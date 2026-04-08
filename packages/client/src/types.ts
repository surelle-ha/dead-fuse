export type ProjectState =
  | "ACTIVE"
  | "WARNING"
  | "READONLY"
  | "LIMITED"
  | "LOCKED"
  | "EXPIRED"
  | "SLEEP"
  | "SELF_DESTRUCT";

export interface DeadFuseConfig {
  /** Unique project identifier */
  projectId: string;
  /** WebSocket master server URL e.g. wss://host.com/fuse */
  master: string;
  /** Public project token for authentication */
  token: string;
  /** Fallback mode when server is unreachable */
  fallbackMode?: ProjectState;
  /** Grace period in days before enforcement */
  gracePeriod?: number;
  /** Heartbeat interval in milliseconds (default: 30000) */
  heartbeatInterval?: number;
  /** Called when project state becomes ACTIVE */
  onActive?: () => void;
  /** Called when project state becomes WARNING */
  onWarning?: (message: string) => void;
  /** Called when project state becomes READONLY */
  onReadonly?: () => void;
  /** Called when project state becomes LIMITED */
  onLimited?: () => void;
  /** Called when project state becomes LOCKED */
  onLocked?: (message: string) => void;
  /** Called when project state becomes EXPIRED */
  onExpired?: () => void;
  /** Called when project state becomes SLEEP */
  onSleep?: () => void;
  /** Called when project state becomes SELF_DESTRUCT */
  onSelfDestruct?: () => void;
  /** Called when WebSocket disconnects */
  onDisconnect?: () => void;
  /** Called when WebSocket reconnects */
  onReconnect?: () => void;
}

export interface StateMessage {
  state: ProjectState;
  message?: string;
}

export interface DeadFuseInstance {
  activate: (config: DeadFuseConfig) => void;
  deactivate: () => void;
  getState: () => ProjectState | null;
  getConfig: () => DeadFuseConfig | null;
}
