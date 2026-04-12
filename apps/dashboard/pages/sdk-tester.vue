<template>
    <div class="min-h-screen bg-fuse-black">
        <main class="max-w-3xl mx-auto px-6 py-8 animate-slide-up">

            
            <div class="mb-6">
                <p class="text-fuse-dim text-xs mt-0.5">Simulate a connected SDK client in this browser tab and watch
                    state changes in real time.</p>
            </div>

            
            <div class="panel mb-5">
                <h2 class="panel-title">Connection config</h2>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                    <div class="field-group sm:col-span-1">
                        <label class="field-label">Project ID</label>
                        <input v-model="config.projectId" type="text" class="field-input text-xs font-mono"
                            placeholder="your-project-key" :disabled="tester.activated" />
                    </div>
                    <div class="field-group sm:col-span-1">
                        <label class="field-label">Token</label>
                        <input v-model="config.token" type="text" class="field-input text-xs font-mono"
                            placeholder="public-token" :disabled="tester.activated" />
                    </div>
                    <div class="field-group sm:col-span-1">
                        <label class="field-label">Fallback mode</label>
                        <select v-model="config.fallback" class="field-input text-xs" :disabled="tester.activated">
                            <option v-for="s in states" :key="s" :value="s.toLowerCase()">{{ s }}</option>
                        </select>
                    </div>
                </div>

                <div v-if="config.sourceName"
                    class="mb-3 flex items-center gap-2 text-[10px] font-mono text-fuse-dim border border-fuse-blue/20 bg-fuse-blue/[0.04] rounded-lg px-3 py-2">
                    <span class="text-fuse-blue">→</span>
                    Pre-filled from <strong class="text-fuse-text">{{ config.sourceName }}</strong>
                </div>

                <div class="flex gap-2">
                    <button @click="activate" :disabled="tester.activated || !config.projectId || !config.token"
                        class="btn-activate flex-1">
                        <span class="w-2 h-2 rounded-full"
                            :class="tester.activated ? 'bg-fuse-green animate-pulse' : 'bg-white/30'" />
                        {{ tester.activated ? 'SDK Active' : 'Activate SDK' }}
                    </button>
                    <button @click="deactivate" :disabled="!tester.activated" class="btn-ghost text-xs px-4">
                        Deactivate
                    </button>
                </div>
            </div>

            
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                <div class="stat-card">
                    <span class="stat-label">SDK state</span>
                    <span class="text-sm font-bold font-mono mt-0.5" :class="testerStateColor">{{ tester.state ?? '—'
                        }}</span>
                </div>
                <div class="stat-card">
                    <span class="stat-label">Last message</span>
                    <span class="text-xs text-fuse-dim mt-0.5 truncate">{{ tester.lastMessage || '—' }}</span>
                </div>
                <div class="stat-card">
                    <span class="stat-label">Events received</span>
                    <span class="text-sm font-bold font-mono text-fuse-text mt-0.5">{{ tester.logs.length }}</span>
                </div>
            </div>

            
            <div class="panel">
                <div class="flex items-center justify-between mb-3">
                    <h2 class="panel-title mb-0">Event log</h2>
                    <button @click="tester.logs = []"
                        class="text-[10px] font-mono text-fuse-muted hover:text-fuse-dim transition-colors">Clear</button>
                </div>
                <div class="log-box" ref="logBox">
                    <div v-if="tester.logs.length === 0" class="text-center text-fuse-muted text-xs font-mono py-6">
                        No events yet — activate the SDK to start.
                    </div>
                    <div v-for="(entry, i) in tester.logs" :key="i" class="log-row">
                        <span class="text-fuse-muted font-mono text-[10px] flex-shrink-0 w-16">{{ entry.time }}</span>
                        <span class="font-mono text-[10px] font-bold w-24 flex-shrink-0 uppercase"
                            :class="logTypeColor(entry.type)">{{ entry.type }}</span>
                        <span class="text-[10px] text-fuse-dim truncate">{{ entry.msg }}</span>
                    </div>
                </div>
            </div>

            
            <div class="panel mt-5">
                <h2 class="panel-title">State reference</h2>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div v-for="s in stateInfo" :key="s.name"
                        class="rounded-lg border border-white/[0.06] px-3 py-2.5 bg-white/[0.02]">
                        <div class="flex items-center gap-1.5 mb-1">
                            <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" :class="s.dot" />
                            <code class="text-[10px] font-mono font-bold" :class="s.color">{{ s.name }}</code>
                        </div>
                        <p class="text-[9px] text-fuse-muted leading-relaxed">{{ s.desc }}</p>
                    </div>
                </div>
            </div>

        </main>
    </div>
