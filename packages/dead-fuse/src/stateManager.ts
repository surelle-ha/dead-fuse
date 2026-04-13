import type { ProjectState } from "./types";

const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

let currentState: ProjectState | null = null;
let interceptorsInstalled = false;
let originalFetch: typeof fetch | null = null;
let originalXHROpen: typeof XMLHttpRequest.prototype.open | null = null;

export function getCurrentState(): ProjectState | null {
  return currentState;
}

export function setCurrentState(state: ProjectState): void {
  currentState = state;
  applyStateEffects(state);
}

function isMutationBlocked(): boolean {
  return (
    currentState === "READONLY" ||
    currentState === "LOCKED" ||
    currentState === "EXPIRED" ||
    currentState === "SLEEP" ||
    currentState === "SELF_DESTRUCT"
  );
}

function applyStateEffects(state: ProjectState): void {
  if (
    state === "READONLY" ||
    state === "LOCKED" ||
    state === "EXPIRED" ||
    state === "SLEEP" ||
    state === "SELF_DESTRUCT"
  ) {
    installInterceptors();
  } else {
    if (interceptorsInstalled) {
      removeInterceptors();
    }
  }
}

function installInterceptors(): void {
  if (interceptorsInstalled) return;
  interceptorsInstalled = true;

  // Intercept fetch
  if (typeof window !== "undefined" && typeof window.fetch === "function") {
    originalFetch = window.fetch.bind(window);
    window.fetch = async function (
      input: RequestInfo | URL,
      init?: RequestInit
    ): Promise<Response> {
      const method = (init?.method || "GET").toUpperCase();
      if (isMutationBlocked() && MUTATION_METHODS.has(method)) {
        console.warn(
          `[DeadFuse] Blocked ${method} request — project is in ${currentState} mode.`
        );
        return new Response(
          JSON.stringify({
            error: "Service unavailable",
            reason: `Project is in ${currentState} mode`,
            deadfuse: true,
          }),
          {
            status: 503,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      return originalFetch!(input, init);
    };
  }

  // Intercept XMLHttpRequest
  if (typeof XMLHttpRequest !== "undefined") {
    originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (
      method: string,
      url: string | URL,
      async: boolean = true,
      username?: string | null,
      password?: string | null
    ): void {
      (this as any)._deadfuseMethod = method.toUpperCase();
      originalXHROpen!.call(this, method, url, async, username, password);
    };

    const originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function (
      body?: Document | XMLHttpRequestBodyInit | null
    ): void {
      const method: string = (this as any)._deadfuseMethod || "GET";
      if (isMutationBlocked() && MUTATION_METHODS.has(method)) {
        console.warn(
          `[DeadFuse] Blocked XHR ${method} — project is in ${currentState} mode.`
        );
        Object.defineProperty(this, "status", { get: () => 503 });
        Object.defineProperty(this, "readyState", { get: () => 4 });
        Object.defineProperty(this, "responseText", {
          get: () =>
            JSON.stringify({
              error: "Service unavailable",
              reason: `Project is in ${currentState} mode`,
              deadfuse: true,
            }),
        });
        this.dispatchEvent(new Event("readystatechange"));
        this.dispatchEvent(new Event("load"));
        return;
      }
      originalSend.call(this, body);
    };
  }

  // Intercept axios if present (global window.axios)
  if (typeof window !== "undefined" && (window as any).axios) {
    const axios = (window as any).axios;
    if (axios.interceptors) {
      axios.interceptors.request.use((config: any) => {
        const method = (config.method || "get").toUpperCase();
        if (isMutationBlocked() && MUTATION_METHODS.has(method)) {
          console.warn(
            `[DeadFuse] Blocked axios ${method} — project is in ${currentState} mode.`
          );
          return Promise.reject({
            response: {
              status: 503,
              data: {
                error: "Service unavailable",
                reason: `Project is in ${currentState} mode`,
                deadfuse: true,
              },
            },
          });
        }
        return config;
      });
    }
  }
}

function removeInterceptors(): void {
  if (!interceptorsInstalled) return;
  interceptorsInstalled = false;

  if (originalFetch && typeof window !== "undefined") {
    window.fetch = originalFetch;
    originalFetch = null;
  }

  if (originalXHROpen) {
    XMLHttpRequest.prototype.open = originalXHROpen;
    originalXHROpen = null;
  }
}

export function cleanupState(): void {
  currentState = null;
  removeInterceptors();
}
