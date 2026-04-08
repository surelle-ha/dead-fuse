<template>
  <div
    class="project-card group cursor-pointer"
    @click="$emit('click')"
  >
    <!-- Subtle glow on hover -->
    <div class="project-card__glow" />

    <div class="relative z-10">
      <div class="flex items-start justify-between mb-4">
        <div class="flex-1 min-w-0 mr-3">
          <h3 class="font-bold text-fuse-text text-base truncate group-hover:text-white transition-colors duration-200">
            {{ project.name }}
          </h3>
          <p class="text-fuse-dim text-xs font-mono mt-0.5 truncate opacity-60">{{ project.project_key }}</p>
        </div>
        <StatusBadge :state="project.state" size="sm" />
      </div>

      <div v-if="project.message" class="text-fuse-dim text-xs italic mb-4 truncate opacity-70">
        "{{ project.message }}"
      </div>

      <div class="flex items-center justify-between pt-3 border-t border-white/[0.06]">
        <span class="text-fuse-dim text-xs font-mono">Grace: {{ project.grace_period }}d</span>
        <span class="text-fuse-dim text-xs opacity-60">{{ formatDate(project.updated_at) }}</span>
      </div>
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

<style scoped>
.project-card {
  @apply relative overflow-hidden rounded-xl p-5
  bg-white/[0.025] backdrop-blur-sm
  border border-white/[0.07]
  hover:border-white/[0.14]
  transition-all duration-300
  hover:shadow-lg hover:shadow-black/30
  hover:-translate-y-0.5;
}

.project-card__glow {
  @apply absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
  pointer-events-none;
  background: radial-gradient(circle at 50% 0%, rgba(255, 51, 51, 0.04), transparent 70%);
}
</style>