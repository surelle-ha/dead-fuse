<template>
  <!-- Rendered via Teleport in the default layout or projects page -->
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="modal-backdrop"
        @click.self="() => {}"
      >
        <div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="downgrade-title">

          <!-- ── Header ──────────────────────────────────────── -->
          <div class="modal-header">
            <div class="flex items-center gap-3">
              <div class="icon-warning">
                <AlertTriangle class="w-4 h-4" />
              </div>
              <div>
                <h2 id="downgrade-title" class="text-sm font-bold text-fuse-text">
                  Plan limit exceeded
                </h2>
                <p class="text-[10px] text-fuse-muted mt-0.5">
                  Your current plan allows
                  <strong class="text-fuse-dim">{{ planLimit }} project{{ planLimit !== 1 ? 's' : '' }}</strong>.
                  You have
                  <strong class="text-fuse-red">{{ projects.length }}</strong> projects.
                  Select up to <strong class="text-fuse-dim">{{ planLimit }}</strong> to retain.
                </p>
              </div>
            </div>
          </div>

          <!-- ── Info banner ─────────────────────────────────── -->
          <div class="info-banner mx-5 mt-4">
            <Info class="w-3.5 h-3.5 flex-shrink-0 text-fuse-blue mt-0.5" />
            <p class="text-[10px] text-fuse-blue/80 leading-relaxed">
              Projects you <strong>don't retain</strong> will be
              <strong>greyed out &amp; disabled</strong> in your dashboard but the deployed SDK app
              will <strong>continue to run</strong> at its current state — no disruption for your
              clients. You can re-activate them anytime by upgrading your plan.
            </p>
          </div>

          <!-- ── Selection counter ───────────────────────────── -->
          <div class="flex items-center justify-between px-5 pt-4 pb-2">
            <span class="text-[10px] font-mono text-fuse-muted uppercase tracking-widest">
              Select projects to keep
            </span>
            <span
              class="text-[10px] font-mono font-bold transition-colors"
              :class="selectedIds.size > planLimit ? 'text-fuse-red' : 'text-fuse-dim'"
            >
              {{ selectedIds.size }} / {{ planLimit }} selected
            </span>
          </div>

          <!-- ── Project list ────────────────────────────────── -->
          <div class="project-list px-5 pb-2 space-y-2 overflow-y-auto" style="max-height: 340px;">
            <div
              v-for="project in projects"
              :key="project.id"
              class="project-row"
              :class="{
                'project-row--selected': selectedIds.has(project.id),
              }"
              @click="toggleProject(project.id)"
              role="checkbox"
              :aria-checked="selectedIds.has(project.id)"
              tabindex="0"
              @keydown.space.prevent="toggleProject(project.id)"
              @keydown.enter.prevent="toggleProject(project.id)"
            >
              <!-- Checkbox -->
              <div
                class="check-box flex-shrink-0"
                :class="selectedIds.has(project.id) ? 'check-box--on' : 'check-box--off'"
              >
                <Check v-if="selectedIds.has(project.id)" class="w-2.5 h-2.5" />
              </div>

              <!-- Project info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-0.5">
                  <span class="text-xs font-semibold text-fuse-text truncate">{{ project.name }}</span>
                  <StatusBadge :state="project.state" size="sm" />
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-[9px] font-mono text-fuse-muted truncate">{{ project.project_key }}</span>
                  <span v-if="project.client_name" class="text-[9px] font-mono text-fuse-dim bg-white/[0.04] border border-white/[0.07] px-1 py-px rounded">
                    {{ project.client_name }}
                  </span>
                </div>
              </div>

              <!-- Will-be badge -->
              <div class="flex-shrink-0 ml-2">
                <span
                  v-if="selectedIds.has(project.id)"
                  class="fate-badge fate-badge--keep"
                >
                  Keep
                </span>
                <span v-else class="fate-badge fate-badge--suspend">
                  Suspend
                </span>
              </div>
            </div>
          </div>

          <!-- ── What happens to suspended projects ──────────── -->
          <div class="mx-5 mt-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 space-y-1.5">
            <p class="text-[9px] font-mono uppercase tracking-widest text-fuse-muted mb-1">What "Suspend" means</p>
            <div class="flex items-start gap-2 text-[10px] text-fuse-dim">
              <span class="text-fuse-green text-[9px] mt-px flex-shrink-0">✓</span>
              Your client's deployed app keeps running — no interruption.
            </div>
            <div class="flex items-start gap-2 text-[10px] text-fuse-dim">
              <span class="text-fuse-green text-[9px] mt-px flex-shrink-0">✓</span>
              The last-set SDK state (Active, Readonly, etc.) is preserved.
            </div>
            <div class="flex items-start gap-2 text-[10px] text-fuse-dim">
              <span class="text-fuse-yellow text-[9px] mt-px flex-shrink-0">⚠</span>
              You won't be able to change the project's state from this dashboard.
            </div>
            <div class="flex items-start gap-2 text-[10px] text-fuse-dim">
              <span class="text-fuse-blue text-[9px] mt-px flex-shrink-0">↑</span>
              Upgrade anytime to re-activate suspended projects.
            </div>
          </div>

          <!-- ── Error ───────────────────────────────────────── -->
          <div v-if="error" class="mx-5 mt-3 text-fuse-red text-xs rounded-lg px-3 py-2.5 border border-fuse-red/20 bg-fuse-red/[0.06]">
            {{ error }}
          </div>

          <!-- ── Actions ─────────────────────────────────────── -->
          <div class="modal-footer">
            <div class="flex items-center gap-2 flex-1 min-w-0 mr-2">
              <span v-if="selectedIds.size < planLimit" class="text-[10px] text-fuse-muted font-mono">
                {{ planLimit - selectedIds.size }} slot{{ planLimit - selectedIds.size !== 1 ? 's' : '' }} remaining
              </span>
              <span v-else-if="selectedIds.size === planLimit" class="text-[10px] text-fuse-green font-mono">
                ✓ All slots filled
              </span>
              <span v-else class="text-[10px] text-fuse-red font-mono">
                {{ selectedIds.size - planLimit }} too many selected
              </span>
            </div>

            <div class="flex gap-2 flex-shrink-0">
              <NuxtLink to="/pricing" class="btn-ghost text-xs">
                Upgrade instead
              </NuxtLink>
              <button
                @click="confirm"
                :disabled="saving || selectedIds.size > planLimit"
                class="btn-primary text-xs"
              >
                {{ saving ? 'Saving…' : `Confirm (${toSuspend} suspended)` }}
              </button>
            </div>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { AlertTriangle, Check, Info } from 'lucide-vue-next'

