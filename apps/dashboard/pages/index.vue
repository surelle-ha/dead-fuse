<template>
  <main class="landing">

    <!-- ─── BACKGROUND ─────────────────────────────────────── -->
    <div class="bg-grid" aria-hidden="true" />
    <div class="bg-orb bg-orb--1" aria-hidden="true" />
    <div class="bg-orb bg-orb--2" aria-hidden="true" />
    <div class="bg-orb bg-orb--3" aria-hidden="true" />
    <div class="noise" aria-hidden="true" />

    <!-- ─── NAV ────────────────────────────────────────────── -->
    <nav class="nav glass-nav">
      <div class="nav-inner">
        <div class="nav-logo">
          <div class="logo-icon">
            <img :src="logo" alt="" class="logo-img" />
          </div>
          <span class="logo-text">DeadFuse<span class="logo-dot">.js</span></span>
        </div>
        <div class="nav-links">
          <a href="#how" class="nav-link">How it works</a>
          <a href="#states" class="nav-link">States</a>
          <a href="#pricing" class="nav-link">Pricing</a>
          <a href="#sdk" class="nav-link">SDK</a>
        </div>
        <NuxtLink to="/login" class="nav-cta">
          <span>Dashboard</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </NuxtLink>
      </div>
    </nav>

    <!-- ─── HERO ────────────────────────────────────────────── -->
    <section class="hero">
      <div class="hero-eyebrow">
        <span class="eyebrow-dot" />
        Ethical · Recoverable · Instant
      </div>
      <h1 class="hero-headline">
        Remote control<br/>
        <span class="hero-gradient">for deployed apps.</span>
      </h1>
      <p class="hero-sub">
        Switch any client app into read-only, limited, or locked mode
        in real time — without touching the codebase. One signal.
        Zero data risk. Full recovery.
      </p>
      <div class="hero-actions">
        <NuxtLink to="/login" class="btn-hero-primary">
          Open Dashboard
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </NuxtLink>
        <a href="#sdk" class="btn-hero-ghost">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1.5" y="2.5" width="11" height="9" rx="1.5" stroke="currentColor" stroke-width="1.25"/><path d="M4 6l2 2-2 2M7.5 10h2.5" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/></svg>
          View SDK
        </a>
      </div>

      <!-- Floating terminal -->
      <div class="hero-terminal glass-terminal">
        <div class="terminal-bar">
          <span class="tbar-dot tbar-dot--r" />
          <span class="tbar-dot tbar-dot--y" />
          <span class="tbar-dot tbar-dot--g" />
          <span class="tbar-title">deadfuse.js</span>
        </div>
        <pre class="terminal-code"><span class="tc-import">import</span> DeadFuse <span class="tc-import">from</span> <span class="tc-str">"@surelle-ha/dead-fuse"</span><span class="tc-semi">;</span>

