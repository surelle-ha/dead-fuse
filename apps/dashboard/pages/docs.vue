<template>
  <div class="min-h-screen bg-fuse-black">
    <main class="flex-1 max-w-4xl mx-auto px-6 py-8 animate-slide-up">

      <div class="mb-10">
        <div class="inline-flex items-center gap-2 border border-fuse-red/20 bg-fuse-red/[0.06] text-fuse-red text-[9px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full mb-3"
          style="backdrop-filter: blur(8px);">
          Documentation
        </div>
        <h1 class="text-2xl font-bold text-fuse-text mb-2">How DeadFuse works</h1>
        <p class="text-fuse-dim text-sm leading-relaxed max-w-2xl">
          Remotely control access to deployed client applications in real time — no redeployment needed. Switch state from this dashboard and the client app responds instantly.
        </p>
      </div>

      <div class="glass-panel mb-10 p-4">
        <h2 class="text-[9px] font-mono text-fuse-muted uppercase tracking-widest mb-2.5">On this page</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-0.5">
          <a v-for="section in toc" :key="section.id" :href="`#${section.id}`"
            class="text-xs text-fuse-dim hover:text-fuse-text transition-colors py-1 flex items-center gap-1.5">
            <span class="text-fuse-red text-[9px]">→</span>
            {{ section.title }}
          </a>
        </div>
      </div>

      <div class="space-y-12">

        <section id="architecture">
          <h2 class="doc-heading">Architecture overview</h2>
          <p class="doc-body">DeadFuse is a two-part system: this dashboard (server) and the <code class="code-inline">dead-fuse</code> npm package (client SDK). The SDK opens a realtime channel on startup and listens for state broadcasts. When you toggle a project state here, it broadcasts instantly to every connected client.</p>
          <div class="arch-diagram mt-5">
            <div class="arch-box" style="border-color: rgba(255,51,51,0.2);">
              <div class="text-[9px] font-mono font-bold uppercase tracking-widest text-fuse-red mb-2">Dashboard</div>
              <div class="space-y-0.5 text-[10px] text-fuse-muted font-mono">
                <div>Admin UI</div>
                <div>REST API</div>
                <div>Realtime sync</div>
                <div>PostgreSQL</div>
              </div>
            </div>
            <div class="flex flex-col items-center gap-1 flex-shrink-0 self-center">
              <div class="w-10 h-px bg-gradient-to-r from-fuse-red/40 to-fuse-blue/40" />
              <span class="text-[8px] font-mono text-fuse-muted text-center leading-relaxed">Realtime<br>broadcast</span>
            </div>
            <div class="arch-box" style="border-color: rgba(68,136,255,0.2);">
              <div class="text-[9px] font-mono font-bold uppercase tracking-widest text-fuse-blue mb-2">Client app</div>
              <div class="space-y-0.5 text-[10px] text-fuse-muted font-mono">
                <div>dead-fuse SDK</div>
                <div>State callbacks</div>
                <div>HTTP interceptors</div>
              </div>
            </div>
          </div>
        </section>

        <section id="installation">
          <h2 class="doc-heading">Installation</h2>
          <p class="doc-body">Install the SDK in the client app you want to control.</p>
          <div class="code-block mt-3">
            <div class="code-block-header">
              <span>terminal</span>
              <button @click="copy('npm install @surelle-ha/dead-fuse', 'install')" class="copy-btn">{{ copied === 'install' ? '✓' : 'Copy' }}</button>
            </div>
            <pre class="code-content">npm install @surelle-ha/dead-fuse
