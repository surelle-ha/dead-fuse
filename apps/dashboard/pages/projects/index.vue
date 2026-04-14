<template>
  <div class="min-h-screen bg-fuse-black relative overflow-hidden">
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute -top-48 -left-48 w-96 h-96 bg-fuse-red/[0.04] rounded-full blur-3xl" />
      <div class="absolute -bottom-32 -right-32 w-64 h-64 bg-fuse-red/[0.03] rounded-full blur-3xl" />
    </div>

    
    <main class="max-w-4xl mx-auto px-5 py-8 relative z-10">
      
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-xl font-bold text-fuse-text">Projects</h1>
          <p class="text-fuse-dim text-xs mt-0.5">Manage and control your deployed applications</p>
        </div>
        <button
          @click="showCreate = true"
          :disabled="limitReached"
          class="btn-primary text-xs"
          :class="limitReached ? 'opacity-50 cursor-not-allowed' : ''"
        >
          + New project
        </button>
      </div>

      
      <div v-if="limitReached" class="upgrade-banner mb-5">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-fuse-red text-xs font-semibold mb-0.5">Project limit reached</p>
            <p class="text-fuse-red/60 text-[10px]">You're on the {{ planName || 'Free' }} plan ({{ projectLimit }} projects). Upgrade to create more.</p>
          </div>
          <NuxtLink to="/pricing" class="btn-upgrade flex-shrink-0">Upgrade →</NuxtLink>
        </div>
      </div>

      
      <div v-if="projects.length > 0 && !loading" class="stats-bar mb-5">
        <div class="stat-item" v-for="stat in projectStats" :key="stat.label">
          <span class="font-mono font-bold text-sm" :class="stat.color">{{ stat.count }}</span>
          <span class="text-[10px] text-fuse-muted font-mono">{{ stat.label }}</span>
        </div>
        <div class="ml-auto text-[10px] font-mono text-fuse-muted">
          {{ projects.length }}/{{ projectLimit }} projects
        </div>
      </div>

      
      <div v-if="!loading && projects.length === 0"
        class="text-center py-16 border border-dashed border-white/[0.07] rounded-xl"
        style="background: rgba(255,255,255,0.01); backdrop-filter: blur(8px);">
        <p class="text-3xl mb-3 opacity-40">🔌</p>
        <p class="text-fuse-dim text-xs mb-4 max-w-xs mx-auto">No projects yet. Create your first one to start controlling deployed apps.</p>
        <button @click="showCreate = true" class="btn-primary text-xs">Create first project</button>
      </div>

      
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div v-for="i in 4" :key="i" class="h-28 rounded-xl animate-pulse" style="background: rgba(255,255,255,0.03); border: 0.5px solid rgba(255,255,255,0.06);" />
      </div>

      
      <div v-else-if="projects.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ProjectCard
          v-for="project in projects"
          :key="project.id"
          :project="project"
          @click="navigateTo(`/projects/${project.id}`)"
        />
      </div>
    </main>

    
    <Teleport to="body">
      <div v-if="showCreate"
        class="fixed inset-0 flex items-center justify-center z-50 p-4"
        style="background: rgba(0,0,0,0.7); backdrop-filter: blur(12px);"
        @click.self="showCreate = false">
        <div class="glass-modal w-full max-w-sm animate-slide-up">
          <div class="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
            <div>
              <h2 class="text-sm font-bold text-fuse-text">New project</h2>
              <p class="text-fuse-muted text-[10px] mt-0.5">Control a new client app</p>
            </div>
            <button @click="showCreate = false" class="text-fuse-muted hover:text-fuse-dim text-sm">✕</button>
          </div>
          <div class="p-5 space-y-3">
            <div class="field-group">
              <label class="field-label">Project name</label>
              <input v-model="newProject.name" type="text" class="field-input" placeholder="e.g. Acme Corp Dashboard"
                @keydown.enter="createProject" />
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div class="field-group">
                <label class="field-label">Client name</label>
                <input v-model="newProject.clientName" type="text" class="field-input" placeholder="Acme Corp" />
              </div>
              <div class="field-group">
                <label class="field-label">Priority</label>
                <select v-model="newProject.priority" class="field-input">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div class="field-group">
                <label class="field-label">Budget</label>
                <input v-model="newProject.budget" type="text" class="field-input" placeholder="$50,000" />
              </div>
              <div class="field-group">
                <label class="field-label">Grace period (days)</label>
                <input v-model.number="newProject.gracePeriod" type="number" min="0" max="365" class="field-input" />
              </div>
            </div>
            <div class="field-group">
              <label class="field-label">Description</label>
              <textarea v-model="newProject.description" class="field-input min-h-[60px] resize-none" placeholder="Project notes..." />
            </div>
            <div v-if="createError" class="error-box">{{ createError }}</div>
            <div class="flex gap-2 pt-1">
              <button @click="showCreate = false" class="btn-ghost flex-1 text-xs">Cancel</button>
              <button @click="createProject" :disabled="createLoading" class="btn-primary flex-1 text-xs">
                {{ createLoading ? 'Creating…' : 'Create project' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <DashboardFooter />

    <PlanDowngradeModal
      :show="showDowngradeModal"
      :plan-limit="projectLimit"
      :projects="projects"
      @resolved="onDowngradeResolved"
    />
  </div>
</template>

<script setup lang="ts">
import PlanDowngradeModal from '~/components/PlanDowngradeModal.vue'

definePageMeta({ middleware: 'auth' })

const router = useRouter()
const projects = ref<any[]>([])
const loading = ref(true)
const showCreate = ref(false)
const createLoading = ref(false)
const createError = ref('')
const projectLimit = ref(2)
const planName = ref('Free')
const showDowngradeModal = ref(false)

const activeProjectsForElection = computed(() =>
  projects.value.filter(p => p.status !== 'suspended')
)

const newProject = reactive({
  name: '',
  gracePeriod: 3,
  clientName: '',
  targetCompletion: '',
  description: '',
  budget: '',
  priority: 'medium'
})

const limitReached = computed(() => activeProjectsForElection.value.length >= projectLimit.value)

const projectStats = computed(() => {
  const counts: Record<string, number> = {}
  for (const p of projects.value) counts[p.state] = (counts[p.state] || 0) + 1
  return [
    { label: 'Active', count: counts['ACTIVE'] || 0, color: 'text-fuse-green' },
    { label: 'Warning', count: counts['WARNING'] || 0, color: 'text-fuse-yellow' },
    { label: 'Restricted', count: (counts['READONLY'] || 0) + (counts['LIMITED'] || 0), color: 'text-fuse-blue' },
    { label: 'Locked', count: (counts['LOCKED'] || 0) + (counts['EXPIRED'] || 0), color: 'text-fuse-red' },
  ]
})

onMounted(async () => {
  try {
    const profile = await $fetch<{ projectLimit?: number; planName?: string }>('/api/auth/me')
    projectLimit.value = profile.projectLimit ?? 2
    planName.value = profile.planName ?? 'Free'
  } catch {
    router.push('/login')
    return
  }
  await loadProjects()
  await checkDowngradeStatus()
})

function downgradeElectionSeenKey(electionId: string) {
  return `downgrade-election-seen:${electionId}`
}

function hasSeenDowngradeElection(electionId: string | null) {
  return electionId ? localStorage.getItem(downgradeElectionSeenKey(electionId)) === 'true' : false
}

function markDowngradeElectionSeen(electionId: string | null) {
  if (!electionId) return
  localStorage.setItem(downgradeElectionSeenKey(electionId), 'true')
}

async function checkDowngradeStatus() {
  try {
    const status = await $fetch<{
      overLimit: boolean
      electionId?: string
      activeCount: number
      planLimit: number
      excess: number
    }>('/api/plan/downgrade-status')

    console.log('[DowngradeStatus] API response:', status)
    console.log('[DowngradeStatus] Total projects:', status.activeCount)
    console.log('[DowngradeStatus] Plan limit:', status.planLimit)
    console.log('[DowngradeStatus] Over limit:', status.overLimit)
    console.log('[DowngradeStatus] Election ID:', status.electionId)

    if (status.overLimit && status.electionId && !hasSeenDowngradeElection(status.electionId)) {
      showDowngradeModal.value = true
      markDowngradeElectionSeen(status.electionId)
    } else {
      showDowngradeModal.value = false
    }
  } catch (err: any) {
    console.error('[DowngradeStatus] Error:', err)
    showDowngradeModal.value = false
  }
}

async function onDowngradeResolved() {
  showDowngradeModal.value = false
  await loadProjects()
}

async function loadProjects() {
  loading.value = true
  try {
    projects.value = await $fetch<any[]>('/api/projects')
  } finally {
    loading.value = false
  }
}

async function createProject() {
  if (limitReached.value) { createError.value = 'Project limit reached.'; return }
  if (!newProject.name.trim()) { createError.value = 'Project name is required'; return }
  createError.value = ''
  createLoading.value = true
  try {
    const project = await $fetch('/api/projects', {
      method: 'POST',
      body: {
        name: newProject.name,
        gracePeriod: newProject.gracePeriod,
        clientName: newProject.clientName,
        targetCompletion: newProject.targetCompletion,
        description: newProject.description,
        budget: newProject.budget,
        priority: newProject.priority
      },
    })
    projects.value.unshift(project)
    showCreate.value = false
    Object.assign(newProject, { name: '', gracePeriod: 3, clientName: '', targetCompletion: '', description: '', budget: '', priority: 'medium' })
  } catch (err: any) {
    createError.value = err?.data?.statusMessage || 'Failed to create project'
  } finally {
    createLoading.value = false
  }
}

</script>

<style scoped>
.upgrade-banner {
  @apply rounded-xl border border-fuse-red/15 px-4 py-3;
  background: rgba(255, 51, 51, 0.04);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.btn-upgrade {
  @apply bg-fuse-red hover:bg-red-500 text-white font-bold text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 rounded-lg transition-colors;
}

.stats-bar {
  @apply flex items-center gap-1 rounded-xl px-4 py-2.5 border border-white/[0.06];
  background: rgba(255,255,255,0.02);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.stat-item {
  @apply flex items-center gap-1.5 px-3 py-1 border-r border-white/[0.05] last:border-0 flex-shrink-0;
}

.glass-modal {
  @apply rounded-2xl border border-white/[0.1];
  background: rgba(17,17,17,0.9);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow: 0 24px 64px rgba(0,0,0,0.5);
}

.field-group { @apply flex flex-col gap-1; }
.field-label { @apply text-[9px] font-mono text-fuse-muted uppercase tracking-widest; }
.field-input {
  @apply w-full rounded-lg px-2.5 py-2 text-fuse-text text-xs outline-none transition-all duration-150 placeholder:text-fuse-muted border;
  background: rgba(0,0,0,0.3);
  border-color: rgba(255,255,255,0.08);
}
.field-input:focus {
  border-color: rgba(255,51,51,0.4);
  box-shadow: 0 0 0 3px rgba(255,51,51,0.06);
}

.btn-primary {
  @apply bg-fuse-red hover:bg-red-500 text-white font-bold px-4 py-2 rounded-lg transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed;
}
.btn-ghost {
  @apply border border-white/[0.1] hover:border-white/[0.18] text-fuse-dim hover:text-fuse-text px-4 py-2 rounded-lg transition-all duration-150;
}
.error-box {
  @apply text-fuse-red text-xs rounded-lg px-3 py-2 border border-fuse-red/20;
  background: rgba(255,51,51,0.06);
}
</style>