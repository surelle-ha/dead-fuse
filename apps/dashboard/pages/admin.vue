<template>
  <div class="min-h-screen bg-fuse-black">
    <!-- Ambient background glows -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
      <div class="absolute top-0 left-1/4 w-[500px] h-[300px] bg-fuse-red/[0.04] rounded-full blur-3xl" />
      <div class="absolute bottom-1/4 right-0 w-64 h-64 bg-fuse-purple/[0.03] rounded-full blur-3xl" />
    </div>

    <main class="max-w-6xl mx-auto px-6 py-10 animate-slide-up relative z-10">

      <!-- Header -->
      <div class="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div class="flex items-center gap-2 mb-3">
            <div class="w-1.5 h-1.5 rounded-full bg-fuse-red animate-pulse" />
            <span class="text-[10px] font-mono uppercase tracking-[0.35em] text-fuse-muted">Admin panel</span>
          </div>
          <h1 class="text-2xl font-bold text-fuse-text">System Overview</h1>
          <p class="text-fuse-dim text-sm mt-1.5 max-w-md">Manage users, pricing plans, and review system health.</p>
        </div>
        <div class="glass-chip">
          <span class="text-[10px] font-mono text-fuse-muted">signed in as</span>
          <span class="text-xs font-mono text-fuse-text">{{ admin?.email || '—' }}</span>
        </div>
      </div>

      <!-- Error state -->
      <div v-if="error && error.statusCode === 403" class="glass-panel mb-6 border-fuse-red/20 bg-fuse-red/[0.03] p-5">
        <p class="text-fuse-red text-sm">You do not have access to this page.</p>
        <NuxtLink to="/projects" class="text-xs text-fuse-dim underline mt-2 inline-block">Return to projects</NuxtLink>
      </div>
      <div v-else-if="error" class="glass-panel mb-6 border-fuse-red/20 p-5">
        <p class="text-fuse-red text-sm">Failed to load admin data.</p>
      </div>

      <!-- Loading skeleton -->
      <div v-if="pending" class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <div v-for="i in 4" :key="i" class="h-24 rounded-xl animate-pulse bg-white/[0.03] border border-white/[0.05]" />
      </div>

      <template v-if="admin">
        <!-- KPI Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <div v-for="kpi in kpiCards" :key="kpi.label" class="kpi-card" :class="kpi.glow">
            <div class="flex items-start justify-between mb-3">
              <span class="text-[9px] font-mono uppercase tracking-[0.3em] text-fuse-muted">{{ kpi.label }}</span>
              <div class="kpi-icon" :class="kpi.iconBg">
                <component :is="kpi.icon" class="w-3 h-3" :class="kpi.iconColor" />
              </div>
            </div>
            <span class="text-2xl font-bold font-mono" :class="kpi.color">{{ kpi.value }}</span>
            <p class="text-[10px] text-fuse-muted mt-1">{{ kpi.desc }}</p>
          </div>
        </div>

        <!-- Users Table -->
        <div class="glass-panel mb-6 overflow-hidden p-0">
          <!-- Panel header -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-5 border-b border-white/[0.06]">
            <div>
              <h2 class="text-sm font-semibold text-fuse-text">Users</h2>
              <p class="text-[10px] text-fuse-muted mt-0.5">Manage roles, plans, and project limits</p>
            </div>
            <div class="relative">
              <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-fuse-muted pointer-events-none" />
              <input
                v-model="userSearch"
                type="search"
                placeholder="Search users…"
                class="search-input pl-8"
              />
            </div>
          </div>

          <!-- Table -->
          <div class="overflow-x-auto">
            <table class="min-w-full">
              <thead>
                <tr class="border-b border-white/[0.05]">
                  <th class="th">User</th>
                  <th class="th">Role</th>
                  <th class="th text-center">Usage</th>
                  <th class="th">Plan</th>
                  <th class="th hidden lg:table-cell">Expiry</th>
                  <th class="th text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="filteredUsers.length === 0">
                  <td colspan="6" class="px-6 py-8 text-center text-sm text-fuse-muted">No users match your search.</td>
                </tr>
                <tr
                  v-for="user in filteredUsers"
                  :key="user.id"
                  class="table-row group"
                >
                  <td class="td">
                    <div class="flex items-center gap-3">
                      <div class="user-avatar">{{ user.email.slice(0,2).toUpperCase() }}</div>
                      <div class="min-w-0">
                        <p class="text-xs font-medium text-fuse-text truncate max-w-[180px]">{{ user.email }}</p>
                        <p class="text-[9px] font-mono text-fuse-muted truncate max-w-[160px]">{{ user.id }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="td">
                    <span class="role-badge" :class="user.role === 'admin' ? 'role-badge--admin' : 'role-badge--user'">
                      {{ user.role }}
                    </span>
                  </td>
                  <td class="td text-center">
                    <div class="flex items-center justify-center gap-2">
                      <div class="usage-bar-track">
                        <div class="usage-bar-fill" :style="{ width: Math.min((user.project_count / Math.max(user.project_limit, 1)) * 100, 100) + '%' }" :class="user.project_count >= user.project_limit ? 'bg-fuse-red' : 'bg-fuse-green'" />
                      </div>
                      <span class="text-[10px] font-mono text-fuse-muted whitespace-nowrap">{{ user.project_count }}/{{ user.project_limit }}</span>
                    </div>
                  </td>
                  <td class="td">
                    <span class="plan-pill">{{ user.plan_name }}</span>
                  </td>
                  <td class="td hidden lg:table-cell">
                    <span class="text-[10px] font-mono text-fuse-muted">
                      {{ user.plan_expires_at ? new Date(user.plan_expires_at).toLocaleDateString() : '—' }}
                    </span>
                  </td>
                  <td class="td text-right">
                    <button @click="openPlanEditor(user)" class="btn-table-action">
                      <Settings class="w-3 h-3" />
                      <span>Manage</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="userUpdateError" class="px-6 py-3 border-t border-white/[0.05] text-fuse-red text-xs">{{ userUpdateError }}</div>
        </div>

        <!-- Pricing Plans -->
        <div class="glass-panel overflow-hidden p-0">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-5 border-b border-white/[0.06]">
            <div>
              <h2 class="text-sm font-semibold text-fuse-text">Pricing Plans</h2>
              <p class="text-[10px] text-fuse-muted mt-0.5">Configure tiers and limits</p>
            </div>
            <button @click="startNewPlan" class="btn-primary text-xs px-4">
              <Plus class="w-3 h-3" />
              New plan
            </button>
          </div>

          <!-- Plan Cards Grid -->
          <div class="p-6">
            <div v-if="planOptions.length === 0" class="text-center py-8 text-sm text-fuse-muted">No pricing plans configured yet.</div>
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
              <div v-for="plan in planOptions" :key="plan.id" class="plan-card">
                <div class="flex items-start justify-between mb-4">
                  <div>
                    <h3 class="text-sm font-bold text-fuse-text">{{ plan.name }}</h3>
                    <p class="text-[10px] font-mono text-fuse-muted mt-0.5">{{ plan.slug }}</p>
                  </div>
                  <div class="flex gap-1.5">
                    <button @click="editPlan(plan)" class="icon-action" title="Edit">
                      <Pencil class="w-3 h-3" />
                    </button>
                    <button @click="deletePlan(plan.id)" class="icon-action icon-action--danger" title="Delete">
                      <Trash2 class="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <p class="text-[10px] text-fuse-muted mb-4 leading-relaxed">{{ plan.description || 'No description' }}</p>
                <div class="grid grid-cols-2 gap-2">
                  <div class="plan-stat">
                    <span class="plan-stat-label">Projects</span>
                    <span class="plan-stat-value text-fuse-green">{{ plan.project_limit >= 9999 ? '∞' : plan.project_limit }}</span>
                  </div>
                  <div class="plan-stat">
                    <span class="plan-stat-label">Expiry</span>
                    <span class="plan-stat-value text-fuse-dim">{{ plan.default_expiry_days != null ? plan.default_expiry_days + 'd' : 'None' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </main>

    <!-- ── Plan Editor Modal ───────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="selectedUser" class="modal-backdrop" @click.self="closePlanEditor">
          <div class="modal-panel animate-slide-up">
            <div class="modal-header">
              <div>
                <div class="flex items-center gap-2 mb-0.5">
                  <div class="user-avatar user-avatar--sm">{{ selectedUser.email.slice(0,2).toUpperCase() }}</div>
                  <h2 class="text-sm font-bold text-fuse-text">Manage Plan</h2>
                </div>
                <p class="text-[10px] text-fuse-muted">{{ selectedUser.email }}</p>
              </div>
              <button @click="closePlanEditor" class="modal-close">✕</button>
            </div>
            <div class="p-6 space-y-4">
              <div class="grid grid-cols-1 gap-4">
                <div class="field-group">
                  <label class="field-label">Pricing plan</label>
                  <select v-model="planEditor.planId" class="field-input text-xs">
                    <option v-for="option in planOptions" :key="option.id" :value="option.id">{{ option.name }}</option>
                  </select>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div class="field-group">
                    <label class="field-label">Expiry date</label>
                    <input v-model="planEditor.expiresAt" type="date" class="field-input text-xs" />
                    <p v-if="selectedPlanInfo?.default_expiry_days" class="text-[10px] text-fuse-muted mt-1">Default: {{ selectedPlanInfo.default_expiry_days }}d</p>
                  </div>
                  <div class="field-group">
                    <label class="field-label">Project limit</label>
                    <input v-model.number="planEditor.projectLimit" type="number" min="1" class="field-input text-xs" />
                  </div>
                </div>
              </div>

              <div class="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                <p class="text-[10px] text-fuse-muted leading-relaxed">Current: <span class="text-fuse-dim">{{ selectedUser.project_count }}/{{ selectedUser.project_limit }} projects</span> · Plan: <span class="text-fuse-dim">{{ selectedUser.plan_name }}</span></p>
              </div>

              <div v-if="planEditor.error" class="error-box">{{ planEditor.error }}</div>

              <div class="flex gap-2 pt-1">
                <button @click="closePlanEditor" class="btn-ghost flex-1 text-xs">Cancel</button>
                <button @click="saveUserPlan" :disabled="planEditor.saving" class="btn-primary flex-1 text-xs">
                  {{ planEditor.saving ? 'Saving…' : 'Save changes' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── Create/Edit Plan Modal ─────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showPlanForm" class="modal-backdrop" @click.self="cancelPlanEdit">
          <div class="modal-panel animate-slide-up">
            <div class="modal-header">
              <div>
                <h2 class="text-sm font-bold text-fuse-text">{{ editingPlanId ? 'Edit Plan' : 'New Plan' }}</h2>
                <p class="text-[10px] text-fuse-muted">{{ editingPlanId ? 'Update pricing tier details' : 'Create a new pricing tier' }}</p>
              </div>
              <button @click="cancelPlanEdit" class="modal-close">✕</button>
            </div>
            <div class="p-6 space-y-4">
              <div class="grid grid-cols-2 gap-3">
                <div class="field-group">
                  <label class="field-label">Name</label>
                  <input v-model="planForm.name" type="text" class="field-input text-xs" placeholder="Pro" />
                </div>
                <div class="field-group">
                  <label class="field-label">Slug</label>
                  <input v-model="planForm.slug" type="text" class="field-input text-xs" placeholder="pro" />
                </div>
              </div>
              <div class="field-group">
                <label class="field-label">Description</label>
                <input v-model="planForm.description" type="text" class="field-input text-xs" placeholder="Short description" />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="field-group">
                  <label class="field-label">Project limit</label>
                  <input v-model.number="planForm.project_limit" type="number" min="1" class="field-input text-xs" />
                </div>
                <div class="field-group">
                  <label class="field-label">Default expiry (days)</label>
                  <input v-model.number="planForm.default_expiry_days" type="number" min="0" class="field-input text-xs" />
                </div>
              </div>

              <div v-if="planFormError" class="error-box">{{ planFormError }}</div>

              <div class="flex gap-2 pt-1">
                <button @click="cancelPlanEdit" class="btn-ghost flex-1 text-xs">Cancel</button>
                <button @click="savePlan" :disabled="planFormSaving" class="btn-primary flex-1 text-xs">
                  {{ planFormSaving ? 'Saving…' : editingPlanId ? 'Save plan' : 'Create plan' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useFetch } from '#imports'
import { Users, FolderKanban, Ticket, AlertCircle, Search, Settings, Plus, Pencil, Trash2 } from 'lucide-vue-next'

type AdminUser = {
  id: string
  email: string
  role: string
  project_limit: number
  project_count: number
  plan_id?: string | null
  plan_name: string
  plan_expires_at?: string | null
}

type AdminSummary = {
  userId: string
  email: string
  totals: {
    users: number
    projects: number
    tickets: number
    openTickets: number
  }
  users: AdminUser[]
  tickets: Array<{ id: string; subject: string; status: string; created_at: string }>
}

type PricingPlan = {
  id: string
  slug: string
  name: string
  description: string | null
  project_limit: number
  default_expiry_days: number | null
}

definePageMeta({ middleware: ['auth', 'admin'] })

const userSearch = ref('')
const userUpdateError = ref('')
const selectedUser = ref<AdminUser | null>(null)
const showPlanForm = ref(false)
const planEditor = reactive({ planId: '', expiresAt: '', projectLimit: 0, saving: false, error: '' })
const planForm = reactive({ id: '', name: '', slug: '', description: '', project_limit: 2, default_expiry_days: 30 })
const editingPlanId = ref<string | null>(null)
const planFormError = ref('')
const planFormSaving = ref(false)

const { data: admin, pending, error, refresh } = useFetch<AdminSummary>('/api/admin')
const { data: plans, refresh: refreshPlans } = useFetch<PricingPlan[]>('/api/admin/plans')

const planOptions = computed(() => plans.value ?? [])
const selectedPlanInfo = computed(() => planOptions.value.find((plan) => plan.id === planEditor.planId) ?? null)

const kpiCards = computed(() => {
  if (!admin.value) return []
  return [
    { label: 'Users', value: admin.value.totals.users, desc: 'Total registered', icon: Users, color: 'text-fuse-blue', iconBg: 'bg-fuse-blue/[0.08] border-fuse-blue/20', iconColor: 'text-fuse-blue', glow: '' },
    { label: 'Projects', value: admin.value.totals.projects, desc: 'System-wide', icon: FolderKanban, color: 'text-fuse-green', iconBg: 'bg-fuse-green/[0.08] border-fuse-green/20', iconColor: 'text-fuse-green', glow: '' },
    { label: 'Tickets', value: admin.value.totals.tickets, desc: 'All support requests', icon: Ticket, color: 'text-fuse-yellow', iconBg: 'bg-fuse-yellow/[0.08] border-fuse-yellow/20', iconColor: 'text-fuse-yellow', glow: '' },
    { label: 'Open issues', value: admin.value.totals.openTickets, desc: 'Awaiting review', icon: AlertCircle, color: admin.value.totals.openTickets > 0 ? 'text-fuse-red' : 'text-fuse-dim', iconBg: admin.value.totals.openTickets > 0 ? 'bg-fuse-red/[0.08] border-fuse-red/20' : 'bg-white/[0.04] border-white/[0.07]', iconColor: admin.value.totals.openTickets > 0 ? 'text-fuse-red' : 'text-fuse-muted', glow: admin.value.totals.openTickets > 0 ? 'kpi-card--alert' : '' },
  ]
})

watch(() => planEditor.planId, (newPlanId, oldPlanId) => {
  if (!selectedPlanInfo.value) return
  const previousPlanLimit = planOptions.value.find((plan) => plan.id === oldPlanId)?.project_limit
  if (oldPlanId === '' || planEditor.projectLimit === previousPlanLimit || planEditor.projectLimit === 2) {
    planEditor.projectLimit = selectedPlanInfo.value.project_limit
  }
})

const filteredUsers = computed(() => {
  if (!admin.value?.users) return []
  const query = userSearch.value.trim().toLowerCase()
  if (!query) return admin.value.users
  return admin.value.users.filter(u =>
    u.email.toLowerCase().includes(query) ||
    u.id.toLowerCase().includes(query) ||
    u.role.toLowerCase().includes(query)
  )
})

function openPlanEditor(user: AdminUser) {
  selectedUser.value = user
  planEditor.planId = user.plan_id || planOptions.value[0]?.id || ''
  planEditor.expiresAt = user.plan_expires_at ? user.plan_expires_at.slice(0, 10) : ''
  planEditor.projectLimit = user.project_limit
  planEditor.error = ''
}

function closePlanEditor() {
  selectedUser.value = null
  planEditor.planId = ''
  planEditor.expiresAt = ''
  planEditor.projectLimit = 0
  planEditor.error = ''
}

async function saveUserPlan() {
  if (!selectedUser.value) return
  planEditor.error = ''
  planEditor.saving = true
  try {
    let expiresAt: string | null = planEditor.expiresAt || null
    if (!expiresAt && selectedPlanInfo.value?.default_expiry_days != null) {
      const expiry = new Date()
      expiry.setDate(expiry.getDate() + selectedPlanInfo.value.default_expiry_days)
      expiresAt = expiry.toISOString()
    }
    await $fetch(`/api/admin/users/${encodeURIComponent(selectedUser.value.id)}/plan`, {
      method: 'POST',
      body: {
        planId: planEditor.planId || null,
        expiresAt,
        projectLimit: selectedPlanInfo.value?.project_limit ?? planEditor.projectLimit,
      },
    })
    await refresh()
    await refreshPlans()
    closePlanEditor()
  } catch (err: any) {
    planEditor.error = err?.data?.statusMessage || 'Unable to save user plan.'
  } finally {
    planEditor.saving = false
  }
}

function startNewPlan() {
  editingPlanId.value = null
  planForm.name = ''
  planForm.slug = ''
  planForm.description = ''
  planForm.project_limit = 2
  planForm.default_expiry_days = 30
  planFormError.value = ''
  showPlanForm.value = true
}

function editPlan(plan: PricingPlan) {
  editingPlanId.value = plan.id
  planForm.name = plan.name
  planForm.slug = plan.slug
  planForm.description = plan.description || ''
  planForm.project_limit = plan.project_limit
  planForm.default_expiry_days = plan.default_expiry_days ?? 0
  planFormError.value = ''
  showPlanForm.value = true
}

function cancelPlanEdit() {
  showPlanForm.value = false
  editingPlanId.value = null
  planFormError.value = ''
}

async function savePlan() {
  planFormError.value = ''
  planFormSaving.value = true
  if (!planForm.name.trim() || !planForm.slug.trim()) {
    planFormError.value = 'Name and slug are required.'
    planFormSaving.value = false
    return
  }
  try {
    const payload = {
      name: planForm.name.trim(),
      slug: planForm.slug.trim().toLowerCase(),
      description: planForm.description.trim() || null,
      project_limit: planForm.project_limit,
      default_expiry_days: planForm.default_expiry_days || null,
    }
    if (editingPlanId.value) {
      await $fetch(`/api/admin/plans/${encodeURIComponent(editingPlanId.value)}`, { method: 'PATCH', body: payload })
    } else {
      await $fetch('/api/admin/plans', { method: 'POST', body: payload })
    }
    await refreshPlans()
    cancelPlanEdit()
  } catch (err: any) {
    planFormError.value = err?.data?.statusMessage || 'Unable to save pricing plan.'
  } finally {
    planFormSaving.value = false
  }
}

async function deletePlan(planId: string) {
  if (!confirm('Delete this pricing plan? This cannot be undone.')) return
  try {
    await $fetch(`/api/admin/plans/${encodeURIComponent(planId)}`, { method: 'DELETE' })
    await refreshPlans()
  } catch (err: any) {
    planFormError.value = err?.data?.statusMessage || 'Unable to delete pricing plan.'
  }
}
</script>

<style scoped>
/* ── Base glass panel ───────────────────────── */
.glass-panel {
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.07);
  background: rgba(255,255,255,0.025);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

/* ── Header chip ───────────────────────────── */
.glass-chip {
  @apply flex flex-col items-end gap-0.5 px-4 py-2.5 rounded-xl border border-white/[0.07];
  background: rgba(255,255,255,0.03);
  backdrop-filter: blur(12px);
}

/* ── KPI cards ─────────────────────────────── */
.kpi-card {
  @apply p-5 rounded-xl border border-white/[0.07] flex flex-col;
  background: rgba(255,255,255,0.025);
  backdrop-filter: blur(16px);
  transition: border-color 0.15s, transform 0.15s;
}
.kpi-card:hover { border-color: rgba(255,255,255,0.12); transform: translateY(-1px); }
.kpi-card--alert {
  border-color: rgba(255,51,51,0.15) !important;
  background: rgba(255,51,51,0.025) !important;
}
.kpi-icon {
  @apply w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0;
}

/* ── Table ─────────────────────────────────── */
.th {
  @apply px-6 py-3 text-[9px] font-mono uppercase tracking-[0.25em] text-fuse-muted font-normal text-left;
  background: rgba(255,255,255,0.02);
}
.td { @apply px-6 py-3.5 border-t border-white/[0.04]; }
.table-row { transition: background 0.1s; }
.table-row:hover td { background: rgba(255,255,255,0.02); }

/* ── Search ───────────────────────────────── */
.search-input {
  @apply w-full sm:w-56 text-xs text-fuse-text rounded-lg border border-white/[0.08] px-3 py-1.5 outline-none placeholder:text-fuse-muted;
  background: rgba(0,0,0,0.3);
  transition: border-color 0.15s;
}
.search-input:focus { border-color: rgba(255,51,51,0.3); }

/* ── User avatar ──────────────────────────── */
.user-avatar {
  @apply w-8 h-8 rounded-lg bg-fuse-red/15 border border-fuse-red/25 flex items-center justify-center text-[10px] font-mono font-bold text-fuse-red flex-shrink-0;
}
.user-avatar--sm { @apply w-6 h-6 text-[9px]; }

/* ── Badges ───────────────────────────────── */
.role-badge {
  @apply text-[9px] font-mono uppercase tracking-[0.2em] px-2 py-0.5 rounded-md border;
}
.role-badge--admin {
  @apply text-fuse-red border-fuse-red/25 bg-fuse-red/[0.08];
}
.role-badge--user {
  @apply text-fuse-muted border-white/[0.08] bg-white/[0.03];
}

.plan-pill {
  @apply text-[10px] font-mono text-fuse-dim border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 rounded-md;
}

/* ── Usage bar ────────────────────────────── */
.usage-bar-track {
  @apply w-16 h-1 rounded-full bg-white/[0.06] overflow-hidden;
}
.usage-bar-fill { @apply h-full rounded-full transition-all; }

/* ── Table action button ──────────────────── */
.btn-table-action {
  @apply flex items-center gap-1.5 text-[10px] font-mono text-fuse-dim border border-white/[0.08] rounded-lg px-2.5 py-1.5 transition-all;
  background: rgba(255,255,255,0.02);
}
.btn-table-action:hover {
  @apply text-fuse-text border-white/[0.15];
  background: rgba(255,255,255,0.05);
}

/* ── Plan cards ───────────────────────────── */
.plan-card {
  @apply rounded-xl border border-white/[0.07] p-4;
  background: rgba(255,255,255,0.02);
  backdrop-filter: blur(8px);
  transition: border-color 0.15s, transform 0.15s;
}
.plan-card:hover {
  border-color: rgba(255,255,255,0.12);
  transform: translateY(-1px);
}

.plan-stat {
  @apply flex flex-col gap-0.5 bg-black/20 rounded-lg px-3 py-2;
}
.plan-stat-label { @apply text-[9px] font-mono uppercase tracking-widest text-fuse-muted; }
.plan-stat-value { @apply text-sm font-bold font-mono; }

/* ── Icon action buttons ──────────────────── */
.icon-action {
  @apply w-7 h-7 flex items-center justify-center rounded-lg border border-white/[0.07] text-fuse-muted transition-all;
  background: rgba(255,255,255,0.02);
}
.icon-action:hover { @apply text-fuse-text border-white/[0.14]; background: rgba(255,255,255,0.05); }
.icon-action--danger:hover { @apply text-fuse-red border-fuse-red/25; background: rgba(255,51,51,0.06); }

/* ── Modal ────────────────────────────────── */
.modal-backdrop {
  @apply fixed inset-0 z-50 flex items-center justify-center p-4;
  background: rgba(0,0,0,0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
.modal-panel {
  @apply w-full max-w-md rounded-2xl border border-white/[0.1] overflow-hidden;
  background: rgba(14,14,14,0.97);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow: 0 24px 64px rgba(0,0,0,0.7), 0 0 0 0.5px rgba(255,255,255,0.05);
}
.modal-header {
  @apply flex items-start justify-between gap-4 px-6 py-5 border-b border-white/[0.07];
}
.modal-close {
  @apply text-fuse-muted hover:text-fuse-text transition-colors text-sm w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/[0.06];
}

/* ── Modal transitions ────────────────────── */
.modal-enter-active { transition: opacity 0.2s ease; }
.modal-leave-active { transition: opacity 0.15s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

/* ── Form elements ────────────────────────── */
.field-group { @apply flex flex-col gap-1.5; }
.field-label { @apply text-[9px] font-mono uppercase tracking-widest text-fuse-muted; }
.field-input {
  @apply w-full rounded-lg border border-white/[0.08] px-3 py-2 text-fuse-text outline-none placeholder:text-fuse-muted;
  background: rgba(0,0,0,0.35);
  transition: border-color 0.15s;
  font-size: 12px;
}
.field-input:focus { border-color: rgba(255,51,51,0.35); box-shadow: 0 0 0 3px rgba(255,51,51,0.06); }

/* ── Buttons ──────────────────────────────── */
.btn-primary {
  @apply flex items-center justify-center gap-1.5 bg-fuse-red hover:bg-red-500 text-white font-bold px-4 py-2 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed;
}
.btn-ghost {
  @apply flex items-center justify-center border border-white/[0.08] hover:border-white/[0.16] text-fuse-dim hover:text-fuse-text px-4 py-2 rounded-lg transition-all;
}

/* ── Error box ────────────────────────────── */
.error-box {
  @apply text-fuse-red text-xs rounded-lg px-3 py-2.5 border border-fuse-red/20;
  background: rgba(255,51,51,0.06);
}
</style>