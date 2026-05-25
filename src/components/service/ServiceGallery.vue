<template>
  <!-- Gallery with photos -->
  <section
    v-if="photos.length"
    class="gallery"
    :aria-label="`${serviceTitle} photo gallery`"
  >
    <div class="gallery__shell">

      <!-- Prev arrow -->
      <button
        class="gallery__nav gallery__nav--prev"
        :class="{ 'gallery__nav--hidden': totalPages <= 1 }"
        :disabled="currentPage === 0"
        aria-label="Previous photos"
        @click="prevPage"
      >
        <q-icon name="arrow_back" size="18px" />
      </button>

      <!-- 3 × 2 grid -->
      <div class="gallery__grid" role="list">
        <button
          v-for="(photo, i) in visiblePhotos"
          :key="`${currentPage}-${i}`"
          class="gallery__item"
          role="listitem"
          :aria-label="`View photo ${currentPage * PAGE_SIZE + i + 1} of ${photos.length}`"
          @click="open(currentPage * PAGE_SIZE + i)"
        >
          <!-- Shimmer enquanto a variante medium carrega -->
          <div
            class="img-shimmer"
            :class="{ 'img-shimmer--done': loadedPhotos[photo] }"
          />
          <img
            :src="mediumMap[photo] ?? photo"
            :alt="`${serviceTitle} — photo ${currentPage * PAGE_SIZE + i + 1}`"
            loading="lazy"
            decoding="async"
            width="360"
            height="270"
            :class="['gallery__img', { 'is-loaded': loadedPhotos[photo] }]"
            @load="onPhotoLoad(photo)"
          />
          <div class="gallery__overlay" aria-hidden="true">
            <q-icon name="search" size="26px" class="gallery__zoom" />
          </div>
        </button>
      </div>

      <!-- Next arrow -->
      <button
        class="gallery__nav gallery__nav--next"
        :class="{ 'gallery__nav--hidden': totalPages <= 1 }"
        :disabled="currentPage >= totalPages - 1"
        aria-label="Next photos"
        @click="nextPage"
      >
        <q-icon name="arrow_forward" size="18px" />
      </button>

    </div>

    <!-- ── Lightbox ─────────────────────────────────────────────────────────── -->
    <q-dialog v-model="lightboxOpen" maximized transition-show="fade" transition-hide="fade">
      <div class="lightbox" @click.self="lightboxOpen = false">

        <button class="lightbox__close" aria-label="Close gallery" @click="lightboxOpen = false">
          <q-icon name="close" size="24px" />
        </button>

        <p class="lightbox__counter" aria-live="polite">
          {{ activeIndex + 1 }} / {{ photos.length }}
        </p>

        <div class="lightbox__stage">
          <img
            :src="photos[activeIndex]"
            :alt="`${serviceTitle} — photo ${activeIndex + 1}`"
            class="lightbox__img"
            decoding="async"
          />
        </div>

        <button
          v-if="photos.length > 1"
          class="lightbox__nav lightbox__nav--prev"
          aria-label="Previous photo"
          :disabled="activeIndex === 0"
          @click.stop="prevPhoto"
        >
          <q-icon name="chevron_left" size="32px" />
        </button>

        <button
          v-if="photos.length > 1"
          class="lightbox__nav lightbox__nav--next"
          aria-label="Next photo"
          :disabled="activeIndex === photos.length - 1"
          @click.stop="nextPhoto"
        >
          <q-icon name="chevron_right" size="32px" />
        </button>

        <div v-if="photos.length > 1" class="lightbox__thumbs" role="tablist" aria-label="Gallery thumbnails">
          <button
            v-for="(photo, index) in photos"
            :key="index"
            class="lightbox__thumb"
            :class="{ 'lightbox__thumb--active': index === activeIndex }"
            role="tab"
            :aria-selected="index === activeIndex"
            :aria-label="`Photo ${index + 1}`"
            @click.stop="activeIndex = index"
          >
            <img :src="thumbMap[photo] ?? photo" :alt="`Thumbnail ${index + 1}`" loading="lazy" />
          </button>
        </div>

      </div>
    </q-dialog>
  </section>

  <!-- Placeholder when no photos -->
  <section v-else class="gallery-placeholder" aria-hidden="true">
    <p class="gallery-placeholder__text">Project photos coming soon.</p>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { prefetchVariants, resolveImageVariant } from 'src/composables/cms/useImageVariant'

