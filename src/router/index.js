import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

import { useAuthStore } from '../stores/auth'

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  Router.beforeEach(async (to, form, next) => {
    const auth = useAuthStore()

    // if (!auth.isAuthenticated) {
    //   await auth.getUser()
    // }

    if (to.matched.some((record) => record.meta.requiresAuth) && !auth.isAuthenticated) {
      next({ name: 'LoginNow', query: { to: to.path } })
    } else if (to.matched.some((record) => record.meta.requireGuest) && auth.isAuthenticated) {
      next('/dashboard/')
    } else {
      next()
    }
  })

  // Router.beforeEach(async (to, from, next) => {
  //   const authStore = useAuthStore();
  //   console.log(to.meta.requiresAuth , !authStore.isAuthenticated)

  //   // Only fetch user if we haven't checked authentication yet
  //   if (!authStore.isAuthenticated) {
  //     console.log("asdas")
  //     await authStore.getUser();
  //   }

  //   // Validate Authentication
  //   if (to.meta.requiresAuth && !authStore.isAuthenticated) {
  //     next('/'); // Redirect to login if not authenticated
  //   } else {
  //     next(); // Allow access
  //   }
  // });

  return Router
})
