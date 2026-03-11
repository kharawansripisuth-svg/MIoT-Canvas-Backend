<!--
  Step 3: ตั้งรหัสผ่านใหม่ + ยืนยัน
  Props: newPassword, confirmPassword, isLoading, error
  Emits: update:newPassword, update:confirmPassword, submit
-->
<script setup>
import { ref } from 'vue'
import AppIcon from '@/components/AppIcon.vue'

defineProps({
  newPassword: { type: String, required: true },
  confirmPassword: { type: String, required: true },
  isLoading: { type: Boolean, default: false },
  error: { type: String, default: null }
})

const emit = defineEmits(['update:newPassword', 'update:confirmPassword', 'submit'])

// Eye toggle — state อยู่ใน component นี้เพราะเป็นเรื่อง UI ไม่ใช่ data
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
</script>

<template>
  <!-- Header -->
  <div class="text-center mb-6">
    <div class="w-12 h-12 bg-primary-bg rounded-xl flex items-center justify-center mx-auto mb-3">
      <AppIcon name="key-round" size="24" class="text-primary" />
    </div>
    <h2 class="text-lg font-semibold text-text-primary">Set New Password</h2>
    <p class="text-sm text-text-tertiary mt-1">
      Your new password must be at least 8 characters.
    </p>
  </div>

  <!-- Error Banner -->
  <div
    v-if="error"
    class="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg"
  >
    <AppIcon name="alert-circle" size="18" class="text-error shrink-0" />
    <span class="text-sm text-error">{{ error }}</span>
  </div>

  <!-- Form -->
  <form @submit.prevent="emit('submit')" class="space-y-4">
    <!-- New Password -->
    <div class="space-y-1.5">
      <label class="block text-sm font-medium text-text-primary">New Password</label>
      <div class="relative">
        <AppIcon name="lock" size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-text-placeholder" />
        <input
          :value="newPassword"
          @input="emit('update:newPassword', $event.target.value)"
          :type="showNewPassword ? 'text' : 'password'"
          class="w-full pl-10 pr-10 py-2.5 border border-border rounded-lg text-sm
                 focus:ring-2 focus:ring-blue-100 focus:border-primary outline-none transition
                 placeholder:text-text-placeholder"
          placeholder="Enter new password"
        />
        <button
          type="button"
          @click="showNewPassword = !showNewPassword"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition"
        >
          <AppIcon :name="showNewPassword ? 'eye' : 'eye-off'" size="18" />
        </button>
      </div>
    </div>

    <!-- Confirm Password -->
    <div class="space-y-1.5">
      <label class="block text-sm font-medium text-text-primary">Confirm Password</label>
      <div class="relative">
        <AppIcon name="lock" size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-text-placeholder" />
        <input
          :value="confirmPassword"
          @input="emit('update:confirmPassword', $event.target.value)"
          :type="showConfirmPassword ? 'text' : 'password'"
          class="w-full pl-10 pr-10 py-2.5 border border-border rounded-lg text-sm
                 focus:ring-2 focus:ring-blue-100 focus:border-primary outline-none transition
                 placeholder:text-text-placeholder"
          placeholder="Confirm new password"
        />
        <button
          type="button"
          @click="showConfirmPassword = !showConfirmPassword"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition"
        >
          <AppIcon :name="showConfirmPassword ? 'eye' : 'eye-off'" size="18" />
        </button>
      </div>
    </div>

    <button
      type="submit"
      :disabled="isLoading"
      class="w-full bg-primary text-white py-2.5 rounded-lg font-semibold text-sm
             shadow-(--shadow-button) hover:bg-primary-hover transition duration-150
             disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      <svg v-if="isLoading" class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <span>{{ isLoading ? 'Saving...' : 'Reset Password' }}</span>
    </button>
  </form>
</template>
