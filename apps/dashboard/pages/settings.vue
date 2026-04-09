<template>
  <div class="min-h-screen bg-fuse-black">
    <nav class="border-b border-fuse-border/60 px-6 py-4 flex items-center justify-between backdrop-blur-sm bg-fuse-black/80 sticky top-0 z-10">
      <div class="flex items-center gap-3">
        <button @click="navigateTo('/projects')" class="text-fuse-dim hover:text-fuse-text transition-colors text-sm flex items-center gap-1.5">
          <span>←</span> <span>Projects</span>
        </button>
        <span class="text-fuse-border">/</span>
        <span class="text-fuse-text font-medium text-sm">Settings</span>
      </div>
      <div class="text-fuse-dim text-xs font-mono">Account preferences</div>
    </nav>

    <main class="max-w-5xl mx-auto px-6 py-10 animate-slide-up">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-fuse-text">Account settings</h1>
        <p class="text-fuse-dim text-sm mt-1">Manage your profile, security, and workspace preferences from one place.</p>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <div class="panel">
          <h2 class="panel-title">Profile</h2>
          <p class="text-fuse-dim text-xs mb-4">Update your name, email, and login preferences.</p>
          <div class="space-y-3">
            <div>
              <label class="field-label text-xs">Full name</label>
              <input type="text" class="field-input text-sm" placeholder="Your name" />
            </div>
            <div>
              <label class="field-label text-xs">Email</label>
              <input type="email" class="field-input text-sm" placeholder="you@example.com" />
            </div>
            <button class="btn-primary text-sm mt-2">Save profile</button>
          </div>
        </div>
        <div class="panel">
          <h2 class="panel-title">Security</h2>
          <p class="text-fuse-dim text-xs mb-4">Enable two-factor authentication and rotate API keys.</p>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-fuse-dim">Two-factor auth</span>
              <span class="text-xs bg-fuse-red/10 text-fuse-red px-2 py-1 rounded-full border border-fuse-red/20">Disabled</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-fuse-dim">API key rotation</span>
              <button class="text-xs text-fuse-red hover:text-fuse-red/80 transition-colors">Rotate now</button>
            </div>
            <button class="btn-primary text-sm mt-2">Update security</button>
          </div>
        </div>
      </div>

      <div class="mt-8 panel">
        <h2 class="panel-title">Danger zone</h2>
        <p class="text-fuse-dim text-xs mb-4">Account deletion is irreversible. Download your data first if needed.</p>
        <button class="bg-fuse-red hover:bg-fuse-red/80 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm">
          Delete account
        </button>
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
.panel-title {
  @apply text-sm font-bold text-fuse-text uppercase tracking-widest font-mono mb-4;
}
.field-label {
  @apply text-xs font-mono text-fuse-dim uppercase tracking-widest block mb-1.5;
}
.field-input {
  @apply w-full bg-fuse-zinc border border-fuse-border rounded-md px-3 py-2.5 text-fuse-text text-sm outline-none
  focus:border-fuse-red/60 focus:ring-1 focus:ring-fuse-red/20 transition-all duration-200 placeholder:text-fuse-muted;
}
.btn-primary {
  @apply bg-fuse-red hover:bg-red-500 text-white font-bold text-sm px-4 py-2.5 rounded-md transition-all duration-200;
}
</style>
