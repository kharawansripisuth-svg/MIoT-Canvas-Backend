import { image } from '@/assets/image'

export const DEVICE_TABS = [
    { name: 'Overview', image: image.overview },
    { name: 'Grid', image: image.grid },
    { name: 'List', image: image.list }
    
]

export const DEFAULT_DEVICE_FORM = {
    device_name: '',
    device_type: 'sensor',
    device_label: '',
    customer_code: '',
    device_area: '',
    broker: 'mosquitto',
    topic_name: '',
    broker_host: '',
    broker_port: '',
    serial_number: '',
    vendor_name: '',
    location: '',
    description: ''
}