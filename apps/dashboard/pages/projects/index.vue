<template>
  <div class="min-h-screen bg-fuse-black relative overflow-hidden">
    <!-- Ambient glows -->
    <div class="ambient-glow ambient-glow--tl" />
    <div class="ambient-glow ambient-glow--br" />

    <!-- Nav -->
    <nav class="border-b border-fuse-border/50 px-6 py-4 flex items-center justify-between backdrop-blur-md bg-fuse-black/70 sticky top-0 z-10">
      <div class="flex items-center gap-3">
        <div class="w-7 h-7 bg-fuse-red rounded-sm flex items-center justify-center shadow-lg shadow-fuse-red/30">
          <span class="text-white font-mono text-xs font-bold">DF</span>
        </div>
        <span class="font-bold text-fuse-text">DeadFuse</span>
        <span class="hidden sm:inline text-fuse-border text-xs font-mono ml-1">License Control</span>
      </div>
      <div class="flex items-center gap-4">
        <NuxtLink to="/docs" class="text-fuse-dim hover:text-fuse-text text-sm transition-colors font-mono hidden sm:inline">
          Docs
        </NuxtLink>
        <span class="text-fuse-dim text-sm font-mono hidden sm:inline">{{ userEmail }}</span>
        <button @click="logout" class="text-fuse-dim hover:text-fuse-red text-sm transition-colors">Logout</button>
      </div>
    </nav>

    <main class="max-w-5xl mx-auto px-6 py-10 relative z-10">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-fuse-text">Projects</h1>
          <p class="text-fuse-dim text-sm mt-1">Manage and control your deployed applications</p>
        </div>
        <button @click="showCreate = true" class="btn-primary">+ New Project</button>
      </div>

      <!-- Stats bar -->
      <div v-if="projects.length > 0 && !loading" class="stats-bar mb-8">
        <div class="stat-item" v-for="stat in projectStats" :key="stat.label">
          <span class="stat-count" :class="stat.color">{{ stat.count }}</span>
          <span class="stat-label">{{ stat.label }}</span>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="!loading && projects.length === 0"
        class="text-center py-20 border border-dashed border-fuse-border/50 rounded-2xl bg-white/[0.015] backdrop-blur-sm">
        <div class="text-5xl mb-4 opacity-60">🔌</div>
        <p class="text-fuse-dim text-sm mb-6 max-w-xs mx-auto">No projects yet. Create your first one to start controlling your deployed apps.</p>
        <button @click="showCreate = true" class="btn-primary">Create First Project</button>
      </div>

      <!-- Loading skeleton -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="i in 4" :key="i" class="h-36 bg-white/[0.03] border border-white/[0.06] rounded-xl animate-pulse" />
      </div>

      <!-- Project grid -->
      <div v-else-if="projects.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProjectCard
          v-for="project in projects"
          :key="project.id"
          :project="project"
          @click="navigateTo(`/projects/${project.id}`)"
        />
      </div>
    </main>

    <!-- Create project modal -->
    <Teleport to="body">
      <div v-if="showCreate"
        class="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
        @click.self="showCreate = false">
        <div class="glass-modal w-full max-w-md animate-slide-up">
          <div class="p-6 border-b border-white/[0.07]">
            <h2 class="text-lg font-bold text-fuse-text">New Project</h2>
            <p class="text-fuse-dim text-xs mt-1">Create a new project to control a client app.</p>
          </div>
          <div class="p-6 space-y-4">
            <div class="field-group">
              <label class="field-label">Project Name</label>
              <input v-model="newProject.name" type="text" class="field-input" placeholder="e.g. Acme Corp Dashboard"
                @keydown.enter="createProject" />
            </div>
            <div class="field-group">
              <label class="field-label">Grace Period (days)</label>
              <input v-model.number="newProject.gracePeriod" type="number" min="0" max="365" class="field-input" />
              <p class="text-fuse-dim text-xs mt-1">Days before restrictions enforce after a state change.</p>
            </div>
            <div v-if="createError" class="error-box">{{ createError }}</div>
            <div class="flex gap-3 pt-1">
              <button @click="showCreate = false" class="btn-ghost flex-1">Cancel</button>
              <button @click="createProject" :disabled="createLoading" class="btn-primary flex-1">
                {{ createLoading ? 'Creating…' : 'Create Project' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Footer -->
    <DashboardFooter />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const router = useRouter()
const projects = ref<any[]>([])
const loading = ref(true)
const showCreate = ref(false)
const createLoading = ref(false)
const createError = ref('')
const userEmail = ref('')

const newProject = reactive({ name: '', gracePeriod: 3 })

const projectStats = computed(() => {
  const counts: Record<string, number> = {}
  for (const p of projects.value) {
    counts[p.state] = (counts[p.state] || 0) + 1
  }
  return [
    { label: 'Active', count: counts['ACTIVE'] || 0, color: 'text-fuse-green' },
    { label: 'Warning', count: counts['WARNING'] || 0, color: 'text-fuse-yellow' },
    { label: 'Restricted', count: (counts['READONLY'] || 0) + (counts['LIMITED'] || 0), color: 'text-fuse-blue' },
    { label: 'Locked', count: (counts['LOCKED'] || 0) + (counts['EXPIRED'] || 0), color: 'text-fuse-red' },
  ]
})

onMounted(async () => {
  try {
    const me = await $fetch<{ email: string }>('/api/auth/me')
    userEmail.value = me.email
  } catch {
    router.push('/login')
    return
  }
  await loadProjects()
})

async function loadProjects() {
  loading.value = true
  try {
    projects.value = await $fetch<any[]>('/api/projects')
  } finally {
    loading.value = false
  }
}

async function createProject() {
  if (!newProject.name.trim()) {
    createError.value = 'Project name is required'
    return
  }
  createError.value = ''
  createLoading.value = true
  try {
    const project = await $fetch('/api/projects', {
      method: 'POST',
      body: { name: newProject.name, gracePeriod: newProject.gracePeriod },
    })
    projects.value.unshift(project)
    showCreate.value = false
    newProject.name = ''
    newProject.gracePeriod = 3
  } catch (err: any) {
    createError.value = err?.data?.statusMessage || 'Failed to create project'
  } finally {
    createLoading.value = false
  }
}

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  router.push('/login')
}
</script>

<style scoped>
/* Ambient glows */
.ambient-glow {
  @apply absolute w-96 h-96 rounded-full blur-3xl pointer-events-none;
}
.ambient-glow--tl {
  @apply -top-32 -left-32 bg-fuse-red/[0.04];
}
.ambient-glow--br {
  @apply -bottom-32 -right-32 bg-fuse-red/[0.03];
}

/* Stats bar */
.stats-bar {
  @apply flex items-center gap-1 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06]
  rounded-xl px-4 py-3 overflow-x-auto;
}
.stat-item {
  @apply flex items-center gap-2 px-4 py-1 border-r border-white/[0.06] last:border-0 flex-shrink-0;
}
.stat-count {
  @apply text-xl font-bold font-mono;
}
.stat-label {
  @apply text-xs text-fuse-dim font-mono;
}

