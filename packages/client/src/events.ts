import type { ProjectState, DeadFuseConfig } from "./types";

export function dispatchStateEvent(
  state: ProjectState,
  message: string,
  config: DeadFuseConfig
): void {
  switch (state) {
    case "ACTIVE":
      config.onActive?.();
      break;
    case "WARNING":
      config.onWarning?.(message);
      break;
    case "READONLY":
      config.onReadonly?.();
      break;
    case "LIMITED":
      config.onLimited?.();
      break;
    case "LOCKED":
      config.onLocked?.(message);
      break;
    case "EXPIRED":
      config.onExpired?.();
      break;
    case "SLEEP":
      config.onSleep?.();
      break;
    case "SELF_DESTRUCT":
      config.onSelfDestruct?.();
      break;
  }
}
