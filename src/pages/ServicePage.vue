<template>
  <q-page>
    <!-- Loading -->
    <div v-if="loading" class="service-loading" aria-busy="true">
      <q-spinner-dots size="40px" color="positive" />
    </div>

    <!-- Not found -->
    <div v-else-if="!service" class="service-notfound">
      <div class="max-content">
        <p class="service-notfound__heading">Service Not Found</p>
        <p class="service-notfound__sub">
          We couldn't find the service you're looking for.
        </p>
        <q-btn
          unelevated
          no-caps
          label="View All Services"
          to="/services/custom-pool-cage-installation"
          class="service-notfound__btn"
        />
      </div>
    </div>

    <!-- Service content -->
    <template v-else>

      <!-- Intro: eyebrow + heading + description (2-col) -->
      <ServiceHero
        :title="service.title"
        :description="service.description"
      />

      <!-- Gallery: dark bg, 3×2 grid, rounded corners, lightbox -->
      <ServiceGallery
        :photos="service.gallery ?? []"
        :service-title="service.title"
      />

      <!-- CTA: white bg, centered italic text + phone button -->
      <ServiceCta />

      <!-- Feature photo: full-bleed using service's own heroImage -->
      <div
        v-if="service.heroImage"
        class="service-feature-photo"
        role="img"
        :aria-label="`${service.title} — project photo`"
      >
        <img
          :src="service.heroImage"
          :alt="`${service.title} completed by Alumen Outdoors Structure`"
          loading="lazy"
          decoding="async"
          width="1440"
          height="600"
          class="service-feature-photo__img"
        />
      </div>
      <div v-else class="service-feature-photo service-feature-photo--placeholder" aria-hidden="true" />

      <!-- Contact form -->
      <ContactForm aria-label="Service page contact section" />

    </template>
  </q-page>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useMeta } from 'quasar'
import { useCmsStore } from 'stores/cms'
import ServiceHero from 'components/service/ServiceHero.vue'
import ServiceGallery from 'components/service/ServiceGallery.vue'
import ServiceCta from 'components/service/ServiceCta.vue'
import ContactForm from 'components/shared/ContactForm.vue'

// ── Types ─────────────────────────────────────────────────────────────────────
interface ServiceDoc {
  id: string
  slug: string
  title: string
  subtitle?: string
  description?: string
  features?: string[]
  heroImage?: string
  gallery?: string[]
  order?: number
}

// ── Route & store ─────────────────────────────────────────────────────────────
const route = useRoute()
const store = useCmsStore()

const loading = computed(() => !Array.isArray(store.services))

const service = computed<ServiceDoc | undefined>(() => {
  if (!Array.isArray(store.services)) return undefined
  return (store.services as ServiceDoc[]).find(
    (s) => s.slug === route.params.slug
  )
})

// ── SEO (reactive) ────────────────────────────────────────────────────────────
useMeta(computed(() => {
  const title  = service.value?.title    ?? 'Aluminum Enclosure Services'
  const desc   = service.value?.subtitle ?? 'Premium aluminum enclosure services across Sarasota, Tampa, Bradenton, Venice & North Port, FL.'
  const slug   = route.params.slug as string
  const image  = service.value?.heroImage || 'https://alumenoutdoors.com/og-image.jpg'
  const url    = `https://alumenoutdoors.com/services/${slug}`
  const fullTitle = `${title} in Sarasota & Tampa, FL | Alumen Outdoors Structure`

  return {
    title: fullTitle,
    meta: {
      description: { name: 'description', content: `${desc} Licensed & insured. Free estimates across Florida's Gulf Coast. Call (941) 526-5425.` },
      robots:   { name: 'robots',   content: 'index, follow' },
      keywords: { name: 'keywords', content: `${title.toLowerCase()}, aluminum enclosure Florida, pool cage Sarasota, Gulf Coast enclosures` },

      // Open Graph
      ogTitle:       { property: 'og:title',       content: fullTitle },
      ogDescription: { property: 'og:description', content: desc },
      ogUrl:         { property: 'og:url',         content: url },
      ogImage:       { property: 'og:image',       content: image },
      ogImageAlt:    { property: 'og:image:alt',   content: `${title} by Alumen Outdoors Structure` },
      ogType:        { property: 'og:type',        content: 'website' },

      // Twitter / X
      twCard:        { name: 'twitter:card',        content: 'summary_large_image' },
      twTitle:       { name: 'twitter:title',       content: fullTitle },
      twDescription: { name: 'twitter:description', content: desc },
      twImage:       { name: 'twitter:image',       content: image },
    },
    link: {
      canonical: { rel: 'canonical', href: url },
    },
    script: {
      ldJson: {
        type: 'application/ld+json',
        innerHTML: JSON.stringify([
          {
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: title,
            description: desc,
            url,
            image,
            provider: {
              '@type': 'LocalBusiness',
              name: 'Alumen Outdoors Structure',
              url: 'https://alumenoutdoors.com',
              telephone: '+1-941-526-5425',
              '@id': 'https://alumenoutdoors.com/#business',
            },
            areaServed: { '@type': 'State', name: 'Florida' },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home',     item: 'https://alumenoutdoors.com/' },
              { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://alumenoutdoors.com/#services' },
              { '@type': 'ListItem', position: 3, name: title,      item: url },
            ],
          },
        ]),
      },
    },
  }
}))

// ── Scroll to top on slug change ──────────────────────────────────────────────
watch(() => route.params.slug, () => window.scrollTo({ top: 0, behavior: 'smooth' }))
</script>

<style scoped lang="scss">
// ── Loading state ─────────────────────────────────────────────────────────────
.service-loading {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $brand-dark;
}

// ── Not found ─────────────────────────────────────────────────────────────────
.service-notfound {
  min-height: 60vh;
  display: flex;
  align-items: center;
  background-color: $brand-dark;
  padding: 80px 0;

  &__heading {
    font-family: $font-family-heading;
    font-size: clamp(32px, 5vw, 52px);
    font-weight: 800;
    color: $brand-white;
    text-transform: uppercase;
    margin: 0 0 12px;
  }

  &__sub {
    font-family: $font-family-body;
    font-size: 14px;
    font-weight: 300;
    color: $brand-silver;
    margin: 0 0 28px;
  }

  &__btn {
    background-color: $brand-green !important;
    color: $brand-dark !important;
    font-family: $font-family-body;
    font-weight: 600;
    font-size: 13px;
    letter-spacing: 0.08em;
    border-radius: 0;
    padding: 14px 32px;
  }
}

// ── Service feature photo ─────────────────────────────────────────────────────
.service-feature-photo {
  position: relative;
  width: 100%;
  overflow: hidden;
  max-height: 600px;
  line-height: 0;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(#000, 0.45);
    pointer-events: none;
  }

  &__img {
    width: 100%;
    height: 600px;
    object-fit: cover;
    object-position: center;
    display: block;

    @media (max-width: 599px) { height: 280px; }
  }

  &--placeholder {
    height: 400px;
    background: linear-gradient(135deg, #252525 0%, #1a1a1a 100%);

    @media (max-width: 599px) { height: 200px; }
  }
}
</style>
