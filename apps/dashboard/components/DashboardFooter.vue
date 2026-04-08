<template>
  <footer class="border-t border-fuse-border/40 mt-16 px-6 py-8">
    <div class="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="w-6 h-6 bg-fuse-red/80 rounded-sm flex items-center justify-center">
          <span class="text-white font-mono text-xs font-bold leading-none">DF</span>
        </div>
        <span class="text-fuse-dim text-xs font-mono">DeadFuse.js — Ethical License Enforcement</span>
      </div>
      <div class="flex items-center gap-6">
        <NuxtLink to="/docs" class="text-fuse-dim hover:text-fuse-text text-xs font-mono transition-colors">
          Docs
        </NuxtLink>
        <a href="https://github.com" target="_blank" rel="noopener" class="text-fuse-dim hover:text-fuse-text text-xs font-mono transition-colors">
          GitHub
        </a>
        <span class="text-fuse-border text-xs font-mono">MIT License</span>
      </div>
    </div>
  </footer>
</template>