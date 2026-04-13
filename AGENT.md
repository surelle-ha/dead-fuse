# Dead Fuse Agent Reference

## Table of Contents
1. [Structure](#structure)
2. [Client SDK behavior](#client-sdk-behavior)
3. [Dashboard behavior](#dashboard-behavior)
4. [Recent fixes](#recent-fixes)
5. [Packaging and release](#packaging-and-release)
6. [Notes for future reference](#notes-for-future-reference)
7. [AGENT MEMORY](#agent-memory)

---

## Structure
**Instruction:**  
Use this section to understand the monorepo layout. Any new packages or apps must follow this structure and naming convention. Avoid placing unrelated logic outside these directories.

- `packages/dead-fuse`: client SDK package published as `@surelle-ha/dead-fuse`
- `apps/dashboard`: dashboard application and server API

---

## Client SDK behavior
**Instruction:**  
Follow this as the source of truth when modifying SDK logic. Any changes to initialization, connection, or identity handling must remain backward compatible unless explicitly versioned.

- The SDK is initialized via `DeadFuse.activate({ projectId, token, master, fallbackMode, ... })`
- If `supabaseUrl` and `supabaseAnonKey` are not provided, the SDK fetches runtime config from `<master>/api/config`
- The SDK opens a realtime channel on `project:<projectId>` for state updates
- Client identity is persisted in browser storage to avoid duplicate remote app entries
- The SDK registers itself with the dashboard using `/api/project/:projectKey/clients/connect` and sends periodic heartbeats
- Disconnects are reported via `/api/project/:projectKey/clients/disconnect`
- Initial state load uses a tolerant row fetch and falls back to the dashboard endpoint if needed

---

## Dashboard behavior
**Instruction:**  
All dashboard-related API changes must maintain compatibility with the client SDK. Do not introduce breaking API changes without updating SDK fallback logic.

- Dashboard exposes public API routes under `/api/`
- `/api/config` returns runtime project credentials to clients
- `/api/projects/:id/clients` returns current connected client count and client host metadata
- Dashboard includes CORS middleware for cross-origin client integration
- Client host tracking is deduplicated by origin and last-seen timestamp

---

## Recent fixes
**Instruction:**  
Append new fixes here chronologically. Do not remove past entries. This acts as a lightweight changelog for agents and contributors.

- Scoped package name updated to `@surelle-ha/dead-fuse`
- Dashboard CORS support added so remote apps can fetch `/api/config`
- Stable client IDs added to prevent duplicate connections in browser sessions
- Realtime channel reconnect logic improved with exponential backoff and fallback behavior
- Dashboard client list now shows connected host/origin and last-seen info
- Dashboard web UI copy cleaned to remove visible Supabase branding
- Projects page now uses the shared app topbar and no longer duplicates the nav header

---

## Packaging and release
**Instruction:**  
Follow these steps strictly when publishing. Ensure builds are clean and outputs are verified before release. Do not publish broken or partial builds.

- `packages/client/package.json` is configured with `publishConfig.access: public`
- Build command: `pnpm --filter @surelle-ha/dead-fuse build`
- Package output uses `dist/index.js`, `dist/index.mjs`, and `dist/index.d.ts`
- Workflow uses a pnpm monorepo with lockfile and scoped package resolution

---

## Notes for future reference
**Instruction:**  
Use this section for important architectural clarifications. Add notes here when decisions may be unclear to future contributors or agents.

- `master` is the dashboard base URL, not a websocket endpoint
- The dashboard serves client config and client list data for remote integrations
- Client apps should pass project token and dashboard host to initialize

---

## AGENT MEMORY
**Instruction:**  
Log completed tasks only. Keep entries concise and factual. Do not include plans or discussions—only finalized changes.

- Completed: removed `apps/test` folder.
- Completed: removed web-facing Supabase branding from dashboard pages.
- Completed: stripped HTML comments from dashboard page Vue files.
- Completed: fixed duplicate topbar on the Projects page by removing the redundant page nav.