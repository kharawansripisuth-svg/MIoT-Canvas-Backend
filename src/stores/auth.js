/**
 * Auth Store — Pinia (Composition API style)
 *
 *  1. login()  → POST /api/login → เก็บ token + profile
 *  2. logout() → ล้าง state + localStorage
 *  3. isLoggedIn → computed getter
 *
 *  API Response:
 *  Success: { status: "success", data: { token, profile: { member_id, username, role_name } } }
 *  Error:   { status: "error", message: "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง" }
 */
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

// ─── API Base URL (เปลี่ยนตอน deploy จริง) ───
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000'

export const useAuthStore = defineStore('auth', () => {
  // ═══ State ═══
  const token = ref(localStorage.getItem('user-token') || null)
  const profile = ref(JSON.parse(localStorage.getItem('user-profile') || 'null'))
  const isLoading = ref(false)
  const error = ref(null)        // error message string

  // ═══ Getters ═══
  const isLoggedIn = computed(() => !!token.value)

  // ═══ Actions ═══

  /**
   * login — POST /api/login
   * @param {string} username
   * @param {string} password
   * @returns {boolean} success
   */
  async function login(username, password) {
    isLoading.value = true
    error.value = null

    try {
      // ──── Mock Mode ────
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock accounts: admin/1235 หรือ user01/password123
      const mockAccounts = {
        admin:  { password: '1234',        member_id: 1, role_name: 'admin' },
        user01: { password: 'password123', member_id: 2, role_name: 'user' }
      }

      const account = mockAccounts[username]
      if (!account || account.password !== password) {
        error.value = 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง'
        return false
      }

      const json = {
        status: 'success',
        data: {
          token: 'mock-jwt-token-' + Date.now(),
          profile: { member_id: account.member_id, username, role_name: account.role_name }
        }
      }
      // ──── End Mock Mode ────

      // ──── Real API (ลบ Mock Mode ข้างบน แล้ว uncomment อันนี้แทน) ────
      // const res = await fetch(`${API_BASE}/api/login`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ username, password })
      // })
      // const json = await res.json()
      //
      // if (!res.ok || json.status === 'error') {
      //   error.value = json.message || 'เข้าสู่ระบบไม่สำเร็จ'
      //   return false
      // }
      // ──── End Real API ────

      // ─── Success → เก็บ token + profile ───
      token.value = json.data.token
      profile.value = json.data.profile

      localStorage.setItem('user-token', json.data.token)
      localStorage.setItem('user-profile', JSON.stringify(json.data.profile))

      return true
    } catch (err) {
      // Network error / server down
      error.value = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * logout — ล้างทุกอย่าง
   */
  function logout() {
    token.value = null
    profile.value = null
    error.value = null
    localStorage.removeItem('user-token')
    localStorage.removeItem('user-profile')
  }

  /**
   * clearError — ล้าง error message (เช่น ตอน user พิมพ์ใหม่)
   */
  function clearError() {
    error.value = null
  }

  return {
    // state
    token,
    profile,
    isLoading,
    error,
    // getters
    isLoggedIn,
    // actions
    login,
    logout,
    clearError
  }
})
