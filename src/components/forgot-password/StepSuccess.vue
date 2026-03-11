<!--
  Step 4: เปลี่ยนรหัสสำเร็จ + countdown → redirect กลับ login
  Props: countdown
  Emits: go-login
-->
<script setup>
import AppIcon from '@/components/AppIcon.vue'

defineProps({
  countdown: { type: Number, default: 5 }
})

const emit = defineEmits(['go-login'])
</script>

<template>
  <div class="text-center py-4">
    <div class="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
      <AppIcon name="check" size="28" class="text-(--color-success)" />
    </div>
    <h2 class="text-lg font-semibold text-text-primary mb-2">
      Password Changed!
    </h2>
    <p class="text-sm text-text-tertiary">
      Your password has been changed successfully.
    </p>
    <p class="text-sm text-text-tertiary mt-1">
      Redirecting to login in <strong class="text-primary">{{ countdown }}</strong> seconds...
    </p>
    <button
      @click="emit('go-login')"
      class="mt-6 w-full bg-primary text-white py-2.5 rounded-lg font-semibold text-sm
             hover:bg-primary-hover transition"
    >
      Back to Sign In
    </button>
  </div>
</template>
