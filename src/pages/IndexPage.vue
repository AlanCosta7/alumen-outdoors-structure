<template>
  <q-page>
    <!-- 1. Hero -->

    <HeroSection :image-url="heroImageUrl" />

    <!-- 2. Services Grid -->
    <ServicesGrid />

    <!-- 3. Process Section -->
    <ProcessSection />

    <!-- 4. Full-bleed feature photo -->
    <FeaturePhoto />

    <!-- 5. Contact Form -->
    <ContactForm aria-label="Home page contact section" />
  </q-page>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useMeta } from 'quasar'
import { useCmsStore } from 'stores/cms'

// Críticos para o first paint — carregam de forma síncrona
import HeroSection  from 'components/home/HeroSection.vue'
import ServicesGrid from 'components/home/ServicesGrid.vue'

// Abaixo da dobra — Vite cria chunks separados, carregam quando necessários
const ProcessSection = defineAsyncComponent(() => import('components/home/ProcessSection.vue'))
const FeaturePhoto   = defineAsyncComponent(() => import('components/shared/FeaturePhoto.vue'))
const ContactForm    = defineAsyncComponent(() => import('components/shared/ContactForm.vue'))

// ── JSON-LD schemas ───────────────────────────────────────────────────────────
const BASE_URL = 'https://alumenoutdoors.com'

const ldLocalBusiness = {
  '@context': 'https://schema.org',
  '@type': ['LocalBusiness', 'HomeAndConstructionBusiness'],
  '@id': `${BASE_URL}/#business`,
  name: 'Alumen Outdoors Structure',
  description: 'Custom pool cages, aluminum enclosures, extended lanais, and porch enclosures in Florida.',
  url: BASE_URL,
  telephone: '+1-941-526-5425',
  email: 'sales@skywayaluminum.com',
  priceRange: '$$',
  currenciesAccepted: 'USD',
  paymentAccepted: 'Cash, Check, Credit Card',
  image: `${BASE_URL}/og-image.jpg`,
  logo: `${BASE_URL}/images/logo.png`,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Sarasota',
    addressRegion: 'FL',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 27.3364,
    longitude: -82.5307,
  },
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday'], opens: '08:00', closes: '18:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Saturday'], opens: '09:00', closes: '14:00' },
  ],
  areaServed: [
    { '@type': 'City', name: 'Sarasota',   '@id': 'https://www.wikidata.org/wiki/Q49255' },
    { '@type': 'City', name: 'Tampa',      '@id': 'https://www.wikidata.org/wiki/Q49197' },
    { '@type': 'City', name: 'Bradenton',  '@id': 'https://www.wikidata.org/wiki/Q49259' },
    { '@type': 'City', name: 'Venice',     '@id': 'https://www.wikidata.org/wiki/Q984933' },
    { '@type': 'City', name: 'North Port', '@id': 'https://www.wikidata.org/wiki/Q1008695' },
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Aluminum Enclosure Services',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Custom Pool Cage Installation',       url: `${BASE_URL}/services/custom-pool-cage-installation` } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Extended Lanai Construction',          url: `${BASE_URL}/services/extended-lanai-construction` } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Front & Back Porch Enclosures',        url: `${BASE_URL}/services/front-back-porch-enclosures` } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Full Pool Cage & Lanai Rescreening',   url: `${BASE_URL}/services/full-pool-cage-lanai-rescreening` } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Pool Cage Painting & Restoration',     url: `${BASE_URL}/services/pool-cage-painting-restoration` } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Screen Repair (Individual Panels)',    url: `${BASE_URL}/services/screen-repair-individual-panels` } },
    ],
  },
  sameAs: [
    'https://www.instagram.com/alumenoutdoors',
    'https://www.facebook.com/alumenoutdoors',
  ],
}

const ldWebSite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${BASE_URL}/#website`,
  url: BASE_URL,
  name: 'Alumen Outdoors Structure',
  description: 'Custom pool cages and aluminum enclosures across Florida\'s Gulf Coast.',
  inLanguage: 'en-US',
  publisher: { '@id': `${BASE_URL}/#business` },
}

const jsonLd = JSON.stringify([ldLocalBusiness, ldWebSite])

// ── SEO ───────────────────────────────────────────────────────────────────────
useMeta({
  title: 'Custom Pool Cages & Aluminum Enclosures | Alumen Outdoors Structure',
  meta: {
    description: {
      name: 'description',
      content: 'Alumen Outdoors Structure builds custom pool cages, extended lanais, and porch enclosures across Sarasota, Tampa, Bradenton, Venice & North Port, FL. Licensed CGC1538497. Free estimates.',
    },
    robots:    { name: 'robots',    content: 'index, follow' },
    keywords:  { name: 'keywords',  content: 'pool cage installation, aluminum enclosures, lanai construction, porch enclosures, rescreening, Sarasota, Tampa, Bradenton, Florida' },

    // Open Graph
    ogTitle:       { property: 'og:title',       content: 'Custom Pool Cages & Aluminum Enclosures | Alumen Outdoors Structure' },
    ogDescription: { property: 'og:description', content: 'Premium aluminum enclosures engineered for Florida\'s climate — pool cages, lanais, porch enclosures, rescreening & restoration. Serving the Gulf Coast.' },
    ogUrl:         { property: 'og:url',          content: 'https://alumenoutdoors.com/' },
    ogImage:       { property: 'og:image',        content: 'https://alumenoutdoors.com/og-image.jpg' },
    ogImageAlt:    { property: 'og:image:alt',    content: 'Custom pool cage installed by Alumen Outdoors Structure in Sarasota, FL' },
    ogType:        { property: 'og:type',         content: 'website' },

    // Twitter / X
    twCard:        { name: 'twitter:card',        content: 'summary_large_image' },
    twTitle:       { name: 'twitter:title',       content: 'Custom Pool Cages & Aluminum Enclosures | Alumen Outdoors Structure' },
    twDescription: { name: 'twitter:description', content: 'Premium aluminum enclosures engineered for Florida\'s climate. Free estimates across the Gulf Coast.' },
    twImage:       { name: 'twitter:image',       content: 'https://alumenoutdoors.com/og-image.jpg' },
  },
  link: {
    canonical: { rel: 'canonical', href: 'https://alumenoutdoors.com/' },
  },
  script: {
    ldJson: { type: 'application/ld+json', innerHTML: jsonLd },
  },
})

// ── CMS images ────────────────────────────────────────────────────────────────
interface ConfigDoc { heroImage?: string }
const store = useCmsStore()
const heroImageUrl = computed(() => (store.config as ConfigDoc | null)?.heroImage ?? '')

</script>
