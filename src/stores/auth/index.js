import { defineStore } from 'pinia'
import { api } from 'boot/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    checkedAuth: false,
    message: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
  },
  actions: {
    async login(email, password) {
      try {
        this.message = null
        await api.post('api/auth/login/', { email, password })
        await this.getUser()
        this.checkedAuth = true
        // api.defaults.headers.common['X-CSRFToken'] = this.getCookie('csrftoken')
      } catch (error) {
        this.message = error
        this.checkedAuth = false
        console.error('Login failed', error)
      }
    },
    async logout() {
      try {
        await api.post('api/auth/logout/')
        this.user = null
        this.checkedAuth = false
      } catch (error) {
        console.error('Logout failed:', error)
      } finally {
        console.log('Clearing auth cookies and storage...')
      }
    },
    async getUser() {
      try {
        const res = await api.get('api/auth/user/profile/')
        this.user = res.data
        this.checkedAuth = true
      } catch (error) {
        console.error('User not authenticated', error.code)
        this.checkedAuth = false
      }
    },
    async refreshToken() {
      try {
        const res = await api.post('api/auth/token/refresh/')
        return res
      } catch (error) {
        console.error('Session expired, please log in again.', error.message)
      }
    },
    // startAutoRefresh() {
    //   if (this.refreshInterval) {
    //     clearInterval(this.refreshInterval)
    //   }

    //   this.refreshInterval = setInterval(
    //     () => {
    //       this.refreshToken()
    //       console.log('sdasdasdas refresh')
    //     },
    //     1 * 60 * 1000,
    //   )
    // },
    // getCookie(name) {
    //   let cookieValue = null;
    //   if (document.cookie && document.cookie !== "") {
    //     const cookies = document.cookie.split(";");
    //     for (let i = 0; i < cookies.length; i++) {
    //       const cookie = cookies[i].trim();
    //       if (cookie.startsWith(name + "=")) {
    //         cookieValue = cookie.substring(name.length + 1);
    //         break;
    //       }
    //     }
    //   }
    //   return cookieValue;
    // }
  },
  persist: {
    enabled: true, // Keeps state for new tabs & refreshes
    // strategies: [
    //   {
    //     key: 'auth', // Storage key
    //     storage: localStorage, // Use localStorage to persist across tabs
    //   },
    // ],
  },
})
