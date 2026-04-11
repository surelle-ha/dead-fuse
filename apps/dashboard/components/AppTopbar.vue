<template>
  <header
    class="h-11 flex items-center justify-between px-5 border-b border-white/[0.06] sticky top-0 z-30 shrink-0"
    style="background: rgba(10,10,10,0.75); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);"
  >
    <!-- Left: page title / breadcrumb -->
    <div class="flex items-center gap-2 min-w-0">
      <slot name="left">
        <span class="text-xs font-medium text-fuse-dim truncate">{{ title }}</span>
      </slot>
    </div>

    <!-- Right: user menu -->
    <div class="relative flex-shrink-0" ref="menuRef">
      <button
        @click="open = !open"
        class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-transparent hover:border-white/[0.08] hover:bg-white/[0.04] transition-all duration-150 group"
      >
        <!-- Avatar initials -->
        <div class="w-5 h-5 rounded-md bg-fuse-red/20 border border-fuse-red/20 flex items-center justify-center flex-shrink-0">
          <span class="text-[9px] font-mono font-bold text-fuse-red uppercase">{{ initials }}</span>
        </div>
        <span class="text-xs font-mono text-fuse-dim group-hover:text-fuse-text transition-colors max-w-[120px] truncate hidden sm:block">
          {{ displayName }}
        </span>
        <ChevronDown
          class="w-3 h-3 text-fuse-muted transition-transform duration-150 hidden sm:block"
          :class="open ? 'rotate-180' : ''"
        />
      </button>

      <!-- Dropdown -->
      <Transition
        enter-active-class="transition-all duration-150 ease-out"
        enter-from-class="opacity-0 translate-y-1 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition-all duration-100 ease-in"
        leave-from-class="opacity-100 translate-y-0 scale-100"
        leave-to-class="opacity-0 translate-y-1 scale-95"
      >
        <div
          v-if="open"
          class="dropdown"
        >
          <!-- User info header -->
          <div class="px-3 py-2.5 border-b border-white/[0.06]">
            <p class="text-xs font-medium text-fuse-text truncate">{{ email }}</p>
            <p class="text-[9px] font-mono text-fuse-muted mt-0.5">Free plan · 2 project limit</p>
          </div>

          <!-- Menu items -->
          <div class="p-1">
            <NuxtLink
              to="/settings"
              class="dropdown-item"
              @click="open = false"
            >
              <Settings class="dropdown-icon" />
              Settings
            </NuxtLink>
            <NuxtLink
              to="/pricing"
              class="dropdown-item text-fuse-red hover:text-fuse-red hover:bg-fuse-red/[0.06]"
              @click="open = false"
            >
              <Zap class="dropdown-icon" />
              Upgrade plan
            </NuxtLink>
          </div>

          <div class="p-1 border-t border-white/[0.06]">
            <button
              class="dropdown-item w-full text-left text-fuse-muted hover:text-fuse-red hover:bg-fuse-red/[0.04]"
              @click="logout"
            >
              <LogOut class="dropdown-icon" />
              Sign out
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Settings, ChevronDown, LogOut, Zap } from 'lucide-vue-next'

const props = defineProps<{
  title?: string
  email?: string
}>()

const router = useRouter()
const open = ref(false)
const menuRef = ref<HTMLElement | null>(null)

const initials = computed(() => {
  if (!props.email) return '?'
  return props.email.slice(0, 2).toUpperCase()
})

const displayName = computed(() => {
  if (!props.email) return ''
  // Show name part before @ for cleaner look
  return props.email.split('@')[0]
})

// Close on click outside
onMounted(() => {
  document.addEventListener('click', handleOutside)
})
onUnmounted(() => {
  document.removeEventListener('click', handleOutside)
})
function handleOutside(e: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    open.value = false
  }
}

async function logout() {
  open.value = false
  await $fetch('/api/auth/logout', { method: 'POST' })
  router.push('/login')
}
</script>

<style scoped>
.dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + 6px);
  width: 200px;
  border-radius: 12px;
  border: 0.5px solid rgba(255,255,255,0.1);
  overflow: hidden;
  background: rgba(17,17,17,0.95);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow: 0 16px 48px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(255,255,255,0.04);
  transform-origin: top right;
}

.dropdown-item {
  @apply flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-xs text-fuse-dim hover:text-fuse-text hover:bg-white/[0.05] transition-all duration-100 cursor-pointer;
  text-decoration: none;
}

.dropdown-icon {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
  opacity: 0.7;
}
</style>