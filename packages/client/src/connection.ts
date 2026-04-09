import { createClient, type SupabaseClient, type RealtimeChannel } from "@supabase/supabase-js";
import type { DeadFuseConfig, StateMessage } from "./types";
import { setCurrentState } from "./stateManager";
import { dispatchStateEvent } from "./events";

const MAX_RECONNECT_ATTEMPTS = 10;
const BASE_RECONNECT_DELAY = 1000;

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
  private destroyed = false;

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
      if (!this.config.master) {
        console.error(
          "[DeadFuse] Provide either `master` (dashboard URL) or both " +
          "`supabaseUrl` + `supabaseAnonKey`."
        );
        this._applyFallback();
        return;
      }

      try {
        const res = await fetch(`${this.config.master.replace(/\/$/, "")}/api/config`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json() as { supabaseUrl: string; supabaseAnonKey: string };
        supabaseUrl = json.supabaseUrl;
        supabaseAnonKey = json.supabaseAnonKey;
      } catch (err) {
        console.warn("[DeadFuse] Could not fetch config from dashboard:", err);
        this._applyFallback();
        this._scheduleReconnect();
        return;
      }
    }

    if (this.destroyed) return;

    this.supabase = createClient(supabaseUrl, supabaseAnonKey, {
      realtime: { params: { eventsPerSecond: 2 } },
    });

    this._subscribe();
    this._fetchInitialState();
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
    try {
      const { data, error } = await this.supabase
        .from("projects")
        .select("state, message")
        .eq("project_key", this.config.projectId)
        .eq("public_token", this.config.token)
        .single();

      if (error || !data) {
        console.warn("[DeadFuse] Could not fetch initial state:", error?.message);
        this._applyFallback();
        return;
      }

      setCurrentState(data.state);
      dispatchStateEvent(data.state, data.message ?? "", this.config);
    } catch (err) {
      console.warn("[DeadFuse] Initial state fetch failed:", err);
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
    if (this.channel && this.supabase) { this.supabase.removeChannel(this.channel); this.channel = null; }
  }
}