import { defineBoot } from '#q-app/wrappers'

export default defineBoot(({ app }) => {
  app.config.globalProperties.$urlevent = import.meta.env.VITE_EVENT_BASE_URL
  app.config.globalProperties.$urlchat = import.meta.env.VITE_CHAT_BASE_URL
  app.config.globalProperties.$urlauth = import.meta.env.VITE_AUTH_BASE_URL
})
