<template>
  <div class="min-h-screen bg-fuse-black">
    <!-- Nav -->
    <nav class="border-b border-fuse-border px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-7 h-7 bg-fuse-red rounded-sm flex items-center justify-center">
          <span class="text-white font-mono text-xs font-bold">DF</span>
        </div>
        <span class="font-bold text-fuse-text">DeadFuse</span>
      </div>
      <div class="flex items-center gap-4">
        <span class="text-fuse-dim text-sm font-mono">{{ userEmail }}</span>
        <button @click="logout" class="text-fuse-dim hover:text-fuse-red text-sm transition-colors">Logout</button>
      </div>
    </nav>

    <main class="max-w-5xl mx-auto px-6 py-10">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-fuse-text">Projects</h1>
          <p class="text-fuse-dim text-sm mt-1">Manage and control your deployed applications</p>
        </div>
        <button @click="showCreate = true" class="btn-primary">+ New Project</button>
      </div>

      <!-- Empty state -->
      <div v-if="!loading && projects.length === 0" class="text-center py-20 border border-dashed border-fuse-border rounded-xl">
        <div class="text-4xl mb-4">🔌</div>
        <p class="text-fuse-dim text-sm mb-4">No projects yet. Create your first one to get started.</p>
        <button @click="showCreate = true" class="btn-primary">Create Project</button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="i in 4" :key="i" class="h-36 bg-fuse-zinc border border-fuse-border rounded-xl animate-pulse" />
      </div>

      <!-- Project grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      <div v-if="showCreate" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="showCreate = false">
        <div class="bg-fuse-carbon border border-fuse-border rounded-xl p-6 w-full max-w-md animate-slide-up">
          <h2 class="text-lg font-bold text-fuse-text mb-5">New Project</h2>
          <div class="space-y-4">
            <div class="field-group">
              <label class="field-label">Project Name</label>
              <input v-model="newProject.name" type="text" class="field-input" placeholder="e.g. Acme Corp Dashboard" />
            </div>
            <div class="field-group">
              <label class="field-label">Grace Period (days)</label>
              <input v-model.number="newProject.gracePeriod" type="number" min="0" max="365" class="field-input" />
            </div>
            <div v-if="createError" class="error-box">{{ createError }}</div>
            <div class="flex gap-3 pt-2">
              <button @click="showCreate = false" class="btn-ghost flex-1">Cancel</button>
              <button @click="createProject" :disabled="createLoading" class="btn-primary flex-1">
                {{ createLoading ? 'Creating…' : 'Create Project' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
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
.field-group { @apply flex flex-col gap-1.5; }
.field-label { @apply text-xs font-mono text-fuse-dim uppercase tracking-widest; }
.field-input {
  @apply w-full bg-fuse-zinc border border-fuse-border rounded-md px-3 py-2.5 text-fuse-text text-sm outline-none
  focus:border-fuse-red/60 focus:ring-1 focus:ring-fuse-red/20 transition-all duration-200 placeholder:text-fuse-muted;
}
.btn-primary {
  @apply bg-fuse-red hover:bg-red-500 text-white font-bold text-sm px-4 py-2.5 rounded-md transition-all duration-200
  disabled:opacity-40 disabled:cursor-not-allowed;
}
.btn-ghost {
  @apply border border-fuse-border hover:border-fuse-muted text-fuse-dim hover:text-fuse-text text-sm px-4
  py-2.5 rounded-md transition-all duration-200;
}
.error-box {
  @apply bg-fuse-red/10 border border-fuse-red/30 text-fuse-red text-sm rounded-md px-3 py-2;
}
</style>
