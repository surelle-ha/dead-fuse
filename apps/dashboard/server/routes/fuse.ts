import { queryOne } from "../utils/db";
import { projectSockets } from "../api/projects/[id]/state.post";

export default defineWebSocketHandler({
  async open(peer) {
    // Parse query params from the upgrade request URL
    const url = new URL(peer.request?.url ?? "", "http://localhost");
    const projectId = url.searchParams.get("projectId");
    const token = url.searchParams.get("token");

    if (!projectId || !token) {
      peer.send(JSON.stringify({ error: "Missing projectId or token" }));
      peer.close(4001, "Unauthorized");
      return;
    }

    // Validate token against DB
    let project: any;
    try {
      project = await queryOne(
        "SELECT id, project_key, public_token, state, message FROM projects WHERE project_key = $1 AND public_token = $2",
        [projectId, token]
      );
    } catch {
      peer.send(JSON.stringify({ error: "Database unavailable" }));
      peer.close(4002, "Server error");
      return;
    }

    if (!project) {
      peer.send(JSON.stringify({ error: "Invalid credentials" }));
      peer.close(4003, "Forbidden");
      return;
    }

    // Register peer in project socket map
    if (!projectSockets.has(project.project_key)) {
      projectSockets.set(project.project_key, new Set());
    }
    projectSockets.get(project.project_key)!.add(peer);

    // Store project key on peer for cleanup
    (peer as any)._projectKey = project.project_key;

    // Send current state immediately
    peer.send(JSON.stringify({
      state: project.state,
      message: project.message ?? "",
    }));
  },

  message(peer, message) {
    // Handle heartbeat pings
    try {
      const data = JSON.parse(message.text());
      if (data.type === "ping") {
        peer.send(JSON.stringify({ type: "pong" }));
      }
    } catch {
      // ignore non-JSON messages
    }
  },

  close(peer) {
    const key = (peer as any)._projectKey;
    if (key && projectSockets.has(key)) {
      projectSockets.get(key)!.delete(peer);
      if (projectSockets.get(key)!.size === 0) {
        projectSockets.delete(key);
      }
    }
  },

  error(peer, error) {
    console.error("[DeadFuse WS] Error:", error);
    const key = (peer as any)._projectKey;
    if (key && projectSockets.has(key)) {
      projectSockets.get(key)!.delete(peer);
    }
  },
});
