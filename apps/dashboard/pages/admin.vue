<template>
  <div class="min-h-screen bg-fuse-black">
    <main class="max-w-6xl mx-auto px-6 py-10 animate-slide-up">
      <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-fuse-dim text-xs uppercase tracking-[0.35em] mb-2">Admin summary</p>
          <h1 class="text-3xl font-bold text-fuse-text">Account & support dashboard</h1>
          <p class="text-fuse-muted mt-2 max-w-2xl">Review your account activity, project usage, and pricing plans in one place.</p>
        </div>
        <div class="space-y-2 text-right">
          <p class="text-xs uppercase tracking-[0.35em] text-fuse-dim">Signed in as</p>
          <p class="text-sm font-mono text-fuse-text">{{ admin?.email || '—' }}</p>
        </div>
      </div>

      <div v-if="error && error.statusCode === 403" class="panel mb-6 text-fuse-red">
        You do not have access to this page.
        <NuxtLink to="/projects" class="text-fuse-text underline ml-2">Return to projects</NuxtLink>
      </div>
      <div v-else-if="error" class="panel mb-6 text-fuse-red">Failed to load admin data.</div>
      <div v-if="pending" class="panel mb-6 text-fuse-text">Loading admin summary…</div>

      <div v-if="admin" class="grid gap-4 lg:grid-cols-4">
        <div class="panel p-5">
          <p class="text-[9px] uppercase tracking-[0.35em] text-fuse-dim mb-2">Projects</p>
          <p class="text-3xl font-bold text-fuse-text">{{ admin.totals.projects }}</p>
          <p class="text-[10px] text-fuse-muted mt-2">Total system projects</p>
        </div>
        <div class="panel p-5">
          <p class="text-[9px] uppercase tracking-[0.35em] text-fuse-dim mb-2">Users</p>
          <p class="text-3xl font-bold text-fuse-text">{{ admin.totals.users }}</p>
          <p class="text-[10px] text-fuse-muted mt-2">Total registered users</p>
        </div>
        <div class="panel p-5">
          <p class="text-[9px] uppercase tracking-[0.35em] text-fuse-dim mb-2">Tickets</p>
          <p class="text-3xl font-bold text-fuse-text">{{ admin.totals.tickets }}</p>
          <p class="text-[10px] text-fuse-muted mt-2">Support requests created</p>
        </div>
        <div class="panel p-5">
          <p class="text-[9px] uppercase tracking-[0.35em] text-fuse-dim mb-2">Open issues</p>
          <p class="text-3xl font-bold text-fuse-text">{{ admin.totals.openTickets }}</p>
          <p class="text-[10px] text-fuse-muted mt-2">Active tickets awaiting review</p>
        </div>
      </div>

      <div v-if="admin" class="panel p-6 mt-10">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 class="text-sm font-semibold text-fuse-text">Users</h2>
            <p class="text-[10px] text-fuse-dim">Search users, view roles, and assign plans with expiry dates.</p>
          </div>
          <div class="w-full max-w-sm">
            <input
              v-model="userSearch"
              type="search"
              placeholder="Search by email, user id, or role"
              class="field-input text-xs w-full"
            />
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full border-separate border-spacing-y-2">
            <thead>
              <tr class="text-left text-[10px] uppercase tracking-[0.25em] text-fuse-dim">
                <th class="px-3 py-2">Email</th>
                <th class="px-3 py-2">User ID</th>
                <th class="px-3 py-2">Role</th>
                <th class="px-3 py-2 text-right">Project usage</th>
                <th class="px-3 py-2 text-right">Plan</th>
                <th class="px-3 py-2 text-right">Expiry</th>
                <th class="px-3 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredUsers.length === 0">
                <td colspan="7" class="px-3 py-4 text-sm text-fuse-muted">No users match your search.</td>
              </tr>
              <tr v-for="user in filteredUsers" :key="user.id" class="rounded-xl bg-white/[0.02] border border-white/[0.06] align-top">
                <td class="px-3 py-3"><span class="text-sm text-fuse-text">{{ user.email }}</span></td>
                <td class="px-3 py-3"><span class="text-xs font-mono text-fuse-dim break-all">{{ user.id }}</span></td>
                <td class="px-3 py-3"><span class="text-xs uppercase tracking-[0.15em] text-fuse-red/80">{{ user.role }}</span></td>
                <td class="px-3 py-3 text-right"><span class="text-sm text-fuse-text">{{ user.project_count }}/{{ user.project_limit }}</span></td>
                <td class="px-3 py-3 text-right"><span class="text-sm text-fuse-text">{{ user.plan_name }}</span></td>
                <td class="px-3 py-3 text-right"><span class="text-sm text-fuse-dim">{{ user.plan_expires_at ? new Date(user.plan_expires_at).toLocaleDateString() : '—' }}</span></td>
                <td class="px-3 py-3 text-right">
                  <button
                    @click="openPlanEditor(user)"
                    class="btn-secondary text-[10px] px-3 py-2"
                  >
                    Change plan
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="userUpdateError" class="mt-4 text-fuse-red text-sm">{{ userUpdateError }}</div>
      </div>

      <div v-if="selectedUser && admin" class="panel p-6 mt-6">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 class="text-sm font-semibold text-fuse-text">Change plan for {{ selectedUser.email }}</h2>
            <p class="text-[10px] text-fuse-dim">Assign a pricing plan, adjust project limit, or set a custom expiry.</p>
          </div>
          <button @click="closePlanEditor" class="btn-ghost text-xs">Cancel</button>
        </div>

        <div class="grid gap-4 lg:grid-cols-3">
          <div class="field-group">
            <label class="field-label">Pricing plan</label>
            <select v-model="planEditor.planId" class="field-input text-xs">
              <option v-for="option in planOptions" :key="option.id" :value="option.id">{{ option.name }}</option>
            </select>
          </div>
          <div class="field-group">
            <label class="field-label">Expiry date</label>
            <input v-model="planEditor.expiresAt" type="date" class="field-input text-xs" />
            <p v-if="selectedPlanInfo?.default_expiry_days" class="text-[10px] text-fuse-dim mt-1">
              Default expiry: {{ selectedPlanInfo.default_expiry_days }} days
            </p>
          </div>
          <div class="field-group">
            <label class="field-label">Project limit</label>
            <input v-model.number="planEditor.projectLimit" type="number" min="1" class="field-input text-xs" />
          </div>
        </div>

        <div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-[10px] text-fuse-dim">Changing a plan will also update the user's project slot limit.</p>
            <p v-if="planEditor.error" class="text-fuse-red text-sm mt-2">{{ planEditor.error }}</p>
          </div>
          <button @click="saveUserPlan" :disabled="planEditor.saving" class="btn-primary text-xs px-4 py-2">
            {{ planEditor.saving ? 'Saving…' : 'Save changes' }}
          </button>
        </div>
      </div>

      <div v-if="admin" class="panel p-6 mt-6">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 class="text-sm font-semibold text-fuse-text">Pricing & plans</h2>
            <p class="text-[10px] text-fuse-dim">Manage available plans and the limits associated with each pricing tier.</p>
          </div>
          <button @click="startNewPlan" class="btn-secondary text-xs">Create plan</button>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full border-separate border-spacing-y-2">
            <thead>
              <tr class="text-left text-[10px] uppercase tracking-[0.25em] text-fuse-dim">
                <th class="px-3 py-2">Name</th>
                <th class="px-3 py-2">Slug</th>
                <th class="px-3 py-2 text-right">Project limit</th>
                <th class="px-3 py-2 text-right">Default expiry</th>
                <th class="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="planOptions.length === 0">
                <td colspan="5" class="px-3 py-4 text-sm text-fuse-muted">No pricing plans configured yet.</td>
              </tr>
              <tr v-for="plan in planOptions" :key="plan.id" class="rounded-xl bg-white/[0.02] border border-white/[0.06] align-top">
                <td class="px-3 py-3"><span class="text-sm text-fuse-text">{{ plan.name }}</span><p class="text-[10px] text-fuse-dim mt-1">{{ plan.description || 'No description' }}</p></td>
                <td class="px-3 py-3"><span class="text-xs font-mono text-fuse-dim">{{ plan.slug }}</span></td>
                <td class="px-3 py-3 text-right"><span class="text-sm text-fuse-text">{{ plan.project_limit }}</span></td>
                <td class="px-3 py-3 text-right"><span class="text-sm text-fuse-dim">{{ plan.default_expiry_days != null ? plan.default_expiry_days + ' days' : 'None' }}</span></td>
                <td class="px-3 py-3 text-right space-x-2">
                  <button @click="editPlan(plan)" class="btn-secondary text-[10px] px-3 py-2">Edit</button>
                  <button @click="deletePlan(plan.id)" class="btn-ghost text-[10px] px-3 py-2 text-fuse-red">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="panel p-5 mt-6 border border-white/[0.06] bg-white/[0.02]">
          <h3 class="text-sm font-semibold text-fuse-text mb-3">{{ editingPlanId ? 'Edit plan' : 'New plan' }}</h3>
          <div class="grid gap-4 lg:grid-cols-3">
            <div class="field-group">
              <label class="field-label">Name</label>
              <input v-model="planForm.name" type="text" class="field-input text-xs" />
            </div>
            <div class="field-group">
              <label class="field-label">Slug</label>
              <input v-model="planForm.slug" type="text" class="field-input text-xs" />
            </div>
            <div class="field-group">
              <label class="field-label">Project limit</label>
              <input v-model.number="planForm.project_limit" type="number" min="1" class="field-input text-xs" />
            </div>
            <div class="field-group lg:col-span-2">
              <label class="field-label">Description</label>
              <input v-model="planForm.description" type="text" class="field-input text-xs" />
            </div>
            <div class="field-group">
              <label class="field-label">Default expiry (days)</label>
              <input v-model.number="planForm.default_expiry_days" type="number" min="0" class="field-input text-xs" />
            </div>
          </div>

          <div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p v-if="planFormError" class="text-fuse-red text-sm">{{ planFormError }}</p>
              <p v-else class="text-[10px] text-fuse-dim">Plans can be created and edited here. Assign them to users from the table above.</p>
            </div>
            <div class="flex gap-2">
              <button v-if="editingPlanId" @click="cancelPlanEdit" class="btn-ghost text-xs">Cancel</button>
              <button @click="savePlan" :disabled="planFormSaving" class="btn-primary text-xs px-4 py-2">
                {{ planFormSaving ? 'Saving…' : editingPlanId ? 'Save plan' : 'Create plan' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useFetch } from '#imports'

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
const planEditor = reactive({ planId: '', expiresAt: '', projectLimit: 0, saving: false, error: '' })
const planForm = reactive({ id: '', name: '', slug: '', description: '', project_limit: 2, default_expiry_days: 30 })
const editingPlanId = ref<string | null>(null)
const planFormError = ref('')
const planFormSaving = ref(false)

const { data: admin, pending, error, refresh } = useFetch<AdminSummary>('/api/admin')
const { data: plans, pending: plansPending, error: plansError, refresh: refreshPlans } = useFetch<PricingPlan[]>('/api/admin/plans')

const planOptions = computed(() => plans.value ?? [])
const selectedPlanInfo = computed(() => planOptions.value.find((plan) => plan.id === planEditor.planId) ?? null)

watch(() => planEditor.planId, (newPlanId, oldPlanId) => {
  if (!selectedPlanInfo.value) return
  const previousPlanLimit = planOptions.value.find((plan) => plan.id === oldPlanId)?.project_limit
  if (oldPlanId === '' || planEditor.projectLimit === previousPlanLimit || planEditor.projectLimit === 2) {
    planEditor.projectLimit = selectedPlanInfo.value.project_limit
  }
})

const filteredUsers = computed(() => {
  if (!admin.value?.users) {
    return []
  }

  const query = userSearch.value.trim().toLowerCase()
  if (!query) {
    return admin.value.users
  }

  return admin.value.users.filter((user) => {
    return (
      user.email.toLowerCase().includes(query) ||
      user.id.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    )
  })
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
    planEditor.error = err?.data?.statusMessage || 'Unable to save user plan. Please try again.'
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
}

function editPlan(plan: PricingPlan) {
  editingPlanId.value = plan.id
  planForm.name = plan.name
  planForm.slug = plan.slug
  planForm.description = plan.description || ''
  planForm.project_limit = plan.project_limit
  planForm.default_expiry_days = plan.default_expiry_days ?? 0
  planFormError.value = ''
}

function cancelPlanEdit() {
  startNewPlan()
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
      await $fetch(`/api/admin/plans/${encodeURIComponent(editingPlanId.value)}`, {
        method: 'PATCH',
        body: payload,
      })
    } else {
      await $fetch('/api/admin/plans', {
        method: 'POST',
        body: payload,
      })
    }

    await refreshPlans()
    startNewPlan()
  } catch (err: any) {
    planFormError.value = err?.data?.statusMessage || 'Unable to save pricing plan.'
  } finally {
    planFormSaving.value = false
  }
}

async function deletePlan(planId: string) {
  const confirmed = confirm('Delete this pricing plan? This cannot be undone.')
  if (!confirmed) return

  try {
    await $fetch(`/api/admin/plans/${encodeURIComponent(planId)}`, {
      method: 'DELETE',
    })
    await refreshPlans()
  } catch (err: any) {
    planFormError.value = err?.data?.statusMessage || 'Unable to delete pricing plan.'
  }
}
</script>
