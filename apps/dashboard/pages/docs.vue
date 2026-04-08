<template>
  <div class="min-h-screen bg-fuse-black">
    <!-- Nav -->
    <nav class="border-b border-fuse-border/60 px-6 py-4 flex items-center justify-between backdrop-blur-sm bg-fuse-black/80 sticky top-0 z-10">
      <div class="flex items-center gap-3">
        <div class="w-7 h-7 bg-fuse-red rounded-sm flex items-center justify-center shadow-lg shadow-fuse-red/20">
          <span class="text-white font-mono text-xs font-bold">DF</span>
        </div>
        <span class="font-bold text-fuse-text">DeadFuse</span>
      </div>
      <div class="flex items-center gap-4">
        <button @click="navigateTo('/projects')" class="text-fuse-dim hover:text-fuse-text text-sm transition-colors">← Back to Projects</button>
      </div>
    </nav>

    <main class="max-w-4xl mx-auto px-6 py-12 animate-slide-up">
      <!-- Header -->
      <div class="mb-12">
        <div class="inline-flex items-center gap-2 bg-fuse-red/10 border border-fuse-red/20 text-fuse-red text-xs font-mono px-3 py-1 rounded-full mb-4">
          Documentation
        </div>
        <h1 class="text-4xl font-bold text-fuse-text mb-3">How DeadFuse Works</h1>
        <p class="text-fuse-dim text-base leading-relaxed max-w-2xl">
          DeadFuse lets you remotely control access to your deployed client applications in real time — no redeployment needed. When a client delays payment or a contract ends, switch the state from this dashboard and their app responds instantly.
        </p>
      </div>

      <!-- TOC -->
      <div class="glass-panel mb-10 p-5">
        <h2 class="text-xs font-mono text-fuse-dim uppercase tracking-widest mb-3">On this page</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-1">
          <a v-for="section in toc" :key="section.id" :href="`#${section.id}`"
            class="text-sm text-fuse-dim hover:text-fuse-text transition-colors py-1 flex items-center gap-2">
            <span class="text-fuse-red text-xs">→</span>
            {{ section.title }}
          </a>
        </div>
      </div>

      <!-- Sections -->
      <div class="space-y-14">

        <!-- Architecture -->
        <section id="architecture">
          <h2 class="doc-heading">Architecture Overview</h2>
          <p class="doc-body">DeadFuse is a two-part system: this dashboard (server) and the <code class="code-inline">dead-fuse</code> npm package (client SDK). The client SDK opens a WebSocket connection to your dashboard on startup and listens for state changes. When you toggle a project state here, it broadcasts instantly to every connected client.</p>
          <div class="architecture-diagram mt-6">
            <div class="arch-box arch-box--server">
              <div class="arch-label">This Dashboard</div>
              <div class="arch-items">
                <span>Admin UI</span>
                <span>REST API</span>
                <span>WebSocket Server</span>
                <span>PostgreSQL</span>
              </div>
            </div>
            <div class="arch-arrow">
              <div class="arch-arrow-line" />
              <div class="arch-arrow-label">wss:///fuse<br><span class="text-fuse-dim">real-time</span></div>
            </div>
            <div class="arch-box arch-box--client">
              <div class="arch-label">Client App</div>
              <div class="arch-items">
                <span>dead-fuse SDK</span>
                <span>State callbacks</span>
                <span>HTTP interceptors</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Installation -->
        <section id="installation">
          <h2 class="doc-heading">Installation</h2>
          <p class="doc-body">Install the SDK in the client app you want to control.</p>
          <div class="code-block mt-4">
            <div class="code-block-header">
              <span>terminal</span>
              <button @click="copy('npm install dead-fuse', 'install')" class="copy-btn">{{ copied === 'install' ? '✓' : 'Copy' }}</button>
            </div>
            <pre class="code-content">npm install dead-fuse
