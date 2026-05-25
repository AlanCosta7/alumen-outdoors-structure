<template>
  <section class="services-section section" aria-labelledby="services-heading">
    <div class="max-content">

      <!-- ── About row: heading (left) / description (right) ──────────────── -->
      <div class="services-section__about-row">

        <div class="services-section__about-left">
          <p class="eyebrow">About Company</p>
          <h2
            id="services-heading"
            class="services-section__heading heading-underline"
          >
            We Build With<br />Precision<br />and Purpose
          </h2>
        </div>

        <div class="services-section__about-right">
          <p class="services-section__desc">
            We are Alumen Outdoor Structures, a high-end aluminum contractor specializing
            in custom pool cages, lanai extensions, and architectural enclosures.
          </p>
          <p class="services-section__desc">
            We are driven by craftsmanship, structure, and attention to detail, delivering
            projects that combine durability, aesthetics, and long-term performance.
          </p>
        </div>

      </div>

      <!-- ── Full-width 3×2 service card grid ─────────────────────────────── -->
      <div class="services-grid" role="list" aria-label="Our services">
        <article
          v-for="service in services"
          :key="service.slug"
          class="service-card"
          role="listitem"
        >
          <router-link
            :to="`/services/${service.slug}`"
            class="service-card__link"
            :aria-label="`Learn more about ${service.title}`"
          >
            <!-- Image -->
            <div class="service-card__img-wrap" aria-hidden="true">
              <!-- Shimmer: visível enquanto a imagem não carregou -->
              <div
                class="img-shimmer"
                :class="{ 'img-shimmer--done': loadedCards[service.slug] }"
              />
              <img
                v-if="service.photo"
                :src="photoMap[service.photo] ?? service.photo"
                :alt="service.title"
                loading="lazy"
                decoding="async"
                width="480"
                height="360"
                :class="['service-card__img', { 'is-loaded': loadedCards[service.slug] }]"
                @load="onCardLoad(service.slug)"
              />
              <div class="service-card__overlay" aria-hidden="true" />
            </div>

            <!-- Title overlay -->
            <div class="service-card__body">
              <h3 class="service-card__title">{{ service.title }}</h3>
            </div>
          </router-link>
        </article>
      </div>

    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useCmsStore } from 'stores/cms'
import { prefetchVariants, resolveImageVariant } from 'src/composables/cms/useImageVariant'

// Rastreia quais cards já tiveram imagem carregada — keyed by service.slug.
// Usar ref<Record> em vez de classList imperativo garante que o Vue mantenha
// o estado mesmo que o elemento seja re-patchado.
const loadedCards = ref<Record<string, boolean>>({})

function onCardLoad(slug: string) {
  // Spread cria novo objeto → Vue detecta mudança e re-renderiza
  loadedCards.value = { ...loadedCards.value, [slug]: true }
}

interface ServiceDoc {
  id: string
  slug: string
  title: string
  heroImage?: string
  order?: number
}

// Fallback titles used only when a document hasn't loaded from CMS yet
const FALLBACK_TITLES: Record<string, string> = {
  'custom-pool-cage-installation':    'Custom Pool Cage Installation',
  'screen-repair-individual-panels':  'Screen Repair (Individual Panels)',
  'full-pool-cage-lanai-rescreening': 'Full Pool Cage & Lanai Rescreening',
  'extended-lanai-construction':      'Extended Lanai Construction',
  'front-back-porch-enclosures':      'Front & Back Porch Enclosures',
  'pool-cage-painting-restoration':   'Pool Cage Painting & Restoration',
}

const { services: storeServices } = storeToRefs(useCmsStore())

// Medium variant URL map (900px WebP) for the service cards
const photoMap = ref<Record<string, string>>({})

const services = computed(() => {
  const cms = Array.isArray(storeServices.value) ? (storeServices.value as ServiceDoc[]) : []

  return [...cms]
    // Sort by the `order` field set in admin (ascending)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map(doc => ({
      slug:  doc.slug,
      title: doc.title || FALLBACK_TITLES[doc.slug] || doc.slug,
      photo: doc.heroImage ?? '',
    }))
})

