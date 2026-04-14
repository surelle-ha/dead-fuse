<template>
  <div
    class="project-card group"
    :class="{
      'project-card--suspended': isSuspended,
      'cursor-pointer': !isSuspended,
      'cursor-default': isSuspended,
    }"
    @click="!isSuspended && $emit('click')"
    :tabindex="isSuspended ? -1 : 0"
    @keydown.enter="!isSuspended && $emit('click')"
  >
    <!-- Suspended overlay badge -->
    <div v-if="isSuspended" class="suspended-banner">
      <PauseCircle class="w-3 h-3 flex-shrink-0" />
      <span>Suspended — upgrade to manage</span>
    </div>

    <div class="flex items-start justify-between mb-3" :class="isSuspended ? 'opacity-40' : ''">
      <div class="flex-1 min-w-0 mr-2">
        <h3 class="font-semibold text-fuse-text text-sm truncate" :class="!isSuspended ? 'group-hover:text-white transition-colors duration-150' : ''">
          {{ project.name }}
        </h3>
        <p class="text-fuse-muted text-[10px] font-mono mt-0.5 truncate">{{ project.project_key }}</p>
      </div>
      <StatusBadge :state="project.state" size="sm" />
    </div>

    <div v-if="project.message" class="text-fuse-muted text-[10px] italic mb-3 truncate" :class="isSuspended ? 'opacity-40' : ''">
      "{{ project.message }}"
    </div>

    <div v-if="project.client_name || project.priority" class="flex items-center gap-1.5 mb-3" :class="isSuspended ? 'opacity-40' : ''">
      <span v-if="project.client_name" class="text-fuse-dim text-[10px] bg-white/[0.04] border border-white/[0.07] px-1.5 py-0.5 rounded-md font-mono">
        {{ project.client_name }}
      </span>
      <span v-if="project.priority" class="text-fuse-dim text-[10px] bg-white/[0.04] border border-white/[0.07] px-1.5 py-0.5 rounded-md font-mono capitalize">
        {{ project.priority }}
      </span>
    </div>

    <div class="flex items-center justify-between pt-2.5 border-t border-white/[0.05]" :class="isSuspended ? 'opacity-40' : ''">
      <span class="text-fuse-muted text-[10px] font-mono">grace {{ project.grace_period }}d</span>
      <span class="text-fuse-muted text-[10px]">{{ formatDate(project.updated_at) }}</span>
    </div>

    <!-- SDK still running notice -->
    <div v-if="isSuspended" class="sdk-running-notice">
      <span class="w-1.5 h-1.5 rounded-full bg-fuse-green animate-pulse flex-shrink-0" />
      SDK running · state preserved
    </div>
  </div>
</template>

<script setup lang="ts">
import { PauseCircle } from 'lucide-vue-next'

const props = defineProps<{
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
    status?: string   // 'active' | 'suspended' — new field
  }
}>()

defineEmits<{ (e: 'click'): void }>()

const isSuspended = computed(() => props.project.status === 'suspended')

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
    transition-all duration-200;
  background: rgba(255, 255, 255, 0.025);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* Active hover effect */
.project-card:not(.project-card--suspended):hover {
  @apply border-white/[0.12] -translate-y-px;
}

.project-card:not(.project-card--suspended)::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% -20%, rgba(255, 51, 51, 0.03), transparent 60%);
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
}
.project-card:not(.project-card--suspended):hover::before {
  opacity: 1;
}

/* ── Suspended state ─────────────────────────────────────────── */
.project-card--suspended {
  border-color: rgba(255, 255, 255, 0.04) !important;
  background: rgba(255, 255, 255, 0.01) !important;
  /* subtle cross-hatch overlay */
  background-image: repeating-linear-gradient(
    -45deg,
    transparent,
    transparent 6px,
    rgba(255, 255, 255, 0.015) 6px,
    rgba(255, 255, 255, 0.015) 7px
  ) !important;
}

/* Top suspended banner */
.suspended-banner {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 9px;
  font-family: 'Space Mono', monospace;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #6b6b6b;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  padding: 4px 8px;
  margin-bottom: 10px;
}

/* Bottom SDK-still-running notice */
.sdk-running-notice {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  font-size: 9px;
  font-family: 'Space Mono', monospace;
  color: #4b7b5e;
  letter-spacing: 0.05em;
}
</style>