<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/services/authService' // เรียกจาก service
import bgLogin from '@/assets/images/bg_Login.webp';

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const router = useRouter()

async function handleLogin() {
  try {
    // เรียก service login
    await login(email.value, password.value)

    // ถ้า login สำเร็จ -> ไปหน้า devices
    router.push('/devices')
  } catch (err) {
    // รับ error ที่ส่งมาจาก service
    console.error('Login failed:', err.message)
    alert(err.response?.data?.message || err.message || 'Login failed')
  }
}
</script>

<template>
  <div
  class="min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat"
  :style="{ backgroundImage: `url(${bgLogin})` }"
  >
    <!-- Card -->
    <div class="w-full max-w-md mx-4 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-10">
      <!-- Icon -->
      <div class="flex justify-center mb-6">
        <div class="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
          <svg class="w-7 h-7 text-gray-700" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.5-1.632Z" />
          </svg>
        </div>
      </div>

      <!-- Title -->
      <h1 class="text-2xl font-bold text-center text-gray-900 mb-2">Sign in with email</h1>
      <p class="text-center text-gray-500 text-sm mb-8">
        Enter your credentials to access your account
      </p>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="space-y-4">
        <!-- Email -->
        <div class="relative">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
          </span>
          <input
            v-model="email"
            type="email"
            placeholder="Email"
            class="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-transparent transition"
          />
        </div>

        <!-- Password -->
        <div class="relative">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </span>
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Password"
            class="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-transparent transition"
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
          >
            <!-- Eye open -->
            <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
            <!-- Eye closed -->
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
            </svg>
          </button>
        </div>

        <!-- Forgot password -->
        <div class="text-right">
          <a href="#" class="text-sm text-gray-500 hover:text-gray-900 transition">
            Forgot password?
          </a>
        </div>

        <!-- Submit button -->
        <button
          type="submit"
          class="w-full py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition active:scale-[0.98]"
        >
          Get Started
        </button>
      </form>
    </div>
  </div>
</template>
