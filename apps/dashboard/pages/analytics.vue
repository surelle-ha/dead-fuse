<template>
  <div class="min-h-screen bg-fuse-black">
    <nav class="border-b border-fuse-border/60 px-6 py-4 flex items-center justify-between backdrop-blur-sm bg-fuse-black/80 sticky top-0 z-10">
      <div class="flex items-center gap-3">
        <button @click="navigateTo('/projects')" class="text-fuse-dim hover:text-fuse-text transition-colors text-sm flex items-center gap-1.5">
          <span>←</span> <span>Projects</span>
        </button>
        <span class="text-fuse-border">/</span>
        <span class="text-fuse-text font-medium text-sm">Analytics</span>
      </div>
      <div class="text-fuse-dim text-xs font-mono">Real-time insights</div>
    </nav>

    <main class="max-w-5xl mx-auto px-6 py-10 animate-slide-up">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-fuse-text">Project insights</h1>
        <p class="text-fuse-dim text-sm mt-1">View your usage trends, request history, and performance metrics across all active projects.</p>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <div class="panel">
          <p class="text-xs uppercase tracking-[0.35em] text-fuse-border mb-3">Requests</p>
          <p class="text-3xl font-semibold text-white">1.2M</p>
          <p class="mt-2 text-sm text-fuse-dim">Last 30 days total</p>
        </div>
        <div class="panel">
          <p class="text-xs uppercase tracking-[0.35em] text-fuse-border mb-3">Active projects</p>
          <p class="text-3xl font-semibold text-white">3</p>
          <p class="mt-2 text-sm text-fuse-dim">Currently monitored</p>
        </div>
      </div>

      <div class="mt-8 grid gap-6 lg:grid-cols-3">
        <div class="panel">
          <p class="text-xs uppercase tracking-[0.35em] text-fuse-border mb-3">Avg response</p>
          <p class="text-2xl font-semibold text-white">42ms</p>
          <p class="mt-2 text-sm text-fuse-dim">Across all endpoints</p>
        </div>
        <div class="panel">
          <p class="text-xs uppercase tracking-[0.35em] text-fuse-border mb-3">State changes</p>
          <p class="text-2xl font-semibold text-white">128</p>
          <p class="mt-2 text-sm text-fuse-dim">This month</p>
        </div>
        <div class="panel">
          <p class="text-xs uppercase tracking-[0.35em] text-fuse-border mb-3">Clients</p>
          <p class="text-2xl font-semibold text-white">24</p>
          <p class="mt-2 text-sm text-fuse-dim">Connected devices</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
</script>

<style scoped>
.panel {
  @apply bg-white/[0.025] backdrop-blur-sm border border-white/[0.07] rounded-xl p-6;
}
</style>