// Estado reativo de imagens carregadas — keyed pela URL original da foto
const loadedPhotos = ref<Record<string, boolean>>({})

function onPhotoLoad(photoUrl: string) {
  loadedPhotos.value = { ...loadedPhotos.value, [photoUrl]: true }
}

const props = defineProps<{
  photos: string[]
  serviceTitle: string
}>()

const PAGE_SIZE = 6

// ── Variant URL maps ──────────────────────────────────────────────────────────
// medium (900px WebP) for the grid tiles; thumb (400px WebP) for lightbox strip
const mediumMap = ref<Record<string, string>>({})
const thumbMap  = ref<Record<string, string>>({})

watch(
  () => props.photos,
  async (photos) => {
    if (!photos.length) return
    await Promise.all([
      prefetchVariants(photos, 'medium'),
      prefetchVariants(photos, 'thumb'),
    ])
    const [mediumEntries, thumbEntries] = await Promise.all([
      Promise.all(photos.map(async (url) => [url, await resolveImageVariant(url, 'medium')] as const)),
      Promise.all(photos.map(async (url) => [url, await resolveImageVariant(url, 'thumb')]  as const)),
    ])
    mediumMap.value = Object.fromEntries(mediumEntries)
    thumbMap.value  = Object.fromEntries(thumbEntries)
  },
  { immediate: true },
)

// ── Pagination ─────────────────────────────────────────────────────────────────
const currentPage = ref(0)

const totalPages = computed(() => Math.ceil(props.photos.length / PAGE_SIZE))

const visiblePhotos = computed(() =>
  props.photos.slice(currentPage.value * PAGE_SIZE, (currentPage.value + 1) * PAGE_SIZE)
)

function prevPage() {
  if (currentPage.value > 0) currentPage.value--
}

function nextPage() {
  if (currentPage.value < totalPages.value - 1) currentPage.value++
}

// ── Lightbox ───────────────────────────────────────────────────────────────────
const lightboxOpen = ref(false)
const activeIndex  = ref(0)

function open(index: number) {
  activeIndex.value  = index
  lightboxOpen.value = true
}

function prevPhoto() {
  if (activeIndex.value > 0) activeIndex.value--
}

function nextPhoto() {
  if (activeIndex.value < props.photos.length - 1) activeIndex.value++
}
</script>

