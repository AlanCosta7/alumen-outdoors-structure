<template>
  <div class="topbar" role="complementary" aria-label="Contact information">
    <div class="topbar__inner max-content">
      <a
        class="topbar__item"
        href="https://maps.google.com/?q=Sarasota+FL"
        target="_blank"
        rel="noopener"
        :aria-label="`Hours: ${config.hoursTopbar}`"
      >
        <q-icon name="schedule" size="14px" />
        <span class="topbar__text gt-xs">{{ config.hoursTopbar }}</span>
      </a>

      <a
        class="topbar__item"
        href="https://maps.google.com/?q=Sarasota+FL"
        target="_blank"
        rel="noopener"
        aria-label="Get directions to Alumen Outdoors Structure"
      >
        <q-icon name="place" size="14px" />
        <span class="topbar__text gt-xs">Get Directions</span>
      </a>

      <a
        class="topbar__item"
        :href="`mailto:${config.email}`"
        :aria-label="`Email us at ${config.email}`"
      >
        <q-icon name="mail_outline" size="14px" />
        <span class="topbar__text gt-sm">{{ config.email }}</span>
      </a>

      <a
        class="topbar__item topbar__item--phone"
        :href="`tel:${config.phoneRaw}`"
        :aria-label="`Call us at ${config.phone}`"
      >
        <q-icon name="phone" size="14px" />
        <span class="topbar__text">{{ config.phone }}</span>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCmsStore } from 'stores/cms'

interface ConfigDoc {
  phone?: string
  phoneRaw?: string
  email?: string
  hoursTopbar?: string
}

const store = useCmsStore()

const config = computed<Required<ConfigDoc>>(() => ({
  phone:      (store.config as ConfigDoc | null)?.phone      ?? '(941) 526-5425',
  phoneRaw:   (store.config as ConfigDoc | null)?.phoneRaw   ?? '+19415265425',
  email:      (store.config as ConfigDoc | null)?.email      ?? 'sales@skywayaluminum.com',
  hoursTopbar:(store.config as ConfigDoc | null)?.hoursTopbar ?? 'Mon–Sat: 7am – 6pm',
}))
</script>

<style scoped lang="scss">
.topbar {
  background-color: $brand-dark;
  height: $topbar-height;
  display: flex;
  align-items: center;

  &__inner {
    display: flex;
    align-items: center;
    gap: 24px;
    justify-content: space-between;

    @media (max-width: 599px) {
      gap: 16px;
      justify-content: space-around;
    }
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 6px;
    color: $brand-silver;
    text-decoration: none;
    font-size: 12px;
    font-family: $font-family-body;
    font-weight: 400;
    transition: color 0.2s;
    white-space: nowrap;
    min-height: 44px; // touch target

    &:hover,
    &:focus-visible {
      color: $brand-white;
      outline: none;
    }

    &:focus-visible {
      outline: 2px solid $brand-green;
      outline-offset: 2px;
      border-radius: 2px;
    }

    &--phone {
      color: $brand-white;
      font-weight: 600;
    }
  }

  &__text {
    line-height: 1;
  }
}
</style>
