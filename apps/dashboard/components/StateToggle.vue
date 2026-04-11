<template>
  <div class="space-y-3">
    <div class="grid grid-cols-4 gap-1.5">
      <button
        v-for="state in states"
        :key="state.value"
        @click="!loading && $emit('change', state.value)"
        :disabled="loading"
        class="state-btn"
        :class="[
          state.classes,
          current === state.value ? state.activeClasses : 'opacity-40 hover:opacity-70',
          loading ? 'cursor-not-allowed' : 'cursor-pointer'
        ]"
      >
        <span class="state-dot" :class="state.dot" />
        <span class="text-[9px] font-mono font-bold uppercase tracking-[0.15em] leading-tight">{{ state.label }}</span>
      </button>
    </div>

    <div class="glass-row px-3 py-2 text-[10px] font-mono flex items-center gap-2">
      <span :class="currentStateColor" class="font-bold">{{ current }}</span>
      <span class="text-fuse-muted">—</span>
      <span class="text-fuse-dim">{{ currentDesc }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  current: string
  loading?: boolean
}>()

defineEmits<{ (e: 'change', state: string): void }>()

const states = [
  {
    value: 'ACTIVE',
    label: 'Active',
    dot: 'bg-fuse-green',
    classes: 'border-fuse-green/20 text-fuse-green bg-fuse-green/[0.04] hover:bg-fuse-green/[0.08]',
    activeClasses: '!opacity-100 !bg-fuse-green/[0.12] !border-fuse-green/30',
  },
  {
    value: 'WARNING',
    label: 'Warning',
    dot: 'bg-fuse-yellow',
    classes: 'border-fuse-yellow/20 text-fuse-yellow bg-fuse-yellow/[0.04] hover:bg-fuse-yellow/[0.08]',
    activeClasses: '!opacity-100 !bg-fuse-yellow/[0.12] !border-fuse-yellow/30',
  },
  {
    value: 'READONLY',
    label: 'Readonly',
    dot: 'bg-fuse-blue',
    classes: 'border-fuse-blue/20 text-fuse-blue bg-fuse-blue/[0.04] hover:bg-fuse-blue/[0.08]',
    activeClasses: '!opacity-100 !bg-fuse-blue/[0.12] !border-fuse-blue/30',
  },
  {
    value: 'LIMITED',
    label: 'Limited',
    dot: 'bg-fuse-orange',
    classes: 'border-fuse-orange/20 text-fuse-orange bg-fuse-orange/[0.04] hover:bg-fuse-orange/[0.08]',
    activeClasses: '!opacity-100 !bg-fuse-orange/[0.12] !border-fuse-orange/30',
  },
  {
    value: 'LOCKED',
    label: 'Locked',
    dot: 'bg-fuse-red',
    classes: 'border-fuse-red/20 text-fuse-red bg-fuse-red/[0.04] hover:bg-fuse-red/[0.08]',
    activeClasses: '!opacity-100 !bg-fuse-red/[0.12] !border-fuse-red/30',
  },
  {
    value: 'EXPIRED',
    label: 'Expired',
    dot: 'bg-fuse-red',
    classes: 'border-fuse-red/[0.15] text-fuse-red/80 bg-fuse-red/[0.04] hover:bg-fuse-red/[0.08]',
    activeClasses: '!opacity-100 !bg-fuse-red/[0.12] !border-fuse-red/20',
  },
  {
    value: 'SLEEP',
    label: 'Sleep',
    dot: 'bg-fuse-muted',
    classes: 'border-white/[0.07] text-fuse-dim bg-white/[0.02] hover:bg-white/[0.05]',
    activeClasses: '!opacity-100 !bg-white/[0.06] !border-white/[0.15]',
  },
  {
    value: 'SELF_DESTRUCT',
    label: 'Destruct',
    dot: 'bg-fuse-purple',
    classes: 'border-fuse-purple/20 text-fuse-purple bg-fuse-purple/[0.04] hover:bg-fuse-purple/[0.08]',
    activeClasses: '!opacity-100 !bg-fuse-purple/[0.12] !border-fuse-purple/30',
  },
]

const stateDescriptions: Record<string, string> = {
  ACTIVE:       'Full access, no restrictions.',
  WARNING:      'Sends a warning message to clients.',
  READONLY:     'Blocks POST, PUT, PATCH, DELETE.',
  LIMITED:      'Partial — use onLimited() to customize.',
  LOCKED:       'Full block with message overlay.',
  EXPIRED:      'Contract ended, triggers onExpired().',
  SLEEP:        'App temporarily paused.',
  SELF_DESTRUCT:'Triggers onSelfDestruct() handler.',
}

const stateColors: Record<string, string> = {
  ACTIVE: 'text-fuse-green',
  WARNING: 'text-fuse-yellow',
  READONLY: 'text-fuse-blue',
  LIMITED: 'text-fuse-orange',
  LOCKED: 'text-fuse-red',
  EXPIRED: 'text-fuse-red',
  SLEEP: 'text-fuse-dim',
  SELF_DESTRUCT: 'text-fuse-purple',
}

const currentDesc = computed(() => stateDescriptions[props.current] ?? '')
const currentStateColor = computed(() => stateColors[props.current] ?? 'text-fuse-text')
</script>

<style scoped>
.state-btn {
  @apply flex flex-col items-center gap-1 py-2 px-1 rounded-lg border transition-all duration-150;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.state-dot {
  @apply w-1 h-1 rounded-full flex-shrink-0;
}

.glass-row {
  @apply bg-white/[0.03] border border-white/[0.07] rounded-lg;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
</style>