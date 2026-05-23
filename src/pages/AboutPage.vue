<template>
  <q-page>
    <!-- Story Section -->
    <AboutStory />

    <!-- Values Section -->
    <ValuesSection />

    <!-- Team Section (only if team data available) -->
    <TeamSection :members="teamMembers" />

    <!-- Full-bleed feature photo -->
    <FeaturePhoto />

    <!-- Contact Form -->
    <ContactForm aria-label="About page contact section" />
  </q-page>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useMeta } from 'quasar'
import { useCmsStore } from 'stores/cms'

// Primeiro conteúdo visível — síncrono
import AboutStory from 'components/about/AboutStory.vue'

// Abaixo da dobra — lazy
const ValuesSection = defineAsyncComponent(() => import('components/about/ValuesSection.vue'))
const TeamSection   = defineAsyncComponent(() => import('components/about/TeamSection.vue'))
const FeaturePhoto  = defineAsyncComponent(() => import('components/shared/FeaturePhoto.vue'))
const ContactForm   = defineAsyncComponent(() => import('components/shared/ContactForm.vue'))

// ── CMS ───────────────────────────────────────────────────────────────────────
interface TeamMember {
  id: string
  name: string
  role: string
  bio?: string
  photo?: string
  order?: number
}

const store = useCmsStore()

const teamMembers = computed<TeamMember[]>(() =>
  Array.isArray(store.team) ? (store.team as TeamMember[]) : []
)

// ── SEO ───────────────────────────────────────────────────────────────────────
useMeta({
  title: 'About Us — Florida\'s Premier Enclosure Specialists | Alumen Outdoors Structure',
  meta: {
    description: {
      name: 'description',
      content: 'Over 15 years building custom pool cages and aluminum enclosures across Florida. 1,200+ projects completed. Certified crews, premium materials, transparent process. Licensed CGC1538497.',
    },
    robots:    { name: 'robots',   content: 'index, follow' },
    keywords:  { name: 'keywords', content: 'aluminum enclosure contractor Florida, pool cage company Sarasota, licensed aluminum contractor, about Alumen Outdoors Structure' },

    // Open Graph
    ogTitle:       { property: 'og:title',       content: 'About Alumen Outdoors Structure — Florida\'s Premier Enclosure Specialists' },
    ogDescription: { property: 'og:description', content: 'Over 15 years and 1,200+ projects. We build aluminum enclosures that withstand Florida\'s climate — with certified crews and a transparent process.' },
    ogUrl:         { property: 'og:url',         content: 'https://alumenoutdoors.com/about' },
    ogImage:       { property: 'og:image',       content: 'https://alumenoutdoors.com/og-image.jpg' },
    ogImageAlt:    { property: 'og:image:alt',   content: 'Alumen Outdoors Structure team on a pool cage project' },
    ogType:        { property: 'og:type',        content: 'website' },

    // Twitter / X
    twCard:        { name: 'twitter:card',        content: 'summary_large_image' },
    twTitle:       { name: 'twitter:title',       content: 'About Alumen Outdoors Structure — Florida\'s Premier Enclosure Specialists' },
    twDescription: { name: 'twitter:description', content: 'Over 15 years and 1,200+ projects across the Gulf Coast. Certified crews, premium aluminum, transparent process.' },
    twImage:       { name: 'twitter:image',       content: 'https://alumenoutdoors.com/og-image.jpg' },
  },
  link: {
    canonical: { rel: 'canonical', href: 'https://alumenoutdoors.com/about' },
  },
})
</script>
