<template>
  <div class="min-h-screen bg-fuse-black text-fuse-text font-sans">
    <div class="min-h-screen flex">
      <aside
        v-if="showSidebar"
        :class="['hidden lg:flex shrink-0 flex-col p-5 gap-6 transition-all duration-300 overflow-hidden', sidebarCollapsed ? 'lg:w-20' : 'lg:w-72']"
        class="bg-white/5 backdrop-blur-2xl border-r border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.25)]"
      >
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3" :class="sidebarCollapsed ? 'justify-center' : ''">
            <div class="w-11 h-11 rounded-2xl bg-fuse-red/90 flex items-center justify-center shadow-lg shadow-fuse-red/30">
              <span class="text-white font-mono font-bold text-sm">DF</span>
            </div>
            <div v-if="!sidebarCollapsed" class="min-w-0">
              <p class="text-fuse-text font-bold">DeadFuse</p>
              <p class="text-fuse-dim text-[11px] uppercase tracking-[0.35em]">License control</p>
            </div>
          </div>
          <button
            @click="toggleSidebar"
            aria-label="Toggle sidebar"
            class="text-fuse-dim hover:text-fuse-text p-2 rounded-full border border-white/10 bg-fuse-black/20"
          >
            <component :is="sidebarCollapsed ? ChevronRight : ChevronLeft" class="h-4 w-4" />
          </button>
        </div>

        <nav class="space-y-1">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="group flex items-center gap-3 rounded-2xl px-3 py-3 transition-all duration-200"
            :class="route.path.startsWith(item.to) ? 'bg-fuse-red text-white' : 'text-fuse-dim hover:bg-white/10 hover:text-fuse-text'"
          >
            <component :is="item.icon" class="h-4 w-4" />
            <span v-if="!sidebarCollapsed" class="text-sm font-medium">{{ item.label }}</span>
          </NuxtLink>
        </nav>

      </aside>

      <div class="flex-1 min-h-screen">
        <div v-if="showSidebar" class="lg:hidden border-b border-fuse-border/50 px-6 py-4 bg-fuse-black/95">
          <div class="flex items-center justify-between">
            <span class="font-bold text-fuse-text">DeadFuse</span>
            <NuxtLink to="/projects" class="text-sm text-fuse-dim hover:text-fuse-text">Projects</NuxtLink>
          </div>
        </div>

        <div v-if="showPageHeader" class="border-b border-fuse-border/50 px-6 py-4 sticky top-0 z-20 bg-fuse-black/95 backdrop-blur-sm">
          <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-2xl bg-fuse-red/90 flex items-center justify-center shadow-lg shadow-fuse-red/30">
                <span class="text-white font-mono text-xs font-bold">DF</span>
              </div>
              <div>
                <p class="text-base font-semibold text-fuse-text">{{ pageHeader }}</p>
                <p class="text-fuse-dim text-xs">Quick actions and workspace navigation.</p>
              </div>
            </div>
            <NuxtLink v-if="route.path !== '/projects'" to="/projects" class="text-sm text-fuse-dim hover:text-fuse-text">Back to projects</NuxtLink>
          </div>
        </div>

        <main class="min-h-screen">
          <NuxtPage />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from '#imports'
import { Box, BarChart3, BookOpen, Settings, ChevronLeft, ChevronRight } from 'lucide-vue-next'

const route = useRoute()
const sidebarCollapsed = ref(false)
const showSidebar = computed(() => !['/login', '/onboarding'].includes(route.path))
const pageHeader = computed(() => {
  if (route.path.startsWith('/docs')) return 'Documentation'
  if (route.path.startsWith('/analytics')) return 'Analytics'
  if (route.path.startsWith('/settings')) return 'Settings'
  return ''
})
const showPageHeader = computed(() => pageHeader.value !== '')
const navItems = [
  { label: 'Projects', to: '/projects', icon: Box },
  { label: 'Analytics', to: '/analytics', icon: BarChart3 },
  { label: 'Documentation', to: '/docs', icon: BookOpen },
  { label: 'Settings', to: '/settings', icon: Settings },
]

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}
</script>

<style>
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  color-scheme: dark;
}

html {
  scroll-behavior: smooth;
}

body {
  background-color: #0a0a0a;
  color: #e8e8e8;
  font-family: 'Syne', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

::selection {
  background: #ff333366;
  color: #fff;
}

::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: #0a0a0a;
}

::-webkit-scrollbar-thumb {
  background: #2a2a2a;
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: #444444;
}
</style>
