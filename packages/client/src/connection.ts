import type { DeadFuseConfig, StateMessage } from "./types";
import { setCurrentState } from "./stateManager";
import { dispatchStateEvent } from "./events";

const MAX_RECONNECT_ATTEMPTS = 10;
const BASE_RECONNECT_DELAY = 1000;

export class DeadFuseConnection {
  private ws: WebSocket | null = null;
  private config: DeadFuseConfig;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private destroyed = false;

  constructor(config: DeadFuseConfig) {
    this.config = config;
  }

  connect(): void {
    if (this.destroyed) return;

    const url = new URL(this.config.master);
    url.searchParams.set("projectId", this.config.projectId);
    url.searchParams.set("token", this.config.token);

    try {
      this.ws = new WebSocket(url.toString());
    } catch (err) {
      console.error("[DeadFuse] Failed to create WebSocket:", err);
      this.handleFallback();
      return;
    }

    this.ws.onopen = () => {
      console.info("[DeadFuse] Connected to master server.");
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      if (this.reconnectAttempts > 0) {
        this.config.onReconnect?.();
      }
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const data: StateMessage = JSON.parse(event.data as string);
        if (data.state) {
          setCurrentState(data.state);
          dispatchStateEvent(data.state, data.message ?? "", this.config);
        }
      } catch {
        console.warn("[DeadFuse] Received unparseable message:", event.data);
      }
    };

    this.ws.onclose = () => {
      this.stopHeartbeat();
      if (!this.destroyed) {
        console.warn("[DeadFuse] Disconnected from master server.");
        this.config.onDisconnect?.();
        this.handleFallback();
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (err) => {
      console.error("[DeadFuse] WebSocket error:", err);
    };
  }

  private handleFallback(): void {
    const fallback = this.config.fallbackMode;
    if (fallback) {
      setCurrentState(fallback);
      dispatchStateEvent(fallback, "", this.config);
    }
  }

  private startHeartbeat(): void {
    const interval = this.config.heartbeatInterval ?? 30000;
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: "ping" }));
      }
    }, interval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.warn("[DeadFuse] Max reconnect attempts reached.");
      return;
    }

    const delay = Math.min(
      BASE_RECONNECT_DELAY * Math.pow(2, this.reconnectAttempts),
      30000
    );
    this.reconnectAttempts++;

    console.info(
      `[DeadFuse] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`
    );

    this.reconnectTimer = setTimeout(() => {
      if (!this.destroyed) {
        this.connect();
      }
    }, delay);
  }

  destroy(): void {
    this.destroyed = true;
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
