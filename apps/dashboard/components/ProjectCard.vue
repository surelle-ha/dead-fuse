<template>
  <div
    class="bg-fuse-carbon border border-fuse-border rounded-xl p-5 cursor-pointer group
           hover:border-fuse-muted transition-all duration-200 hover:bg-fuse-zinc/30"
    @click="$emit('click')"
  >
    <div class="flex items-start justify-between mb-4">
      <div class="flex-1 min-w-0 mr-3">
        <h3 class="font-bold text-fuse-text text-base truncate group-hover:text-white transition-colors">
          {{ project.name }}
        </h3>
        <p class="text-fuse-dim text-xs font-mono mt-0.5 truncate">{{ project.project_key }}</p>
      </div>
      <StatusBadge :state="project.state" size="sm" />
    </div>

    <div v-if="project.message" class="text-fuse-dim text-xs italic mb-3 truncate">
      "{{ project.message }}"
    </div>

    <div class="flex items-center justify-between mt-4 pt-4 border-t border-fuse-border">
      <span class="text-fuse-dim text-xs font-mono">Grace: {{ project.grace_period }}d</span>
      <span class="text-fuse-dim text-xs">{{ formatDate(project.updated_at) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  project: {
    id: string
    name: string
    project_key: string
    public_token: string
    state: string
    message: string
    grace_period: number
    updated_at: string
  }
}>()

defineEmits<{ (e: 'click'): void }>()

function formatDate(d: string) {
  const date = new Date(d)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return date.toLocaleDateString()
}
</script>
