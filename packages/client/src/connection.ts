import { createClient, type SupabaseClient, type RealtimeChannel } from "@supabase/supabase-js";
import type { DeadFuseConfig, ProjectState, StateMessage } from "./types";
import { DEFAULT_MASTER } from "./constants";
import { setCurrentState } from "./stateManager";
import { dispatchStateEvent } from "./events";

const MAX_RECONNECT_ATTEMPTS = 10;
const BASE_RECONNECT_DELAY = 1000;
const CLIENT_HEARTBEAT_INTERVAL = 25_000;
const CLIENT_ID_STORAGE_KEY = "dead-fuse-client-id";

function getOrCreateClientId(): string {
  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    const existing = localStorage.getItem(CLIENT_ID_STORAGE_KEY);
    if (existing) return existing;
    const id = `df-client-${
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2)
    }`;
    localStorage.setItem(CLIENT_ID_STORAGE_KEY, id);
    return id;
  }
  return `df-client-${Math.random().toString(36).slice(2)}`;
}

/**
 * DeadFuseConnection uses Supabase Realtime broadcast channels for real-time
 * state delivery.
 *
 * Supabase credentials are resolved in this priority order:
 *   1. `config.supabaseUrl` + `config.supabaseAnonKey`  (explicit override)
 *   2. Fetched from `<config.master>/api/config`         (auto, default)
 *
 * This means end-users only need to supply `projectId`, `master`, and `token` —
 * the Supabase internals stay hidden inside the dashboard deployment.
 */
export class DeadFuseConnection {
  private supabase: SupabaseClient | null = null;
  private channel: RealtimeChannel | null = null;
  private config: DeadFuseConfig;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private destroyed = false;
  private clientId = getOrCreateClientId();

  constructor(config: DeadFuseConfig) {
    this.config = config;
  }

  connect(): void {
    if (this.destroyed) return;
    this._init();
  }

  // ── Bootstrap ──────────────────────────────────────────────────────────────