const props = defineProps<{
  show: boolean
  planLimit: number
  projects: Array<{
    id: string
    name: string
    project_key: string
    state: string
    client_name?: string
    status: string
  }>
}>()

const emit = defineEmits<{
  (e: 'resolved'): void
}>()

const selectedIds = ref<Set<string>>(new Set())
const saving = ref(false)
const error = ref('')

// Pre-select the first planLimit active projects by default (prioritize active over suspended)
watchEffect(() => {
  if (props.show && props.projects.length > 0) {
    const initial = new Set<string>()
    
    // First, try to select active projects
    const activeProjects = props.projects.filter(p => p.status === 'active')
    const suspendedProjects = props.projects.filter(p => p.status === 'suspended')
    
    // Fill with active projects first
    for (let i = 0; i < Math.min(props.planLimit, activeProjects.length); i++) {
      initial.add(activeProjects[i].id)
    }
    
    // If we still have slots, add suspended projects
    const remainingSlots = props.planLimit - initial.size
    if (remainingSlots > 0) {
      for (let i = 0; i < Math.min(remainingSlots, suspendedProjects.length); i++) {
        initial.add(suspendedProjects[i].id)
      }
    }
    
    selectedIds.value = initial
  }
})

const toSuspend = computed(() =>
  props.projects.filter(p => !selectedIds.value.has(p.id)).length
)

