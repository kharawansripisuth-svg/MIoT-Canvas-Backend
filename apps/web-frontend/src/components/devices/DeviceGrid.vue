<script setup>
defineProps(['devices'])
defineEmits(['select', 'delete'])
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    <div v-for="device in devices" :key="device.device_id" @click="$emit('select', device)"
      class="group relative flex flex-col justify-between p-5 h-full bg-white border border-slate-200 rounded-2xl cursor-pointer transition-all hover:shadow-xl hover:border-blue-200">
      <div>
        <div class="flex justify-between items-start mb-4">
          <div class="w-12 h-12 flex items-center justify-center bg-blue-50 border border-blue-100 rounded-xl text-blue-600 font-black text-xl">
            {{ device.device_name ? device.device_name.charAt(0) : 'D' }}
          </div>
          
          <span class="relative flex h-3 w-3">
            <span 
              :class="device.status === 'Online' ? 'bg-success' : 'bg-error'"
            ></span>
            <span 
              class="relative inline-flex rounded-full h-3 w-3" 
              :class="device.status === 'Online' ? 'bg-success' : 'bg-error'"
            ></span>
          </span>
        </div>

        <h3 class="font-bold text-primary group-hover:text-primary-blue transition-colors">
          {{ device.deviceName }}
        </h3>
        
        <p class="mt-1 text-[10px] font-bold uppercase tracking-wider text-tertiary">
          {{ device.deviceType }}
        </p>

        <div class="mt-4 text-[11px] text-secondary space-y-1">
          <p v-if="device.location" class="flex items-center gap-2"> {{ device.location }}</p>
          <p v-if="device.serialNumber" class="flex items-center gap-2"> {{ device.serialNumber }}</p>
        </div>
      </div>

      <div class="flex items-center gap-2 mt-6 border-t border-border/30 pt-4">
        <button class="flex-1 py-2 bg-page rounded-lg text-xs font-bold text-secondary transition-all hover:bg-primary-blue hover:text-white">
          Manage Device
        </button>
        
        <button 
          @click.stop="$emit('delete', device.id)" 
          class="p-2 text-tertiary opacity-0 group-hover:opacity-100 hover:text-error transition-all rounded-lg hover:bg-error/10"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>