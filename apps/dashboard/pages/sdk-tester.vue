<template>
  <div class="min-h-screen bg-fuse-black">
    <main class="max-w-4xl mx-auto px-6 py-12 animate-slide-up">
      <div class="panel p-6 text-fuse-text text-sm">
        Redirecting to support page...
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

definePageMeta({ middleware: 'auth' })

const router = useRouter()

onMounted(() => {
  router.replace('/support')
})
</script>

<style scoped>
.panel {
    @apply rounded-xl border border-white/[0.07] p-5;
    background: rgba(255, 255, 255, 0.025);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
}

.panel-title {
    @apply text-[10px] font-mono uppercase tracking-widest text-fuse-muted mb-3 block;
}

.field-group {
    @apply flex flex-col gap-1;
}

.field-label {
    @apply text-[9px] font-mono uppercase tracking-widest text-fuse-muted;
}

.field-input {
    @apply w-full bg-black/30 border border-white/[0.08] rounded-lg px-3 py-2 text-fuse-text outline-none focus:border-fuse-red/40 focus:ring-1 focus:ring-fuse-red/[0.12] transition-all duration-150 placeholder:text-fuse-muted disabled:opacity-50 disabled:cursor-not-allowed;
}

.stat-card {
    @apply rounded-xl border border-white/[0.06] px-4 py-3 flex flex-col;
    background: rgba(255, 255, 255, 0.02);
    backdrop-filter: blur(8px);
}

.stat-label {
    @apply text-[9px] font-mono uppercase tracking-widest text-fuse-muted;
}

.btn-activate {
    @apply flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-xs transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed;
    background: rgba(0, 255, 136, 0.12);
    border: 1px solid rgba(0, 255, 136, 0.25);
    color: #00ff88;
}

.btn-activate:not(:disabled):hover {
    background: rgba(0, 255, 136, 0.18);
    border-color: rgba(0, 255, 136, 0.4);
}

.btn-ghost {
    @apply border border-white/[0.08] hover:border-white/[0.16] text-fuse-dim hover:text-fuse-text rounded-lg transition-all duration-150 flex items-center justify-center;
}

.log-box {
    @apply rounded-lg border border-white/[0.06] overflow-y-auto;
    height: 260px;
    background: rgba(0, 0, 0, 0.35);
    padding: 8px;
}

.log-row {
    @apply flex items-start gap-3 py-1 border-b border-white/[0.03] last:border-0;
}

.tab-button {
    @apply text-[10px] uppercase tracking-[0.35em] rounded-full border border-white/[0.1] px-3 py-2 transition-all duration-150 text-fuse-dim bg-white/[0.02] hover:border-white/[0.16] hover:text-fuse-text;
}

.tab-button--active {
    @apply bg-fuse-red text-white border-fuse-red;
}
</style>