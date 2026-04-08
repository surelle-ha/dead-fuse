import type { DeadFuseConfig, DeadFuseInstance, ProjectState } from "./types";
import { DeadFuseConnection } from "./connection";
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
    if (!config.master) throw new Error("[DeadFuse] master URL is required.");
    if (!config.token) throw new Error("[DeadFuse] token is required.");

    activeConfig = config;
    activeConnection = new DeadFuseConnection(config);
    activeConnection.connect();

    console.info(
      `[DeadFuse] Activated for project "${config.projectId}". Connecting to ${config.master}...`
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