DeadFuse<span class="tc-punc">.</span><span class="tc-fn">activate</span><span class="tc-punc">({</span>
  <span class="tc-key">projectId</span><span class="tc-punc">:</span> <span class="tc-str">"acme-dashboard"</span><span class="tc-punc">,</span>
  <span class="tc-key">token</span><span class="tc-punc">:</span>     <span class="tc-str">"prod-token-here"</span><span class="tc-punc">,</span>

  <span class="tc-key">onReadonly</span><span class="tc-punc">:</span> <span class="tc-punc">()</span> <span class="tc-import">=&gt;</span> showBanner<span class="tc-punc">(),</span>
  <span class="tc-key">onLocked</span><span class="tc-punc">:</span>   <span class="tc-punc">(</span><span class="tc-key">msg</span><span class="tc-punc">)</span> <span class="tc-import">=&gt;</span> lockScreen<span class="tc-punc">(</span>msg<span class="tc-punc">),</span>
<span class="tc-punc">});</span></pre>
        <div class="terminal-status">
          <span class="status-dot" />
          <span>Connected · ACTIVE</span>
        </div>
      </div>

      <!-- Stat chips row -->
      <div class="hero-chips">
        <div class="glass-chip">
          <span class="metric-val">8</span>
          <span class="metric-label">Project states</span>
        </div>
        <div class="hero-chips-sep" />
        <div class="glass-chip">
          <span class="metric-dot metric-dot--green" />
          <span class="metric-label">Realtime sync</span>
        </div>
        <div class="hero-chips-sep" />
        <div class="glass-chip">
          <span class="metric-val">&lt;100ms</span>
          <span class="metric-label">Broadcast latency</span>
        </div>
      </div>
    </section>

    <!-- ─── LOGOS / TRUST ──────────────────────────────────── -->
    <section class="trust">
      <p class="trust-label">Works with any frontend framework</p>
      <div class="trust-logos">
        <span class="trust-logo">React</span>
        <span class="trust-sep">·</span>
        <span class="trust-logo">Next.js</span>
        <span class="trust-sep">·</span>
        <span class="trust-logo">Vue 3</span>
        <span class="trust-sep">·</span>
        <span class="trust-logo">Nuxt 3</span>
        <span class="trust-sep">·</span>
        <span class="trust-logo">SvelteKit</span>
        <span class="trust-sep">·</span>
        <span class="trust-logo">Plain HTML</span>
      </div>
    </section>

    <!-- ─── HOW IT WORKS ───────────────────────────────────── -->
    <section class="section" id="how">
      <div class="section-header">
        <div class="section-badge">How it works</div>
        <h2 class="section-title">One dashboard.<br/>Instant control.</h2>
        <p class="section-sub">A lightweight pub/sub architecture connects your dashboard to every deployed client app in real time — no redeployment needed.</p>
      </div>

      <div class="flow-grid">
        <div class="flow-card glass-card" v-for="(step, i) in steps" :key="i">
          <div class="flow-num">{{ String(i + 1).padStart(2,'0') }}</div>
          <div class="flow-icon" :class="step.iconClass">
            <span v-html="step.icon" />
          </div>
          <h3 class="flow-title">{{ step.title }}</h3>
          <p class="flow-desc">{{ step.desc }}</p>
          <div v-if="i < steps.length - 1" class="flow-arrow" aria-hidden="true">→</div>
        </div>
      </div>

      <!-- Architecture diagram -->
      <div class="arch-diagram glass-card">
        <div class="arch-node arch-node--dashboard">
          <div class="arch-icon">
            <img :src="logo" alt="" style="width:20px;height:20px;" />
          </div>
          <div>
            <p class="arch-node-title">Dashboard</p>
            <p class="arch-node-sub">Admin UI · REST API</p>
          </div>
        </div>
        <div class="arch-pipe">
          <div class="arch-pipe-line" />
          <div class="arch-pipe-label">
            <span class="pipe-pulse" />
            Realtime broadcast
          </div>
          <div class="arch-pipe-line" />
        </div>
        <div class="arch-node arch-node--sdk">
          <div class="arch-icon arch-icon--blue">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1.5" y="2.5" width="15" height="13" rx="2" stroke="#4488ff" stroke-width="1.5"/><path d="M4.5 7L7 9.5 4.5 12M9 12h4" stroke="#4488ff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <div>
            <p class="arch-node-title">Client App</p>
            <p class="arch-node-sub">dead-fuse SDK · Any framework</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── STATES ─────────────────────────────────────────── -->
    <section class="section" id="states">
      <div class="section-header">
        <div class="section-badge">Project states</div>
        <h2 class="section-title">Eight states.<br/>Total coverage.</h2>
        <p class="section-sub">From a friendly warning banner to a full lockdown — every scenario a freelancer faces is built in.</p>
      </div>

      <div class="states-grid">
        <div
          v-for="state in projectStates"
          :key="state.name"
          class="state-card glass-card"
          :class="state.cardClass"
        >
          <div class="state-header">
            <div class="state-indicator" :class="state.dotClass" />
            <code class="state-name" :class="state.textClass">{{ state.name }}</code>
            <span v-if="state.blocks" class="state-blocks-badge">Blocks writes</span>
          </div>
          <p class="state-desc">{{ state.desc }}</p>
          <code class="state-callback">{{ state.callback }}</code>
        </div>
      </div>
    </section>

    <!-- ─── ETHICS ─────────────────────────────────────────── -->
    <section class="ethics-section">
      <div class="ethics-inner glass-card">
        <div class="ethics-left">
          <div class="section-badge">Philosophy</div>
          <h2 class="ethics-title">Built on trust,<br/>not pressure.</h2>
          <p class="ethics-sub">DeadFuse is designed for professional, ethical client relationships. It never destroys data. It always allows recovery.</p>
        </div>
        <div class="ethics-right">
          <div v-for="point in ethicsPoints" :key="point.text" class="ethics-row">
            <span class="ethics-icon" :class="point.iconClass">{{ point.icon }}</span>
            <span class="ethics-text">{{ point.text }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── SDK INSTALL ────────────────────────────────────── -->
    <section class="section" id="sdk">
      <div class="section-header">
        <div class="section-badge">SDK</div>
        <h2 class="section-title">Install once.<br/>Control forever.</h2>
        <p class="section-sub">One package, two lines of config, infinite control.</p>
      </div>

      <div class="sdk-grid">
        <div class="sdk-install glass-card">
          <div class="terminal-bar">
            <span class="tbar-dot tbar-dot--r" /><span class="tbar-dot tbar-dot--y" /><span class="tbar-dot tbar-dot--g" />
            <span class="tbar-title">terminal</span>
          </div>
          <pre class="terminal-code" style="padding:16px 20px;">
<span class="tc-str">$</span> npm install @surelle-ha/dead-fuse

<span class="tc-punc"># or</span>
<span class="tc-str">$</span> pnpm add @surelle-ha/dead-fuse</pre>
        </div>

        <div class="sdk-tabs glass-card">
          <div class="tab-row">
            <button
              v-for="fw in frameworks"
              :key="fw.name"
              class="tab-btn"
              :class="activeTab === fw.name ? 'tab-btn--active' : ''"
              @click="activeTab = fw.name"
            >{{ fw.name }}</button>
          </div>
          <pre class="terminal-code tab-code" v-html="activeFramework?.highlighted" />
        </div>
      </div>
    </section>

    <!-- ─── PRICING ────────────────────────────────────────── -->
    <section class="section" id="pricing">
      <div class="section-header">
        <div class="section-badge">Pricing</div>
        <h2 class="section-title">Simple, honest pricing.</h2>
        <p class="section-sub">No seats. No per-client fees. Just projects.</p>
        <div class="billing-toggle">
          <span :class="billing==='monthly'?'toggle-label--active':'toggle-label'">Monthly</span>
          <button class="toggle-track" :class="billing==='yearly'?'toggle-on':'toggle-off'" @click="billing=billing==='monthly'?'yearly':'monthly'">
            <span class="toggle-thumb" />
          </button>
          <span :class="billing==='yearly'?'toggle-label--active':'toggle-label'">
            Yearly <span class="save-badge">–20%</span>
          </span>
        </div>
      </div>

      <div class="pricing-grid">
        <div v-for="plan in plans" :key="plan.id" class="pricing-card glass-card" :class="plan.featured?'pricing-card--featured':''">
          <div v-if="plan.featured" class="pricing-popular">Most popular</div>
          <div class="pricing-header">
            <h3 class="pricing-name">{{ plan.name }}</h3>
            <p class="pricing-desc">{{ plan.desc }}</p>
          </div>
          <div class="pricing-price">
            <span class="price-val">${{ billing==='yearly' ? plan.yearlyPrice : plan.monthlyPrice }}</span>
            <span class="price-period">/mo</span>
          </div>
          <ul class="pricing-features">
            <li v-for="f in plan.features" :key="f.text" class="pricing-feature" :class="!f.included?'pricing-feature--dim':''">
              <span :class="f.included?'feat-check':'feat-x'">{{ f.included ? '✓' : '×' }}</span>
              {{ f.text }}
            </li>
          </ul>
          <NuxtLink to="/pricing" class="pricing-cta" :class="plan.featured?'pricing-cta--featured':''">
            {{ plan.cta }}
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ─── CTA ────────────────────────────────────────────── -->
    <section class="cta-section">
      <div class="cta-inner glass-card">
        <div class="cta-orb" aria-hidden="true" />
        <div class="section-badge" style="margin-bottom:16px;">Get started today</div>
        <h2 class="cta-title">Take control of your<br/>client relationships.</h2>
        <p class="cta-sub">Deploy in minutes. Free plan includes 2 projects.</p>
        <div class="cta-actions">
          <NuxtLink to="/login" class="btn-hero-primary">Open Dashboard →</NuxtLink>
          <a href="https://www.npmjs.com/package/@surelle-ha/dead-fuse" target="_blank" rel="noopener" class="btn-hero-ghost">
            npm install
          </a>
        </div>
      </div>
    </section>

    <!-- ─── FOOTER ─────────────────────────────────────────── -->
    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <div class="nav-logo">
            <div class="logo-icon">
              <img :src="logo" alt="" class="logo-img" />
            </div>
            <span class="logo-text">DeadFuse<span class="logo-dot">.js</span></span>
          </div>
          <p class="footer-tagline">Ethical license enforcement for freelancers and agencies.</p>
        </div>
        <div class="footer-links">
          <a href="#how" class="footer-link">How it works</a>
          <a href="#states" class="footer-link">States</a>
          <a href="#pricing" class="footer-link">Pricing</a>
          <a href="#sdk" class="footer-link">SDK</a>
          <NuxtLink to="/login" class="footer-link">Dashboard</NuxtLink>
        </div>
        <p class="footer-copy">MIT License · Built with ❤ for freelancers</p>
      </div>
    </footer>
  </main>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import logo from '~/assets/logo.svg'

definePageMeta({ layout: 'public' })

const billing = ref<'monthly' | 'yearly'>('monthly')
const activeTab = ref('React')

const steps = [
  {
    icon: `<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="2" y="3" width="18" height="16" rx="2.5" stroke="currentColor" stroke-width="1.5"/><path d="M6 9h10M6 13h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    iconClass: 'flow-icon--red',
    title: 'Create a project',
    desc: 'Add your client app to the dashboard. Get a project key and generate instance tokens for each deployment.'
  },
  {
    icon: `<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="2" y="3.5" width="18" height="15" rx="2.5" stroke="currentColor" stroke-width="1.5"/><path d="M5.5 8L8.5 11 5.5 14M10 14h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    iconClass: 'flow-icon--blue',
    title: 'Embed the SDK',
    desc: 'npm install once. Call DeadFuse.activate() with your credentials and define your state callbacks.'
  },
  {
    icon: `<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="1.5"/><path d="M11 7v4l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    iconClass: 'flow-icon--yellow',
    title: 'Deploy & connect',
    desc: 'The SDK opens a realtime channel. Your client app receives the current state instantly on startup.'
  },
  {
    icon: `<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M4 11h14M4 7h8M4 15h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    iconClass: 'flow-icon--green',
    title: 'Flip the switch',
    desc: 'Change state from the dashboard. All connected clients respond within milliseconds. No redeployment.'
  },
]

const projectStates = [
  { name: 'ACTIVE', dotClass: 'dot-green', textClass: 'text-green', cardClass: '', desc: 'Full access. App runs normally.', callback: 'onActive()', blocks: false },
  { name: 'WARNING', dotClass: 'dot-yellow', textClass: 'text-yellow', cardClass: '', desc: 'Sends a warning message to all clients.', callback: 'onWarning(msg)', blocks: false },
  { name: 'READONLY', dotClass: 'dot-blue', textClass: 'text-blue', cardClass: '', desc: 'Blocks all write operations automatically.', callback: 'onReadonly()', blocks: true },
  { name: 'LIMITED', dotClass: 'dot-orange', textClass: 'text-orange', cardClass: '', desc: 'Custom partial restriction via handler.', callback: 'onLimited()', blocks: false },
  { name: 'LOCKED', dotClass: 'dot-red', textClass: 'text-red', cardClass: 'state-card--alert', desc: 'Full block. Writes intercepted + custom UI.', callback: 'onLocked(msg)', blocks: true },
  { name: 'EXPIRED', dotClass: 'dot-red', textClass: 'text-red', cardClass: 'state-card--alert', desc: 'Contract ended. Triggers expiry handler.', callback: 'onExpired()', blocks: true },
  { name: 'SLEEP', dotClass: 'dot-dim', textClass: 'text-dim', cardClass: '', desc: 'App temporarily paused.', callback: 'onSleep()', blocks: true },
  { name: 'SELF_DESTRUCT', dotClass: 'dot-purple', textClass: 'text-purple', cardClass: '', desc: 'Fully custom — you define what happens.', callback: 'onSelfDestruct()', blocks: true },
]

const ethicsPoints = [
  { icon: '✓', iconClass: 'ei-green', text: 'Never deletes client data — only sends control signals' },
  { icon: '✓', iconClass: 'ei-green', text: 'Read-only as default enforcement — not destruction' },
  { icon: '✓', iconClass: 'ei-green', text: 'Full recovery available instantly after payment' },
  { icon: '✓', iconClass: 'ei-green', text: 'Use WARNING before escalating to LOCKED' },
  { icon: '✓', iconClass: 'ei-green', text: 'Client controls the deployed app — you send the signal' },
  { icon: '⚠', iconClass: 'ei-yellow', text: 'Always disclose DeadFuse in your contract terms' },
]

const frameworks = [
  {
    name: 'React',
    highlighted: `<span class="tc-import">import</span> { useEffect } <span class="tc-import">from</span> <span class="tc-str">"react"</span>;
<span class="tc-import">import</span> DeadFuse <span class="tc-import">from</span> <span class="tc-str">"@surelle-ha/dead-fuse"</span>;

<span class="tc-import">export</span> <span class="tc-import">function</span> <span class="tc-fn">App</span>() {
  useEffect(() => {
    DeadFuse.<span class="tc-fn">activate</span>({
      <span class="tc-key">projectId</span>: import.meta.env.VITE_FUSE_PROJECT_ID,
      <span class="tc-key">token</span>:     import.meta.env.VITE_FUSE_TOKEN,
      <span class="tc-key">onLocked</span>: (msg) => showLockScreen(msg),
    });
    <span class="tc-import">return</span> () => DeadFuse.<span class="tc-fn">deactivate</span>();
  }, []);
}`
  },
  {
    name: 'Next.js',
    highlighted: `<span class="tc-str">"use client"</span>;
<span class="tc-import">import</span> { useEffect } <span class="tc-import">from</span> <span class="tc-str">"react"</span>;
<span class="tc-import">import</span> DeadFuse <span class="tc-import">from</span> <span class="tc-str">"@surelle-ha/dead-fuse"</span>;

<span class="tc-import">export function</span> <span class="tc-fn">FuseProvider</span>({ children }) {
  useEffect(() => {
    DeadFuse.<span class="tc-fn">activate</span>({
      <span class="tc-key">projectId</span>: process.env.NEXT_PUBLIC_FUSE_PROJECT_ID,
      <span class="tc-key">token</span>:     process.env.NEXT_PUBLIC_FUSE_TOKEN,
    });
    <span class="tc-import">return</span> () => DeadFuse.<span class="tc-fn">deactivate</span>();
  }, []);
  <span class="tc-import">return</span> children;
}`
  },
  {
    name: 'Vue 3',
    highlighted: `<span class="tc-import">import</span> DeadFuse <span class="tc-import">from</span> <span class="tc-str">"@surelle-ha/dead-fuse"</span>;

<span class="tc-import">export default</span> {
  <span class="tc-fn">install</span>(app) {
    DeadFuse.<span class="tc-fn">activate</span>({
      <span class="tc-key">projectId</span>: <span class="tc-str">"your-project-key"</span>,
      <span class="tc-key">token</span>:     <span class="tc-str">"your-token"</span>,
      <span class="tc-key">onReadonly</span>: () => showNotice(),
      <span class="tc-key">onLocked</span>:  (msg) => lockUI(msg),
    });
  },
};`
  },
  {
    name: 'Nuxt 3',
    highlighted: `<span class="tc-punc">// plugins/deadfuse.client.ts</span>
<span class="tc-import">import</span> DeadFuse <span class="tc-import">from</span> <span class="tc-str">"@surelle-ha/dead-fuse"</span>;

<span class="tc-import">export default</span> <span class="tc-fn">defineNuxtPlugin</span>(() => {
  <span class="tc-import">const</span> config = useRuntimeConfig();
  DeadFuse.<span class="tc-fn">activate</span>({
    <span class="tc-key">projectId</span>: config.public.fuseProjectId,
    <span class="tc-key">token</span>:     config.public.fuseToken,
    <span class="tc-key">onLocked</span>: (msg) =>
      navigateTo(<span class="tc-str">\`/locked?message=\${msg}\`</span>),
  });
});`
  },
]

const activeFramework = computed(() =>
  frameworks.find(f => f.name === activeTab.value)
)

const plans = [
  {
    id: 'free',
    name: 'Free',
    desc: 'For solo freelancers getting started.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    featured: false,
    cta: 'Start free',
    features: [
      { text: '2 projects', included: true },
      { text: 'All 8 states', included: true },
      { text: 'Realtime sync', included: true },
      { text: 'GitHub login', included: true },
      { text: 'Priority support', included: false },
      { text: 'Custom domain', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    desc: 'For active freelancers with multiple clients.',
    monthlyPrice: 12,
    yearlyPrice: 10,
    featured: true,
    cta: 'Upgrade to Pro',
    features: [
      { text: '25 projects', included: true },
      { text: 'All 8 states', included: true },
      { text: 'Realtime sync', included: true },
      { text: 'GitHub login', included: true },
      { text: 'Priority support', included: true },
      { text: 'Custom domain', included: true },
    ],
  },
  {
    id: 'agency',
    name: 'Agency',
    desc: 'For studios managing clients at scale.',
    monthlyPrice: 39,
    yearlyPrice: 32,
    featured: false,
    cta: 'Upgrade to Agency',
    features: [
      { text: 'Unlimited projects', included: true },
      { text: 'All 8 states', included: true },
      { text: 'Realtime sync', included: true },
      { text: 'GitHub login', included: true },
      { text: 'Priority support', included: true },
      { text: 'Up to 5 team members', included: true },
    ],
  },
]
</script>

<style scoped>
/* ──────────────────────────────────────────────────────────────
   ROOT / RESET
────────────────────────────────────────────────────────────── */
.landing {
  min-height: 100vh;
  background: #080808;
  color: #f0f0f0;
  font-family: 'Syne', sans-serif;
  overflow-x: hidden;
  position: relative;
}

/* ──────────────────────────────────────────────────────────────
   BACKGROUND EFFECTS
────────────────────────────────────────────────────────────── */
.bg-grid {
  position: fixed;
  inset: 0;
  z-index: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
  background-size: 48px 48px;
  pointer-events: none;
}

.noise {
  position: fixed;
  inset: 0;
  z-index: 0;
  opacity: 0.04;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 160px;
  pointer-events: none;
}

.bg-orb {
  position: fixed;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(100px);
  z-index: 0;
}
.bg-orb--1 {
  width: 600px; height: 600px;
  top: -200px; left: 50%;
  transform: translateX(-50%);
  background: radial-gradient(circle, rgba(255,51,51,0.12) 0%, transparent 70%);
  animation: orb-drift 20s ease-in-out infinite alternate;
}
.bg-orb--2 {
  width: 400px; height: 400px;
  bottom: 30%; right: -100px;
  background: radial-gradient(circle, rgba(68,136,255,0.08) 0%, transparent 70%);
  animation: orb-drift 25s ease-in-out infinite alternate-reverse;
}
.bg-orb--3 {
  width: 350px; height: 350px;
  bottom: 0; left: 10%;
  background: radial-gradient(circle, rgba(204,68,255,0.06) 0%, transparent 70%);
  animation: orb-drift 18s ease-in-out infinite alternate;
}
@keyframes orb-drift {
  0%   { transform: translate(0, 0); }
  100% { transform: translate(30px, 40px); }
}

/* ──────────────────────────────────────────────────────────────
   NAV
────────────────────────────────────────────────────────────── */
.glass-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  background: rgba(8,8,8,0.7);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}
.nav-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
  height: 56px;
  display: flex;
  align-items: center;
  gap: 40px;
}
.nav-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.logo-icon {
  width: 32px; height: 32px;
  background: rgba(255,51,51,0.1);
  border: 1px solid rgba(255,51,51,0.25);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.logo-img { width: 22px; height: 22px; }
.logo-text {
  font-size: 14px;
  font-weight: 800;
  color: #f0f0f0;
  letter-spacing: -0.01em;
}
.logo-dot { color: #ff3333; }

.nav-links {
  display: flex;
  align-items: center;
  gap: 28px;
  flex: 1;
}
.nav-link {
  font-size: 12px;
  font-family: 'Space Mono', monospace;
  color: #6b6b6b;
  text-decoration: none;
  transition: color 0.15s;
}
.nav-link:hover { color: #f0f0f0; }

.nav-cta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-family: 'Space Mono', monospace;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #fff;
  background: #ff3333;
  padding: 7px 14px;
  border-radius: 8px;
  text-decoration: none;
  transition: background 0.15s;
  flex-shrink: 0;
}
.nav-cta:hover { background: #ef4444; }

/* ──────────────────────────────────────────────────────────────
   HERO
────────────────────────────────────────────────────────────── */
.hero {
  position: relative;
  z-index: 1;
  max-width: 1100px;
  margin: 0 auto;
  padding: 90px 24px 72px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 10px;
  font-family: 'Space Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  color: #6b6b6b;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.03);
  padding: 6px 16px;
  border-radius: 100px;
  margin-bottom: 32px;
  animation: fade-up 0.6s ease forwards;
}
.eyebrow-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #ff3333;
  animation: blink 2s ease-in-out infinite;
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.3; }
}

.hero-headline {
  font-size: clamp(40px, 5.5vw, 64px);
  font-weight: 800;
  line-height: 1.08;
  letter-spacing: -0.01em;
  color: #f0f0f0;
  margin-bottom: 20px;
  animation: fade-up 0.6s 0.1s ease forwards;
  opacity: 0;
  animation-fill-mode: forwards;
}
.hero-gradient {
  background: linear-gradient(135deg, #ff3333 0%, #ff8c00 50%, #cc44ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-sub {
  max-width: 560px;
  font-size: 16px;
  line-height: 1.7;
  color: #ababab;
  margin-bottom: 40px;
  animation: fade-up 0.6s 0.2s ease forwards;
  opacity: 0;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 0;
  animation: fade-up 0.6s 0.3s ease forwards;
  opacity: 0;
}

.btn-hero-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #ff3333;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  padding: 12px 24px;
  border-radius: 10px;
  text-decoration: none;
  transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
  box-shadow: 0 0 0 0 rgba(255,51,51,0);
}
.btn-hero-primary:hover {
  background: #ef4444;
  transform: translateY(-1px);
  box-shadow: 0 8px 32px rgba(255,51,51,0.3);
}
.btn-hero-ghost {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(255,255,255,0.12);
  color: #ababab;
  font-size: 13px;
  font-weight: 600;
  padding: 11px 20px;
  border-radius: 10px;
  text-decoration: none;
  transition: border-color 0.15s, color 0.15s;
  background: rgba(255,255,255,0.02);
}
.btn-hero-ghost:hover {
  border-color: rgba(255,255,255,0.22);
  color: #f0f0f0;
}

/* ── Terminal ── */
.hero-terminal {
  width: 100%;
  max-width: 560px;
  text-align: left;
  margin-top: 48px;
  animation: fade-up 0.6s 0.5s ease forwards;
  opacity: 0;
}
.glass-terminal {
  background: rgba(10,10,10,0.8);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  backdrop-filter: blur(20px);
  overflow: hidden;
  box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(255,255,255,0.04);
}
.terminal-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  background: rgba(255,255,255,0.02);
}
.tbar-dot {
  width: 10px; height: 10px;
  border-radius: 50%;
}
.tbar-dot--r { background: #ff5f57; }
.tbar-dot--y { background: #febc2e; }
.tbar-dot--g { background: #28c840; }
.tbar-title {
  margin-left: 8px;
  font-size: 10px;
  font-family: 'Space Mono', monospace;
  color: #555;
}
.terminal-code {
  padding: 20px;
  font-size: 12px;
  font-family: 'Space Mono', monospace;
  line-height: 1.8;
  color: #ababab;
  margin: 0;
  overflow-x: auto;
  white-space: pre;
}
.terminal-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-top: 1px solid rgba(255,255,255,0.07);
  font-size: 10px;
  font-family: 'Space Mono', monospace;
  color: #00ff88;
  background: rgba(0,255,136,0.03);
}
.status-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #00ff88;
  animation: blink 1.5s ease-in-out infinite;
}

/* Syntax colours */
.tc-import  { color: #cc44ff; }
.tc-str     { color: #00ff88; }
.tc-fn      { color: #ff8c00; }
.tc-key     { color: #4488ff; }
.tc-punc    { color: #6b6b6b; }
.tc-semi    { color: #6b6b6b; }

/* ── Floating metrics ── */
.hero-chips {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  animation: fade-up 0.6s 0.4s ease forwards;
  opacity: 0;
  margin-top: 40px;
}
.hero-chips-sep {
  width: 1px;
  height: 28px;
  background: rgba(255,255,255,0.08);
  margin: 0 4px;
  flex-shrink: 0;
}
.glass-chip {
  background: transparent;
  border-radius: 100px;
  padding: 6px 18px;
  font-size: 11px;
  font-family: 'Space Mono', monospace;
  color: #ababab;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.metric-val {
  font-weight: 700;
  color: #f0f0f0;
  font-size: 13px;
  line-height: 1;
}
.metric-label { color: #555; line-height: 1; font-size: 10px; }
.metric-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.metric-dot--green { background: #00ff88; animation: blink 1.5s ease-in-out infinite; }

@keyframes fade-up {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ──────────────────────────────────────────────────────────────
   TRUST
────────────────────────────────────────────────────────────── */
.trust {
  position: relative;
  z-index: 1;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px 80px;
  text-align: center;
}
.trust-label {
  font-size: 10px;
  font-family: 'Space Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 0.25em;
  color: #444;
  margin-bottom: 16px;
}
.trust-logos {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 4px;
}
.trust-logo {
  font-size: 13px;
  font-family: 'Space Mono', monospace;
  color: #555;
  padding: 4px 12px;
  transition: color 0.15s;
}
.trust-logo:hover { color: #ababab; }
.trust-sep { color: #2a2a2a; font-size: 18px; }

/* ──────────────────────────────────────────────────────────────
   SECTION COMMON
────────────────────────────────────────────────────────────── */
.section {
  position: relative;
  z-index: 1;
  max-width: 1100px;
  margin: 0 auto;
  padding: 80px 24px;
}
.section-header {
  text-align: center;
  margin-bottom: 56px;
}
.section-badge {
  display: inline-flex;
  align-items: center;
  font-size: 9px;
  font-family: 'Space Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  color: #ff3333;
  border: 1px solid rgba(255,51,51,0.2);
  background: rgba(255,51,51,0.06);
  padding: 4px 12px;
  border-radius: 100px;
  margin-bottom: 20px;
}
.section-title {
  font-size: clamp(28px, 3.2vw, 44px);
  font-weight: 800;
  letter-spacing: -0.01em;
  line-height: 1.12;
  color: #f0f0f0;
  margin-bottom: 16px;
}
.section-sub {
  font-size: 15px;
  color: #ababab;
  max-width: 520px;
  margin: 0 auto;
  line-height: 1.7;
}

/* ──────────────────────────────────────────────────────────────
   GLASS CARD
────────────────────────────────────────────────────────────── */
.glass-card {
  background: rgba(255,255,255,0.025);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 20px;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: border-color 0.2s, transform 0.2s;
}
.glass-card:hover {
  border-color: rgba(255,255,255,0.12);
  transform: translateY(-2px);
}

/* ──────────────────────────────────────────────────────────────
   HOW IT WORKS - FLOW
────────────────────────────────────────────────────────────── */
.flow-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}
@media (max-width: 900px) {
  .flow-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 600px) {
  .flow-grid { grid-template-columns: 1fr; }
}
.flow-card {
  padding: 24px;
  position: relative;
}
.flow-num {
  font-size: 11px;
  font-family: 'Space Mono', monospace;
  color: #333;
  margin-bottom: 16px;
}
.flow-icon {
  width: 44px; height: 44px;
  border-radius: 12px;
  border: 1px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}
.flow-icon--red    { border-color: rgba(255,51,51,0.3); background: rgba(255,51,51,0.08); color: #ff3333; }
.flow-icon--blue   { border-color: rgba(68,136,255,0.3); background: rgba(68,136,255,0.08); color: #4488ff; }
.flow-icon--yellow { border-color: rgba(255,215,0,0.3); background: rgba(255,215,0,0.08); color: #ffd700; }
.flow-icon--green  { border-color: rgba(0,255,136,0.3); background: rgba(0,255,136,0.08); color: #00ff88; }
.flow-title {
  font-size: 14px;
  font-weight: 700;
  color: #f0f0f0;
  margin-bottom: 8px;
}
.flow-desc {
  font-size: 12px;
  color: #6b6b6b;
  line-height: 1.6;
}
.flow-arrow {
  position: absolute;
  right: -12px;
  top: 50%;
  transform: translateY(-50%);
  color: #2a2a2a;
  font-size: 18px;
  z-index: 2;
}

/* ── Architecture diagram ── */
.arch-diagram {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  padding: 32px 40px;
  flex-wrap: wrap;
  gap: 24px;
}
.arch-node {
  display: flex;
  align-items: center;
  gap: 14px;
}
.arch-icon {
  width: 44px; height: 44px;
  border-radius: 12px;
  background: rgba(255,51,51,0.08);
  border: 1px solid rgba(255,51,51,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}
.arch-icon--blue {
  background: rgba(68,136,255,0.08);
  border-color: rgba(68,136,255,0.2);
}
.arch-node-title { font-size: 13px; font-weight: 700; color: #f0f0f0; }
.arch-node-sub { font-size: 10px; font-family: 'Space Mono', monospace; color: #555; margin-top: 2px; }
.arch-pipe {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 120px;
  gap: 12px;
}
.arch-pipe-line { flex: 1; height: 1px; background: linear-gradient(90deg, rgba(255,51,51,0.3), rgba(68,136,255,0.3)); }
.arch-pipe-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 9px;
  font-family: 'Space Mono', monospace;
  color: #555;
  text-align: center;
  white-space: nowrap;
}
.pipe-pulse {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #ff3333;
  animation: blink 1s ease-in-out infinite;
}

/* ──────────────────────────────────────────────────────────────
   STATES GRID
────────────────────────────────────────────────────────────── */
.states-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
@media (max-width: 900px) { .states-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 600px) { .states-grid { grid-template-columns: 1fr; } }

.state-card { padding: 20px; }
.state-card--alert {
  border-color: rgba(255,51,51,0.15) !important;
  background: rgba(255,51,51,0.025) !important;
}
.state-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}
.state-indicator {
  width: 7px; height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dot-green  { background: #00ff88; }
.dot-yellow { background: #ffd700; }
.dot-blue   { background: #4488ff; }
.dot-orange { background: #ff8c00; }
.dot-red    { background: #ff3333; }
.dot-dim    { background: #555; }
.dot-purple { background: #cc44ff; }

.state-name {
  font-size: 10px;
  font-family: 'Space Mono', monospace;
  font-weight: 700;
  letter-spacing: 0.05em;
}
.text-green  { color: #00ff88; }
.text-yellow { color: #ffd700; }
.text-blue   { color: #4488ff; }
.text-orange { color: #ff8c00; }
.text-red    { color: #ff3333; }
.text-dim    { color: #ababab; }
.text-purple { color: #cc44ff; }

.state-blocks-badge {
  font-size: 8px;
  font-family: 'Space Mono', monospace;
  color: #ff3333;
  border: 1px solid rgba(255,51,51,0.2);
  background: rgba(255,51,51,0.06);
  padding: 1px 6px;
  border-radius: 4px;
  margin-left: auto;
}
.state-desc {
  font-size: 11px;
  color: #6b6b6b;
  line-height: 1.5;
  margin-bottom: 10px;
}
.state-callback {
  font-size: 10px;
  font-family: 'Space Mono', monospace;
  color: #4488ff;
  background: rgba(68,136,255,0.06);
  border: 1px solid rgba(68,136,255,0.12);
  padding: 3px 8px;
  border-radius: 6px;
  display: inline-block;
}

/* ──────────────────────────────────────────────────────────────
   ETHICS
────────────────────────────────────────────────────────────── */
.ethics-section {
  position: relative;
  z-index: 1;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px 80px;
}
.ethics-inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  padding: 56px;
}
@media (max-width: 780px) {
  .ethics-inner { grid-template-columns: 1fr; padding: 32px; gap: 32px; }
}
.ethics-title {
  font-size: clamp(24px, 2.8vw, 36px);
  font-weight: 800;
  letter-spacing: -0.01em;
  line-height: 1.12;
  color: #f0f0f0;
  margin-bottom: 16px;
}
.ethics-sub { font-size: 14px; color: #6b6b6b; line-height: 1.7; }
.ethics-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.ethics-row:last-child { border: none; }
.ethics-icon {
  font-size: 11px;
  font-weight: 700;
  width: 18px;
  flex-shrink: 0;
  margin-top: 2px;
}
.ei-green  { color: #00ff88; }
.ei-yellow { color: #ffd700; }
.ethics-text { font-size: 13px; color: #ababab; line-height: 1.5; }

/* ──────────────────────────────────────────────────────────────
   SDK
────────────────────────────────────────────────────────────── */
.sdk-grid {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 16px;
}
@media (max-width: 780px) { .sdk-grid { grid-template-columns: 1fr; } }
.sdk-install { overflow: hidden; }
.sdk-tabs { overflow: hidden; }
.tab-row {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  flex-wrap: wrap;
}
.tab-btn {
  font-size: 10px;
  font-family: 'Space Mono', monospace;
  color: #555;
  border: 1px solid rgba(255,255,255,0.06);
  background: transparent;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}
.tab-btn:hover { color: #ababab; border-color: rgba(255,255,255,0.12); }
.tab-btn--active {
  color: #ff3333;
  border-color: rgba(255,51,51,0.3);
  background: rgba(255,51,51,0.06);
}
.tab-code { min-height: 180px; }

/* ──────────────────────────────────────────────────────────────
   PRICING
────────────────────────────────────────────────────────────── */
.billing-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
}
.toggle-label {
  font-size: 12px;
  font-family: 'Space Mono', monospace;
  color: #555;
  transition: color 0.15s;
}
.toggle-label--active { color: #f0f0f0; }
.save-badge {
  font-size: 9px;
  color: #00ff88;
  margin-left: 4px;
}
.toggle-track {
  position: relative;
  width: 40px; height: 22px;
  border-radius: 11px;
  border: 1px solid rgba(255,255,255,0.1);
  cursor: pointer;
  background: rgba(255,255,255,0.05);
  transition: background 0.2s, border-color 0.2s;
}
.toggle-on { background: rgba(255,51,51,0.2); border-color: rgba(255,51,51,0.35); }
.toggle-thumb {
  position: absolute;
  top: 50%; margin-top: -8px;
  width: 16px; height: 16px;
  border-radius: 50%;
  transition: left 0.2s, background 0.2s;
  pointer-events: none;
}
.toggle-off .toggle-thumb { left: 2px; background: #555; }
.toggle-on  .toggle-thumb { left: 20px; background: #ff3333; }

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
@media (max-width: 780px) { .pricing-grid { grid-template-columns: 1fr; } }

.pricing-card {
  padding: 28px;
  display: flex;
  flex-direction: column;
  position: relative;
  padding-top: 36px;
}
.pricing-card--featured {
  border-color: rgba(255,51,51,0.2) !important;
  background: rgba(255,51,51,0.03) !important;
}
.pricing-popular {
  position: absolute;
  top: -1px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 8px;
  font-family: 'Space Mono', monospace;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  background: #ff3333;
  color: #fff;
  padding: 3px 12px 4px;
  border-radius: 0 0 8px 8px;
}
.pricing-header { margin-bottom: 20px; }
.pricing-name {
  font-size: 16px;
  font-weight: 800;
  color: #f0f0f0;
  margin-bottom: 4px;
}
.pricing-desc { font-size: 11px; color: #555; }
.pricing-price {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  margin-bottom: 24px;
}
.price-val {
  font-size: 36px;
  font-weight: 800;
  font-family: 'Space Mono', monospace;
  color: #f0f0f0;
  line-height: 1;
}
.price-period { font-size: 12px; color: #555; margin-bottom: 4px; }
.pricing-features { list-style: none; padding: 0; margin: 0 0 24px; flex: 1; }
.pricing-feature {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #ababab;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.pricing-feature:last-child { border: none; }
.pricing-feature--dim { color: #444; }
.feat-check { color: #00ff88; font-size: 10px; }
.feat-x     { color: #333; font-size: 10px; }
.pricing-cta {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-family: 'Space Mono', monospace;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.1);
  color: #6b6b6b;
  text-decoration: none;
  transition: all 0.15s;
  background: rgba(255,255,255,0.02);
}
.pricing-cta:hover { border-color: rgba(255,255,255,0.2); color: #f0f0f0; }
.pricing-cta--featured {
  background: #ff3333;
  border-color: #ff3333;
  color: #fff;
}
.pricing-cta--featured:hover { background: #ef4444; border-color: #ef4444; color: #fff; }

/* ──────────────────────────────────────────────────────────────
   CTA
────────────────────────────────────────────────────────────── */
.cta-section {
  position: relative;
  z-index: 1;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px 100px;
}
.cta-inner {
  text-align: center;
  padding: 80px 40px;
  position: relative;
  overflow: hidden;
}
.cta-orb {
  position: absolute;
  width: 400px; height: 400px;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(255,51,51,0.08) 0%, transparent 70%);
  border-radius: 50%;
  filter: blur(60px);
  pointer-events: none;
}
.cta-title {
  font-size: clamp(28px, 3.2vw, 44px);
  font-weight: 800;
  letter-spacing: -0.01em;
  line-height: 1.12;
  color: #f0f0f0;
  margin-bottom: 16px;
  position: relative;
}
.cta-sub { font-size: 15px; color: #6b6b6b; margin-bottom: 40px; position: relative; }
.cta-actions { display: flex; align-items: center; justify-content: center; gap: 16px; position: relative; }

/* ──────────────────────────────────────────────────────────────
   FOOTER
────────────────────────────────────────────────────────────── */
.footer {
  position: relative;
  z-index: 1;
  border-top: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.01);
}
.footer-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  text-align: center;
}
.footer-tagline { font-size: 11px; color: #444; margin-top: 6px; }
.footer-links { display: flex; gap: 24px; flex-wrap: wrap; justify-content: center; }
.footer-link {
  font-size: 11px;
  font-family: 'Space Mono', monospace;
  color: #444;
  text-decoration: none;
  transition: color 0.15s;
}
.footer-link:hover { color: #ababab; }
.footer-copy { font-size: 10px; font-family: 'Space Mono', monospace; color: #2a2a2a; }
</style>