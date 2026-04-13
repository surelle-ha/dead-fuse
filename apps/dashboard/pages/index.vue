<template>
  <main class="min-h-screen bg-fuse-black text-fuse-text font-sans">
    <section class="container mx-auto px-6 py-24 lg:py-32">
      <div class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,420px)] items-center">
        <div class="space-y-6">
          <p class="text-sm font-mono uppercase tracking-[0.3em] text-fuse-red">DeadFuse.js</p>
          <h1 class="text-5xl font-black leading-tight lg:text-6xl">Lightweight remote control for deployed web apps.</h1>
          <p class="max-w-2xl text-fuse-muted text-base leading-7">Switch a client app into read-only, limited, or locked mode instantly from a dashboard — without redeploying. DeadFuse keeps your enforcement ethical, recoverable, and safe for freelancer workflows.</p>
          <div class="flex flex-wrap gap-4">
            <NuxtLink to="/login" class="btn-primary">View the dashboard</NuxtLink>
            <a href="#features" class="text-fuse-dim font-medium">See how it works →</a>
          </div>
        </div>

        <div class="grid gap-4">
          <div class="rounded-3xl border border-white/10 bg-white/5 p-8">
            <p class="text-xs uppercase tracking-[0.2em] text-fuse-dim mb-3">Ethical enforcement</p>
            <h2 class="text-2xl font-semibold mb-3">Never destroy client data.</h2>
            <p class="text-fuse-muted leading-relaxed">Use read-only as the default mode, block risky actions gracefully, and keep recovery fast after payment issues.</p>
          </div>
          <div class="rounded-3xl border border-white/10 bg-white/5 p-8">
            <p class="text-xs uppercase tracking-[0.2em] text-fuse-dim mb-3">Instant control</p>
            <h2 class="text-2xl font-semibold mb-3">Remote state updates.</h2>
            <p class="text-fuse-muted leading-relaxed">Connected client apps respond instantly over WebSocket when the dashboard changes project state.</p>
          </div>
        </div>
      </div>
    </section>

    <section id="features" class="container mx-auto px-6 pb-24 lg:pb-32">
      <h2 class="text-3xl font-bold mb-10">Built for freelancers and agencies</h2>
      <div class="grid gap-6 lg:grid-cols-3">
        <div class="rounded-3xl border border-white/10 bg-white/5 p-8">
          <p class="font-semibold mb-3">Dashboard-first</p>
          <p class="text-fuse-muted leading-relaxed">Manage all client projects from a single Nuxt dashboard with plan-aware limits baked in.</p>
        </div>
        <div class="rounded-3xl border border-white/10 bg-white/5 p-8">
          <p class="font-semibold mb-3">SDK integration</p>
          <p class="text-fuse-muted leading-relaxed">Embed the DeadFuse client library once and let your app react to state changes without redeploying.</p>
        </div>
        <div class="rounded-3xl border border-white/10 bg-white/5 p-8">
          <p class="font-semibold mb-3">Graceful fallback</p>
          <p class="text-fuse-muted leading-relaxed">From warning banners to locked access, the SDK supports smooth degradation without surprises.</p>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'public' })
</script>
