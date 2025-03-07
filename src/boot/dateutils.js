import { date } from 'quasar'

export default ({ app }) => {
  app.config.globalProperties.$formatDate = (value, format = 'YYYY-MM-DD') => {
    return date.formatDate(value, format)
  }

  app.config.globalProperties.$ManualformatTime = (value) => {
    const dateObj = new Date(value)
    let hours = dateObj.getUTCHours()
    const minutes = String(dateObj.getUTCMinutes()).padStart(2, '0')
    const ampm = hours >= 12 ? 'p' : 'a'
    hours = hours % 12 || 12

    return `${hours}:${minutes}${ampm}`
  }

  app.config.globalProperties.$ManualformatDateTime = (value) => {
    const dateObj = new Date(value)
    return `${dateObj.getUTCFullYear()}-${String(dateObj.getUTCMonth() + 1).padStart(2, '0')}-${String(dateObj.getUTCDate()).padStart(2, '0')} ${String(dateObj.getUTCHours()).padStart(2, '0')}:${String(dateObj.getUTCMinutes()).padStart(2, '0')}`
  }
}
