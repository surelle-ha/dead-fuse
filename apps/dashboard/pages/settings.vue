<template>
  <div class="min-h-screen bg-fuse-black">
    <main class="max-w-2xl mx-auto px-6 py-8 animate-slide-up space-y-5">

      <!-- Profile -->
      <div class="panel">
        <h2 class="panel-title">Profile</h2>
        <p class="text-fuse-dim text-xs mb-4">Your display email and account identity.</p>

        <div class="space-y-3">
          <div class="field-group">
            <label class="field-label">Email address</label>
            <input
              v-model="profile.email"
              type="email"
              class="field-input"
              placeholder="you@example.com"
              :disabled="profile.loading"
            />
          </div>

          <div v-if="profile.success" class="notice notice--success">{{ profile.success }}</div>
          <div v-if="profile.error"   class="notice notice--error">{{ profile.error }}</div>

          <div class="flex justify-end">
            <button @click="saveProfile" :disabled="profile.loading" class="btn-primary text-xs px-5">
              {{ profile.loading ? 'Saving…' : 'Save profile' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Password -->
      <div class="panel">
        <h2 class="panel-title">Change password</h2>
        <p class="text-fuse-dim text-xs mb-4">Use at least 8 characters. Your session stays active after the change.</p>

        <div class="space-y-3">
          <div class="field-group">
            <label class="field-label">Current password</label>
            <input
              v-model="pwd.current"
              type="password"
              class="field-input"
              placeholder="••••••••"
              autocomplete="current-password"
              :disabled="pwd.loading"
            />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="field-group">
              <label class="field-label">New password</label>
              <input
                v-model="pwd.next"
                type="password"
                class="field-input"
                placeholder="••••••••"
                autocomplete="new-password"
                :disabled="pwd.loading"
              />
            </div>
            <div class="field-group">
              <label class="field-label">Confirm new password</label>
              <input
                v-model="pwd.confirm"
                type="password"
                class="field-input"
                placeholder="••••••••"
                autocomplete="new-password"
                :disabled="pwd.loading"
              />
            </div>
          </div>

          <!-- Strength indicator -->
          <div v-if="pwd.next" class="space-y-1">
            <div class="flex gap-1">
              <div v-for="i in 4" :key="i"
                class="h-0.5 flex-1 rounded-full transition-all duration-200"
                :class="i <= pwdStrength.score ? pwdStrength.color : 'bg-white/[0.08]'"
              />
            </div>
            <p class="text-[9px] font-mono" :class="pwdStrength.textColor">{{ pwdStrength.label }}</p>
          </div>

          <div v-if="pwd.success" class="notice notice--success">{{ pwd.success }}</div>
          <div v-if="pwd.error"   class="notice notice--error">{{ pwd.error }}</div>

          <div class="flex justify-end">
            <button @click="changePassword" :disabled="pwd.loading" class="btn-primary text-xs px-5">
              {{ pwd.loading ? 'Updating…' : 'Update password' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Preferences -->
      <div class="panel">
        <h2 class="panel-title">Preferences</h2>
        <p class="text-fuse-dim text-xs mb-4">Dashboard behaviour and notifications.</p>

        <div class="space-y-3">
          <div class="pref-row">
            <div>
              <p class="text-xs font-medium text-fuse-text">Email alerts on state change</p>
              <p class="text-[10px] text-fuse-muted mt-0.5">Get an email when any project state is changed.</p>
            </div>
            <button
              @click="prefs.emailAlerts = !prefs.emailAlerts; savePrefs()"
              class="toggle-track flex-shrink-0"
              :class="prefs.emailAlerts ? 'toggle-on' : 'toggle-off'"
              role="switch"
              :aria-checked="prefs.emailAlerts"
            >
              <span class="toggle-thumb" :style="prefs.emailAlerts ? 'transform:translateX(18px)' : 'transform:translateX(2px)'" />
            </button>
          </div>

          <div class="pref-row">
            <div>
              <p class="text-xs font-medium text-fuse-text">SDK removal alerts</p>
              <p class="text-[10px] text-fuse-muted mt-0.5">Notify when a deployed instance stops sending SDK heartbeats.</p>
            </div>
            <button
              @click="prefs.sdkAlerts = !prefs.sdkAlerts; savePrefs()"
              class="toggle-track flex-shrink-0"
              :class="prefs.sdkAlerts ? 'toggle-on' : 'toggle-off'"
              role="switch"
              :aria-checked="prefs.sdkAlerts"
            >
              <span class="toggle-thumb" :style="prefs.sdkAlerts ? 'transform:translateX(18px)' : 'transform:translateX(2px)'" />
            </button>
          </div>

          <div class="pref-row">
            <div>
              <p class="text-xs font-medium text-fuse-text">Sidebar expanded by default</p>
              <p class="text-[10px] text-fuse-muted mt-0.5">Show full labels in the navigation sidebar.</p>
            </div>
            <button
              @click="prefs.sidebarExpanded = !prefs.sidebarExpanded; savePrefs()"
              class="toggle-track flex-shrink-0"
              :class="prefs.sidebarExpanded ? 'toggle-on' : 'toggle-off'"
              role="switch"
              :aria-checked="prefs.sidebarExpanded"
            >
              <span class="toggle-thumb" :style="prefs.sidebarExpanded ? 'transform:translateX(18px)' : 'transform:translateX(2px)'" />
            </button>
          </div>

          <div v-if="prefs.saved" class="notice notice--success">Preferences saved.</div>
        </div>
      </div>

      <!-- Session / Security -->
      <div class="panel">
        <h2 class="panel-title">Session</h2>
        <p class="text-fuse-dim text-xs mb-4">Your current login session. JWT sessions expire after 7 days.</p>

        <div class="grid grid-cols-2 gap-3 mb-4">
          <div class="stat-card">
            <span class="stat-label">Account</span>
            <span class="stat-value text-xs truncate">{{ me.email || '…' }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Plan</span>
            <span class="stat-value text-xs">Free · 2 projects</span>
          </div>
        </div>

        <button @click="logout" class="btn-ghost text-xs px-4 w-full flex items-center justify-center gap-2">
          <LogOut class="w-3.5 h-3.5" />
          Sign out of this session
        </button>
      </div>

      <!-- Danger zone -->
      <div class="panel" style="border-color: rgba(255,51,51,0.12); background: rgba(255,51,51,0.02);">
        <h2 class="panel-title text-fuse-red/70">Danger zone</h2>
        <p class="text-fuse-dim text-xs mb-4">
          Permanently deletes your account, all projects, and all instances. This cannot be undone.
        </p>

        <div v-if="!deleteConfirmStep">
          <button @click="deleteConfirmStep = 1" class="w-full text-xs text-fuse-red border border-fuse-red/20 hover:border-fuse-red/40 hover:bg-fuse-red/[0.06] px-4 py-2 rounded-lg font-medium transition-all">
            Delete my account
          </button>
        </div>

        <div v-else-if="deleteConfirmStep === 1" class="space-y-3">
          <div class="notice notice--error">
            This will delete everything permanently. Type your email to confirm.
          </div>
          <div class="field-group">
            <label class="field-label">Type <strong class="text-fuse-dim">{{ me.email }}</strong> to confirm</label>
            <input v-model="deleteEmailConfirm" type="email" class="field-input text-xs" :placeholder="me.email" />
          </div>
          <div class="flex gap-2">
            <button @click="deleteConfirmStep = 0; deleteEmailConfirm = ''" class="btn-ghost flex-1 text-xs">Cancel</button>
            <button
              @click="deleteAccount"
              :disabled="deleteEmailConfirm !== me.email || deleteLoading"
              class="flex-1 text-xs bg-fuse-red hover:bg-red-500 text-white px-4 py-2 rounded-lg font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {{ deleteLoading ? 'Deleting…' : 'Delete permanently' }}
            </button>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup lang="ts">
import { LogOut } from 'lucide-vue-next'

definePageMeta({ middleware: 'auth' })

const router = useRouter()

// ── Current user ──────────────────────────────────────────────────
const me = reactive({ email: '', userId: '' })

onMounted(async () => {
  try {
    const res = await $fetch<{ email: string; userId: string }>('/api/auth/me')
    me.email  = res.email
    me.userId = res.userId
    profile.email = res.email
  } catch {
    router.push('/login')
  }
  loadPrefs()
})

// ── Profile ───────────────────────────────────────────────────────
const profile = reactive({ email: '', loading: false, success: '', error: '' })

async function saveProfile() {
  profile.loading = true
  profile.success = ''
  profile.error   = ''
  try {
    await $fetch('/api/auth/profile', {
      method: 'PATCH',
      body: { email: profile.email.trim() },
    })
    me.email = profile.email.trim()
    profile.success = 'Profile saved successfully.'
  } catch (e: any) {
    profile.error = e?.data?.statusMessage || 'Failed to save profile.'
  } finally {
    profile.loading = false
    if (profile.success) setTimeout(() => { profile.success = '' }, 3000)
  }
}

// ── Password ──────────────────────────────────────────────────────
const pwd = reactive({ current: '', next: '', confirm: '', loading: false, success: '', error: '' })

const pwdStrength = computed(() => {
  const p = pwd.next
  let score = 0
  if (p.length >= 8)  score++
  if (p.length >= 12) score++
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++
  if (/[0-9]/.test(p) && /[^a-zA-Z0-9]/.test(p)) score++
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['', 'bg-fuse-red', 'bg-fuse-orange', 'bg-fuse-yellow', 'bg-fuse-green']
  const textColors = ['', 'text-fuse-red', 'text-fuse-orange', 'text-fuse-yellow', 'text-fuse-green']
  return { score, label: labels[score], color: colors[score], textColor: textColors[score] }
})

async function changePassword() {
  pwd.success = ''
  pwd.error   = ''
  if (!pwd.current)           { pwd.error = 'Current password is required.'; return }
  if (pwd.next.length < 8)    { pwd.error = 'New password must be at least 8 characters.'; return }
  if (pwd.next !== pwd.confirm) { pwd.error = 'New passwords do not match.'; return }
  pwd.loading = true
  try {
    await $fetch('/api/auth/password', {
      method: 'PATCH',
      body: { currentPassword: pwd.current, newPassword: pwd.next },
    })
    pwd.success = 'Password updated successfully.'
    pwd.current = ''
    pwd.next    = ''
    pwd.confirm = ''
  } catch (e: any) {
    pwd.error = e?.data?.statusMessage || 'Failed to update password.'
  } finally {
    pwd.loading = false
    if (pwd.success) setTimeout(() => { pwd.success = '' }, 3000)
  }
}

// ── Preferences (localStorage) ────────────────────────────────────
const prefs = reactive({ emailAlerts: false, sdkAlerts: true, sidebarExpanded: true, saved: false })

function loadPrefs() {
  try {
    const raw = localStorage.getItem('df_prefs')
    if (raw) Object.assign(prefs, JSON.parse(raw))
  } catch {}
}

function savePrefs() {
  localStorage.setItem('df_prefs', JSON.stringify({
    emailAlerts:     prefs.emailAlerts,
    sdkAlerts:       prefs.sdkAlerts,
    sidebarExpanded: prefs.sidebarExpanded,
  }))
  prefs.saved = true
  setTimeout(() => { prefs.saved = false }, 2000)
}

// ── Logout ────────────────────────────────────────────────────────
async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  router.push('/login')
}

// ── Delete account ────────────────────────────────────────────────
const deleteConfirmStep  = ref(0)
const deleteEmailConfirm = ref('')
const deleteLoading      = ref(false)

async function deleteAccount() {
  if (deleteEmailConfirm.value !== me.email) return
  deleteLoading.value = true
  try {
    await $fetch('/api/auth/account', { method: 'DELETE' })
    router.push('/login')
  } catch (e: any) {
    alert(e?.data?.statusMessage || 'Failed to delete account.')
  } finally {
    deleteLoading.value = false
  }
}
</script>

<style scoped>
.panel {
  @apply rounded-xl border border-white/[0.07] p-6;
  background: rgba(255,255,255,0.025);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
.panel-title { @apply text-[10px] font-mono uppercase tracking-widest text-fuse-muted mb-1 block; }

.field-group  { @apply flex flex-col gap-1.5; }
.field-label  { @apply text-[9px] font-mono uppercase tracking-widest text-fuse-muted; }
.field-input  {
  @apply w-full bg-black/30 border border-white/[0.08] rounded-lg px-3 py-2.5 text-fuse-text text-sm outline-none
    focus:border-fuse-red/40 focus:ring-1 focus:ring-fuse-red/[0.12] transition-all duration-150
    placeholder:text-fuse-muted disabled:opacity-50 disabled:cursor-not-allowed;
}

.notice {
  @apply text-xs rounded-lg px-3 py-2.5 border;
}
.notice--success { @apply text-fuse-green border-fuse-green/20 bg-fuse-green/[0.06]; }
.notice--error   { @apply text-fuse-red   border-fuse-red/20   bg-fuse-red/[0.06];   }

.pref-row {
  @apply flex items-center justify-between gap-6 py-3 border-b border-white/[0.05] last:border-0;
}

.stat-card {
  @apply rounded-xl border border-white/[0.06] px-4 py-3 flex flex-col gap-1;
  background: rgba(255,255,255,0.02);
}
.stat-label { @apply text-[9px] font-mono uppercase tracking-widest text-fuse-muted; }
.stat-value { @apply font-bold text-fuse-text font-mono; }

.btn-primary {
  @apply bg-fuse-red hover:bg-red-500 text-white font-bold py-2 rounded-lg transition-all
    disabled:opacity-40 disabled:cursor-not-allowed;
}
.btn-ghost {
  @apply border border-white/[0.08] hover:border-white/[0.16] text-fuse-dim hover:text-fuse-text
    py-2 rounded-lg transition-all flex items-center;
}

/* Toggle */
.toggle-track {
  position: relative;
  width: 38px;
  height: 22px;
  border-radius: 11px;
  border: 1px solid;
  transition: background 0.2s, border-color 0.2s;
  cursor: pointer;
  outline: none;
  flex-shrink: 0;
}
.toggle-track:focus-visible { box-shadow: 0 0 0 2px rgba(255,51,51,0.4); }
.toggle-on  { background: rgba(0,255,136,0.18); border-color: rgba(0,255,136,0.35); }
.toggle-off { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.12); }
.toggle-thumb {
  position: absolute;
  top: 50%;
  margin-top: -8px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  transition: transform 0.2s cubic-bezier(0.4,0,0.2,1), background 0.2s;
  pointer-events: none;
}
.toggle-on  .toggle-thumb { background: #00ff88; }
.toggle-off .toggle-thumb { background: #555555; }
</style>