# or
pnpm add dead-fuse</pre>
          </div>
        </section>

        <!-- Basic Usage -->
        <section id="usage">
          <h2 class="doc-heading">Basic Usage</h2>
          <p class="doc-body">Call <code class="code-inline">DeadFuse.activate()</code> as early as possible in your application lifecycle. Find your <strong class="text-fuse-text">Project ID</strong> and <strong class="text-fuse-text">Public Token</strong> on the project page.</p>
          <div class="code-block mt-4">
            <div class="code-block-header">
              <span>JavaScript / TypeScript</span>
              <button @click="copy(basicUsage, 'basic')" class="copy-btn">{{ copied === 'basic' ? '✓ Copied' : 'Copy' }}</button>
            </div>
            <pre class="code-content">{{ basicUsage }}</pre>
          </div>
        </section>

        <!-- States reference -->
        <section id="states">
          <h2 class="doc-heading">Project States</h2>
          <p class="doc-body">Each state triggers a different callback in the client SDK and may enable HTTP request interception.</p>
          <div class="states-table mt-5">
            <div class="states-header">
              <span>State</span>
              <span>Callback</span>
              <span>HTTP Blocking</span>
              <span>Use Case</span>
            </div>
            <div v-for="state in states" :key="state.name" class="states-row">
              <span><code class="state-badge" :class="state.color">{{ state.name }}</code></span>
              <code class="text-fuse-dim text-xs">{{ state.callback }}</code>
              <span class="text-xs" :class="state.blocks ? 'text-fuse-red' : 'text-fuse-dim'">
                {{ state.blocks ? 'POST PUT PATCH DELETE' : 'None' }}
              </span>
              <span class="text-xs text-fuse-dim">{{ state.use }}</span>
            </div>
          </div>
        </section>

        <!-- Framework examples -->
        <section id="frameworks">
          <h2 class="doc-heading">Framework Examples</h2>

          <div class="space-y-4">
            <div v-for="fw in frameworks" :key="fw.name" class="glass-panel overflow-hidden">
              <button @click="fw.open = !fw.open" class="w-full flex items-center justify-between p-4 text-left">
                <span class="font-bold text-fuse-text text-sm">{{ fw.name }}</span>
                <span class="text-fuse-dim text-sm transition-transform duration-200" :class="fw.open ? 'rotate-180' : ''">▾</span>
              </button>
              <div v-if="fw.open" class="border-t border-white/[0.06]">
                <div class="code-block-inner">
                  <button @click="copy(fw.code, fw.name)" class="copy-btn absolute top-3 right-3">
                    {{ copied === fw.name ? '✓ Copied' : 'Copy' }}
                  </button>
                  <pre class="code-content pr-16">{{ fw.code }}</pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Reconnection -->
        <section id="reconnection">
          <h2 class="doc-heading">Reconnection & Fallback</h2>
          <p class="doc-body">If the WebSocket connection drops, the SDK applies <code class="code-inline">fallbackMode</code> immediately and attempts to reconnect with exponential backoff.</p>
          <div class="info-grid mt-5">
            <div class="info-card">
              <span class="info-label">Base delay</span>
              <span class="info-value">1 second</span>
            </div>
            <div class="info-card">
              <span class="info-label">Max delay</span>
              <span class="info-value">30 seconds</span>
            </div>
            <div class="info-card">
              <span class="info-label">Max attempts</span>
              <span class="info-value">10</span>
            </div>
            <div class="info-card">
              <span class="info-label">Formula</span>
              <span class="info-value font-mono text-sm">min(1000 × 2ⁿ, 30000)</span>
            </div>
          </div>
        </section>

        <!-- Ethics -->
        <section id="ethics">
          <h2 class="doc-heading">Ethical Usage Guidelines</h2>
          <div class="space-y-3 mt-4">
            <div v-for="tip in ethics" :key="tip" class="flex items-start gap-3 text-sm text-fuse-dim">
              <span class="text-fuse-green mt-0.5 flex-shrink-0">✓</span>
              <span>{{ tip }}</span>
            </div>
          </div>
        </section>

      </div>
    </main>

    <!-- Footer -->
    <DashboardFooter />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const copied = ref('')

const toc = [
  { id: 'architecture', title: 'Architecture Overview' },
  { id: 'installation', title: 'Installation' },
  { id: 'usage', title: 'Basic Usage' },
  { id: 'states', title: 'Project States' },
  { id: 'frameworks', title: 'Framework Examples' },
  { id: 'reconnection', title: 'Reconnection & Fallback' },
  { id: 'ethics', title: 'Ethical Usage' },
]

