<script setup>

import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppIcon from '@/components/AppIcon.vue'

const router = useRouter()
const auth = useAuthStore()

// ─── Form State ───
const username = ref('')
const password = ref('')
const showPassword = ref(false)     // toggle eye icon
const rememberMe = ref(false)

// ─── ล้าง error เมื่อ user เริ่มพิมพ์ใหม่ ───
watch([username, password], () => {
  auth.clearError()
})

// ─── Submit Handler ───
const handleSubmit = async () => {
  // Validate ว่ากรอกครบ
  if (!username.value.trim() || !password.value.trim()) {
    auth.error = 'กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน'
    return
  }

  // ยิง API จริง (auth store จัดการให้)
  const success = await auth.login(username.value, password.value)

  // Remember me → เก็บ username ไว้ใน localStorage
  if (success) {
    if (rememberMe.value) {
      localStorage.setItem('remember-username', username.value)
    } else {
      localStorage.removeItem('remember-username')
    }
    router.push('/device')
  }

}

// ─── Load remembered username (ถ้ามี) ───
const savedUsername = localStorage.getItem('remember-username')
if (savedUsername) {
  username.value = savedUsername
  rememberMe.value = true
}
</script>

<template>
  <!-- ─── Full Page Background ─── -->
  <div class="min-h-screen flex flex-col items-center justify-center bg-bg-login px-4">

    <!-- ─── Login Card ─── -->
    <div class="bg-white w-full max-w-105 rounded-2xl p-8 shadow-(--shadow-login)">

      <!-- ─── Logo + Title ─── -->
      <div class="flex flex-col items-center mb-6">
        <!-- Logo icon: blue layered squares -->
        <div class="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-3">
          <AppIcon name="logo" size="28" class="text-white" />
        </div>
        <h1 class="text-2xl font-bold tex-text-primary">IoT-MFLOW</h1>
        <p class="text-sm text-text-tertiary mt-0.5">IoT MFEC FLOW Platform</p>
      </div>

      <!-- ─── Sign In Heading ─── -->
      <div class="text-center mb-6">
        <h2 class="text-lg font-semibold text-text-primary">Sign in to your account</h2>
        <p class="text-sm text-text-tertiary mt-1">Enter your credentials to access the platform</p>
      </div>

      <!-- ═══ Error Banner ═══ -->
      <div
        v-if="auth.error"
        class="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg"
      >
        <AppIcon name="alert-circle" size="18" class="text-error shrink-0" />
        <span class="text-sm text-error">{{ auth.error }}</span>
      </div>

      <!-- ═══ Login Form ═══ -->
      <form @submit.prevent="handleSubmit" class="space-y-4">

        <!-- Username Field -->
        <div class="space-y-1.5">
          <label class="block text-sm font-medium text-primary">Username</label>
          <div class="relative">
            <AppIcon name="user" size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-text-placeholder" />
            <input
              v-model="username"
              type="text"
              autocomplete="username"
              class="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm
                     focus:ring-2 focus:ring-blue-100 focus:border-(--color-primary) outline-none transition
                     placeholder:text-text-placeholder"
              placeholder="Enter your username"
            />
          </div>
        </div>

        <!-- Password Field -->
        <div class="space-y-1.5">
          <label class="block text-sm font-medium text-text-primary">Password</label>
          <div class="relative">
            <AppIcon name="lock" size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-text-placeholder" />
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              class="w-full pl-10 pr-10 py-2.5 border border-border) rounded-lg text-sm
                     focus:ring-2 focus:ring-blue-100 focus:border-(--color-primary) outline-none transition
                     placeholder:text-text-placeholder"
              placeholder="Enter your password"
            />
            <!-- Eye Toggle Button -->
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition"
            >
              <AppIcon :name="showPassword ? 'eye' : 'eye-off'" size="18" />
            </button>
          </div>
        </div>

        <!-- Remember Me + Forgot Password -->
        <div class="flex items-center justify-between">
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              v-model="rememberMe"
              type="checkbox"
              class="w-4 h-4 rounded border-border text-primary focus:ring-(--color-primary)"
            />
            <span class="text-sm text-text-secondary">Remember me</span>
          </label>
          <router-link
            to="/forgot-password"
            class="text-sm text-primary hover:text-primary-hover font-medium"
			>
            Forgot Password?
          </router-link>
        </div>

        <!-- Sign In Button -->
        <button
          type="submit"
          :disabled="auth.isLoading"
          class="w-full bg-primary text-white py-2.5 rounded-lg font-semibold text-sm
                 shadow-(--shadow-button) hover:bg-primary-hover transition duration-150
                 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <!-- Loading Spinner -->
          <svg v-if="auth.isLoading" class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>{{ auth.isLoading ? 'Signing in...' : 'Sign In' }}</span>
        </button>


      </form>
    </div>

    <!-- ─── Footer ─── -->
    <div class="mt-6 text-center space-y-1">
      <p class="text-xs text-tertiary">
        &copy; 2026 IoT MFEC FLOW Platform. All rights reserved.
      </p>
      <p class="text-xs text-text-placeholder">
        Version 1.0.0 DEMO &middot; Secured by MFEC
      </p>
    </div>
  </div>
</template>