</template>

<script setup lang="ts">
import DeadFuse from '@surelle-ha/dead-fuse'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const logBox = ref<HTMLElement | null>(null)

// Config — pre-fill from query params when arriving from project page
const config = reactive({
    projectId: (route.query.projectId as string) || '',
    token: (route.query.token as string) || '',
    fallback: 'readonly',
    sourceName: (route.query.name as string) || '',
})

const states = ['ACTIVE', 'WARNING', 'READONLY', 'LIMITED', 'LOCKED', 'EXPIRED', 'SLEEP', 'SELF_DESTRUCT']

const tester = reactive<{
    activated: boolean
    state: string | null
    lastMessage: string
    logs: { time: string; type: string; msg: string }[]
}>({
    activated: false,
    state: null,
    lastMessage: '',
    logs: [],
})

function log(type: string, msg: string) {
    const now = new Date()
    const time = now.toLocaleTimeString('en-GB', { hour12: false })
    tester.logs.push({ time, type, msg })
    nextTick(() => {
        if (logBox.value) logBox.value.scrollTop = logBox.value.scrollHeight
    })
}

function activate() {
    if (!config.projectId || !config.token) return
    try {
        DeadFuse.activate({
            projectId: config.projectId,
            token: config.token,
            fallbackMode: config.fallback as any,
            onActive: () => { tester.state = 'ACTIVE'; log('active', 'Full access granted.') },
            onWarning: (m) => { tester.state = 'WARNING'; tester.lastMessage = m; log('warning', `Warning: ${m}`) },
            onReadonly: () => { tester.state = 'READONLY'; log('readonly', 'Write operations are now blocked.') },
            onLimited: () => { tester.state = 'LIMITED'; log('limited', 'Limited mode active.') },
            onLocked: (m) => { tester.state = 'LOCKED'; tester.lastMessage = m; log('locked', `Locked: ${m}`) },
            onExpired: () => { tester.state = 'EXPIRED'; log('expired', 'Contract expired.') },
            onSleep: () => { tester.state = 'SLEEP'; log('sleep', 'Application paused.') },
            onSelfDestruct: () => { tester.state = 'SELF_DESTRUCT'; log('destruct', 'Self-destruct triggered.') },
            onDisconnect: () => { log('disconnect', 'Lost connection — applying fallback.') },
            onReconnect: () => { log('reconnect', 'Reconnected to Realtime channel.') },
        })
        tester.activated = true
        log('info', `SDK activated for project "${config.projectId}".`)
    } catch (err: any) {
        log('error', err?.message ?? 'Activation failed.')
    }
}

function deactivate() {
    DeadFuse.deactivate()
    tester.activated = false
    tester.state = null
    tester.lastMessage = ''
    log('info', 'SDK deactivated.')
}

onUnmounted(() => {
    if (tester.activated) DeadFuse.deactivate()
})

const testerStateColor = computed(() => {
    const m: Record<string, string> = {
        ACTIVE: 'text-fuse-green', WARNING: 'text-fuse-yellow', READONLY: 'text-fuse-blue',
        LIMITED: 'text-fuse-orange', LOCKED: 'text-fuse-red', EXPIRED: 'text-fuse-red',
        SLEEP: 'text-fuse-dim', SELF_DESTRUCT: 'text-fuse-purple',
    }
    return tester.state ? (m[tester.state] ?? 'text-fuse-text') : 'text-fuse-muted'
})