const basicUsage = `import DeadFuse from "dead-fuse";

DeadFuse.activate({
  projectId: "YOUR_PROJECT_KEY",
  master: "wss://your-dashboard.com/fuse",
  token: "YOUR_PUBLIC_TOKEN",
  fallbackMode: "readonly",

  onActive: () => {
    console.log("App is active");
  },
  onWarning: (message) => {
    showBanner(message); // non-blocking notice
  },
  onReadonly: () => {
    // SDK automatically blocks POST/PUT/PATCH/DELETE
    showNotice("This app is in read-only mode.");
  },
  onLimited: () => {
    disablePremiumFeatures();
  },
  onLocked: (message) => {
    document.body.innerHTML = \`<h1>\${message}</h1>\`;
  },
  onExpired: () => {
    showPage("Contract expired. Please renew.");
  },
  onDisconnect: () => {
    console.warn("Lost connection to license server");
  },
});`

const states = [
  { name: 'ACTIVE', callback: 'onActive()', blocks: false, use: 'Full access', color: 'text-fuse-green' },
  { name: 'WARNING', callback: 'onWarning(msg)', blocks: false, use: 'Show a notice to the user', color: 'text-fuse-yellow' },
  { name: 'READONLY', callback: 'onReadonly()', blocks: true, use: 'Block writes, allow reads', color: 'text-fuse-blue' },
  { name: 'LIMITED', callback: 'onLimited()', blocks: false, use: 'Custom partial restrictions', color: 'text-fuse-orange' },
  { name: 'LOCKED', callback: 'onLocked(msg)', blocks: true, use: 'Full block with message', color: 'text-fuse-red' },
  { name: 'EXPIRED', callback: 'onExpired()', blocks: true, use: 'Contract ended', color: 'text-fuse-red' },
  { name: 'SLEEP', callback: 'onSleep()', blocks: true, use: 'Temporarily paused', color: 'text-fuse-dim' },
  { name: 'SELF_DESTRUCT', callback: 'onSelfDestruct()', blocks: true, use: 'Custom handler', color: 'text-fuse-purple' },
]

const frameworks = reactive([
  {
    name: 'React',
    open: false,
    code: `// src/App.jsx
import { useEffect } from "react";
import DeadFuse from "dead-fuse";

export function useLicenseControl() {
  useEffect(() => {
    DeadFuse.activate({
      projectId: import.meta.env.VITE_FUSE_PROJECT_ID,
      master: import.meta.env.VITE_FUSE_MASTER_URL,
      token: import.meta.env.VITE_FUSE_TOKEN,
      fallbackMode: "readonly",
      onLocked: (msg) => {
        window.location.href = \`/locked?msg=\${encodeURIComponent(msg)}\`;
      },
    });
    return () => DeadFuse.deactivate();
  }, []);
}

export default function App() {
  useLicenseControl();
  return <YourApp />;
}`,
  },
  {
    name: 'Next.js',
    open: false,
    code: `// app/providers.tsx
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
        document.body.innerHTML = \`<p style="text-align:center;padding:4rem">\${msg}</p>\`;
      },
    });
    return () => DeadFuse.deactivate();
  }, []);
  return children;
}`,
  },
  {
    name: 'Vue 3',
    open: false,
    code: `// src/plugins/deadfuse.js
import DeadFuse from "dead-fuse";

export default {
  install(app) {
    DeadFuse.activate({
      projectId: import.meta.env.VITE_FUSE_PROJECT_ID,
      master: import.meta.env.VITE_FUSE_MASTER_URL,
      token: import.meta.env.VITE_FUSE_TOKEN,
      fallbackMode: "readonly",
      onLocked: (msg) => {
        document.getElementById("app").innerHTML = \`<div>\${msg}</div>\`;
      },
    });
  },
};

// main.js
import { createApp } from "vue";
import App from "./App.vue";
import deadfusePlugin from "./plugins/deadfuse";

createApp(App).use(deadfusePlugin).mount("#app");`,
  },
  {
    name: 'Nuxt 3',
    open: false,
    code: `// plugins/deadfuse.client.ts
import DeadFuse from "dead-fuse";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  DeadFuse.activate({
    projectId: config.public.fuseProjectId,
    master: config.public.fuseMasterUrl,
    token: config.public.fuseToken,
    fallbackMode: "readonly",
    onLocked: (msg) => {
      navigateTo(\`/locked?message=\${encodeURIComponent(msg)}\`);
    },
  });
});`,
  },
  {
    name: 'Plain HTML (CDN)',
    open: false,
    code: `<!DOCTYPE html>
<html>
<head>
  <script type="module">
    import DeadFuse from "https://esm.sh/dead-fuse";
    DeadFuse.activate({
      projectId: "your-project-key",
      master: "wss://your-host.com/fuse",
      token: "your-public-token",
      onLocked: (msg) => {
        document.body.innerHTML = \`<h1>\${msg}</h1>\`;
      },
    });
  <\/script>
</head>
<body>
  <h1>My App</h1>
</body>
</html>`,
  },
])

