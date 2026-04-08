# DeadFuse.js

**Lightweight license enforcement and remote control for deployed web applications.**

DeadFuse.js lets freelancers remotely control access to client apps in real time — without redeployment. When a client delays payment or a contract expires, switch the project state from a dashboard and the app responds instantly via WebSocket.

---

## Philosophy

DeadFuse is designed to be **ethical and professional**:

- ✅ Never deletes client data
- ✅ Avoids destructive behavior
- ✅ Supports graceful UX degradation
- ✅ Allows full recovery after payment
- ✅ Read-only restriction as the default enforcement mode
- ✅ Client controls what happens — you just send the signal

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        MONOREPO                             │
│                                                             │
│  packages/client          apps/dashboard                    │
│  ─────────────────         ─────────────────                │
│  dead-fuse (npm)           Nuxt 3 + Nitro                   │
│  TypeScript library        PostgreSQL backend               │
│  ESM + CJS builds          WebSocket server                 │
│  Framework-agnostic        Admin dashboard UI               │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ wss://host/fuse
                              │
                    ┌─────────────────┐
                    │  Client App     │
                    │  (any framework)│
                    │  dead-fuse SDK  │
                    └─────────────────┘
```

### Flow

1. Freelancer deploys client project with `dead-fuse` SDK embedded
2. SDK connects to master server via WebSocket on startup
3. Server immediately sends current project state
4. Freelancer changes state from dashboard → server broadcasts to all connected clients instantly
5. Client SDK fires the appropriate callback (e.g. `onReadonly`, `onLocked`)
6. Client app reacts — no redeployment needed

---

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL 14+

### Installation

```bash
# Clone the repo
git clone https://github.com/yourname/dead-fuse
cd dead-fuse

# Install all dependencies
pnpm install

# Copy environment file
cp .env.example apps/dashboard/.env
```

### Configure Environment

Edit `apps/dashboard/.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/deadfuse
JWT_SECRET=your-super-secret-key-at-least-32-chars
APP_URL=http://localhost:3000
WS_PATH=/fuse
PORT=3000
```

### Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — if `DATABASE_URL` is not set, you'll be guided through the onboarding wizard automatically.

### Build for Production

```bash
# Build client library
pnpm build:client

# Build dashboard
pnpm build:dashboard

# Or build everything
pnpm build
```

---

## Onboarding Wizard

If environment variables are missing, visiting the dashboard redirects to `/onboarding`. The wizard:

1. Accepts your PostgreSQL connection string and tests it
2. Sets a JWT secret and app URL
3. Creates your admin account
4. Runs database migrations automatically
5. Logs you in and redirects to the dashboard

---

## Client Library

### Install

```bash
npm install dead-fuse
# or
pnpm add dead-fuse
```

### Basic Usage

```js
import DeadFuse from "dead-fuse";

