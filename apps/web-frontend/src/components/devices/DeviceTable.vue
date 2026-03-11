<script setup>
defineProps(['devices'])
defineEmits(['select', 'delete'])
</script>

<template>
  <div class="w-full overflow-x-auto">
    <table class="w-full text-left border-collapse whitespace-nowrap">
      <thead>
        <tr class="text-[10px] font-bold uppercase tracking-widest text-tertiary border-b border-border">
          <th class="px-6 py-4 font-bold">Device Name</th>
          <th class="px-6 py-4 font-bold">Type</th>
          <th class="px-6 py-4 font-bold">Broker</th>
          <th class="px-6 py-4 font-bold">Location</th>
          <th class="px-6 py-4 font-bold">Serial No.</th>
          <th class="px-6 py-4 font-bold">Status</th>
          <th class="px-6 py-4 text-right font-bold">Action</th>
        </tr>
      </thead>
      <tbody class="text-sm divide-y divide-slate-100">
        <tr v-for="device in devices" :key="device.id" @click="$emit('select', device)" 
            class="group cursor-pointer hover:bg-blue-50/50 transition-colors">
          <td class="px-6 py-4 font-bold text-slate-700">{{ device.device_name }}</td>
          <td class="px-6 py-4">
            <span class="px-2 py-0.5 border border-border rounded bg-page text-[10px] font-bold uppercase text-secondary">
              {{ device.deviceType }}
            </span>
          </td>

          <td class="px-6 py-4 text-secondary">{{ device.broker || '-' }}</td>
          <td class="px-6 py-4 text-secondary">{{ device.location || '-' }}</td>

          <td class="px-6 py-4 font-mono text-xs text-tertiary">
            {{ device.serialNumber }}
          </td>

          <td class="px-6 py-4">
            <div class="flex items-center gap-2">
              <span 
                class="w-2 h-2 rounded-full animate-pulse" 
                :class="device.status === 'Online' ? 'bg-success' : 'bg-error'"
              ></span>
              <span 
                class="font-medium" 
                :class="device.status === 'Online' ? 'text-success' : 'text-error'"
              >
                {{ device.status }}
              </span>
            </div>
          </td>

          <td class="px-6 py-4 text-right">
            <button 
              @click.stop="$emit('delete', device.id)" 
              class="p-2 text-tertiary hover:text-error transition-colors rounded-lg hover:bg-error/10"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>