/* Glass modal */
.glass-modal {
  @apply bg-fuse-carbon/80 backdrop-blur-xl border border-white/[0.1] rounded-2xl
  shadow-2xl shadow-black/50;
}

/* Fields */
.field-group { @apply flex flex-col gap-1.5; }
.field-label { @apply text-xs font-mono text-fuse-dim uppercase tracking-widest; }
.field-input {
  @apply w-full bg-black/30 backdrop-blur-sm border border-white/[0.1] rounded-md px-3 py-2.5
  text-fuse-text text-sm outline-none focus:border-fuse-red/60 focus:ring-1 focus:ring-fuse-red/20
  transition-all duration-200 placeholder:text-fuse-muted;
}
.btn-primary {
  @apply bg-fuse-red hover:bg-red-500 text-white font-bold text-sm px-4 py-2.5 rounded-md
  transition-all duration-200 shadow-lg shadow-fuse-red/20 disabled:opacity-40 disabled:cursor-not-allowed;
}
.btn-ghost {
  @apply border border-white/[0.1] hover:border-white/[0.2] text-fuse-dim hover:text-fuse-text
  text-sm px-4 py-2.5 rounded-md transition-all duration-200;
}
.error-box {
  @apply bg-fuse-red/10 border border-fuse-red/30 text-fuse-red text-sm rounded-md px-3 py-2;
}
</style>