DeadFuse.activate({
  projectId: "your-project-key",
  master: "wss://your-host.com/fuse",
  token: "your-public-token",
  fallbackMode: "readonly",
  gracePeriod: 3,
  heartbeatInterval: 30000,

  onActive: () => {
    console.log("Application is active");
  },

  onWarning: (message) => {
    showBanner(message); // show a non-blocking notice
  },

  onReadonly: () => {
    // SDK automatically blocks POST/PUT/PATCH/DELETE
    showNotice("This application is in read-only mode.");
  },

  onLimited: () => {
    // Disable premium features, reduce API access, etc.
    disablePremiumFeatures();
  },

  onLocked: (message) => {
    document.body.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;">
        <div style="text-align:center;padding:2rem;">
          <h1>Access Restricted</h1>
          <p>${message || "Please contact support to restore access."}</p>
        </div>
      </div>
    `;
  },

  onExpired: () => {
    showPage("Contract expired. Please renew to continue.");
  },

  onSleep: () => {
    showMaintenancePage();
  },

  onSelfDestruct: () => {
    // Completely custom — whatever you need
    performCustomCleanup();
  },

  onDisconnect: () => {
    console.warn("Lost connection to license server");
  },

  onReconnect: () => {
    console.info("Reconnected to license server");
  },
});
```

### Deactivate

```js
DeadFuse.deactivate();
```

### Query Current State

```js
const state = DeadFuse.getState(); // "ACTIVE" | "READONLY" | ...
```

---

## Framework Examples

### React

```jsx
// src/main.jsx or src/App.jsx
import { useEffect } from "react";
import DeadFuse from "dead-fuse";

export function useLicenseControl() {
  useEffect(() => {
    DeadFuse.activate({
      projectId: import.meta.env.VITE_FUSE_PROJECT_ID,
      master: import.meta.env.VITE_FUSE_MASTER_URL,
      token: import.meta.env.VITE_FUSE_TOKEN,
      fallbackMode: "readonly",
      onActive: () => {},
      onReadonly: () => {
        document.dispatchEvent(new CustomEvent("fuse:readonly"));
      },
      onLocked: (msg) => {
        window.location.href = `/locked?msg=${encodeURIComponent(msg)}`;
      },
    });
    return () => DeadFuse.deactivate();
  }, []);
}

// In App.jsx
export default function App() {
  useLicenseControl();
  return <YourApp />;
}
```

### Next.js

```jsx
// app/providers.tsx
"use client";
import { useEffect } from "react";
import DeadFuse from "dead-fuse";

export function FuseProvider({ children }) {
  useEffect(() => {
    DeadFuse.activate({
      projectId: process.env.NEXT_PUBLIC_FUSE_PROJECT_ID,
      master: process.env.NEXT_PUBLIC_FUSE_MASTER_URL,
      token: process.env.NEXT_PUBLIC_FUSE_TOKEN,
      fallbackMode: "readonly",
      onLocked: (msg) => {
        document.body.innerHTML = `<p style="text-align:center;padding:4rem">${msg}</p>`;
      },
    });
    return () => DeadFuse.deactivate();
  }, []);

  return children;
}

// app/layout.tsx
import { FuseProvider } from "./providers";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <FuseProvider>{children}</FuseProvider>
      </body>
    </html>
  );
}
```

### Vue 3

```js
// src/plugins/deadfuse.js
import DeadFuse from "dead-fuse";

export default {
  install(app) {
    DeadFuse.activate({
      projectId: import.meta.env.VITE_FUSE_PROJECT_ID,
      master: import.meta.env.VITE_FUSE_MASTER_URL,
      token: import.meta.env.VITE_FUSE_TOKEN,
      fallbackMode: "readonly",
      onActive: () => app.config.globalProperties.$fuseState = "ACTIVE",
      onReadonly: () => app.config.globalProperties.$fuseState = "READONLY",
      onLocked: (msg) => {
        document.getElementById("app").innerHTML = `<div>${msg}</div>`;
      },
    });
  },
};

// main.js
import { createApp } from "vue";
import App from "./App.vue";
import deadfusePlugin from "./plugins/deadfuse";

createApp(App).use(deadfusePlugin).mount("#app");
```

### Nuxt 3

```js
// plugins/deadfuse.client.ts
import DeadFuse from "dead-fuse";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  DeadFuse.activate({
    projectId: config.public.fuseProjectId,
    master: config.public.fuseMasterUrl,
    token: config.public.fuseToken,
    fallbackMode: "readonly",
    onLocked: (msg) => {
      navigateTo(`/locked?message=${encodeURIComponent(msg)}`);
    },
  });
});
```

### Plain JavaScript (CDN)

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module">
    import DeadFuse from "https://esm.sh/dead-fuse";

    DeadFuse.activate({
      projectId: "your-project-key",
      master: "wss://your-host.com/fuse",
      token: "your-public-token",
      onLocked: (msg) => {
        document.body.innerHTML = `<h1>${msg}</h1>`;
      },
    });
  </script>
</head>
<body>
  <h1>My App</h1>
</body>
</html>
```

---

## Project States

| State | Description | Request Interception |
|---|---|---|
| `ACTIVE` | Full access | None |
| `WARNING` | Sends a warning message | None |
| `READONLY` | Blocks all write operations | Blocks POST, PUT, PATCH, DELETE |
| `LIMITED` | Partial access (custom handler) | None (implement in `onLimited`) |
| `LOCKED` | Full access block | Blocks POST, PUT, PATCH, DELETE |
| `EXPIRED` | Contract ended | Blocks POST, PUT, PATCH, DELETE |
| `SLEEP` | App paused | Blocks POST, PUT, PATCH, DELETE |
| `SELF_DESTRUCT` | Custom handler triggered | Blocks POST, PUT, PATCH, DELETE |

---

## WebSocket Protocol

### Connection

```
wss://your-host.com/fuse?projectId=PROJECT_KEY&token=PUBLIC_TOKEN
```

### Server → Client (state update)

```json
{
  "state": "READONLY",
  "message": "Invoice #1042 is overdue."
}
```

### Client → Server (heartbeat)

```json
{ "type": "ping" }
```

### Server → Client (heartbeat response)

```json
{ "type": "pong" }
```

---

## REST API

All protected routes require the `df_token` cookie (set on login) or `Authorization: Bearer <token>` header.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login and receive session cookie |
| POST | `/api/auth/register` | Register a new account |
| POST | `/api/auth/logout` | Clear session cookie |
| GET | `/api/auth/me` | Get current user info |

### Projects

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/projects` | List all projects |
| POST | `/api/projects` | Create a new project |
| GET | `/api/projects/:id` | Get a single project |
| POST | `/api/projects/:id/state` | Update state, message, or grace period |

### Onboarding

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/onboarding/status` | Check if server is configured |
| POST | `/api/onboarding/setup` | Run initial setup |

---

## Database Schema

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  project_key TEXT UNIQUE NOT NULL,   -- used as projectId in SDK
  public_token TEXT NOT NULL,          -- used as token in SDK
  state TEXT NOT NULL DEFAULT 'ACTIVE',
  message TEXT DEFAULT '',
  grace_period INTEGER DEFAULT 3,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Security

- **Token validation**: Every WebSocket connection validates `projectId` + `token` against the database
- **Ownership checks**: All project API routes verify the authenticated user owns the project
- **JWT authentication**: Dashboard sessions use signed JWTs stored in HTTP-only cookies
- **Parameterized queries**: All database queries use parameterized statements (no SQL injection)
- **Password hashing**: bcrypt with 12 rounds
- **No destructive operations**: The library never deletes or modifies client data — it only sends signals

### Optional: Domain Restriction

You can add domain validation in the WebSocket handler (`server/routes/fuse.ts`) by checking the `Origin` header against a stored allowed domain per project.

---

## Reconnection Strategy

The client library uses **exponential backoff** for reconnection:

- Base delay: 1 second
- Max delay: 30 seconds
- Max attempts: 10
- Formula: `min(1000 * 2^attempt, 30000)`

When disconnected, the `fallbackMode` state is applied immediately.

---

## Ethical Usage

DeadFuse is a professional tool for managing software contracts. Guidelines:

- Always inform clients upfront that remote state control is in place
- Include it in your contract terms
- Use `WARNING` state before escalating to `READONLY` or `LOCKED`
- Respect grace periods
- Restore access promptly after payment
- Never use SELF_DESTRUCT to cause data loss

---

## License

MIT