# or
pnpm add @surelle-ha/dead-fuse</pre>
          </div>
        </section>

        <section id="limits">
          <h2 class="doc-heading">Project limits</h2>
          <p class="doc-body">Each account can manage up to <strong class="text-fuse-text font-medium">2 projects</strong> on the Free plan. The Projects page shows an upgrade notice when you hit the limit.</p>
          <div class="info-card mt-4 flex items-center justify-between">
            <span class="text-xs text-fuse-dim">Free plan limit</span>
            <span class="text-xs font-mono text-fuse-text font-bold">2 projects</span>
          </div>
        </section>

        <section id="usage">
          <h2 class="doc-heading">Basic usage</h2>
          <p class="doc-body">Call <code class="code-inline">DeadFuse.activate()</code> as early as possible in your app. Find your <span class="text-fuse-text">Project ID</span> and <span class="text-fuse-text">Public Token</span> on the project detail page.</p>
          <div class="code-block mt-3">
            <div class="code-block-header">
              <span>JavaScript / TypeScript</span>
              <button @click="copy(basicUsage, 'basic')" class="copy-btn">{{ copied === 'basic' ? '✓ Copied' : 'Copy' }}</button>
            </div>
            <pre class="code-content">{{ basicUsage }}</pre>
          </div>
        </section>

        <section id="states">
          <h2 class="doc-heading">Project states</h2>
          <p class="doc-body">Each state triggers a different callback and may intercept HTTP requests automatically.</p>
          <div class="states-table mt-4">
            <div class="states-header">
              <span>State</span>
              <span>Callback</span>
              <span class="hidden sm:block">Blocks</span>
              <span class="hidden md:block">Use case</span>
            </div>
            <div v-for="state in states" :key="state.name" class="states-row">
              <code class="font-mono font-bold text-[10px]" :class="state.color">{{ state.name }}</code>
              <code class="text-fuse-muted text-[10px] font-mono">{{ state.callback }}</code>
              <span class="hidden sm:block text-[10px]" :class="state.blocks ? 'text-fuse-red' : 'text-fuse-muted'">
                {{ state.blocks ? 'POST PUT PATCH DELETE' : '—' }}
              </span>
              <span class="hidden md:block text-[10px] text-fuse-muted">{{ state.use }}</span>
            </div>
          </div>
        </section>

        <section id="frameworks">
          <h2 class="doc-heading">Framework examples</h2>
          <div class="space-y-2 mt-3">
            <div v-for="fw in frameworks" :key="fw.name" class="glass-panel overflow-hidden p-0">
              <button @click="fw.open = !fw.open" class="w-full flex items-center justify-between px-4 py-3 text-left">
                <span class="text-xs font-medium text-fuse-text">{{ fw.name }}</span>
                <span class="text-fuse-muted text-xs transition-transform duration-150" :class="fw.open ? 'rotate-180' : ''">▾</span>
              </button>
              <div v-if="fw.open" class="border-t border-white/[0.06] relative">
                <button @click="copy(fw.code, fw.name)" class="copy-btn absolute top-2.5 right-3">
                  {{ copied === fw.name ? '✓ Copied' : 'Copy' }}
                </button>
                <pre class="code-content pr-16">{{ fw.code }}</pre>
              </div>
            </div>
          </div>
        </section>

        <section id="reconnection">
          <h2 class="doc-heading">Reconnection & fallback</h2>
          <p class="doc-body">If the Realtime channel drops, the SDK applies <code class="code-inline">fallbackMode</code> immediately and reconnects with exponential backoff.</p>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
            <div class="info-card flex-col gap-0.5">
              <span class="text-[9px] font-mono text-fuse-muted">Base delay</span>
              <span class="text-sm font-bold font-mono text-fuse-text">1s</span>
            </div>
            <div class="info-card flex-col gap-0.5">
              <span class="text-[9px] font-mono text-fuse-muted">Max delay</span>
              <span class="text-sm font-bold font-mono text-fuse-text">30s</span>
            </div>
            <div class="info-card flex-col gap-0.5">
              <span class="text-[9px] font-mono text-fuse-muted">Max attempts</span>
              <span class="text-sm font-bold font-mono text-fuse-text">10</span>
            </div>
            <div class="info-card flex-col gap-0.5">
              <span class="text-[9px] font-mono text-fuse-muted">Formula</span>
              <span class="text-[10px] font-bold font-mono text-fuse-text">min(1000×2ⁿ, 30k)</span>
            </div>
          </div>
        </section>

        <section id="ethics">
          <h2 class="doc-heading">Ethical usage</h2>
          <div class="space-y-2 mt-3">
            <div v-for="tip in ethics" :key="tip" class="flex items-start gap-2.5 text-xs text-fuse-dim">
              <span class="text-fuse-green mt-0.5 flex-shrink-0 text-[10px]">✓</span>
              {{ tip }}
            </div>
          </div>
        </section>

      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const copied = ref('')

