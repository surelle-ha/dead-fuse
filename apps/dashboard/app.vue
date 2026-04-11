<template>
  <div class="min-h-screen bg-fuse-black text-fuse-text font-sans flex">

    <!-- ── Sidebar ─────────────────────────────────────────────────── -->
    <aside
      v-if="showSidebar"
      class="hidden lg:flex flex-col shrink-0 h-screen sticky top-0 transition-all duration-300 border-r border-white/[0.06]"
      :class="sidebarExpanded ? 'lg:w-52' : 'lg:w-14'"
      style="background: rgba(255,255,255,0.02); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);"
    >
      <!-- Logo / toggle -->
      <div
        class="flex items-center border-b border-white/[0.06] h-11 px-3 gap-3 cursor-pointer select-none flex-shrink-0"
        @click="sidebarExpanded = !sidebarExpanded"
      >
        <div class="w-6 h-6 rounded-md bg-fuse-red flex items-center justify-center flex-shrink-0 shadow-sm shadow-fuse-red/20">
          <span class="text-white font-mono font-bold text-[9px]">DF</span>
        </div>
        <Transition name="fade-label">
          <div v-if="sidebarExpanded" class="flex-1 overflow-hidden">
            <p class="text-xs font-bold text-fuse-text whitespace-nowrap leading-tight">DeadFuse</p>
            <p class="text-[9px] font-mono text-fuse-muted tracking-widest uppercase whitespace-nowrap leading-tight">License control</p>
          </div>
        </Transition>
        <ChevronLeft
          v-if="sidebarExpanded"
          class="w-3 h-3 text-fuse-muted flex-shrink-0 ml-auto"
        />
      </div>

      <!-- Nav — scrollable middle zone -->
      <nav class="flex-1 flex flex-col gap-0.5 p-2 pt-2.5 overflow-y-auto">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          :class="isActive(item.to) ? 'nav-item--active' : 'nav-item--idle'"
          :title="!sidebarExpanded ? item.label : undefined"
        >
          <component :is="item.icon" class="nav-icon" />
          <span v-if="sidebarExpanded" class="text-xs font-medium whitespace-nowrap overflow-hidden">
            {{ item.label }}
          </span>
          <span
            v-if="isActive(item.to) && !sidebarExpanded"
            class="absolute right-1.5 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-fuse-red"
          />
        </NuxtLink>
      </nav>

      <!-- Settings — pinned to bottom, never scrolls away -->
      <div class="flex-shrink-0 p-2 border-t border-white/[0.06]">
        <NuxtLink
          to="/settings"
          class="nav-item"
          :class="isActive('/settings') ? 'nav-item--active' : 'nav-item--idle'"
          :title="!sidebarExpanded ? 'Settings' : undefined"
        >
          <Settings class="nav-icon" />
          <span v-if="sidebarExpanded" class="text-xs font-medium whitespace-nowrap">Settings</span>
          <span
            v-if="isActive('/settings') && !sidebarExpanded"
            class="absolute right-1.5 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-fuse-red"
          />
        </NuxtLink>
      </div>
    </aside>

    <!-- ── Main content ────────────────────────────────────────────── -->
    <div class="flex-1 flex flex-col min-w-0 min-h-screen">

      <!-- Mobile nav bar -->
      <div
        v-if="showSidebar"
        class="lg:hidden flex items-center justify-between border-b border-white/[0.06] px-4 h-11 flex-shrink-0"
        style="background: rgba(10,10,10,0.85); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);"
      >
        <div class="flex items-center gap-2">
          <div class="w-5 h-5 rounded bg-fuse-red flex items-center justify-center">
            <span class="text-white font-mono font-bold text-[8px]">DF</span>
          </div>
          <span class="text-xs font-bold text-fuse-text">DeadFuse</span>
        </div>
        <div class="flex items-center gap-4">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="transition-colors"
            :class="isActive(item.to) ? 'text-fuse-red' : 'text-fuse-muted hover:text-fuse-text'"
          >
            <component :is="item.icon" class="w-4 h-4" />
          </NuxtLink>
          <NuxtLink to="/settings" class="text-fuse-muted hover:text-fuse-text transition-colors">
            <Settings class="w-4 h-4" />
          </NuxtLink>
        </div>
      </div>

      <!-- Shared topbar with user email + dropdown -->
      <AppTopbar
        v-if="showSidebar"
        :title="pageTitle"
        :email="userEmail"
      />

      <main class="flex-1 min-w-0">
        <NuxtPage />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from '#imports'
import { Box, BarChart3, BookOpen, Settings, ChevronLeft } from 'lucide-vue-next'

const route = useRoute()
const sidebarExpanded = ref(true)
const userEmail = ref('')

const showSidebar = computed(() =>
  !['/login', '/onboarding', '/pricing'].includes(route.path)
)

const navItems = [
  { label: 'Projects',      to: '/projects',  icon: Box       },
  { label: 'Analytics',     to: '/analytics', icon: BarChart3  },
  { label: 'Documentation', to: '/docs',       icon: BookOpen   },
]

const pageTitles: Record<string, string> = {
  '/projects':  'Projects',
  '/analytics': 'Analytics',
  '/docs':      'Documentation',
  '/settings':  'Settings',
  '/pricing':   'Pricing',
}

const pageTitle = computed(() => {
  if (pageTitles[route.path]) return pageTitles[route.path]
  const prefix = Object.keys(pageTitles).find(k => route.path.startsWith(k + '/'))
  return prefix ? pageTitles[prefix] : ''
})

function isActive(to: string) {
  return route.path === to || route.path.startsWith(to + '/')
}

onMounted(async () => {
  if (!showSidebar.value) return
  try {
    const me = await $fetch<{ email: string }>('/api/auth/me')
    userEmail.value = me.email
  } catch {}
})
</script>

<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root { color-scheme: dark; }
html { scroll-behavior: smooth; }
body {
  background-color: #0a0a0a;
  color: #e8e8e8;
  font-family: 'Syne', sans-serif;
  -webkit-font-smoothing: antialiased;
}
::selection { background: #ff333344; color: #fff; }
::-webkit-scrollbar { width: 3px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
::-webkit-scrollbar-thumb:hover { background: #3a3a3a; }
</style>

<style scoped>
.nav-item {
  @apply relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-150 cursor-pointer;
  text-decoration: none;
}
.nav-item--idle   { @apply text-fuse-muted hover:text-fuse-text hover:bg-white/[0.04]; }
.nav-item--active { @apply text-fuse-text bg-white/[0.06]; }
.nav-item--active::before {
  content: '';
  position: absolute;
  left: 0; top: 25%; height: 50%; width: 2px;
  border-radius: 0 2px 2px 0;
  background: #ff3333;
}
.nav-icon { width: 14px; height: 14px; flex-shrink: 0; }

.fade-label-enter-active,
.fade-label-leave-active { transition: opacity 0.12s, transform 0.12s; }
.fade-label-enter-from,
.fade-label-leave-to { opacity: 0; transform: translateX(-4px); }
</style>