<style scoped lang="scss">
// ── Gallery shell (dark background, arrows flanking the grid) ─────────────────
.gallery {
  background-color: $brand-dark;
  padding: 48px 0;

  @media (max-width: 599px) { padding: 32px 0; }

  &__shell {
    display: flex;
    align-items: center;
    gap: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;

    @media (max-width: 599px) { padding: 0 8px; }
  }

  // ── Navigation arrows ─────────────────────────────────────────────────────
  &__nav {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba($brand-white, 0.08);
    border: 1px solid rgba($brand-white, 0.15);
    color: $brand-white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s, border-color 0.2s;
    z-index: 2;

    &:hover:not(:disabled) {
      background: rgba($brand-white, 0.16);
      border-color: rgba($brand-white, 0.3);
    }

    &:disabled { opacity: 0.2; cursor: default; }
    &:focus-visible { outline: 2px solid $brand-taupe; outline-offset: 2px; }

    &--prev { margin-right: 16px; }
    &--next { margin-left: 16px; }

    // Invisible but still takes space (keeps grid centered when only 1 page)
    &--hidden {
      visibility: hidden;
      pointer-events: none;
    }

    @media (max-width: 599px) {
      width: 32px;
      height: 32px;
      &--prev { margin-right: 8px; }
      &--next { margin-left: 8px; }
    }
  }

  // ── 3×2 image grid ────────────────────────────────────────────────────────
  &__grid {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    min-width: 0;

    @media (max-width: 699px) { grid-template-columns: repeat(2, 1fr); }
    @media (max-width: 399px) { grid-template-columns: 1fr; }
  }

  &__item {
    position: relative;
    overflow: hidden;
    aspect-ratio: 4 / 3;
    border-radius: 10px;
    background: #2a2a2a;
    border: none;
    cursor: pointer;
    padding: 0;

    &:focus-visible { outline: 2px solid $brand-taupe; outline-offset: 2px; }
    &:hover .gallery__img     { transform: scale(1.05); }
    &:hover .gallery__overlay { opacity: 1; }
  }

  &__img {
    position: relative;
    z-index: 2; // acima do shimmer (z-index: 1)
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    border-radius: 10px;
    // Fade-in reativo: opacity controlada pelo :class.is-loaded via Vue
    opacity: 0;
    transition: transform 0.4s ease, opacity 0.4s ease;

    &.is-loaded { opacity: 1; }
  }

  &__overlay {
    position: absolute;
    inset: 0;
    border-radius: 10px;
    background: rgba(#000, 0.40);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s;
    z-index: 3;
  }

  &__zoom { color: $brand-white; }
}

// ── Placeholder ───────────────────────────────────────────────────────────────
.gallery-placeholder {
  background-color: $brand-dark;
  padding: 48px 0;
  text-align: center;

  &__text {
    font-family: $font-family-body;
    font-size: 14px;
    font-weight: 300;
    color: $brand-silver;
    margin: 0;
  }
}

// ── Lightbox ─────────────────────────────────────────────────────────────────
.lightbox {
  position: relative;
  width: 100%;
  height: 100%;
  background: rgba(#000, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 80px 100px;

  @media (max-width: 599px) { padding: 56px 16px 100px; }

  &__close {
    position: absolute;
    top: 16px;
    right: 16px;
    background: transparent;
    border: none;
    cursor: pointer;
    color: $brand-white;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s;

    &:hover { color: $brand-taupe; }
    &:focus-visible { outline: 2px solid $brand-taupe; }
  }

  &__counter {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    font-family: $font-family-body;
    font-size: 12px;
    letter-spacing: 0.1em;
    color: rgba($brand-white, 0.5);
    margin: 0;
  }

  &__stage {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 0;
  }

  &__img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    display: block;
    border-radius: 6px;
  }

  &__nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba($brand-white, 0.08);
    border: 1px solid rgba($brand-white, 0.15);
    color: $brand-white;
    cursor: pointer;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s, border-color 0.2s;

    &:hover:not(:disabled) {
      background: rgba($brand-white, 0.15);
      border-color: rgba($brand-white, 0.3);
    }

    &:disabled { opacity: 0.25; cursor: default; }
    &:focus-visible { outline: 2px solid $brand-taupe; }

    &--prev { left: 16px; }
    &--next { right: 16px; }

    @media (max-width: 599px) { width: 40px; height: 40px; }
  }

  &__thumbs {
    position: absolute;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 4px;
    max-width: calc(100vw - 32px);
    overflow-x: auto;
    padding: 4px;

    &::-webkit-scrollbar { display: none; }
  }

  &__thumb {
    flex-shrink: 0;
    width: 56px;
    height: 40px;
    overflow: hidden;
    border: 2px solid transparent;
    border-radius: 4px;
    cursor: pointer;
    padding: 0;
    background: none;
    transition: border-color 0.2s;

    &:focus-visible { outline: 2px solid $brand-taupe; }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      opacity: 0.5;
      transition: opacity 0.2s;
    }

    &--active {
      border-color: $brand-taupe;
      img { opacity: 1; }
    }

    &:hover img { opacity: 0.8; }
  }
}
</style>
