<template>
  <q-layout view="lHh LpR lFf" class="adm-layout">

    <!-- ── Sidebar ──────────────────────────────────────────────────────────── -->
    <q-drawer
      v-model="drawer"
      show-if-above
      :width="220"
      :breakpoint="768"
      class="adm-drawer"
    >
      <!-- Logo / brand -->
      <div class="adm-drawer__brand">
        <span class="adm-drawer__brand-name">Alumen</span>
        <span class="adm-drawer__brand-sub">Painel Admin</span>
      </div>

      <q-separator class="adm-separator" />

      <!-- Nav -->
      <q-list class="adm-nav q-py-sm">
        <q-item
          v-for="item in menu"
          :key="item.link"
          clickable
          v-ripple
          :to="{ name: item.link }"
          active-class="adm-nav__item--active"
          class="adm-nav__item"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" size="18px" />
          </q-item-section>
          <q-item-section>{{ item.label }}</q-item-section>
        </q-item>
      </q-list>

      <q-separator class="adm-separator" />

      <!-- Sign out -->
      <div class="adm-drawer__footer">
        <q-btn
          flat no-caps
          icon="logout"
          label="Sair"
          color="grey-5"
          size="sm"
          class="full-width"
          align="left"
          @click="handleSignOut"
        />
      </div>
    </q-drawer>

    <!-- ── Header ───────────────────────────────────────────────────────────── -->
    <q-header class="adm-header-bar">
      <q-toolbar>
        <q-btn
          flat round dense
          icon="menu"
          color="grey-4"
          class="lt-md q-mr-sm"
          @click="drawer = !drawer"
        />
        <q-toolbar-title class="adm-header-bar__title">
          {{ title }}
        </q-toolbar-title>

        <div v-if="currentUser" class="adm-header-bar__user">
          <q-icon name="account_circle" size="18px" color="grey-5" />
          <span>{{ currentUser.email }}</span>
        </div>
      </q-toolbar>
    </q-header>

    <!-- ── Page content ──────────────────────────────────────────────────────── -->
    <q-page-container class="adm-page-container">
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCmsStore } from 'stores/cms'

const props = withDefaults(defineProps<{
  title?: string
  menu?:  Array<{ label: string; link: string; icon: string }>
}>(), {
  title: 'Admin',
  menu:  () => [],
})

const router  = useRouter()
const store   = useCmsStore()
const drawer  = ref(false)

const currentUser = computed(() => store.currentUser)

async function handleSignOut() {
  await store.signOut()
  void router.push('/admin/login')
}
</script>

<style scoped lang="scss">
.adm-layout { background: $adm-bg; }

// ── Drawer ───────────────────────────────────────────────────────────────────
.adm-drawer {
  background: $adm-surface !important;
  border-right: 1px solid $adm-border !important;

  &__brand {
    display: flex;
    flex-direction: column;
    padding: 20px 20px 16px;
  }

  &__brand-name {
    font-family: $font-family-heading;
    font-size: 17px;
    font-weight: 700;
    color: $adm-text;
    letter-spacing: -0.01em;
  }

  &__brand-sub {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: $adm-text-3;
    margin-top: 2px;
  }

  &__footer {
    padding: 12px 12px 16px;
  }
}

.adm-separator { background: $adm-border; }

// ── Nav ──────────────────────────────────────────────────────────────────────
.adm-nav {
  &__item {
    border-radius: 6px;
    margin: 1px 8px;
    min-height: 38px;
    font-family: $font-family-body;
    font-size: 13px;
    font-weight: 400;
    color: $adm-text-2;
    transition: background 0.15s;

    :deep(.q-icon)          { color: $adm-text-3; transition: color 0.15s; }
    :deep(.q-item__section) { padding: 0 8px 0 0; }

    &:hover {
      background: $adm-surface-2;
      color: $adm-text;
      :deep(.q-icon) { color: $adm-text; }
    }

    &--active {
      background: $adm-accent-dim !important;
      color: $adm-accent !important;
      font-weight: 500;
      :deep(.q-icon) { color: $adm-accent !important; }
    }
  }
}

// ── Header bar ───────────────────────────────────────────────────────────────
.adm-header-bar {
  background: $adm-surface !important;
  border-bottom: 1px solid $adm-border;

  &__title {
    font-family: $font-family-body;
    font-size: 14px;
    font-weight: 500;
    color: $adm-text-2;
  }

  &__user {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: $font-family-body;
    font-size: 12px;
    color: $adm-text-3;
  }
}

// ── Page container ────────────────────────────────────────────────────────────
.adm-page-container {
  background: $adm-bg;
  min-height: 100vh;
}
</style>
