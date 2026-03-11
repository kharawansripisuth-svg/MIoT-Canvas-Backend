<!--
  AppSidebar.vue — Collapsible Sidebar (hover to expand)

  ตาม Figma (node 68:938):
  - Collapsed: 64px (icon only)
  - Expanded: 240px (icon + text)
  - Sections: MAIN / SYSTEM
  - Active: blue bg + blue text/icon
  - User info + logout ด้านล่าง
-->
<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppIcon from '@/components/AppIcon.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

// ─── Sidebar State ───
const isExpanded = ref(false)

// ─── Menu Items (ตาม Figma) ───
const mainMenu = [
  { name: 'Device',    icon: 'device',    path: '/device' },
  { name: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
  { name: 'Rules',     icon: 'rules',     path: '/rules' },
  { name: 'Zone',      icon: 'zone',      path: '/zone' },
  { name: 'Report',    icon: 'report',    path: '/report' }
]

const systemMenu = [
  { name: 'Logs',   icon: 'logs',   path: '/logs' },
  { name: 'Member', icon: 'member', path: '/member' }
]

// ─── Active Check ───
const isActive = (path) => route.path.startsWith(path)

// ─── User Info ───
const userInitial = computed(() => {
  const name = auth.profile?.username || 'U'
  return name.charAt(0).toUpperCase()
})

const displayName = computed(() => {
  const name = auth.profile?.username || 'User'
  return name.charAt(0).toUpperCase() + name.slice(1)
})

const displayRole = computed(() => {
  const role = auth.profile?.role_name || 'user'
  // admin → Super Admin, user → User
  if (role === 'admin') return 'Super Admin'
  return role.charAt(0).toUpperCase() + role.slice(1)
})

// ─── Logout ───
const handleLogout = () => {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <aside
    class="sidebar"
    :class="{ expanded: isExpanded }"
    @mouseenter="isExpanded = true"
    @mouseleave="isExpanded = false"
  >
    <!-- ═══ Logo (Figma: 68:939) ═══ -->
    <div class="sidebar-logo">
      <div class="logo-icon-zone">
        <div class="logo-icon">
          <AppIcon name="logo-white" :size="22" color="white" />
        </div>
      </div>
      <Transition name="fade">
        <div v-show="isExpanded" class="logo-text">
          <span class="logo-title">IoT-MFLOW</span>
          <span class="logo-version">v1.0.0</span>
        </div>
      </Transition>
    </div>

    <!-- ═══ Navigation (Figma: 68:949) ═══ -->
    <nav class="sidebar-nav">

      <!-- MAIN Section -->
      <div class="nav-section">
        <span class="nav-section-label">MAIN</span>
      </div>

      <router-link
        v-for="item in mainMenu"
        :key="item.path"
        :to="item.path"
        class="nav-item"
        :class="{ active: isActive(item.path) }"
      >
        <div class="nav-icon">
          <AppIcon :name="item.icon" :size="18" />
        </div>
        <Transition name="fade">
          <span v-show="isExpanded" class="nav-label">{{ item.name }}</span>
        </Transition>
      </router-link>

      <!-- SYSTEM Section -->
      <div class="nav-section system-section">
        <span class="nav-section-label">SYSTEM</span>
      </div>

      <router-link
        v-for="item in systemMenu"
        :key="item.path"
        :to="item.path"
        class="nav-item"
        :class="{ active: isActive(item.path) }"
      >
        <div class="nav-icon">
          <AppIcon :name="item.icon" :size="18" />
        </div>
        <Transition name="fade">
          <span v-show="isExpanded" class="nav-label">{{ item.name }}</span>
        </Transition>
      </router-link>
    </nav>

    <!-- ═══ User Info (Figma: 68:1000) ═══ -->
    <div class="sidebar-user">
      <div class="user-avatar-zone">
        <div class="user-avatar">{{ userInitial }}</div>
      </div>
      <Transition name="fade">
        <div v-show="isExpanded" class="user-info">
          <span class="user-name">{{ displayName }}</span>
          <span class="user-role">{{ displayRole }}</span>
        </div>
      </Transition>
      <Transition name="fade">
        <button
          v-show="isExpanded"
          class="logout-btn"
          @click="handleLogout"
          title="Logout"
        >
          <AppIcon name="out" :size="18" />
        </button>
      </Transition>
    </div>
  </aside>
</template>
