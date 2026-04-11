<template>
  <span
    class="inline-flex items-center gap-1 font-mono font-bold uppercase tracking-widest rounded border"
    :class="[sizeClasses, colorClasses]"
    style="backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);"
  >
    <span class="rounded-full flex-shrink-0" :class="[dotColor, dotSize]" />
    {{ state }}
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{
  state: string
  size?: 'sm' | 'md' | 'lg'
}>()

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm': return 'text-[9px] px-1.5 py-0.5 tracking-[0.2em]'
    case 'lg': return 'text-xs px-2.5 py-1 tracking-widest'
    default:   return 'text-[10px] px-2 py-0.5 tracking-[0.18em]'
  }
})

const dotSize = computed(() => {
  switch (props.size) {
    case 'sm': return 'w-1 h-1'
    case 'lg': return 'w-1.5 h-1.5'
    default:   return 'w-1 h-1'
  }
})

const colorClasses = computed(() => {
  const map: Record<string, string> = {
    ACTIVE:       'text-fuse-green  border-fuse-green/20  bg-fuse-green/[0.07]',
    WARNING:      'text-fuse-yellow border-fuse-yellow/20 bg-fuse-yellow/[0.07]',
    READONLY:     'text-fuse-blue   border-fuse-blue/20   bg-fuse-blue/[0.07]',
    LIMITED:      'text-fuse-orange border-fuse-orange/20 bg-fuse-orange/[0.07]',
    LOCKED:       'text-fuse-red    border-fuse-red/20    bg-fuse-red/[0.07]',
    EXPIRED:      'text-fuse-red    border-fuse-red/20    bg-fuse-red/[0.07]',
    SLEEP:        'text-fuse-dim    border-white/[0.08]   bg-white/[0.03]',
    SELF_DESTRUCT:'text-fuse-purple border-fuse-purple/20 bg-fuse-purple/[0.07]',
  }
  return map[props.state] ?? 'text-fuse-dim border-white/[0.08] bg-white/[0.03]'
})

const dotColor = computed(() => {
  const map: Record<string, string> = {
    ACTIVE:       'bg-fuse-green',
    WARNING:      'bg-fuse-yellow',
    READONLY:     'bg-fuse-blue',
    LIMITED:      'bg-fuse-orange',
    LOCKED:       'bg-fuse-red',
    EXPIRED:      'bg-fuse-red',
    SLEEP:        'bg-fuse-muted',
    SELF_DESTRUCT:'bg-fuse-purple',
  }
  return map[props.state] ?? 'bg-fuse-muted'
})
</script>