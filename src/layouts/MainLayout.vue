<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> Meeting Room Reservation </q-toolbar-title>

        <div><q-btn flat icon="logout" aria-label="logout" label="Logout" @click="Logout()" /></div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> Navigator </q-item-label>

        <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import EssentialLink from 'components/EssentialLink.vue'
import { useAuthStore } from 'src/stores/auth'
import { useRouter } from 'vue-router'
import { LocalStorage, useQuasar, QSpinnerHourglass } from 'quasar'

const authDestroy = useAuthStore()
const router = useRouter()
const loader = useQuasar()

const linksList = [
  {
    title: 'Dashboard',
    caption: 'Calendar Event',
    icon: 'dashboard',
    link: '/dashboard',
  },
]

const leftDrawerOpen = ref(false)

const Logout = async () => {
  showLoading()
  await authDestroy.logout()
  setTimeout(() => {
    LocalStorage.remove('auth')
    showLoading(false)
    router.push('/')
  }, 3000)
}

const showLoading = (eventtype = true) => {
  if (eventtype) {
    loader.loading.show({
      spinner: QSpinnerHourglass,
      spinnerSize: 50,
      message: 'Please wait...',
      messageColor: 'white',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      spinnerColor: 'white',
    })
  } else {
    loader.loading.hide()
  }
}

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
