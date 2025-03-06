<template>
  <q-page class="flex flex-center">
    <q-card class="w-96 shadow-lg rounded-2xl p-6">
      <q-card-section class="text-center">
        <q-avatar size="56px">
          <q-icon name="person" size="56px" />
        </q-avatar>
        <div class="text-h6 q-mt-md">Welcome Back</div>
      </q-card-section>
      <q-form @submit="login" class="q-gutter-md">
        <q-card-section>
          <q-input
            v-model="email"
            label="Email/Username"
            type="string"
            lazy-rules
            :rules="[
              (val) => !!val || 'Email or Username is required',
              (val) => val.length >= 3 || 'Must be at least 3 characters',
            ]"
          />

          <q-input
            v-model="password"
            label="Password"
            type="password"
            lazy-rules
            :rules="[(val) => !!val || 'Password is required']"
          />
          <p></p>
          <q-btn
            label="Login"
            type="submit"
            color="primary"
            class="full-width"
            :loading="loading"
            :disable="loading"
          />
        </q-card-section>
      </q-form>

      <q-card-section class="text-center q-mt-md">
        <q-btn flat label="Forgot Password?" color="blue-6" />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export default {
  data() {
    return {
      email: '',
      password: '',
      loading: false,
    }
  },
  setup() {
    return {
      router: useRouter(),
      authStore: useAuthStore(),
    }
  },
  methods: {
    async login() {
      this.loading = true
      try {
        await this.authStore.login(this.email, this.password)
        if (this.authStore.isAuthenticated) {
          this.router.push('/dashboard')
        }

        if (this.authStore.message) {
          this.$q.notify({
            message: this.authStore.message.response.data.error,
            color: 'negative',
            icon: 'warning',
            position: 'bottom',
          })
        }
      } catch (error) {
        console.error('Login failed', error)
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
.w-96 {
  width: 24rem;
}
</style>
