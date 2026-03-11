import {createRouter, createWebHistory} from 'vue-router'

import MainLayout from '../views/MainLayoutView.vue'
import LoginView from '../views/Login/LoginView.vue'
import ForgotPasswordView from '../views/Login/ForgotPasswordView.vue'
import DeviceView from '../views/Device/DeviceView.vue'
import DashboardView from '../views/Dashboard/DashboardView.vue'
import RulesView from '../views/Rules/RulesView.vue'
import ZoneView from '../views/Zone/ZoneView.vue'
import ReportView from '../views/Report/ReportView.vue'
import LogsView from '../views/Logs/LogsView.vue'
import MemberView from '../views/Member/MemberView.vue'

const routes = [
	{
		path: '/login',
		name: 'Login',
		component: LoginView,
		meta: { requiresAuth: false }
	},
	{
		path: '/forgot-password',
		name: 'ForgotPassword',
		component: ForgotPasswordView,
		meta: { requiresAuth: false }
	},
	{
		path: '/',
		component: MainLayout,
		meta: { requiresAuth: true },
		children: [
			{
				path: '',
				redirect: '/device'
			},
			{
				path: 'device',
				name: 'Device',
				component: DeviceView
			},
			{
				path: 'dashboard',
				name: 'Dashboard',
				component: DashboardView
			},
			{
				path: 'rules',
				name: 'Rules',
				component: RulesView
			},
			{
				path: 'zone',
				name: 'Zone',
				component: ZoneView
			},
			{
				path: 'report',
				name: 'Report',
				component: ReportView
			},
			{
				path: 'logs',
				name: 'Logs',
				component: LogsView
			},
			{
				path: 'member',
				name: 'Member',
				component: MemberView
			}
		]
	}
]

const router = createRouter({
  history: createWebHistory(),
  routes
})


router.beforeEach((to, from) => {
  // 1. จำลองการเช็คว่ามี Token หรือไม่ (ในของจริงมักจะดึงจาก localStorage หรือ Pinia/Vuex)
  // ตอนนี้เราเช็คแบบง่ายๆ ดูก่อนว่ามีค่า 'user-token' ใน localStorage ไหม
  const isAuthenticated = localStorage.getItem('user-token')

  // 2. เช็คว่าหน้าที่กำลังจะไป (to) ต้องการการ Auth ไหม
  // to.matched.some(...) คือการเช็คทะลุไปถึง route แม่ (MainLayout) ว่าแปะ meta.requiresAuth ไว้ไหม
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  // 3. กฎเหล็กของ รปภ.
  if (requiresAuth && !isAuthenticated) {
    // ถ้าหน้าต้อง Login แต่ดันไม่มี Token -> เตะกลับไปหน้า Login
    return { name: 'Login' }
  } else if (to.name === 'Login' && isAuthenticated) {
    // ถ้ามี Token แล้ว (Login แล้ว) แต่พยายามเข้าหน้า Login อีก -> เด้งไป Dashboard เลย
    return { name: 'Device' }
  }

  // ถ้าผ่านเงื่อนไขด้านบนมาได้ ก็ปล่อยให้เข้าหน้าปกติ (Vue Router 4 แนะนำให้ปล่อยผ่านโดยไม่ต้อง return อะไร)
})

export default router