const toc = [
  { id: 'architecture', title: 'Architecture overview' },
  { id: 'installation', title: 'Installation' },
  { id: 'limits',       title: 'Project limits' },
  { id: 'usage',        title: 'Basic usage' },
  { id: 'states',       title: 'Project states' },
  { id: 'frameworks',   title: 'Framework examples' },
  { id: 'reconnection', title: 'Reconnection & fallback' },
  { id: 'ethics',       title: 'Ethical usage' },
]

const basicUsage = `import DeadFuse from "@surelle-ha/dead-fuse";

DeadFuse.activate({
  projectId: "YOUR_PROJECT_KEY",
  token: "YOUR_INSTANCE_TOKEN",
  fallbackMode: "readonly",

  onActive:   () => console.log("App is active"),
  onWarning:  (msg) => showBanner(msg),
  onReadonly: () => showNotice("Read-only mode active"),
  onLimited:  () => disablePremiumFeatures(),
  onLocked:   (msg) => { document.body.innerHTML = \`<h1>\${msg}</h1>\`; },
  onExpired:  () => showPage("Contract expired. Please renew."),
  onDisconnect: () => console.warn("Lost connection"),
});`

const states = [
  { name: 'ACTIVE',        callback: 'onActive()',       blocks: false, use: 'Full access',              color: 'text-fuse-green'  },
  { name: 'WARNING',       callback: 'onWarning(msg)',   blocks: false, use: 'Show notice to user',      color: 'text-fuse-yellow' },
  { name: 'READONLY',      callback: 'onReadonly()',     blocks: true,  use: 'Block writes, allow reads', color: 'text-fuse-blue'   },
  { name: 'LIMITED',       callback: 'onLimited()',      blocks: false, use: 'Custom partial restrict',   color: 'text-fuse-orange' },
  { name: 'LOCKED',        callback: 'onLocked(msg)',    blocks: true,  use: 'Full block with message',   color: 'text-fuse-red'    },
  { name: 'EXPIRED',       callback: 'onExpired()',      blocks: true,  use: 'Contract ended',            color: 'text-fuse-red'    },
  { name: 'SLEEP',         callback: 'onSleep()',        blocks: true,  use: 'App paused',                color: 'text-fuse-dim'    },
  { name: 'SELF_DESTRUCT', callback: 'onSelfDestruct()', blocks: true, use: 'Custom handler',            color: 'text-fuse-purple' },
]

