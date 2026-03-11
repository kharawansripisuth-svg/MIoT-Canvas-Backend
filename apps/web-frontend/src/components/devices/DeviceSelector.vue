<script setup>
import { computed } from 'vue'
import { useDeviceStore } from '@/stores/deviceStore'

const deviceStore = useDeviceStore()

const selectedId = computed({
  get: () => deviceStore.selectedDeviceId,
  set: (value) => deviceStore.selectDevice(value)
})

const groupedDevices = computed(() => {
  const groups = {}
  deviceStore.devices.forEach(device => {
    const type = device.device_name || 'Other'
    if (!groups[type]) {
      groups[type] = []
    }
    groups[type].push(device)
  })
  return groups
})

const getStatusClass = (status) => {
  switch (status) {
    case 'online': return 'bg-green-500'
    case 'idle': return 'bg-yellow-500'
    default: return 'bg-gray-400'
  }
}
</script>

<template>
  <div class="relative">
    <label class="block text-sm font-medium text-gray-700 mb-1">Select Device</label>
    <select
      v-model="selectedId"
      class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      <option :value="null" disabled>Choose a device...</option>
      <optgroup
        v-for="(devices, type) in groupedDevices"
        :key="type"
        :label="type"
      >
        <option
          v-for="device in devices"
          :key="device.device_id"
          :value="device.device_id"
        >
          {{ device.device_label || `${device.device_name}_${device.device_number}` }}
        </option>
      </optgroup>
    </select>

    <!-- Selected device info -->
    <div v-if="deviceStore.selectedDevice" class="mt-2 flex items-center gap-2 text-sm text-gray-600">
      <span
        :class="getStatusClass(deviceStore.selectedDevice.is_online)"
        class="w-2 h-2 rounded-full"
      ></span>
      <span class="capitalize">{{ deviceStore.selectedDevice.is_online }}</span>
      <span v-if="deviceStore.selectedDevice.location" class="text-gray-400">|</span>
      <span v-if="deviceStore.selectedDevice.location">{{ deviceStore.selectedDevice.location }}</span>
    </div>
  </div>
</template>