const ethics = [
  'Always inform clients upfront that remote state control is embedded in their app.',
  'Include it in your contract terms before deploying.',
  'Use WARNING state as a first notice before escalating to READONLY or LOCKED.',
  'Always set a grace period — give clients time to respond.',
  'Restore access promptly after payment is received.',
  'Never use SELF_DESTRUCT to cause data loss or corruption.',
  'DeadFuse never deletes client data — it only sends control signals.',
]

async function copy(text: string, key: string) {
  await navigator.clipboard.writeText(text)
  copied.value = key
  setTimeout(() => { copied.value = '' }, 2000)
}
</script>

<style scoped>
.doc-heading {
  @apply text-xl font-bold text-fuse-text mb-3 pb-2 border-b border-fuse-border/50;
}
.doc-body {
  @apply text-fuse-dim text-sm leading-relaxed;
}
.code-inline {
  @apply bg-black/40 border border-white/[0.08] rounded px-1.5 py-0.5 font-mono text-fuse-text text-xs;
}
.glass-panel {
  @apply bg-white/[0.025] backdrop-blur-sm border border-white/[0.07] rounded-xl;
}
.code-block {
  @apply bg-black/50 border border-white/[0.07] rounded-lg overflow-hidden;
}
.code-block-header {
  @apply flex items-center justify-between px-4 py-2 border-b border-white/[0.06] text-xs text-fuse-dim font-mono;
}
.code-block-inner {
  @apply relative bg-black/30;
}
.code-content {
  @apply text-fuse-dim text-xs font-mono p-4 overflow-x-auto whitespace-pre leading-relaxed;
}
.copy-btn {
  @apply text-xs text-fuse-dim hover:text-fuse-text font-mono border border-white/[0.08]
  rounded px-2 py-0.5 transition-colors whitespace-nowrap;
}

/* Architecture diagram */
.architecture-diagram {
  @apply flex items-center gap-4 flex-wrap;
}
.arch-box {
  @apply flex-1 min-w-48 bg-white/[0.03] border rounded-xl p-4;
}
.arch-box--server { @apply border-fuse-red/30; }
.arch-box--client { @apply border-fuse-blue/30; }
.arch-label { @apply text-xs font-mono font-bold uppercase tracking-widest mb-3; }
.arch-box--server .arch-label { @apply text-fuse-red; }
.arch-box--client .arch-label { @apply text-fuse-blue; }
.arch-items { @apply flex flex-col gap-1; }
.arch-items span { @apply text-xs text-fuse-dim; }
.arch-arrow {
  @apply flex flex-col items-center gap-1 flex-shrink-0;
}
.arch-arrow-line {
  @apply w-12 h-0.5 bg-gradient-to-r from-fuse-red/50 to-fuse-blue/50;
}
.arch-arrow-label {
  @apply text-xs text-fuse-dim font-mono text-center leading-relaxed;
}

/* States table */
.states-table { @apply border border-white/[0.07] rounded-xl overflow-hidden; }
.states-header {
  @apply grid grid-cols-4 gap-4 px-4 py-2.5 bg-white/[0.04] text-xs font-mono text-fuse-dim uppercase tracking-widest;
}
.states-row {
  @apply grid grid-cols-4 gap-4 px-4 py-3 border-t border-white/[0.05] items-center;
}
.state-badge { @apply font-mono font-bold text-xs; }

/* Info grid */
.info-grid { @apply grid grid-cols-2 sm:grid-cols-4 gap-3; }
.info-card {
  @apply bg-white/[0.03] border border-white/[0.06] rounded-lg p-3 flex flex-col gap-1;
}
.info-label { @apply text-xs font-mono text-fuse-dim; }
.info-value { @apply text-fuse-text font-bold text-sm; }
</style>