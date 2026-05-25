<template>
  <header class="app-header" :class="{ 'app-header--scrolled': isScrolled }">
    <div class="app-header__inner max-content">
      <!-- Logo -->
      <router-link to="/" class="app-header__logo" aria-label="Alumen Outdoors Structure — Home">
        <picture>
          <source srcset="/images/logotrans.webp" type="image/webp">
          <img
            src="/images/logotrans.png"
            alt="Alumen Outdoors Structure"
            width="133"
            height="52"
            loading="eager"
            fetchpriority="high"
          />
        </picture>
      </router-link>

      <!-- Nav desktop -->
      <nav class="app-header__nav gt-sm" aria-label="Main navigation">
        <router-link class="nav-link" to="/" exact-active-class="nav-link--active">HOME</router-link>
        <router-link class="nav-link" to="/about" active-class="nav-link--active">ABOUT</router-link>

        <!-- Services dropdown -->
        <div class="nav-link nav-link--dropdown" tabindex="0" @keydown.enter="servicesMenuRef?.show()">
          SERVICES
          <q-icon name="keyboard_arrow_down" size="16px" />
          <q-menu ref="servicesMenuRef" anchor="bottom left" self="top left" :offset="[0, 4]" class="nav-dropdown">
            <q-list>
              <q-item
                v-for="service in services"
                :key="service.slug"
                :to="`/services/${service.slug}`"
                clickable
                v-close-popup
                class="nav-dropdown__item"
              >
                <q-item-section>{{ service.title }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </div>

        <!-- Projects dropdown -->
        <div class="nav-link nav-link--dropdown" tabindex="0" @keydown.enter="projectsMenuRef?.show()">
          PROJECTS
          <q-icon name="keyboard_arrow_down" size="16px" />
          <q-menu ref="projectsMenuRef" anchor="bottom left" self="top left" :offset="[0, 4]" class="nav-dropdown">
            <q-list>
              <q-item to="/projects" clickable v-close-popup class="nav-dropdown__item">
                <q-item-section>All Projects</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </div>

        <router-link class="nav-link" to="/contact" active-class="nav-link--active">CONTACT</router-link>
      </nav>

      <!-- Hamburguer mobile -->
      <q-btn
        flat
        round
        dense
        class="app-header__burger lt-md"
        icon="menu"
        aria-label="Open navigation menu"
        :aria-expanded="drawerOpen"
        @click="drawerOpen = true"
      />
    </div>
  </header>

  <!-- Mobile drawer -->
  <q-drawer
    v-model="drawerOpen"
    side="right"
    overlay
    behavior="mobile"
    :width="280"
    class="mobile-nav"
    aria-label="Mobile navigation"
  >
    <div class="mobile-nav__header">
      <picture>
        <source srcset="/images/logo.webp" type="image/webp">
        <img src="/images/logo.png" alt="Alumen Outdoors Structure" width="140" height="46" />
      </picture>
      <q-btn flat round dense icon="close" aria-label="Close menu" @click="drawerOpen = false" />
    </div>

    <q-list class="mobile-nav__list">
      <q-item to="/" exact clickable v-close-popup class="mobile-nav__item">
        <q-item-section>HOME</q-item-section>
      </q-item>

      <q-item to="/about" clickable v-close-popup class="mobile-nav__item">
        <q-item-section>ABOUT</q-item-section>
      </q-item>

      <q-expansion-item label="SERVICES" header-class="mobile-nav__item mobile-nav__item--expand">
        <q-item
          v-for="service in services"
          :key="service.slug"
          :to="`/services/${service.slug}`"
          clickable
          v-close-popup
          class="mobile-nav__item mobile-nav__item--sub"
        >
          <q-item-section>{{ service.title }}</q-item-section>
        </q-item>
      </q-expansion-item>

      <q-item to="/projects" clickable v-close-popup class="mobile-nav__item">
        <q-item-section>PROJECTS</q-item-section>
      </q-item>

      <q-item to="/contact" clickable v-close-popup class="mobile-nav__item">
        <q-item-section>CONTACT</q-item-section>
      </q-item>
    </q-list>

    <div class="mobile-nav__footer">
      <a href="tel:+19415265425" class="mobile-nav__phone">
        <q-icon name="phone" size="16px" />
        (941) 526-5425
      </a>
    </div>
  </q-drawer>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { QMenu } from 'quasar'

const drawerOpen = ref(false)
const isScrolled = ref(false)
const servicesMenuRef = ref<InstanceType<typeof QMenu> | null>(null)
const projectsMenuRef = ref<InstanceType<typeof QMenu> | null>(null)

const services = [
  { slug: 'custom-pool-cage-installation',     title: 'Custom Pool Cage Installation' },
  { slug: 'extended-lanai-construction',        title: 'Extended Lanai Construction' },
  { slug: 'front-back-porch-enclosures',        title: 'Front & Back Porch Enclosures' },
  { slug: 'full-pool-cage-lanai-rescreening',   title: 'Full Pool Cage & Lanai Rescreening' },
  { slug: 'pool-cage-painting-restoration',     title: 'Pool Cage Painting & Restoration' },
  { slug: 'screen-repair-individual-panels',    title: 'Screen Repair (Individual Panels)' },
]

// Throttled to one rAF per scroll event — prevents running 60 × per second
let _rafId: number | null = null
function onScroll() {
  if (_rafId !== null) return
  _rafId = requestAnimationFrame(() => {
    isScrolled.value = window.scrollY > 20
    _rafId = null
  })
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  if (_rafId !== null) cancelAnimationFrame(_rafId)
})
</script>