function toggleProject(id: string) {
  const next = new Set(selectedIds.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    if (next.size >= props.planLimit) return // can't select more
    next.add(id)
  }
  selectedIds.value = next
}

async function confirm() {
  if (selectedIds.value.size > props.planLimit) return
  error.value = ''
  saving.value = true
  try {
    await $fetch('/api/plan/downgrade-elect', {
      method: 'POST',
      body: { retainIds: Array.from(selectedIds.value) },
    })
    emit('resolved')
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Failed to save your selection.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
/* ── Modal ──────────────────────────────────────────────────── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.82);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.modal-panel {
  width: 100%;
  max-width: 540px;
  border-radius: 20px;
  border: 0.5px solid rgba(255, 255, 255, 0.1);
  background: rgba(12, 12, 12, 0.98);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.75), 0 0 0 0.5px rgba(255, 255, 255, 0.04);
  padding-bottom: 0;
  overflow: hidden;
}

.modal-header {
  padding: 20px 20px 0;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  margin-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

/* ── Warning icon ────────────────────────────────────────────── */
.icon-warning {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid rgba(255, 215, 0, 0.25);
  background: rgba(255, 215, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffd700;
  flex-shrink: 0;
}

/* ── Info banner ─────────────────────────────────────────────── */
.info-banner {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid rgba(68, 136, 255, 0.18);
  background: rgba(68, 136, 255, 0.06);
}

/* ── Project rows ────────────────────────────────────────────── */
.project-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.02);
  cursor: pointer;
  transition: border-color 0.12s, background 0.12s;
  outline: none;
}
.project-row:hover { border-color: rgba(255, 255, 255, 0.1); background: rgba(255, 255, 255, 0.04); }
.project-row:focus-visible { box-shadow: 0 0 0 2px rgba(255, 51, 51, 0.4); }

.project-row--selected {
  border-color: rgba(0, 255, 136, 0.25) !important;
  background: rgba(0, 255, 136, 0.04) !important;
}

.project-row--disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* ── Checkbox ────────────────────────────────────────────────── */
.check-box {
  width: 18px;
  height: 18px;
  border-radius: 5px;
  border: 1.5px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.12s, border-color 0.12s;
  flex-shrink: 0;
}
.check-box--off {
  border-color: rgba(255, 255, 255, 0.15);
  background: transparent;
  color: transparent;
}
.check-box--on {
  border-color: rgba(0, 255, 136, 0.5);
  background: rgba(0, 255, 136, 0.15);
  color: #00ff88;
}

/* ── Fate badges ─────────────────────────────────────────────── */
.fate-badge {
  display: inline-flex;
  align-items: center;
  font-size: 9px;
  font-family: 'Space Mono', monospace;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: 5px;
  border: 1px solid;
}
.fate-badge--keep {
  color: #00ff88;
  border-color: rgba(0, 255, 136, 0.3);
  background: rgba(0, 255, 136, 0.08);
}
.fate-badge--suspend {
  color: #6b6b6b;
  border-color: rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
}

/* ── Buttons ─────────────────────────────────────────────────── */
.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: #ff3333;
  color: white;
  font-weight: 700;
  font-size: 11px;
  padding: 8px 16px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-primary:hover:not(:disabled) { background: #ef4444; }
.btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }

.btn-ghost {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  padding: 8px 14px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: transparent;
  color: #ababab;
  cursor: pointer;
  text-decoration: none;
  transition: border-color 0.15s, color 0.15s;
}
.btn-ghost:hover { border-color: rgba(255, 255, 255, 0.2); color: #f0f0f0; }

/* ── Modal transition ────────────────────────────────────────── */
.modal-enter-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.modal-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.modal-enter-from   { opacity: 0; transform: scale(0.97) translateY(8px); }
.modal-leave-to     { opacity: 0; transform: scale(0.97) translateY(8px); }
</style>