<script setup>
import { ref, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'

// ─── Step Components ───
import StepEmail from '../../components/forgot-password/StepEmail.vue'
import StepOtp from '../../components/forgot-password/StepOtp.vue'
import StepNewPassword from '../../components/forgot-password/StepNewPassword.vue'
import StepSuccess from '../../components/forgot-password/StepSuccess.vue'

const router = useRouter()

// ═══════════════════════════════════════════
//  State ทั้งหมด (Parent ถือไว้ที่เดียว)
// ═══════════════════════════════════════════

const currentStep = ref(1)
const isLoading = ref(false)
const error = ref(null)

// Step 1
const email = ref('')

// Step 2
const otp = ref(['', '', '', '', '', ''])
const otpRef = ref('')
const maskedEmail = ref('')
const resendCooldown = ref(0)
let resendTimer = null

// Step 3
const resetToken = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

// Step 4
const countdown = ref(5)
let countdownTimer = null

// ─── Clear error เมื่อ user พิมพ์ ───
watch([email, otp, newPassword, confirmPassword], () => {
  error.value = null
})

// ═══════════════════════════════════════════
//  Mock API (เปลี่ยนเป็น fetch จริงแค่ uncomment)
// ═══════════════════════════════════════════

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000'

/** POST /api/forgot-password — ส่ง OTP */
async function apiSendOtp(emailValue) {
  // ──── Mock Mode ────
  await new Promise(resolve => setTimeout(resolve, 1500))
  if (emailValue.toLowerCase() === 'notfound') {
    return { status: 'error', message: 'ไม่พบผู้ใช้งานในระบบ' }
  }
  return {
    status: 'success',
    data: {
      otp_ref: 'REF-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      masked_email: emailValue.replace(/(.{1})(.*)(@.*)/, '$1***$3'),
      expires_in: 300
    }
  }

  // ──── Real API (uncomment ข้างบน ลบ Mock Mode แล้วใช้อันนี้แทน) ────
  // const res = await fetch(`${API_BASE}/api/forgot-password`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ email: emailValue })
  // })
  // return await res.json()
}

/** POST /api/verify-otp — ตรวจ OTP */
async function apiVerifyOtp(emailValue, otpValue, otpRefValue) {
  // ──── Mock Mode ────
  await new Promise(resolve => setTimeout(resolve, 1500))
  if (otpValue !== '123456') {
    return {
      status: 'error',
      message: 'รหัส OTP ไม่ถูกต้อง',
      data: { remaining_attempts: 2 }
    }
  }
  return {
    status: 'success',
    data: { reset_token: 'RST-' + Math.random().toString(36).substring(2, 12) }
  }

  // ──── Real API (uncomment ข้างบน ลบ Mock Mode แล้วใช้อันนี้แทน) ────
  // const res = await fetch(`${API_BASE}/api/verify-otp`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ email: emailValue, otp: otpValue, otp_ref: otpRefValue })
  // })
  // return await res.json()
}

/** POST /api/reset-password — เปลี่ยนรหัส */
async function apiResetPassword(resetTokenValue, newPasswordValue) {
  // ──── Mock Mode ────
  await new Promise(resolve => setTimeout(resolve, 1500))
  return { status: 'success', message: 'เปลี่ยนรหัสผ่านสำเร็จ' }

  // ──── Real API (uncomment ข้างบน ลบ Mock Mode แล้วใช้อันนี้แทน) ────
  // const res = await fetch(`${API_BASE}/api/reset-password`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ reset_token: resetTokenValue, new_password: newPasswordValue })
  // })
  // return await res.json()
}

// ═══════════════════════════════════════════
//  Step Handlers
// ═══════════════════════════════════════════

/** Step 1 — ส่ง OTP ไปทาง email */
const handleSendOtp = async () => {
  if (!email.value.trim()) {
    error.value = 'กรุณากรอกอีเมลหรือชื่อผู้ใช้งาน'
    return
  }

  isLoading.value = true
  error.value = null

  try {
    const res = await apiSendOtp(email.value)

    if (res.status === 'error') {
      error.value = res.message
      return
    }

    otpRef.value = res.data.otp_ref
    maskedEmail.value = res.data.masked_email
    currentStep.value = 2
    startResendCooldown()
  } catch {
    error.value = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้'
  } finally {
    isLoading.value = false
  }
}

/** Step 2 — Verify OTP */
const handleVerifyOtp = async () => {
  const otpString = otp.value.join('')
  if (otpString.length !== 6) {
    error.value = 'กรุณากรอก OTP ให้ครบ 6 หลัก'
    return
  }

  isLoading.value = true
  error.value = null

  try {
    const res = await apiVerifyOtp(email.value, otpString, otpRef.value)

    if (res.status === 'error') {
      error.value = res.message
      if (res.data?.remaining_attempts !== undefined) {
        error.value += ` (เหลืออีก ${res.data.remaining_attempts} ครั้ง)`
      }
      otp.value = ['', '', '', '', '', '']
      return
    }

    resetToken.value = res.data.reset_token
    clearInterval(resendTimer)
    currentStep.value = 3
  } catch {
    error.value = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้'
  } finally {
    isLoading.value = false
  }
}

/** Step 3 — ตั้งรหัสผ่านใหม่ */
const handleResetPassword = async () => {
  if (!newPassword.value || !confirmPassword.value) {
    error.value = 'กรุณากรอกรหัสผ่านให้ครบ'
    return
  }
  if (newPassword.value.length < 8) {
    error.value = 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    error.value = 'รหัสผ่านไม่ตรงกัน'
    return
  }

  isLoading.value = true
  error.value = null

  try {
    const res = await apiResetPassword(resetToken.value, newPassword.value)

    if (res.status === 'error') {
      error.value = res.message
      return
    }

    currentStep.value = 4
    startSuccessCountdown()
  } catch {
    error.value = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้'
  } finally {
    isLoading.value = false
  }
}

/** ส่ง OTP ใหม่ */
const handleResendOtp = async () => {
  if (resendCooldown.value > 0) return

  isLoading.value = true
  error.value = null

  try {
    const res = await apiSendOtp(email.value)

    if (res.status === 'error') {
      error.value = res.message
      return
    }

    otpRef.value = res.data.otp_ref
    otp.value = ['', '', '', '', '', '']
    startResendCooldown()
  } catch {
    error.value = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้'
  } finally {
    isLoading.value = false
  }
}

// ═══════════════════════════════════════════
//  Timers
// ═══════════════════════════════════════════

function startResendCooldown() {
  resendCooldown.value = 60
  clearInterval(resendTimer)
  resendTimer = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) clearInterval(resendTimer)
  }, 1000)
}

