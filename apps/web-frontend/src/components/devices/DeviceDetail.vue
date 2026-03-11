<script setup>
import { ref } from 'vue'

// รับ Props จากหน้าหลัก
// device: ข้อมูลที่เลือกมา
// liveData: ข้อมูลเรียลไทม์
const props = defineProps({
  device: {
    type: Array,
    default: () => [{ device_name: 'Unknown Device', serial_number: 'N/A', is_online: 'Offline' }]
  },
  liveData: {
    type: Array,
    default: () => ({ temp: 25.5, humidity: 45, signal: 85 }) // Mock Data 
  }
})

defineEmits(['close', 'save', 'delete']) //ยิงได้ 3 แบบ ปิด เซฟ ลบ

const innerTab = ref('Dashboard') //สลับ Tab ภายใน (Dashboard, Config, Debug)
</script>

<template>
  <div class="animate-in slide-in-from-bottom-4 duration-500">
    <header class="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
      <div class="max-w-5xl mx-auto flex justify-between items-center">
        <button @click="$emit('close')" class="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-sm group">
          <div class="p-1.5 bg-slate-100 rounded-lg group-hover:bg-slate-200 transition-colors border border-slate-200">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
          </div>
          Back to List
        </button>
        <div class="flex items-center gap-3">
          <span :class="[
            'px-3 py-1 border rounded-full text-[10px] font-black uppercase tracking-widest',
            device.is_online === 'Online' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-400'
          ]">
            {{ device.is_online }}
          </span>
        </div>
      </div>
    </header>

    <main class="max-w-5xl mx-auto px-6 py-10">
      <h1 class="text-4xl font-black text-slate-900 tracking-tight mb-2">{{ device[0].device_name }}</h1>
      <p class="text-sm font-mono text-slate-400 mb-8">SN: {{ device[0].serial_number }}</p>

      <div class="flex p-1 bg-slate-200/50 rounded-xl w-fit mb-8 border border-slate-200">
        <button 
          v-for="t in ['Dashboard', 'Config', 'Debug']" :key="t"
          @click="innerTab = t"
          class="px-6 py-2 rounded-lg text-sm font-bold transition-all"
          :class="innerTab === t ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'"
        >
          {{ t }}
        </button>
      </div>

      <div v-if="innerTab === 'Dashboard'" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div class="p-6 bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/50">
          <div class="flex justify-between items-start mb-4">
             <div class="p-3 bg-orange-50 text-orange-500 rounded-xl border border-orange-100">
               <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
             </div>
             <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Temperature</span>
          </div>
          <div class="flex items-end gap-1">
            <span class="text-5xl font-black text-slate-800 tracking-tighter">{{ liveData.temp }}</span>
            <span class="text-xl font-bold text-slate-300 mb-1">°C</span>
          </div>
        </div>

        <div class="p-6 bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/50">
          <div class="flex justify-between items-start mb-4">
             <div class="p-3 bg-blue-50 text-blue-500 rounded-xl border border-blue-100">
               <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
             </div>
             <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Humidity</span>
          </div>
          <div class="flex items-end gap-1">
            <span class="text-5xl font-black text-slate-800 tracking-tighter">{{ liveData.humidity || 48 }}</span>
            <span class="text-xl font-bold text-slate-300 mb-1">%</span>
          </div>
        </div>

        <div class="p-6 bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/50">
          <div class="flex justify-between items-start mb-4">
             <div class="p-3 bg-emerald-50 text-emerald-500 rounded-xl border border-emerald-100">
               <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/></svg>
             </div>
             <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Signal</span>
          </div>
          <div class="flex items-end gap-1">
            <span class="text-5xl font-black text-slate-800 tracking-tighter">{{ liveData.signal || 92 }}</span>
            <span class="text-xl font-bold text-slate-300 mb-1">%</span>
          </div>
        </div>

      </div>

      <div v-else class="p-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] text-center">
        <p class="text-slate-400 font-medium">Coming soon: {{ innerTab }} settings for {{ device[0].device_name }}</p>
      </div>
    </main>
  </div>
</template>