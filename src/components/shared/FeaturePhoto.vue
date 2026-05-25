<template>
  <div
    class="feature-photo"
    :class="{ 'feature-photo--placeholder': !imageUrl }"
    role="img"
    aria-label="Alumen Outdoors Structure — completed enclosure project"
  >
    <!-- Shimmer visível enquanto a imagem carrega -->
    <div
      v-if="imageUrl"
      class="img-shimmer"
      :class="{ 'img-shimmer--done': imgLoaded }"
    />

    <img
      v-if="imageUrl"
      :src="imageUrl"
      alt="Custom aluminum enclosure completed by Alumen Outdoors Structure"
      loading="lazy"
      decoding="async"
      width="1440"
      height="600"
      :class="['feature-photo__img', { 'is-loaded': imgLoaded }]"
      @load="imgLoaded = true"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCmsStore } from 'stores/cms'
import { useImageVariant } from 'src/composables/cms/useImageVariant'

interface ConfigDoc { featureImage?: string }

const store = useCmsStore()

const originalUrl = computed(() => (store.config as ConfigDoc | null)?.featureImage ?? '')
const imageUrl    = useImageVariant(originalUrl, 'medium')

// Estado reativo — Vue mantém corretamente entre re-renders
const imgLoaded = ref(false)
</script>

<style scoped lang="scss">
.feature-photo {
  position: relative;
  width: 100%;
  overflow: hidden;
  // ⚠ Sem content-visibility aqui — a seção tem imagem e o browser descartaria
  //   a textura GPU ao sair da viewport, causando blank ao rolar de volta.
  line-height: 0;

  // Overlay escuro sobre a foto
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(black, 0.50);
    pointer-events: none;
    z-index: 3;
  }

  &__img {
    position: relative;
    z-index: 2;
    width: 100%;
    height: 600px;
    object-fit: cover;
    object-position: center;
    // Fade-in ao carregar; estado controlado por :class reativo (não classList)
    opacity: 0;
    transition: opacity 0.5s ease;

    &.is-loaded { opacity: 1; }

    @media (max-width: 599px) { height: 280px; }
  }

  &--placeholder {
    height: 400px;
    background: linear-gradient(135deg, #252525 0%, #1a1a1a 100%);

    @media (max-width: 599px) { height: 200px; }
  }
}
</style>
