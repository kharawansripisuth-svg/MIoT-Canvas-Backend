<!--
  Step 2: กรอก OTP 6 หลัก → Verify
  Props: otp, otpRef, maskedEmail, isLoading, error, resendCooldown
  Emits: update:otp, submit, resend
-->
<script setup>
import AppIcon from '@/components/AppIcon.vue'

const props = defineProps({
  otp: { type: Array, required: true },       // ['', '', '', '', '', '']
  otpRef: { type: String, default: '' },
  maskedEmail: { type: String, default: '' },
  isLoading: { type: Boolean, default: false },
  error: { type: String, default: null },
  resendCooldown: { type: Number, default: 0 }
})

const emit = defineEmits(['update:otp', 'submit', 'resend'])

// ─── OTP Input: กด 1 ตัว → auto focus ช่องถัดไป ───
function handleOtpInput(index, event) {
  const value = event.target.value
  const newOtp = [...props.otp]
  newOtp[index] = value.replace(/\D/g, '').slice(-1)
  emit('update:otp', newOtp)

  // ถ้ากรอกแล้ว → focus ช่องถัดไป
  if (newOtp[index] && index < 5) {
    const nextInput = event.target.parentElement.children[index + 1]
    if (nextInput) nextInput.focus()
  }
}

function handleOtpKeydown(index, event) {
  // กด Backspace ตอนช่องว่าง → ย้อนกลับช่องก่อนหน้า
  if (event.key === 'Backspace' && !props.otp[index] && index > 0) {
    const prevInput = event.target.parentElement.children[index - 1]
    if (prevInput) prevInput.focus()
  }
}

// กด Paste OTP ทั้งชุด (เช่น copy "123456" จาก email)
function handleOtpPaste(event) {
  event.preventDefault()
  const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
  const newOtp = ['', '', '', '', '', '']
  for (let i = 0; i < 6; i++) {
    newOtp[i] = pasted[i] || ''
  }
  emit('update:otp', newOtp)
}
</script>

<template>
  <!-- Header -->
  <div class="text-center mb-6">
    <div class="w-12 h-12 bg-primary-bg rounded-xl flex items-center justify-center mx-auto mb-3">
      <AppIcon name="shield-check" size="24" class="text-primary" />
    </div>
    <h2 class="text-lg font-semibold text-text-primary">Enter OTP</h2>
    <p class="text-sm text-text-tertiary mt-1">
      We've sent a 6-digit code to <strong>{{ maskedEmail }}</strong>
    </p>
    <p class="text-xs text-text-placeholder mt-1">
      Ref: {{ otpRef }}
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
    <!-- OTP 6 ช่อง -->
    <div class="flex justify-center gap-2" @paste="handleOtpPaste">
      <input
        v-for="(digit, index) in otp"
        :key="index"
        :value="digit"
        @input="handleOtpInput(index, $event)"
        @keydown="handleOtpKeydown(index, $event)"
        type="text"
        inputmode="numeric"
        maxlength="1"
        class="w-11 h-12 text-center text-lg font-semibold border border-border rounded-lg
               focus:ring-2 focus:ring-blue-100 focus:border-(--color-primary) outline-none transition"
      />
    </div>

    <button
      type="submit"
      :disabled="isLoading"
      class="w-full bg-(--color-primary) text-white py-2.5 rounded-lg font-semibold text-sm
             shadow-(--shadow-button) hover:bg-primary-hover transition duration-150
             disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      <svg v-if="isLoading" class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <span>{{ isLoading ? 'Verifying...' : 'Verify OTP' }}</span>
    </button>

    <!-- Resend OTP -->
    <div class="text-center">
      <p class="text-sm text-tertiary">
        Didn't receive the code?
        <button
          type="button"
          @click="emit('resend')"
          :disabled="resendCooldown > 0 || isLoading"
          class="font-medium transition"
          :class="resendCooldown > 0
            ? 'text-text-placeholder cursor-not-allowed'
            : 'text-primary hover:text-primary-hover'"
        >
          {{ resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP' }}
        </button>
      </p>
    </div>
  </form>
</template>
