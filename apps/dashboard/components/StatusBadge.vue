<template>
  <span
    class="inline-flex items-center gap-1.5 font-mono font-bold uppercase tracking-widest rounded-md border"
    :class="[sizeClasses, colorClasses]"
  >
    <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" :class="dotColor" />
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
    case 'sm': return 'text-xs px-2 py-0.5'
    case 'lg': return 'text-sm px-3 py-1.5'
    default:   return 'text-xs px-2.5 py-1'
  }
})

const colorClasses = computed(() => {
  const map: Record<string, string> = {
    ACTIVE:       'text-fuse-green  border-fuse-green/30  bg-fuse-green/10',
    WARNING:      'text-fuse-yellow border-fuse-yellow/30 bg-fuse-yellow/10',
    READONLY:     'text-fuse-blue   border-fuse-blue/30   bg-fuse-blue/10',
    LIMITED:      'text-fuse-orange border-fuse-orange/30 bg-fuse-orange/10',
    LOCKED:       'text-fuse-red    border-fuse-red/30    bg-fuse-red/10',
    EXPIRED:      'text-fuse-red    border-fuse-red/30    bg-fuse-red/10',
    SLEEP:        'text-fuse-dim    border-fuse-border     bg-fuse-zinc',
    SELF_DESTRUCT:'text-fuse-purple border-fuse-purple/30 bg-fuse-purple/10',
  }
  return map[props.state] ?? 'text-fuse-dim border-fuse-border bg-fuse-zinc'
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
