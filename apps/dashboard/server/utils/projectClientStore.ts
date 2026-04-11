type ClientEntry = {
  lastSeen: number;
};

const CLIENT_TTL_MS = 45_000;
const projectClientStore = new Map<string, Map<string, ClientEntry>>();

function pruneStaleClients(projectKey: string): void {
  const clients = projectClientStore.get(projectKey);
  if (!clients) return;

  const now = Date.now();
  for (const [clientId, entry] of clients.entries()) {
    if (now - entry.lastSeen > CLIENT_TTL_MS) {
      clients.delete(clientId);
    }
  }

  if (clients.size === 0) {
    projectClientStore.delete(projectKey);
  }
}

function getProjectClients(projectKey: string): Map<string, ClientEntry> {
  let clients = projectClientStore.get(projectKey);
  if (!clients) {
    clients = new Map<string, ClientEntry>();
    projectClientStore.set(projectKey, clients);
  }
  return clients;
}

export function registerClient(projectKey: string, clientId: string): void {
  const clients = getProjectClients(projectKey);
  clients.set(clientId, { lastSeen: Date.now() });
}

export function heartbeatClient(projectKey: string, clientId: string): void {
  const clients = projectClientStore.get(projectKey);
  if (!clients) return;
  const entry = clients.get(clientId);
  if (!entry) return;
  entry.lastSeen = Date.now();
}

export function removeClient(projectKey: string, clientId: string): void {
  const clients = projectClientStore.get(projectKey);
  if (!clients) return;
  clients.delete(clientId);
  if (clients.size === 0) {
    projectClientStore.delete(projectKey);
  }
}

export function countClients(projectKey: string): number {
  pruneStaleClients(projectKey);
  const clients = projectClientStore.get(projectKey);
  return clients ? clients.size : 0;
}
