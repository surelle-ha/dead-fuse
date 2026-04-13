import type { DeadFuseConfig, DeadFuseInstance, ProjectState } from "./types";
import { DeadFuseConnection } from "./connection";
import { DEFAULT_MASTER } from "./constants";
import { getCurrentState, cleanupState } from "./stateManager";

let activeConnection: DeadFuseConnection | null = null;
let activeConfig: DeadFuseConfig | null = null;

const DeadFuse: DeadFuseInstance = {
  activate(config: DeadFuseConfig): void {
    if (activeConnection) {
      console.warn(
        "[DeadFuse] Already activated. Call deactivate() first to reinitialize."
      );
      return;
    }

    if (!config.projectId) throw new Error("[DeadFuse] projectId is required.");
    if (!config.token) throw new Error("[DeadFuse] token is required.");

    const hasExplicitSupabase = Boolean(config.supabaseUrl && config.supabaseAnonKey);
    const resolvedConfig = { ...config };

    if (!resolvedConfig.master && !hasExplicitSupabase) {
      resolvedConfig.master = DEFAULT_MASTER;
    }

    if (!resolvedConfig.master && !hasExplicitSupabase) {
      throw new Error(
        "[DeadFuse] Provide either a dashboard URL via `master` or both `supabaseUrl` + `supabaseAnonKey`."
      );
    }

    activeConfig = resolvedConfig;
    activeConnection = new DeadFuseConnection(resolvedConfig);
    activeConnection.connect();

    const connectMsg = resolvedConfig.master
      ? `dashboard at ${resolvedConfig.master}`
      : "explicit Supabase credentials";
    console.info(
      `[DeadFuse] Activated for project "${resolvedConfig.projectId}". Connecting via ${connectMsg}...`
    );
  },

  deactivate(): void {
    if (activeConnection) {
      activeConnection.destroy();
      activeConnection = null;
    }
    activeConfig = null;
    cleanupState();
    console.info("[DeadFuse] Deactivated.");
  },

  getState(): ProjectState | null {
    return getCurrentState();
  },

  getConfig(): DeadFuseConfig | null {
    return activeConfig;
  },
};

export default DeadFuse;
export type { DeadFuseConfig, ProjectState, DeadFuseInstance } from "./types";
