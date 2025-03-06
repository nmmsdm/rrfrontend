// import Chat from '@/components/Chat/ChatComponent.vue'

const routes = [
  {
    path: '/',
    component: () => import('layouts/LoginLayout.vue'),
    children: [{ name: 'LoginNow', path: '', component: () => import('pages/LoginPage.vue') }],
    meta: { requireGuest: true },
  },
  {
    path: '/dashboard',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('src/pages/CalendarPage.vue') }],
    meta: { requiresAuth: true },
  },
  // {
  //   path: '/chat',
  //   name: 'Chat',
  //   component: Chat,
  // },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