  /**
   * Resolve credentials then kick off the subscription + initial state fetch.
   * If explicit supabaseUrl/Key are provided they are used immediately (no
   * network round-trip). Otherwise we fetch them from the dashboard.
   */
  private async _init(): Promise<void> {
    if (this.destroyed) return;

    let supabaseUrl = this.config.supabaseUrl;
    let supabaseAnonKey = this.config.supabaseAnonKey;

    if (!supabaseUrl || !supabaseAnonKey) {
      const masterUrl = this.config.master ?? DEFAULT_MASTER;
      if (!masterUrl) {
        console.error(
          "[DeadFuse] Provide either `master` (dashboard URL) or both `supabaseUrl` + `supabaseAnonKey`."
        );
        this._applyFallback();
        return;
      }

      try {
        const res = await fetch(`${masterUrl.replace(/\/$/, "")}/api/config`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json() as { supabaseUrl: string; supabaseAnonKey: string };
        supabaseUrl = json.supabaseUrl;
        supabaseAnonKey = json.supabaseAnonKey;
      } catch (err) {
        console.warn("[DeadFuse] Could not fetch config from dashboard:", err, "master:", masterUrl);
        if (masterUrl.startsWith("wss://")) {
          console.warn(
            "[DeadFuse] The `master` value appears to be a websocket URL. `master` must be the dashboard base URL like https://your-dashboard.example.com"
          );
        }
        this._applyFallback();
        this._scheduleReconnect();
        return;
      }
    }

    if (this.destroyed) return;

    this.supabase = createClient(supabaseUrl, supabaseAnonKey, {
      realtime: { params: { eventsPerSecond: 2 } },
      auth: {
        persistSession: false,
        detectSessionInUrl: false,
        autoRefreshToken: false,
      },
    });

    this._subscribe();
    this._fetchInitialState();
  }

  private async _registerClient(): Promise<void> {
    const masterUrl = this.config.master ?? DEFAULT_MASTER;
    if (!masterUrl || !this.config.token) return;

    try {
      const clientHost = typeof window !== "undefined" ? window.location.origin : undefined;
      const res = await fetch(
        `${masterUrl.replace(/\/$/, "")}/api/project/${encodeURIComponent(
          this.config.projectId
        )}/clients/connect`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: this.config.token, clientId: this.clientId, host: clientHost }),
        }
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (!this.heartbeatTimer) {
        this.heartbeatTimer = setInterval(() => {
          if (this.destroyed) return;
          void this._registerClient();
        }, CLIENT_HEARTBEAT_INTERVAL);
      }
    } catch (err) {
      console.warn("[DeadFuse] Could not register client with dashboard:", err);
    }
  }

  private async _unregisterClient(): Promise<void> {
    const masterUrl = this.config.master ?? DEFAULT_MASTER;
    if (!masterUrl || !this.config.token) return;

    try {
      await fetch(
        `${masterUrl.replace(/\/$/, "")}/api/project/${encodeURIComponent(
          this.config.projectId
        )}/clients/disconnect`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: this.config.token, clientId: this.clientId }),
        }
      );
    } catch {
      // Best-effort cleanup only.
    }
  }

  // ── Realtime subscription ──────────────────────────────────────────────────

  private _subscribe(): void {
    if (!this.supabase) return;
    const channelName = `project:${this.config.projectId}`;

    this.channel = this.supabase
      .channel(channelName, { config: { broadcast: { self: false } } })
      .on("broadcast", { event: "state" }, (payload) => {
        const data = payload.payload as StateMessage;
        if (data?.state) {
          setCurrentState(data.state);
          dispatchStateEvent(data.state, data.message ?? "", this.config);
        }
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.info(`[DeadFuse] Realtime channel connected: ${channelName}`);
          if (this.reconnectAttempts > 0) this.config.onReconnect?.();
          this.reconnectAttempts = 0;
          // Register presence so the dashboard client-count endpoint can see us
          this.channel?.track({ projectId: this.config.projectId, ts: Date.now() });
          void this._registerClient();
        }

        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.warn(`[DeadFuse] Realtime channel error: ${status}`);
          this.config.onDisconnect?.();
          this._applyFallback();
          this._scheduleReconnect();
        }

        if (status === "CLOSED" && !this.destroyed) {
          this.config.onDisconnect?.();
          this._applyFallback();
          this._scheduleReconnect();
        }
      });
  }

  // ── Initial state fetch ────────────────────────────────────────────────────

  private async _fetchInitialState(): Promise<void> {
    if (!this.supabase) return;

    const tryDashboardFallback = async (): Promise<{ state: ProjectState; message?: string } | null> => {
      const masterUrl = this.config.master ?? (typeof window !== "undefined" ? window.location.origin : undefined);
      if (!masterUrl) return null;

      try {
        const res = await fetch(
          `${masterUrl.replace(/\/$/, "")}/api/projects/${this.config.projectId}/initial-state?token=${encodeURIComponent(
            this.config.token
          )}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return (await res.json()) as { state: ProjectState; message?: string };
      } catch (err) {
        console.warn("[DeadFuse] Dashboard initial-state fallback failed:", err);
        return null;
      }
    };

    try {
      const { data, error } = await this.supabase
        .from("projects")
        .select("state, message")
        .eq("project_key", this.config.projectId)
        .eq("public_token", this.config.token)
        .maybeSingle();

      if (error || !data) {
        console.warn(
          "[DeadFuse] Could not fetch initial state via Supabase:",
          error ?? "no error object",
          "data:",
          data
        );

        const fallback = await tryDashboardFallback();
        if (fallback) {
          setCurrentState(fallback.state);
          dispatchStateEvent(fallback.state, fallback.message ?? "", this.config);
          return;
        }

        this._applyFallback();
        return;
      }

      setCurrentState(data.state);
      dispatchStateEvent(data.state, data.message ?? "", this.config);
    } catch (err) {
      console.warn("[DeadFuse] Initial state fetch failed:", err);
      const fallback = await tryDashboardFallback();
      if (fallback) {
        setCurrentState(fallback.state);
        dispatchStateEvent(fallback.state, fallback.message ?? "", this.config);
        return;
      }
      this._applyFallback();
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private _applyFallback(): void {
    const fallback = this.config.fallbackMode;
    if (fallback) {
      setCurrentState(fallback);
      dispatchStateEvent(fallback, "", this.config);
    }
  }

  private _scheduleReconnect(): void {
    if (this.destroyed || this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.warn("[DeadFuse] Max reconnect attempts reached.");
      }
      return;
    }

    const delay = Math.min(BASE_RECONNECT_DELAY * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;
    console.info(`[DeadFuse] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})…`);

    this.reconnectTimer = setTimeout(() => {
      if (this.destroyed) return;
      if (this.channel && this.supabase) {
        this.supabase.removeChannel(this.channel);
        this.channel = null;
      }
      // Re-run full init in case config-fetch also failed last time
      this._init();
    }, delay);
  }

  destroy(): void {
    this.destroyed = true;
    if (this.reconnectTimer) { clearTimeout(this.reconnectTimer); this.reconnectTimer = null; }
    if (this.heartbeatTimer) { clearInterval(this.heartbeatTimer); this.heartbeatTimer = null; }
    void this._unregisterClient();
    if (this.channel && this.supabase) { this.supabase.removeChannel(this.channel); this.channel = null; }
  }
}