<template>
  <q-layout view="hHh lpR fff">
    <q-header>
      <AppTopBar />
      <AppHeader />
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer>
      <AppFooter />
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

// Header: síncrono — visível imediatamente
import AppTopBar from 'components/layout/AppTopBar.vue'
import AppHeader from 'components/layout/AppHeader.vue'

// Footer: lazy — nunca está no first paint
const AppFooter = defineAsyncComponent(() => import('components/layout/AppFooter.vue'))
</script>

<style scoped lang="scss">
// Remove o background padrão do QHeader e QFooter
:deep(.q-header),
:deep(.q-footer) {
  background: transparent;
  box-shadow: none;
}
</style>
