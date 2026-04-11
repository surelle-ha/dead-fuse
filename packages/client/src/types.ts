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
  /** Unique project identifier (project_key from dashboard) */
  projectId: string;

  /**
   * URL of the DeadFuse dashboard server.
   * e.g. "https://your-dashboard.vercel.app"
   * The SDK fetches configuration from `<master>/api/config` automatically.
   * Optional: provide this OR both (supabaseUrl + supabaseAnonKey).
   * If omitted, the SDK will use the package default dashboard URL.
   */
  master?: string;

  /**
   * Public project token (public_token from dashboard).
   * Used to authenticate the initial state fetch via PostgREST.
   */
  token: string;

  /**
   * Override the Supabase project URL.
   * Optional — if omitted the SDK fetches this from `<master>/api/config`.
   * Useful if you self-host Supabase or want zero extra round-trips.
   */
  supabaseUrl?: string;

  /**
   * Override the Supabase anon/public key.
   * Optional — pair with supabaseUrl to bypass the /api/config fetch entirely.
   */
  supabaseAnonKey?: string;

  /** State to apply immediately when the Realtime channel cannot connect */
  fallbackMode?: ProjectState;
  /** Grace period in days (informational — enforced by dashboard) */
  gracePeriod?: number;

  onActive?: () => void;
  onWarning?: (message: string) => void;
  onReadonly?: () => void;
  onLimited?: () => void;
  onLocked?: (message: string) => void;
  onExpired?: () => void;
  onSleep?: () => void;
  onSelfDestruct?: () => void;
  onDisconnect?: () => void;
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