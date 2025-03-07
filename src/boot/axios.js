import { defineBoot } from '#q-app/wrappers'
import { useAuthStore } from 'src/stores/auth'
import axios from 'axios'

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // 'http://localhost:8000',
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
  withCredentials: true, // Important to send cookies
})

export default defineBoot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
})

api.interceptors.response.use(
  async (response) => response,
  async (error) => {
    const status = error.response.status
    const authStore = useAuthStore()
    if (status === 401) {
      // Access token has expired
      try {
        const res = await authStore.refreshToken()

        // Retry the original request with the new access token
        if (res.status === 200) {
          const config = error.config
          return await api.request(config)
        }
      } catch {
        console.warn(error.message)
        authStore.checkedAuth = false
      }
    } else {
      if (!status === 404) {
        await authStore.logout()
        localStorage.removeItem('auth')
        authStore.checkedAuth = false
      }
    }

    return Promise.reject(error)
  },
)

// let failedAttempts = Number(localStorage.getItem('failedAttempts')) || 0

// if (failedAttempts >= 3) {
//   localStorage.setItem('failedAttempts', 0) // Reset on hard reload
// }

// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     if (error.response && error.response.status === 401) {
//       const authStore = useAuthStore()
//       const originalRequest = error.config

//       if (originalRequest._retry) {
//         return Promise.reject(error)
//       }

//       if (failedAttempts < 3) {
//         failedAttempts++
//         localStorage.setItem('failedAttempts', failedAttempts) // Save to localStorage

//         originalRequest._retry = true

//         try {
//           await authStore.refreshToken()
//           return api.request(originalRequest)
//         } catch (refreshError) {
//           return Promise.reject(refreshError)
//         }
//       } else {
//         await authStore.logout()
//         failedAttempts = 0
//         localStorage.setItem('failedAttempts', 0)
//         return Promise.reject(error)
//       }
//     }

//     return Promise.reject(error)
//   },
// )

export { api }
