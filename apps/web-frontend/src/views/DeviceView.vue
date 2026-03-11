<script setup>
import { ref, onMounted, computed } from 'vue' // เพิ่ม computed
import { DEVICE_TABS } from '@/constants/device'  
import { getDevices} from '@/services/deviceService'
import searchImg from '@/assets/images/search.png'

// Import Components
import SystemHealth from '@/components/devices/SystemHealth.vue'
import DeviceTable from '@/components/devices/DeviceTable.vue'
import DeviceGrid from '@/components/devices/DeviceGrid.vue'
import DeviceAddModal from '@/components/devices/DeviceAddModal.vue'
import DeviceDetail from '@/components/devices/DeviceDetail.vue'

const activeTab = ref('Overview')
const deviceList = ref([])
const selectedDevice = ref(null)
const showModal = ref(false)
const searchQuery = ref('')

//ฟังก์ชันกรองข้อมูลอุปกรณ์
const filteredDevices = computed(() => {
  if (!searchQuery.value) return deviceList.value
  return deviceList.value.filter(device => 
    device.deviceName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    device.serialNumber.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const systemHealth = ref({ 
  mqtt: { status: 'Connected', latency: '14ms' }, 
  telegraf: { status: 'Active', uptime: '2d 10h' }, 
  influx: { status: 'Healthy', disk: '28%' } 
})

// ดึงข้อมูลจาก API จริง
const fetchData = async () => {
  try {
    deviceList.value = await getDevices()
  } catch (error) {
    console.error('Error fetching devices:', error)
  }
}

const handleDelete = (id) => {
  deviceList.value = deviceList.value.filter(d => d.id !== id)
}

const handleAddSubmit = (newDevice) => {
  deviceList.value.push(newDevice)
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div>
    <div v-if="!selectedDevice" class="max-w-7xl mx-auto p-8 animate-in fade-in duration-500">
      
      <header class="mb-10 text-left">
        <h1 class="device">Devices</h1>
        <p class="text-secondary mt-2 font-medium text-sm">
          จัดการและติดตามสถานะอุปกรณ์ทั้งหมดในระบบของคุณ
        </p>
      </header>

      <nav class="flex items-end justify-between border-b border-border mb-8 gap-4">
        <div class="flex gap-8 overflow-x-auto no-scrollbar self-stretch">
          <button 
            v-for="tab in DEVICE_TABS" :key="tab.name" 
            @click="activeTab = tab.name"
            class="flex items-center gap-3 pb-4 text-sm font-bold transition-all border-b-2 relative whitespace-nowrap self-stretch"
            :class="activeTab === tab.name 
              ? 'border-primary-blue text-primary-blue' 
              : 'border-transparent text-tertiary hover:text-secondary'"
          >
            <img :src="tab.image" class="w-5 h-5 object-contain" :class="activeTab !== tab.name && 'grayscale opacity-50'">
            {{ tab.name }}
          </button>
        </div>

        <div v-if="activeTab !== 'Overview'" class="flex items-center gap-3 mb-3">
          <div class="relative flex items-center">
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Search devices..." 
              class="input-miot py-2 pl-10 pr-4 text-xs w-64 shadow-sm"
            />
            <img 
              :src="searchImg" 
              class="absolute left-3 w-4 h-4 object-contain opacity-40 pointer-events-none"
            >
          </div>

          <button 
            @click="showModal = true" 
            class="btn-primary px-5 py-2.5 text-xs flex items-center gap-2"
          >
            <span class="text-base leading-none">+</span> Add Device
          </button>
        </div>
      </nav>

      <main class="bg-surface rounded-[2rem] border border-border p-8 shadow-sm min-h-[500px]">
        <SystemHealth v-if="activeTab === 'Overview'" :health="systemHealth" :devices="deviceList" />
        <DeviceTable v-if="activeTab === 'List'" :devices="filteredDevices" @select="selectedDevice = $event" @delete="handleDelete" />
        <DeviceGrid v-if="activeTab === 'Grid'" :devices="filteredDevices" @select="selectedDevice = $event" @delete="handleDelete" />
        
        <div v-if="filteredDevices.length === 0 && activeTab !== 'Overview'" class="text-center py-20 text-tertiary">
          ไม่พบข้อมูลอุปกรณ์
        </div>
      </main>
    </div>

    <DeviceDetail v-else :device="selectedDevice" @close="selectedDevice = null" />
    <DeviceAddModal v-if="showModal" @close="showModal = false" @submit="handleAddSubmit" />
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>