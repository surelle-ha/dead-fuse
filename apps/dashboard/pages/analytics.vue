<template>
  <div class="min-h-screen bg-fuse-black">

    <main class="max-w-5xl mx-auto px-6 py-6 animate-slide-up">

      
      <div class="flex items-center justify-between mb-6">
        <p class="text-[10px] font-mono text-fuse-muted">
          Derived from <span class="text-fuse-dim">{{ projects.length }}</span> project{{ projects.length !== 1 ? 's' : '' }}
        </p>
        <div class="text-[10px] font-mono text-fuse-muted border border-white/[0.06] rounded-lg px-2 py-1 glass">
          Live
        </div>
      </div>

      
      <div v-if="loading" class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div v-for="i in 4" :key="i" class="h-20 rounded-xl animate-pulse bg-white/[0.03] border border-white/[0.05]" />
      </div>

      <template v-else>
        
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div class="kpi-card">
            <span class="kpi-label">Total projects</span>
            <span class="kpi-value text-fuse-text">{{ projects.length }}</span>
            <span class="kpi-sub">/ {{ projectLimit }} limit</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Active</span>
            <span class="kpi-value text-fuse-green">{{ stateCount('ACTIVE') }}</span>
            <span class="kpi-sub">{{ pct(stateCount('ACTIVE')) }} of total</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Restricted</span>
            <span class="kpi-value text-fuse-orange">{{ restrictedCount }}</span>
            <span class="kpi-sub">readonly + limited</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Locked / expired</span>
            <span class="kpi-value text-fuse-red">{{ lockedCount }}</span>
            <span class="kpi-sub">need attention</span>
          </div>
        </div>

        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

          
          <div class="glass-panel">
            <h2 class="panel-label mb-4">State distribution</h2>
            <div v-if="projects.length === 0" class="empty-hint">No projects yet</div>
            <div v-else class="space-y-2.5">
              <div v-for="s in stateDistribution" :key="s.state" class="flex items-center gap-3">
                <div class="w-16 text-[9px] font-mono uppercase tracking-widest flex-shrink-0" :class="s.color">{{ s.state }}</div>
                <div class="flex-1 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-700"
                    :class="s.barColor"
                    :style="{ width: s.pct + '%' }"
                  />
                </div>
                <div class="text-xs font-mono text-fuse-dim w-6 text-right flex-shrink-0">{{ s.count }}</div>
              </div>
            </div>
          </div>

          
          <div class="glass-panel">
            <h2 class="panel-label mb-4">Priority breakdown</h2>
            <div v-if="projects.length === 0" class="empty-hint">No projects yet</div>
            <div v-else class="grid grid-cols-2 gap-2">
              <div
                v-for="p in priorityBreakdown"
                :key="p.label"
                class="priority-cell"
                :class="p.accent"
              >
                <span class="text-xl font-bold font-mono" :class="p.color">{{ p.count }}</span>
                <span class="text-[10px] font-mono uppercase tracking-widest mt-0.5" :class="p.color" style="opacity: 0.7;">{{ p.label }}</span>
                <span class="text-[9px] text-fuse-muted mt-1">{{ pct(p.count) }}</span>
              </div>
            </div>
          </div>
        </div>

        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

          
          <div class="glass-panel">
            <h2 class="panel-label mb-4">Grace period overview</h2>
            <div v-if="projects.length === 0" class="empty-hint">No projects yet</div>
            <div v-else class="space-y-1.5">
              <div v-for="p in projectsByGrace" :key="p.id" class="grace-row">
                <span class="text-xs text-fuse-dim truncate flex-1">{{ p.name }}</span>
                <div class="flex items-center gap-2 flex-shrink-0">
                  <div class="w-20 h-1 rounded-full bg-white/[0.05] overflow-hidden">
                    <div
                      class="h-full rounded-full"
                      :class="graceBarColor(p.grace_period)"
                      :style="{ width: Math.min((p.grace_period / maxGrace) * 100, 100) + '%' }"
                    />
                  </div>
                  <span class="text-[10px] font-mono text-fuse-muted w-8 text-right">{{ p.grace_period }}d</span>
                </div>
              </div>
              <div class="pt-2 border-t border-white/[0.05] flex items-center justify-between text-[10px] font-mono text-fuse-muted">
                <span>avg grace period</span>
                <span class="text-fuse-dim">{{ avgGrace }}d</span>
              </div>
            </div>
          </div>

          
          <div class="glass-panel">
            <h2 class="panel-label mb-4">Created timeline</h2>
            <div v-if="projects.length === 0" class="empty-hint">No projects yet</div>
            <div v-else class="space-y-1.5">
              <div v-for="p in projectsByDate" :key="p.id" class="grace-row">
                <div class="flex items-center gap-2 flex-1 min-w-0">
                  <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" :class="stateColor(p.state)" />
                  <span class="text-xs text-fuse-dim truncate">{{ p.name }}</span>
                </div>
                <span class="text-[10px] font-mono text-fuse-muted flex-shrink-0">{{ formatRelative(p.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>

        
        <div class="glass-panel">
          <div class="flex items-center justify-between mb-4">
            <h2 class="panel-label">All projects</h2>
            <div class="flex items-center gap-2">
              <select v-model="filterState" class="mini-select">
                <option value="">All states</option>
                <option v-for="s in allStates" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
          </div>
          <div v-if="filteredProjects.length === 0" class="empty-hint">No projects match</div>
          <div v-else class="overflow-x-auto">
            <table class="w-full text-xs">
              <thead>
                <tr class="border-b border-white/[0.05]">
                  <th class="th">Name</th>
                  <th class="th">State</th>
                  <th class="th hidden sm:table-cell">Priority</th>
                  <th class="th hidden md:table-cell">Client</th>
                  <th class="th hidden lg:table-cell">Grace</th>
                  <th class="th text-right">Updated</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="p in filteredProjects"
                  :key="p.id"
                  class="table-row-item cursor-pointer"
                  @click="navigateTo(`/projects/${p.id}`)"
                >
                  <td class="td font-medium text-fuse-text">{{ p.name }}</td>
                  <td class="td">
                    <StatusBadge :state="p.state" size="sm" />
                  </td>
                  <td class="td hidden sm:table-cell capitalize text-fuse-dim">{{ p.priority || '—' }}</td>
                  <td class="td hidden md:table-cell text-fuse-dim">{{ p.client_name || '—' }}</td>
                  <td class="td hidden lg:table-cell font-mono text-fuse-muted">{{ p.grace_period }}d</td>
                  <td class="td text-right font-mono text-fuse-muted">{{ formatRelative(p.updated_at) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">

          
          <div class="glass-panel">
            <h2 class="panel-label mb-4">Upcoming deadlines</h2>
            <div v-if="upcomingDeadlines.length === 0" class="empty-hint">No deadlines set</div>
            <div v-else class="space-y-2">
              <div v-for="p in upcomingDeadlines" :key="p.id" class="grace-row">
                <div class="flex-1 min-w-0">
                  <p class="text-xs text-fuse-dim truncate">{{ p.name }}</p>
                  <p v-if="p.client_name" class="text-[9px] text-fuse-muted font-mono">{{ p.client_name }}</p>
                </div>
                <div class="flex-shrink-0 text-right">
                  <p class="text-[10px] font-mono" :class="deadlineColor(p.target_completion)">{{ formatDate(p.target_completion) }}</p>
                  <p class="text-[9px] text-fuse-muted">{{ daysUntil(p.target_completion) }}</p>
                </div>
              </div>
            </div>
          </div>

          
          <div class="glass-panel">
            <h2 class="panel-label mb-4">Health summary</h2>
            <div class="space-y-3">
              <div class="health-row">
                <span class="text-xs text-fuse-dim">All projects active</span>
                <span class="text-xs font-mono" :class="allActive ? 'text-fuse-green' : 'text-fuse-red'">
                  {{ allActive ? 'Yes ✓' : 'No ✗' }}
                </span>
              </div>
              <div class="health-row">
                <span class="text-xs text-fuse-dim">Projects needing attention</span>
                <span class="text-xs font-mono" :class="lockedCount > 0 ? 'text-fuse-red' : 'text-fuse-green'">
                  {{ lockedCount }}
                </span>
              </div>
              <div class="health-row">
                <span class="text-xs text-fuse-dim">Projects with messages set</span>
                <span class="text-xs font-mono text-fuse-dim">{{ withMessages }}</span>
              </div>
              <div class="health-row">
                <span class="text-xs text-fuse-dim">Avg grace period</span>
                <span class="text-xs font-mono text-fuse-dim">{{ avgGrace }} days</span>
              </div>
              <div class="health-row">
                <span class="text-xs text-fuse-dim">Oldest project</span>
                <span class="text-xs font-mono text-fuse-dim">{{ oldestProject }}</span>
              </div>
              <div class="health-row">
                <span class="text-xs text-fuse-dim">Slot utilisation</span>
                <div class="flex items-center gap-2">
                  <div class="w-16 h-1 rounded-full bg-white/[0.05] overflow-hidden">
                    <div class="h-full rounded-full bg-fuse-red transition-all duration-700"
                      :style="{ width: (projects.length / projectLimit * 100) + '%' }" />
                  </div>
                  <span class="text-[10px] font-mono text-fuse-dim">{{ projects.length }}/{{ projectLimit }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const projects = ref<any[]>([])
const loading = ref(true)
const filterState = ref('')
const projectLimit = 2

const allStates = ['ACTIVE','WARNING','READONLY','LIMITED','LOCKED','EXPIRED','SLEEP','SELF_DESTRUCT']

onMounted(async () => {
  try {
    projects.value = await $fetch<any[]>('/api/projects')
  } finally {
    loading.value = false
  }
})

// --- Computed ---
function stateCount(s: string) { return projects.value.filter(p => p.state === s).length }
const restrictedCount = computed(() => stateCount('READONLY') + stateCount('LIMITED'))
const lockedCount = computed(() => stateCount('LOCKED') + stateCount('EXPIRED'))
const allActive = computed(() => projects.value.length > 0 && projects.value.every(p => p.state === 'ACTIVE'))
const withMessages = computed(() => projects.value.filter(p => p.message?.trim()).length)

function pct(n: number) {
  if (projects.value.length === 0) return '0%'
  return Math.round((n / projects.value.length) * 100) + '%'
}

const stateDistribution = computed(() => {
  const colorMap: Record<string, { color: string; barColor: string }> = {
    ACTIVE:       { color: 'text-fuse-green',  barColor: 'bg-fuse-green' },
    WARNING:      { color: 'text-fuse-yellow', barColor: 'bg-fuse-yellow' },
    READONLY:     { color: 'text-fuse-blue',   barColor: 'bg-fuse-blue' },
    LIMITED:      { color: 'text-fuse-orange', barColor: 'bg-fuse-orange' },
    LOCKED:       { color: 'text-fuse-red',    barColor: 'bg-fuse-red' },
    EXPIRED:      { color: 'text-fuse-red',    barColor: 'bg-fuse-red' },
    SLEEP:        { color: 'text-fuse-dim',    barColor: 'bg-fuse-muted' },
    SELF_DESTRUCT:{ color: 'text-fuse-purple', barColor: 'bg-fuse-purple' },
  }
  const total = projects.value.length || 1
  return allStates
    .map(s => ({
      state: s,
      count: stateCount(s),
      pct: Math.round((stateCount(s) / total) * 100),
      ...colorMap[s],
    }))
    .filter(s => s.count > 0)
})

const priorityBreakdown = computed(() => {
  const defs = [
    { label: 'Urgent', key: 'urgent', color: 'text-fuse-red',    accent: 'border-fuse-red/15 bg-fuse-red/[0.04]' },
    { label: 'High',   key: 'high',   color: 'text-fuse-orange', accent: 'border-fuse-orange/15 bg-fuse-orange/[0.04]' },
    { label: 'Medium', key: 'medium', color: 'text-fuse-yellow', accent: 'border-fuse-yellow/15 bg-fuse-yellow/[0.04]' },
    { label: 'Low',    key: 'low',    color: 'text-fuse-dim',    accent: 'border-white/[0.07] bg-white/[0.02]' },
  ]
  return defs.map(d => ({
    ...d,
    count: projects.value.filter(p => (p.priority || 'medium') === d.key).length,
  }))
})

const maxGrace = computed(() => Math.max(...projects.value.map(p => p.grace_period || 0), 1))
const avgGrace = computed(() => {
  if (!projects.value.length) return 0
  return Math.round(projects.value.reduce((a, p) => a + (p.grace_period || 0), 0) / projects.value.length)
})
const projectsByGrace = computed(() => [...projects.value].sort((a, b) => b.grace_period - a.grace_period))
const projectsByDate  = computed(() => [...projects.value].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))

const upcomingDeadlines = computed(() =>
  projects.value
    .filter(p => p.target_completion)
    .sort((a, b) => new Date(a.target_completion).getTime() - new Date(b.target_completion).getTime())
    .slice(0, 5)
)

const oldestProject = computed(() => {
  if (!projects.value.length) return '—'
  const oldest = projectsByDate.value[projectsByDate.value.length - 1]
  return formatRelative(oldest.created_at)
})

const filteredProjects = computed(() =>
  filterState.value
    ? projects.value.filter(p => p.state === filterState.value)
    : projects.value
)

// --- Helpers ---
function stateColor(state: string) {
  const m: Record<string,string> = {
    ACTIVE:'bg-fuse-green', WARNING:'bg-fuse-yellow', READONLY:'bg-fuse-blue',
    LIMITED:'bg-fuse-orange', LOCKED:'bg-fuse-red', EXPIRED:'bg-fuse-red',
    SLEEP:'bg-fuse-muted', SELF_DESTRUCT:'bg-fuse-purple',
  }
  return m[state] ?? 'bg-fuse-muted'
}

function graceBarColor(days: number) {
  if (days <= 1) return 'bg-fuse-red'
  if (days <= 3) return 'bg-fuse-orange'
  if (days <= 7) return 'bg-fuse-yellow'
  return 'bg-fuse-green'
}

function deadlineColor(date: string) {
  const d = daysUntilNum(date)
  if (d < 0) return 'text-fuse-red'
  if (d <= 7) return 'text-fuse-orange'
  if (d <= 30) return 'text-fuse-yellow'
  return 'text-fuse-dim'
}

function daysUntilNum(date: string) {
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000)
}

function daysUntil(date: string) {
  const d = daysUntilNum(date)
  if (d < 0) return `${Math.abs(d)}d overdue`
  if (d === 0) return 'today'
  return `in ${d}d`
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatRelative(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return formatDate(d)
}
</script>

<style scoped>
.glass { backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }

.glass-panel {
  @apply rounded-xl border border-white/[0.07] p-5;
  background: rgba(255,255,255,0.025);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.panel-label {
  @apply text-[10px] font-mono uppercase tracking-widest text-fuse-muted;
}

.kpi-card {
  @apply rounded-xl border border-white/[0.06] p-4 flex flex-col gap-0.5;
  background: rgba(255,255,255,0.02);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.kpi-label { @apply text-[9px] font-mono uppercase tracking-widest text-fuse-muted; }
.kpi-value { @apply text-2xl font-bold font-mono; }
.kpi-sub   { @apply text-[9px] font-mono text-fuse-muted; }

.priority-cell {
  @apply rounded-lg border p-3 flex flex-col;
}

.grace-row {
  @apply flex items-center justify-between gap-3 py-1.5 border-b border-white/[0.04] last:border-0;
}

.health-row {
  @apply flex items-center justify-between gap-3 py-1.5 border-b border-white/[0.04] last:border-0;
}

.th {
  @apply text-[9px] font-mono uppercase tracking-widest text-fuse-muted text-left pb-2.5 pr-4 font-normal;
}
.td { @apply py-2.5 pr-4 text-fuse-dim align-middle; }

.table-row-item {
  @apply border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors duration-100;
}

.mini-select {
  @apply text-[10px] font-mono text-fuse-dim rounded-lg border border-white/[0.08] px-2 py-1 outline-none;
  background: rgba(255,255,255,0.03);
  backdrop-filter: blur(8px);
}

.empty-hint {
  @apply text-[10px] font-mono text-fuse-muted text-center py-6;
}
</style>