function startSuccessCountdown() {
  countdown.value = 5
  clearInterval(countdownTimer)
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownTimer)
      router.push('/login')
    }
  }, 1000)
}

// ─── Navigation ───
const goBack = () => {
  if (currentStep.value === 1 || currentStep.value === 4) {
    router.push('/login')
  } else {
    currentStep.value--
    error.value = null
  }
}

const goLogin = () => {
  clearInterval(countdownTimer)
  router.push('/login')
}

// ─── Cleanup ───
onUnmounted(() => {
  clearInterval(resendTimer)
  clearInterval(countdownTimer)
})
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-bg-login px-4">

    <div class="bg-white w-full max-w-105 rounded-2xl p-8 shadow-(--shadow-login)">

      <!-- ─── Back Button ─── -->
      <button
        v-if="currentStep !== 4"
        @click="goBack"
        class="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary mb-6 transition"
      >
        <AppIcon name="arrow-left" size="16" />
        <span>{{ currentStep === 1 ? 'Back to Sign In' : 'Back' }}</span>
      </button>

      <!-- ─── Step Indicator ─── -->
      <div v-if="currentStep !== 4" class="flex items-center justify-center gap-2 mb-6">
        <div
          v-for="step in 3"
          :key="step"
          class="h-1.5 rounded-full transition-all duration-300"
          :class="step <= currentStep
            ? 'bg-primary w-8'
            : 'bg-gray-200 w-6'"
        />
      </div>

      <!-- ═══ Step 1: Email ═══ -->
      <StepEmail
        v-if="currentStep === 1"
        v-model:email="email"
        :is-loading="isLoading"
        :error="error"
        @submit="handleSendOtp"
      />

      <!-- ═══ Step 2: OTP ═══ -->
      <StepOtp
        v-else-if="currentStep === 2"
        v-model:otp="otp"
        :otp-ref="otpRef"
        :masked-email="maskedEmail"
        :is-loading="isLoading"
        :error="error"
        :resend-cooldown="resendCooldown"
        @submit="handleVerifyOtp"
        @resend="handleResendOtp"
      />

      <!-- ═══ Step 3: New Password ═══ -->
      <StepNewPassword
        v-else-if="currentStep === 3"
        v-model:new-password="newPassword"
        v-model:confirm-password="confirmPassword"
        :is-loading="isLoading"
        :error="error"
        @submit="handleResetPassword"
      />

      <!-- ═══ Step 4: Success ═══ -->
      <StepSuccess
        v-else
        :countdown="countdown"
        @go-login="goLogin"
      />
    </div>

    <!-- Footer -->
    <div class="mt-6 text-center space-y-1">
      <p class="text-xs text-text-tertiary">
        &copy; 2026 IoT MFEC FLOW Platform. All rights reserved.
      </p>
    </div>
  </div>
</template>
