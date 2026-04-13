import { createClient, type SupabaseClient, type RealtimeChannel } from "@supabase/supabase-js";
import type { DeadFuseConfig, ProjectState, StateMessage } from "./types";
import { DEFAULT_MASTER } from "./constants";
import { setCurrentState } from "./stateManager";
import { dispatchStateEvent } from "./events";

const MAX_RECONNECT_ATTEMPTS  = 10;
const BASE_RECONNECT_DELAY    = 2000;   // start at 2 s, not 1 s
const MAX_RECONNECT_DELAY     = 30000;
const CLIENT_HEARTBEAT_INTERVAL = 25_000;
const CLIENT_ID_STORAGE_KEY   = "dead-fuse-client-id";

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
 * Reconnect loop fix
 * ──────────────────
 * The previous version called supabase.removeChannel() inside _scheduleReconnect,
 * which fired a CLOSED status event on the channel. That CLOSED handler then called
 * _scheduleReconnect again — an infinite cycle.
 *
 * Fix: `isReconnecting` flag prevents any new reconnect from being scheduled while
 * one is already in-flight. The channel is only removed via `_teardownChannel()`
 * which sets a `_tearing` flag on the channel object so the CLOSED event handler
 * can detect it was an intentional teardown and skip scheduling another reconnect.
 */
export class DeadFuseConnection {
  private supabase: SupabaseClient | null = null;
  private channel: RealtimeChannel | null = null;
  private config: DeadFuseConfig;

  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;

  // Guards against overlapping reconnect cycles
  private isReconnecting = false;
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
        supabaseUrl    = json.supabaseUrl;
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

    // Reuse the Supabase client across reconnects — only create once.
    if (!this.supabase) {
      this.supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
        realtime: {
          params: { eventsPerSecond: 10 },  // was 2 — too low, caused server-side disconnects
        },
        auth: {
          persistSession:       false,
          detectSessionInUrl:   false,
          autoRefreshToken:     false,
        },
      });
    }

    this._subscribe();
    this._fetchInitialState();
  }

  // ── Channel management ─────────────────────────────────────────────────────

  /**
   * Tear down the current channel cleanly without triggering a reconnect.
   * We mark the channel with a `_deadfuseTearing` flag so the CLOSED status
   * handler knows this was intentional and should not schedule a reconnect.
   */
  private _teardownChannel(): void {
    if (this.channel && this.supabase) {
      (this.channel as any)._deadfuseTearing = true;
      this.supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }

  private _subscribe(): void {
    if (!this.supabase || this.destroyed) return;

    // Always tear down any existing channel before creating a new one.
    this._teardownChannel();

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
        if (this.destroyed) return;

        if (status === "SUBSCRIBED") {
          console.info(`[DeadFuse] Connected: ${channelName}`);

          // Reset reconnect state on successful connection
          if (this.reconnectAttempts > 0) this.config.onReconnect?.();
          this.reconnectAttempts = 0;
          this.isReconnecting    = false;

          // Track presence so the dashboard can see this client.
          // token lets the dashboard match this connection to its instance label.
          this.channel?.track({
            projectId: this.config.projectId,
            token:     this.config.token,
            ts:        Date.now(),
            host:      typeof window !== "undefined" ? window.location.origin : undefined,
          });

          void this._registerClient();
        }

        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.warn(`[DeadFuse] Channel error: ${status}`);
          this.config.onDisconnect?.();
          this._applyFallback();
          // Don't call _teardownChannel here — Supabase will handle it.
          // Just schedule a reconnect via _init (which will create a new channel).
          this._scheduleReconnect();
        }

        if (status === "CLOSED") {
          // Only react to unexpected closes — not ones we triggered ourselves.
          const intentional = (this.channel as any)?._deadfuseTearing === true;
          if (!intentional && !this.destroyed) {
            console.warn(`[DeadFuse] Channel closed unexpectedly.`);
            this.config.onDisconnect?.();
            this._applyFallback();
            this._scheduleReconnect();
          }
        }
      });
  }

  // ── Client registration (REST heartbeat, best-effort) ─────────────────────

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
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({
            token:    this.config.token,
            clientId: this.clientId,
            host:     clientHost,
          }),
        }
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // Start heartbeat only once
      if (!this.heartbeatTimer) {
        this.heartbeatTimer = setInterval(() => {
          if (this.destroyed) return;
          void this._registerClient();
        }, CLIENT_HEARTBEAT_INTERVAL);
      }
    } catch (err) {
      // Non-fatal — presence is the authoritative connection signal
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
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ token: this.config.token, clientId: this.clientId }),
        }
      );
    } catch {
      // Best-effort only
    }
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
      const { data: instance, error: instanceErr } = await this.supabase
        .from("project_instances")
        .select("project_id")
        .eq("token", this.config.token)
        .maybeSingle();

      if (instanceErr || !instance?.project_id) {
        console.warn("[DeadFuse] Could not fetch initial state via Supabase:", instanceErr ?? "no instance");
        const fallback = await tryDashboardFallback();
        if (fallback) {
          setCurrentState(fallback.state);
          dispatchStateEvent(fallback.state, fallback.message ?? "", this.config);
          return;
        }
        this._applyFallback();
        return;
      }

      const { data: project, error: projectErr } = await this.supabase
        .from("projects")
        .select("state, message, project_key")
        .eq("id", instance.project_id)
        .maybeSingle();

      if (projectErr || !project || project.project_key !== this.config.projectId) {
        console.warn("[DeadFuse] Could not fetch initial state via Supabase:", projectErr ?? "no project");
        const fallback = await tryDashboardFallback();
        if (fallback) {
          setCurrentState(fallback.state);
          dispatchStateEvent(fallback.state, fallback.message ?? "", this.config);
          return;
        }
        this._applyFallback();
        return;
      }

      setCurrentState(project.state);
      dispatchStateEvent(project.state, project.message ?? "", this.config);
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
    // Hard guards — never stack reconnects
    if (this.destroyed)        return;
    if (this.isReconnecting)   return;
    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.warn("[DeadFuse] Max reconnect attempts reached. Giving up.");
      return;
    }

    this.isReconnecting = true;

    const delay = Math.min(
      BASE_RECONNECT_DELAY * Math.pow(2, this.reconnectAttempts),
      MAX_RECONNECT_DELAY
    );
    this.reconnectAttempts++;

    console.info(
      `[DeadFuse] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})…`
    );

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.destroyed) return;

      // Tear down stale channel before re-subscribing.
      // _teardownChannel marks the channel so CLOSED won't re-trigger a reconnect.
      this._teardownChannel();

      // isReconnecting stays true until SUBSCRIBED fires and resets it.
      this._subscribe();
    }, delay);
  }

  destroy(): void {
    this.destroyed      = true;
    this.isReconnecting = false;

    if (this.reconnectTimer)  { clearTimeout(this.reconnectTimer);   this.reconnectTimer  = null; }
    if (this.heartbeatTimer)  { clearInterval(this.heartbeatTimer);  this.heartbeatTimer  = null; }

    void this._unregisterClient();
    this._teardownChannel();
  }
}