<template>
  <div
    class="project-card group cursor-pointer"
    @click="$emit('click')"
  >
    <div class="flex items-start justify-between mb-3">
      <div class="flex-1 min-w-0 mr-2">
        <h3 class="font-semibold text-fuse-text text-sm truncate group-hover:text-white transition-colors duration-150">
          {{ project.name }}
        </h3>
        <p class="text-fuse-muted text-[10px] font-mono mt-0.5 truncate">{{ project.project_key }}</p>
      </div>
      <StatusBadge :state="project.state" size="sm" />
    </div>

    <div v-if="project.message" class="text-fuse-muted text-[10px] italic mb-3 truncate">
      "{{ project.message }}"
    </div>

    <div v-if="project.client_name || project.priority" class="flex items-center gap-1.5 mb-3">
      <span v-if="project.client_name" class="text-fuse-dim text-[10px] bg-white/[0.04] border border-white/[0.07] px-1.5 py-0.5 rounded-md font-mono">
        {{ project.client_name }}
      </span>
      <span v-if="project.priority" class="text-fuse-dim text-[10px] bg-white/[0.04] border border-white/[0.07] px-1.5 py-0.5 rounded-md font-mono capitalize">
        {{ project.priority }}
      </span>
    </div>

    <div class="flex items-center justify-between pt-2.5 border-t border-white/[0.05]">
      <span class="text-fuse-muted text-[10px] font-mono">grace {{ project.grace_period }}d</span>
      <span class="text-fuse-muted text-[10px]">{{ formatDate(project.updated_at) }}</span>
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
    client_name?: string
    target_completion?: string
    priority?: string
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
  @apply relative overflow-hidden rounded-xl p-4
  border border-white/[0.06]
  hover:border-white/[0.12]
  transition-all duration-200
  hover:-translate-y-px;
  background: rgba(255, 255, 255, 0.025);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.project-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% -20%, rgba(255, 51, 51, 0.03), transparent 60%);
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
}

.project-card:hover::before {
  opacity: 1;
}
</style>