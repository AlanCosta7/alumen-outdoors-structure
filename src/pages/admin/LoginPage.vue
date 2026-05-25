<template>
  <q-page class="login-page flex flex-center">
    <div class="login-card">

      <div class="login-card__brand">
        <p class="login-card__overline">Admin</p>
        <h1 class="login-card__title">Alumen Outdoors</h1>
      </div>

      <q-form @submit.prevent="handleLogin" class="login-card__form">
        <q-input
          v-model="email"
          type="email"
          label="E-mail"
          filled dark dense
          autocomplete="username"
          :rules="[v => !!v || 'Campo obrigatório']"
          class="q-mb-md"
        >
          <template #prepend>
            <q-icon name="email" color="grey-6" />
          </template>
        </q-input>

        <q-input
          v-model="password"
          :type="showPass ? 'text' : 'password'"
          label="Senha"
          filled dark dense
          autocomplete="current-password"
          :rules="[v => !!v || 'Campo obrigatório']"
          class="q-mb-lg"
        >
          <template #prepend>
            <q-icon name="lock" color="grey-6" />
          </template>
          <template #append>
            <q-icon
              :name="showPass ? 'visibility_off' : 'visibility'"
              color="grey-6"
              class="cursor-pointer"
              @click="showPass = !showPass"
            />
          </template>
        </q-input>

        <q-btn
          unelevated no-caps
          type="submit"
          label="Entrar"
          color="positive"
          text-color="dark"
          :loading="loading"
          class="full-width login-card__btn"
        />
      </q-form>

    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCmsStore } from 'stores/cms'

const store    = useCmsStore()
const router   = useRouter()
const route    = useRoute()

const email    = ref('')
const password = ref('')
const showPass = ref(false)
const loading  = ref(false)

async function handleLogin() {
  loading.value = true
  try {
    const user = await store.signIn({ email: email.value, password: password.value })
    if (user) {
      // Redireciona para a rota que acionou o guard (se houver), senão para config
      const redirect = typeof route.query.redirect === 'string'
        ? route.query.redirect
        : '/admin/config'
      void router.push(redirect)
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.login-page {
  background: $adm-bg;
  min-height: 100vh;
}

.login-card {
  width: 100%;
  max-width: 360px;
  padding: 0 16px;

  &__brand {
    text-align: center;
    margin-bottom: 32px;
  }

  &__overline {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: $adm-accent;
    margin: 0 0 8px;
    font-family: $font-family-body;
  }

  &__title {
    font-family: $font-family-heading;
    font-size: 24px;
    font-weight: 700;
    color: $adm-text;
    margin: 0;
    letter-spacing: -0.01em;
  }

  &__form { display: flex; flex-direction: column; }

  &__btn {
    font-size: 14px;
    font-weight: 500;
    min-height: 44px;
    border-radius: 6px;
  }
}
</style>
