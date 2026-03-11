<script setup>
import { image } from '@/assets/image' 

defineProps({
  health: {
    type: Object,
    default: () => ({
      mqtt: { status: 'Connected', latency: '12ms' },
      telegraf: { status: 'Running', uptime: '1d 2h' },
      influx: { status: 'Healthy', disk: '24%' }
    })
  },
  devices: {
    type: Array,
    default: () => []
  }
})
</script> 
<template>
  <section class="space-y-12">
    
    <div class="space-y-6">
      <h3 class="flex items-center gap-2 text-lg font-bold text-primary">
        System Health
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="flex items-center gap-4 p-5 bg-surface border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
          <div class="w-14 h-14 p-3 bg-primary-light rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
            <img :src="image.broker" class="w-full h-full object-contain" alt="Broker">
          </div>
          <div>
            <p class="text-[10px] font-bold text-tertiary uppercase tracking-widest">MQTT Broker</p>
            <h4 class="text-lg font-black text-primary">{{ health?.mqtt?.status || 'Offline' }}</h4>
            <p class="text-xs text-secondary font-medium">Latency: {{ health?.mqtt?.latency || '-' }}</p>
          </div>
        </div>

        <div class="flex items-center gap-4 p-5 bg-surface border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
          <div class="w-14 h-14 p-3 bg-maintenance/10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
            <img :src="image.telegraf || image.broker" class="w-full h-full object-contain" alt="Telegraf">
          </div>
          <div>
            <p class="text-[10px] font-bold text-tertiary uppercase tracking-widest">Telegraf</p>
            <h4 class="text-lg font-black" :class="health?.telegraf?.status === 'Error' ? 'text-error' : 'text-primary'">
              {{ health?.telegraf?.status || 'Offline' }}
            </h4>
            <p class="text-xs text-secondary font-medium">Uptime: {{ health?.telegraf?.uptime || '-' }}</p>
          </div>
        </div>

        <div class="flex items-center gap-4 p-5 bg-surface border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
          <div class="w-14 h-14 p-3 bg-error/10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
            <img :src="image.influx" class="w-full h-full object-contain" alt="InfluxDB">
          </div>
          <div>
            <p class="text-[10px] font-bold text-tertiary uppercase tracking-widest">InfluxDB</p>
            <h4 class="text-lg font-black" :class="health?.influx?.status === 'Error' ? 'text-error' : 'text-primary'">
              {{ health?.influx?.status || 'Offline' }}
            </h4>
            <p class="text-xs text-secondary font-medium">Disk Usage: {{ health?.influx?.disk || '-' }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="space-y-6">
      <h3 class="flex items-center gap-2 text-lg font-bold text-primary">
        Devices Summary
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="p-6 bg-surface border border-border rounded-2xl shadow-sm">
          <p class="text-[10px] font-bold text-tertiary uppercase tracking-widest mb-1">Total Devices</p>
          <h4 class="text-3xl font-black text-primary-blue">{{ devices?.length || 0 }}</h4> 
        </div>

        <div class="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm border-l-4 border-l-green-500">
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Online</p>
          <h4 class="text-3xl font-black text-green-600">{{ devices?.filter(d => d.is_online === 'Online').length || 0 }}</h4>
        </div>

        <div class="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm border-l-4 border-l-red-500">
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Offline</p>
          <h4 class="text-3xl font-black text-red-600">{{ devices?.filter(d => d.is_online !== 'Online').length || 0 }}</h4>
        </div>
      </div>
    </div>

  </section>
</template>