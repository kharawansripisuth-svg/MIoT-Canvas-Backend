<script setup>
import { ref } from 'vue'
import { DEFAULT_DEVICE_FORM } from '@/constants/device'
const emit = defineEmits(['close', 'submit'])
const step = ref(1)
const errors = ref({})
const form = ref({ ...DEFAULT_DEVICE_FORM })

const validate = () => {
  errors.value = {}

  if (!form.value.device_label) errors.value.device_label = true
  if (!form.value.device_name) errors.value.device_name = true
  if (!form.value.topic_name) errors.value.topic_name = true

  return Object.keys(errors.value).length === 0
}

const nextStep = () => {
  if (validate()) step.value = 2
}
const submitForm = () => {
  emit('submit', {
    ...form.value,
    id: Date.now().toString(),
    status: 'Online'
  })

  form.value = { ...DEFAULT_DEVICE_FORM }
  step.value = 1
  emit('close')
}
</script>
<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/60 backdrop-blur-sm">
      <div class="w-full max-w-2xl bg-surface rounded-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">

        <!-- Header -->
        <header class="px-8 py-6 border-b border-border flex justify-between items-center bg-surface">
          <h3 class="text-xl font-black text-text-primary tracking-tight">
            {{ step === 1 ? 'Add New Device' : 'Review Details' }}
          </h3>
          <button
            @click="emit('close')"
            class="text-text-tertiary hover:text-secondary text-2xl leading-none">
            &times;
          </button>
        </header>

        <!-- Body -->
        <div class="p-8 max-h-[75vh] overflow-y-auto no-scrollbar">

          <!-- STEP 1 -->
          <div v-if="step === 1" class="space-y-5">

            <!-- Device Name -->
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-text-primary ml-1">
                Device Name <span class="text-error">*</span>
              </label>
              <input
                v-model="form.device_label"
                :class="errors.device_label ? 'border-error' : 'border-border'"
                class="input-miot py-2.5!"
              >
            </div>

            <!-- Model + Type -->
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-text-primary ml-1">
                  Model <span class="text-error">*</span>
                </label>
                <input
                  v-model="form.device_name"
                  :class="errors.device_name ? 'border-error' : 'border-border'"
                  class="input-miot py-2.5!"
                >
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-bold text-text-primary ml-1">
                  Type
                </label>
                <select v-model="form.device_type" class="input-miot py-2.5!">
                  <option value="sensor">Sensor</option>
                  <option value="gateway">Gateway</option>
                </select>
              </div>
            </div>

            <!-- Broker + Serial -->
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-text-primary ml-1">
                  Broker
                </label>
                <select v-model="form.broker" class="input-miot py-2.5!">
                  <option value="mosquitto">Mosquitto</option>
                </select>
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-bold text-text-primary ml-1">
                  Serial No.
                </label>
                <input
                  v-model="form.serial_number"
                  class="input-miot py-2.5!"
                >
              </div>
            </div>

            <!-- Topic + Customer -->
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-text-primary ml-1">
                  Topic <span class="text-error">*</span>
                </label>
                <input
                  v-model="form.topic_name"
                  :class="errors.topic_name ? 'border-error' : 'border-border'"
                  class="input-miot py-2.5!"
                >
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-bold text-text-primary ml-1">
                  Organization Name
                </label>
                <input v-model="form.customer_code" class="input-miot py-2.5!">
              </div>
            </div>

            <!-- Vendor + Tag -->
            <div class="grid grid-cols-2 gap-4">
             <div class="space-y-1.5">
              <label class="text-xs font-bold text-text-primary ml-1">
                 Vendor
              </label>
              <input v-model="form.vendor_name" class="input-miot py-2.5!">
              </div>

              <div class="space-y-1.5">
              <label class="text-xs font-bold text-text-primary ml-1">
                Tag
              </label>
              <input v-model="form.tag" class="input-miot py-2.5!">
              </div>
              </div>

            <!-- Host + Port -->
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-text-primary ml-1">
                  Host
                </label>
                <input v-model="form.broker_host" class="input-miot py-2.5!">
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-bold text-text-primary ml-1">
                  Port
                </label>
                <input v-model="form.broker_port" class="input-miot py-2.5!">
              </div>
            </div>

            <!-- Area + Location -->
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-text-primary ml-1">
                  Area
                </label>
                <select v-model="form.device_area" class="input-miot py-2.5!">
                  <option value="indoor">Indoor</option>
                  <option value="outdoor">Outdoor</option>
                </select>
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-bold text-text-primary ml-1">
                  Location
                </label>
                <input v-model="form.location" class="input-miot py-2.5!">
              </div>
            </div>

            <!-- Description -->
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-text-primary ml-1">
                Description
              </label>
              <textarea
                v-model="form.description"
                rows="3"
                class="input-miot resize-none">
              </textarea>
            </div>

          </div>

          <!-- STEP 2 (Styled Like Old Template + New Data) -->
          <div v-else class="space-y-8 animate-in slide-in-from-right-4 duration-300">

            <div class="flex items-center gap-3 p-4 bg-primary-light text-primary-dark rounded-xl border border-primary-blue/20">
              <div class="w-5 h-5 bg-primary-blue text-white rounded-full flex items-center justify-center text-[10px]">✓</div>
              <p class="text-sm font-medium">Please verify the information below.</p>
            </div>

            <div class="grid grid-cols-2 gap-y-6 gap-x-12 px-2">

              <div>
                <p class="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-1">Device Name</p>
                <p class="font-bold text-text-primary">{{ form.device_label }}</p>
              </div>

              <div>
                <p class="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-1">Model</p>
                <p class="font-bold text-text-primary">{{ form.device_name }}</p>
              </div>

              <div>
                <p class="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-1">Serial No.</p>
                <p class="font-bold text-text-primary">{{ form.serial_number || '-' }}</p>
              </div>

              <div>
                <p class="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-1">Type</p>
                <p class="font-bold text-text-primary uppercase">{{ form.device_type }}</p>
              </div>

              <div>
                <p class="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-1">Broker</p>
                <p class="font-bold text-text-primary uppercase">{{ form.broker }}</p>
              </div>

              <div>
                <p class="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-1">Customer Code</p>
                <p class="font-bold text-text-primary">{{ form.customer_code || '-' }}</p>
              </div>

              <div class="col-span-2">
                <p class="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-1">Topic</p>
                <p class="px-2 py-1 bg-bg-page border border-border rounded w-fit text-sm font-mono text-secondary">
                  {{ form.topic_name }}
                </p>
              </div>

            </div>

            <div class="border-t border-border pt-6 grid grid-cols-2 gap-x-12 gap-y-6 px-2">
              <div>
                <p class="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-1">Host</p>
                <p class="font-bold text-text-primary">{{ form.vendor_name || '-' }}</p>
              </div>

              <div>
                <p class="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-1">Host</p>
                <p class="font-bold text-text-primary">{{ form.tag || '-' }}</p>
              </div>

              <div>
                <p class="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-1">Host</p>
                <p class="font-bold text-text-primary">{{ form.broker_host || '-' }}</p>
              </div>

              <div>
                <p class="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-1">Port</p>
                <p class="font-bold text-text-primary">{{ form.broker_port || '-' }}</p>
              </div>

              <div>
                <p class="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-1">Area</p>
                <p class="font-bold text-text-primary">{{ form.device_area || '-' }}</p>
              </div>

              <div>
                <p class="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-1">Location</p>
                <p class="font-bold text-text-primary">{{ form.location || '-' }}</p>
              </div>

              <div class="col-span-2 mt-4">
                <p class="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-1">Description</p>
                <p class="text-secondary text-sm leading-relaxed">
                  {{ form.description || '-' }}
                </p>
              </div>

            </div>

          </div>
        </div>

        <!-- Footer -->
        <footer class="px-8 py-6 bg-bg-page border-t border-border flex justify-end gap-3">
          <button
            @click="step === 2 ? step = 1 : emit('close')"
            class="px-6 py-2.5 font-bold text-text-tertiary hover:text-secondary transition-colors">
            {{ step === 2 ? 'Go Back' : 'Cancel' }}
          </button>

          <button
            @click="step === 1 ? nextStep() : submitForm()"
            class="btn-primary px-8 py-2.5">
            {{ step === 1 ? 'Next Step' : 'Save' }}
          </button>
        </footer>

      </div>
    </div>
  </Teleport>
</template>