// ── Resolve medium variants progressively ─────────────────────────────────────
// Updates photoMap per-image as each getMetadata() resolves instead of waiting
// for all of them — cards fill in as variants become available rather than all
// at once.  A Set guards against processing the same URL twice.
const resolvedUrls = new Set<string>()

async function resolveVariants(list: typeof services.value) {
  const urls = list.map(s => s.photo).filter(u => u && !resolvedUrls.has(u))
  if (!urls.length) return

  // Kick off prefetch (populates variant cache) and immediately start resolving
  void prefetchVariants(urls, 'medium')

  await Promise.allSettled(
    urls.map(async (url) => {
      resolvedUrls.add(url)
      const variant = await resolveImageVariant(url, 'medium')
      // Update one entry at a time — Vue batches same-tick mutations
      photoMap.value = { ...photoMap.value, [url]: variant }
    }),
  )
}

// Debounce prevents double-fire when Firestore sends cache→network updates
let _resolveTimer: ReturnType<typeof setTimeout> | null = null
watch(
  services,
  (list) => {
    if (_resolveTimer) clearTimeout(_resolveTimer)
    _resolveTimer = setTimeout(() => void resolveVariants(list), 60)
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
// ── Section ───────────────────────────────────────────────────────────────────
.services-section {
  background-color: $brand-white;

  // ── About row ──────────────────────────────────────────────────────────────
  &__about-row {
    display: grid;
    grid-template-columns: 340px 1fr;
    gap: 56px;
    align-items: start;
    margin-bottom: 52px;

    @media (max-width: 1099px) {
      grid-template-columns: 280px 1fr;
      gap: 40px;
    }

    @media (max-width: 899px) {
      grid-template-columns: 1fr;
      gap: 20px;
      margin-bottom: 36px;
    }
  }

  &__heading {
    font-family: $font-family-heading;
    font-size: clamp(38px, 5vw, 58px);
    font-weight: 800;
    color: $brand-dark;
    text-transform: uppercase;
    line-height: 0.96;
    letter-spacing: -0.01em;
    margin: 0;
  }

  &__about-right {
    // Alinha os parágrafos com o topo do heading
    padding-top: 36px;

    @media (max-width: 899px) { padding-top: 0; }
  }

  &__desc {
    font-family: $font-family-body;
    font-size: 14px;
    font-weight: 300;
    color: #555;
    line-height: 1.75;
    margin: 0 0 14px;

    &:last-child { margin-bottom: 0; }
  }
}

// ── Services grid ─────────────────────────────────────────────────────────────
.services-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;

  @media (max-width: 899px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 499px) { grid-template-columns: 1fr; }
}

// ── Service card ──────────────────────────────────────────────────────────────
.service-card {
  position: relative;
  overflow: hidden;
  background-color: $brand-dark;
  aspect-ratio: 3 / 4;
  border-radius: 10px;

  &__link {
    display: block;
    width: 100%;
    height: 100%;
    text-decoration: none;
    color: inherit;

    &:focus-visible { outline: 3px solid $brand-green; outline-offset: -3px; }
  }

  &__img-wrap {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    overflow: hidden;
  }

  &__img {
    position: relative; // fica acima do shimmer (z-index: 2)
    z-index: 2;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease, opacity 0.4s ease;
    opacity: 0; // começa invisible; .is-loaded revela com fade

    &.is-loaded { opacity: 1; }
  }

  &__overlay {
    position: absolute;
    inset: 0;
    z-index: 3; // acima da img (2) e do shimmer (1)
    background: linear-gradient(
      to top,
      rgba($brand-dark, 0.88) 0%,
      rgba($brand-dark, 0.30) 55%,
      transparent 100%
    );
  }

  &__body {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 18px 20px 22px;
    z-index: 2;
    text-align: center;
  }

  &__title {
    font-family: $font-family-heading;
    font-size: clamp(15px, 2vw, 22px);
    font-weight: 800;
    color: $brand-white;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    margin: 0;
    line-height: 1.15;
  }

  &:hover {
    .service-card__img { transform: scale(1.05); }
  }
}
</style>
