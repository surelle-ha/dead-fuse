<template>
  <div class="space-y-4">
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <button
        v-for="state in states"
        :key="state.value"
        @click="!loading && $emit('change', state.value)"
        :disabled="loading"
        class="state-btn"
        :class="[
          state.classes,
          current === state.value ? state.activeClasses : 'opacity-50 hover:opacity-80',
          loading ? 'cursor-not-allowed' : 'cursor-pointer'
        ]"
      >
        <span class="text-lg">{{ state.icon }}</span>
        <span class="text-xs font-mono font-bold uppercase tracking-wider">{{ state.label }}</span>
        <span class="text-xs opacity-70 leading-tight">{{ state.desc }}</span>
      </button>
    </div>

    <div class="bg-fuse-zinc border border-fuse-border rounded-lg px-4 py-3 text-xs text-fuse-dim font-mono">
      <span class="text-fuse-text font-bold">Current: </span>
      <span :class="currentStateColor">{{ current }}</span>
      <span class="ml-2 text-fuse-muted">— {{ currentDesc }}</span>
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
    icon: '✅',
    desc: 'Full access',
    classes: 'border-fuse-green/40 text-fuse-green bg-fuse-green/5 hover:bg-fuse-green/10',
    activeClasses: '!opacity-100 !bg-fuse-green/15 !border-fuse-green/60 ring-1 ring-fuse-green/30',
  },
  {
    value: 'WARNING',
    label: 'Warning',
    icon: '⚠️',
    desc: 'Show notice',
    classes: 'border-fuse-yellow/40 text-fuse-yellow bg-fuse-yellow/5 hover:bg-fuse-yellow/10',
    activeClasses: '!opacity-100 !bg-fuse-yellow/15 !border-fuse-yellow/60 ring-1 ring-fuse-yellow/30',
  },
  {
    value: 'READONLY',
    label: 'Read-only',
    icon: '🔒',
    desc: 'Block writes',
    classes: 'border-fuse-blue/40 text-fuse-blue bg-fuse-blue/5 hover:bg-fuse-blue/10',
    activeClasses: '!opacity-100 !bg-fuse-blue/15 !border-fuse-blue/60 ring-1 ring-fuse-blue/30',
  },
  {
    value: 'LIMITED',
    label: 'Limited',
    icon: '🔽',
    desc: 'Partial access',
    classes: 'border-fuse-orange/40 text-fuse-orange bg-fuse-orange/5 hover:bg-fuse-orange/10',
    activeClasses: '!opacity-100 !bg-fuse-orange/15 !border-fuse-orange/60 ring-1 ring-fuse-orange/30',
  },
  {
    value: 'LOCKED',
    label: 'Locked',
    icon: '🛑',
    desc: 'Full block',
    classes: 'border-fuse-red/40 text-fuse-red bg-fuse-red/5 hover:bg-fuse-red/10',
    activeClasses: '!opacity-100 !bg-fuse-red/15 !border-fuse-red/60 ring-1 ring-fuse-red/30',
  },
  {
    value: 'EXPIRED',
    label: 'Expired',
    icon: '⌛',
    desc: 'Contract ended',
    classes: 'border-fuse-red/30 text-fuse-red/80 bg-fuse-red/5 hover:bg-fuse-red/10',
    activeClasses: '!opacity-100 !bg-fuse-red/15 !border-fuse-red/50 ring-1 ring-fuse-red/20',
  },
  {
    value: 'SLEEP',
    label: 'Sleep',
    icon: '💤',
    desc: 'App paused',
    classes: 'border-fuse-border text-fuse-dim bg-fuse-zinc hover:bg-fuse-border',
    activeClasses: '!opacity-100 !border-fuse-muted ring-1 ring-fuse-muted/30',
  },
  {
    value: 'SELF_DESTRUCT',
    label: 'Destruct',
    icon: '💥',
    desc: 'Custom handler',
    classes: 'border-fuse-purple/40 text-fuse-purple bg-fuse-purple/5 hover:bg-fuse-purple/10',
    activeClasses: '!opacity-100 !bg-fuse-purple/15 !border-fuse-purple/60 ring-1 ring-fuse-purple/30',
  },
]

const stateDescriptions: Record<string, string> = {
  ACTIVE:       'Application running normally with full access.',
  WARNING:      'Sends a warning message to connected clients.',
  READONLY:     'Blocks all POST, PUT, PATCH, DELETE requests.',
  LIMITED:      'Partial restrictions — use onLimited() to customize.',
  LOCKED:       'Fully blocks application with a message overlay.',
  EXPIRED:      'Contract has ended; triggers onExpired() handler.',
  SLEEP:        'Application is temporarily paused.',
  SELF_DESTRUCT:'Triggers the onSelfDestruct() handler for custom logic.',
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
  @apply flex flex-col items-center gap-1 py-3 px-2 rounded-lg border transition-all duration-200;
}
</style>