<style scoped lang="scss">
.app-header {
  background-color: rgba($brand-dark, 0.75);
  height: $header-height;
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
  transition: box-shadow 0.3s;

  &--scrolled {
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.4);
  }

  &__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__logo {
    display: flex;
    align-items: center;
    flex-shrink: 0;

    img { height: 52px; width: auto; max-width: none; }

    &:focus-visible {
      outline: 2px solid $brand-green;
      outline-offset: 4px;
      border-radius: 2px;
    }
  }

  &__nav {
    display: flex;
    align-items: center;
    gap: 32px;
  }

  &__burger {
    color: $brand-white !important;
    font-size: 24px;
  }
}

// Nav links
.nav-link {
  color: $brand-silver;
  text-decoration: none;
  font-family: $font-family-body;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.08em;
  transition: color 0.2s;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px 0;
  border-bottom: 2px solid transparent;
  white-space: nowrap;

  &:hover,
  &:focus-visible {
    color: $brand-white;
    outline: none;
  }

  &:focus-visible {
    border-bottom-color: $brand-green;
  }

  &--active {
    color: $brand-white;
    border-bottom-color: $brand-green;
  }

  &--dropdown {
    user-select: none;

    &:hover { color: $brand-white; }
  }
}

// Dropdown menu
:deep(.nav-dropdown) {
  background-color: $brand-dark;
  border-radius: 0;
  min-width: 260px;

  .nav-dropdown__item {
    color: $brand-silver;
    font-family: $font-family-body;
    font-size: 13px;
    letter-spacing: 0.04em;
    border-left: 2px solid transparent;
    transition: color 0.15s, border-color 0.15s;

    &:hover {
      color: $brand-white;
      border-left-color: $brand-green;
      background: rgba(255, 255, 255, 0.04);
    }
  }
}

// Mobile drawer
.mobile-nav {
  background-color: $brand-dark !important;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid rgba($brand-silver, 0.15);

    :deep(.q-btn) { color: $brand-silver; }
  }

  &__list { padding: 8px 0; }

  &__item {
    color: $brand-silver !important;
    font-family: $font-family-body;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.1em;
    min-height: 52px;

    &--sub {
      font-size: 12px;
      padding-left: 32px;
      min-height: 44px;
    }

    &--expand :deep(.q-item__label) {
      color: $brand-silver;
      font-family: $font-family-body;
      font-size: 13px;
      font-weight: 500;
      letter-spacing: 0.1em;
    }
  }

  &__footer {
    padding: 20px;
    border-top: 1px solid rgba($brand-silver, 0.15);
    margin-top: auto;
  }

  &__phone {
    display: flex;
    align-items: center;
    gap: 8px;
    color: $brand-white;
    text-decoration: none;
    font-family: $font-family-body;
    font-weight: 600;
    font-size: 15px;
  }
}
</style>
