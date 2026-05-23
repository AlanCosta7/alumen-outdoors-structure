<template>
  <div
    v-if="imageUrl"
    class="feature-photo"
    role="img"
    aria-label="Alumen Outdoors Structure — completed enclosure project"
  >
    <img
      :src="imageUrl"
      alt="Custom aluminum enclosure completed by Alumen Outdoors Structure"
      loading="lazy"
      decoding="async"
      width="1440"
      height="600"
      class="feature-photo__img"
    />
  </div>
  <div v-else class="feature-photo feature-photo--placeholder" aria-hidden="true" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCmsStore } from 'stores/cms'
import { useImageVariant } from 'src/composables/cms/useImageVariant'

interface ConfigDoc { featureImage?: string }

const store = useCmsStore()

// Original URL from CMS
const originalUrl = computed(() => (store.config as ConfigDoc | null)?.featureImage ?? '')

// Medium variant (900px WebP) — falls back to original while variant resolves
const imageUrl = useImageVariant(originalUrl, 'medium')
</script>

<style scoped lang="scss">
.feature-photo {
  position: relative;
  width: 100%;
  overflow: hidden;
  max-height: 600px;
  line-height: 0;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(black, 0.50);
    pointer-events: none;
  }

  &__img {
    width: 100%;
    height: 600px;
    object-fit: cover;
    object-position: center;

    @media (max-width: 599px) { height: 280px; }
  }

  &--placeholder {
    height: 400px;
    background: linear-gradient(135deg, #252525 0%, #1a1a1a 100%);

    @media (max-width: 599px) { height: 200px; }
  }
}
</style>