function logTypeColor(type: string) {
    const m: Record<string, string> = {
        active: 'text-fuse-green', warning: 'text-fuse-yellow', readonly: 'text-fuse-blue',
        limited: 'text-fuse-orange', locked: 'text-fuse-red', expired: 'text-fuse-red',
        sleep: 'text-fuse-dim', destruct: 'text-fuse-purple',
        disconnect: 'text-fuse-muted', reconnect: 'text-fuse-blue', error: 'text-fuse-red',
        info: 'text-fuse-muted',
    }
    return m[type] ?? 'text-fuse-muted'
}

const stateInfo = [
    { name: 'ACTIVE', dot: 'bg-fuse-green', color: 'text-fuse-green', desc: 'Full access, no restrictions.' },
    { name: 'WARNING', dot: 'bg-fuse-yellow', color: 'text-fuse-yellow', desc: 'Warning message shown to users.' },
    { name: 'READONLY', dot: 'bg-fuse-blue', color: 'text-fuse-blue', desc: 'POST/PUT/PATCH/DELETE blocked.' },
    { name: 'LIMITED', dot: 'bg-fuse-orange', color: 'text-fuse-orange', desc: 'Custom partial restrictions.' },
    { name: 'LOCKED', dot: 'bg-fuse-red', color: 'text-fuse-red', desc: 'Full block with message.' },
    { name: 'EXPIRED', dot: 'bg-fuse-red', color: 'text-fuse-red', desc: 'Contract ended.' },
    { name: 'SLEEP', dot: 'bg-fuse-muted', color: 'text-fuse-dim', desc: 'App temporarily paused.' },
    { name: 'SELF_DESTRUCT', dot: 'bg-fuse-purple', color: 'text-fuse-purple', desc: 'Custom handler triggered.' },
]
</script>

<style scoped>
.panel {
    @apply rounded-xl border border-white/[0.07] p-5;
    background: rgba(255, 255, 255, 0.025);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
}

.panel-title {
    @apply text-[10px] font-mono uppercase tracking-widest text-fuse-muted mb-3 block;
}

.field-group {
    @apply flex flex-col gap-1;
}

.field-label {
    @apply text-[9px] font-mono uppercase tracking-widest text-fuse-muted;
}

.field-input {
    @apply w-full bg-black/30 border border-white/[0.08] rounded-lg px-3 py-2 text-fuse-text outline-none focus:border-fuse-red/40 focus:ring-1 focus:ring-fuse-red/[0.12] transition-all duration-150 placeholder:text-fuse-muted disabled:opacity-50 disabled:cursor-not-allowed;
}

.stat-card {
    @apply rounded-xl border border-white/[0.06] px-4 py-3 flex flex-col;
    background: rgba(255, 255, 255, 0.02);
    backdrop-filter: blur(8px);
}

.stat-label {
    @apply text-[9px] font-mono uppercase tracking-widest text-fuse-muted;
}

.btn-activate {
    @apply flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-xs transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed;
    background: rgba(0, 255, 136, 0.12);
    border: 1px solid rgba(0, 255, 136, 0.25);
    color: #00ff88;
}

.btn-activate:not(:disabled):hover {
    background: rgba(0, 255, 136, 0.18);
    border-color: rgba(0, 255, 136, 0.4);
}

.btn-ghost {
    @apply border border-white/[0.08] hover:border-white/[0.16] text-fuse-dim hover:text-fuse-text rounded-lg transition-all duration-150 flex items-center justify-center;
}

.log-box {
    @apply rounded-lg border border-white/[0.06] overflow-y-auto;
    height: 260px;
    background: rgba(0, 0, 0, 0.35);
    padding: 8px;
}

.log-row {
    @apply flex items-start gap-3 py-1 border-b border-white/[0.03] last:border-0;
}
</style>