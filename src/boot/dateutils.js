import { date } from 'quasar'

export default ({ app }) => {
  app.config.globalProperties.$formatDate = (value, format = 'YYYY-MM-DD') => {
    return date.formatDate(value, format)
  }

  app.config.globalProperties.$formatDateTime = (value, format = 'YYYY-MM-DD HH:mm') => {
    return date.formatDate(value, format)
  }
}