const frameworks = reactive([
  {
    name: 'React', open: false,
    code: `import { useEffect } from "react";
import DeadFuse from "@surelle-ha/dead-fuse";

export function useLicenseControl() {
  useEffect(() => {
    DeadFuse.activate({
      projectId: import.meta.env.VITE_FUSE_PROJECT_ID,
      token: import.meta.env.VITE_FUSE_TOKEN,
      fallbackMode: "readonly",
      onLocked: (msg) => { window.location.href = \`/locked?msg=\${encodeURIComponent(msg)}\`; },
    });
    return () => DeadFuse.deactivate();
  }, []);
}`,
  },
  {
    name: 'Next.js', open: false,
    code: `// app/providers.tsx
"use client";
import { useEffect } from "react";
import DeadFuse from "@surelle-ha/dead-fuse";

export function FuseProvider({ children }) {
  useEffect(() => {
    DeadFuse.activate({
      projectId: process.env.NEXT_PUBLIC_FUSE_PROJECT_ID,
      token: process.env.NEXT_PUBLIC_FUSE_TOKEN,
      fallbackMode: "readonly",
      onLocked: (msg) => {
        document.body.innerHTML = \`<p style="padding:4rem;text-align:center">\${msg}</p>\`;
      },
    });
    return () => DeadFuse.deactivate();
  }, []);
  return children;
}`,
  },
  {
    name: 'Vue 3', open: false,
    code: `// src/plugins/deadfuse.js
import DeadFuse from "@surelle-ha/dead-fuse";

export default {
  install(app) {
    DeadFuse.activate({
      projectId: import.meta.env.VITE_FUSE_PROJECT_ID,
      token: import.meta.env.VITE_FUSE_TOKEN,
      fallbackMode: "readonly",
      onLocked: (msg) => {
        document.getElementById("app").innerHTML = \`<div>\${msg}</div>\`;
      },
    });
  },
};`,
  },
  {
    name: 'Nuxt 3', open: false,
    code: `// plugins/deadfuse.client.ts
import DeadFuse from "@surelle-ha/dead-fuse";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  DeadFuse.activate({
    projectId: config.public.fuseProjectId,
    token: config.public.fuseToken,
    fallbackMode: "readonly",
    onLocked: (msg) => {
      navigateTo(\`/locked?message=\${encodeURIComponent(msg)}\`);
    },
  });
});`,
  },
  {
    name: 'Plain HTML (CDN)', open: false,
    code: `<script type="module">
  import DeadFuse from "https://esm.sh/@surelle-ha/dead-fuse";
  DeadFuse.activate({
    projectId: "your-project-key",
    token: "your-public-token",
    onLocked: (msg) => {
      document.body.innerHTML = \`<h1>\${msg}</h1>\`;
    },
  });
<\/script>`,
  },
])

const ethics = [
  'Always inform clients upfront that remote state control is embedded.',
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
  @apply text-sm font-bold text-fuse-text mb-2.5 pb-2 border-b border-white/[0.06] uppercase tracking-widest font-mono;
}
.doc-body { @apply text-fuse-dim text-xs leading-relaxed; }

.code-inline {
  @apply rounded px-1.5 py-0.5 font-mono text-fuse-text text-[10px];
  background: rgba(255,255,255,0.06);
  border: 0.5px solid rgba(255,255,255,0.08);
}

.glass-panel {
  @apply rounded-xl border border-white/[0.07] p-4;
  background: rgba(255,255,255,0.025);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.code-block {
  @apply rounded-xl border border-white/[0.07] overflow-hidden;
  background: rgba(0,0,0,0.4);
}
.code-block-header {
  @apply flex items-center justify-between px-3 py-2 border-b border-white/[0.06] text-[10px] text-fuse-muted font-mono;
}
.code-content {
  @apply text-fuse-dim text-[11px] font-mono p-3 overflow-x-auto whitespace-pre leading-relaxed;
}
.copy-btn {
  @apply text-[10px] text-fuse-muted hover:text-fuse-text font-mono border border-white/[0.08] rounded px-1.5 py-0.5 transition-colors whitespace-nowrap;
  background: rgba(255,255,255,0.03);
}

/* Architecture diagram */
.arch-diagram { @apply flex items-stretch gap-3 flex-wrap; }
.arch-box {
  @apply flex-1 min-w-36 rounded-xl border p-4;
  background: rgba(255,255,255,0.02);
  backdrop-filter: blur(8px);
}

/* States table */
.states-table { @apply rounded-xl border border-white/[0.07] overflow-hidden; }
.states-header {
  @apply grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 px-4 py-2 text-[9px] font-mono text-fuse-muted uppercase tracking-widest;
  background: rgba(255,255,255,0.03);
}
.states-row {
  @apply grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 px-4 py-2.5 border-t border-white/[0.04] items-center;
}

/* Info cards */
.info-card {
  @apply flex rounded-lg border border-white/[0.06] p-3;
  background: rgba(255,255,255,0.02);
}
</style>