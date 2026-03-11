import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: MainLayout,
      children: [

        {
          path: '',
          redirect: '/login'
        },

		{
		  path: 'login',
		  name: 'login',
		  component: () => import('../views/auth/LoginPage.vue')
		},

        {
          path: 'devices',
          name: 'devices',
          component: () => import('../views/DeviceView.vue')
        },

		{
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('../views/DashboardView.vue')
        },


      ]
    }
  ]
})

export default router
