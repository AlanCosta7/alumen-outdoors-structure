<template>
  <q-page>

    <!-- ── 1. Hero ──────────────────────────────────────────────────────────── -->
    <header
      class="contact-hero"
      :class="{ 'contact-hero--no-image': !heroImageUrl }"
      :style="heroImageUrl ? { backgroundImage: `url('${heroImageUrl}')` } : {}"
      aria-label="Contact Alumen Outdoors Structure"
    >
      <div class="contact-hero__overlay" aria-hidden="true" />
      <div class="contact-hero__content">
        <h1 class="contact-hero__heading">
          Ready to Transform<br />Your Space?
        </h1>
        <p class="contact-hero__sub">
          High-quality enclosures that add comfort,<br />
          style, and everyday usability.
        </p>
      </div>
    </header>

    <!-- ── 2. Intro ─────────────────────────────────────────────────────────── -->
    <section class="contact-intro" aria-labelledby="contact-intro-heading">
      <div class="max-content contact-intro__grid">

        <div class="contact-intro__left">
          <p class="eyebrow">Contact Us</p>
          <h2 id="contact-intro-heading" class="contact-intro__heading">
            Let's Build<br />with Precision
          </h2>
          <div class="contact-intro__rule" aria-hidden="true" />
        </div>

        <div class="contact-intro__right">
          <p class="contact-intro__para">
            If you're ready to elevate your outdoor space, our team is
            prepared to guide you through a structured and professional process.
          </p>
          <p class="contact-intro__para">
            Reach out to schedule your private consultation. We'll assess your
            project, answer your questions, and provide clear direction based on
            your goals.
          </p>
          <p class="contact-intro__para">
            At Alumen Outdoors Structure, every conversation is the first step
            toward a well-executed result.
          </p>
        </div>

      </div>
    </section>

    <!-- ── 3. Map ────────────────────────────────────────────────────────────── -->
    <section class="contact-map" aria-label="Florida Gulf Coast service area map">
      <iframe
        title="Alumen Outdoors Structure — Florida service area"
        src="https://maps.google.com/maps?q=27.5,-82.46&t=k&z=9&output=embed&hl=en"
        width="100%"
        height="460"
        style="border:0;display:block;"
        allowfullscreen
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
      />
    </section>

    <!-- ── 4. Contact Details ────────────────────────────────────────────────── -->
    <section class="contact-details" aria-labelledby="contact-details-heading">
      <div class="max-content contact-details__inner">

        <p class="contact-details__eyebrow">let's get in touch</p>
        <h2 id="contact-details-heading" class="contact-details__heading">
          Contact<br />Details
        </h2>
        <div class="contact-details__rule" aria-hidden="true" />

        <dl class="contact-details__list">

          <div class="contact-details__item">
            <dt class="contact-details__label">Phone:</dt>
            <dd class="contact-details__value">
              <a href="tel:+19415265425" class="contact-details__link contact-details__link--phone">
                (941) 526-5425
              </a>
            </dd>
          </div>

          <div class="contact-details__item">
            <dt class="contact-details__label">E-Mail:</dt>
            <dd class="contact-details__value">
              <a href="mailto:sales@skywayaluminum.com" class="contact-details__link contact-details__link--upper">
                sales@skywayaluminum.com
              </a>
            </dd>
          </div>

          <div class="contact-details__item contact-details__item--block">
            <dt class="contact-details__label">Service Areas:</dt>
            <dd class="contact-details__value contact-details__value--areas">
              • Sarasota • Tampa • Bradenton<br />
              • Venice • North Port
            </dd>
          </div>

          <div class="contact-details__item contact-details__item--block">
            <dt class="contact-details__label">Opening Hours:</dt>
            <dd class="contact-details__value">
              Mon-Fri: 8AM – 6PM<br />
              Sat: 9AM – 2PM
            </dd>
          </div>

        </dl>

        <!-- Social icons -->
        <div class="contact-details__social" aria-label="Social media links">
          <a
            href="https://www.instagram.com/alumenoutdoors"
            target="_blank"
            rel="noopener noreferrer"
            class="contact-details__social-link"
            aria-label="Follow us on Instagram"
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="1.5"
              stroke-linecap="round" stroke-linejoin="round"
              aria-hidden="true" focusable="false">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
            </svg>
          </a>
          <a
            href="https://www.facebook.com/alumenoutdoors"
            target="_blank"
            rel="noopener noreferrer"
            class="contact-details__social-link"
            aria-label="Follow us on Facebook"
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="1.5"
              stroke-linecap="round" stroke-linejoin="round"
              aria-hidden="true" focusable="false">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
          </a>
        </div>

      </div>
    </section>

    <!-- ── 5. Feature Photo ─────────────────────────────────────────────────── -->
    <FeaturePhoto />

    <!-- ── 6. Contact Form ───────────────────────────────────────────────────── -->
    <ContactForm aria-label="Contact page form" />

  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMeta } from 'quasar'
import { useCmsStore } from 'stores/cms'
import ContactForm from 'components/shared/ContactForm.vue'
import FeaturePhoto from 'components/shared/FeaturePhoto.vue'

// ── CMS hero image ─────────────────────────────────────────────────────────────
interface ConfigDoc { heroImage?: string; contactHeroImage?: string }
const store = useCmsStore()
const heroImageUrl = computed(() => {
  const cfg = store.config as ConfigDoc | null
  return cfg?.contactHeroImage ?? cfg?.heroImage ?? ''
})

// ── SEO ───────────────────────────────────────────────────────────────────────
useMeta({
  title: 'Contact Us | Alumen Outdoors Structure',
  meta: {
    description: {
      name: 'description',
      content: 'Ready to transform your outdoor space? Contact Alumen Outdoors Structure for a free consultation. Serving Sarasota, Tampa, Bradenton, Venice & North Port, FL. Call (941) 526-5425.',
    },
    robots:   { name: 'robots',   content: 'index, follow' },
    keywords: { name: 'keywords', content: 'contact aluminum contractor, free pool cage estimate, Sarasota enclosure quote, Florida aluminum enclosure' },

    ogTitle:       { property: 'og:title',       content: 'Contact Alumen Outdoors Structure' },
    ogDescription: { property: 'og:description', content: 'Schedule a private consultation. We serve Sarasota, Tampa, Bradenton, Venice & North Port. Call (941) 526-5425.' },
    ogUrl:         { property: 'og:url',         content: 'https://alumenoutdoors.com/contact' },
    ogImage:       { property: 'og:image',       content: 'https://alumenoutdoors.com/og-image.jpg' },
    ogImageAlt:    { property: 'og:image:alt',   content: 'Alumen Outdoors Structure — Contact us' },
    ogType:        { property: 'og:type',        content: 'website' },

    twCard:        { name: 'twitter:card',        content: 'summary_large_image' },
    twTitle:       { name: 'twitter:title',       content: 'Contact Alumen Outdoors Structure' },
    twDescription: { name: 'twitter:description', content: 'Schedule a private consultation across Florida\'s Gulf Coast.' },
    twImage:       { name: 'twitter:image',       content: 'https://alumenoutdoors.com/og-image.jpg' },
  },
  link: {
    canonical: { rel: 'canonical', href: 'https://alumenoutdoors.com/contact' },
  },
})
</script>

<style scoped lang="scss">
// ── 1. Hero ───────────────────────────────────────────────────────────────────
.contact-hero {
  position: relative;
  width: 100%;
  min-height: 56vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $brand-dark;
  background-size: cover;
  background-position: center;

  @media (max-width: 599px) { min-height: 44vh; }

  &--no-image { background-color: $brand-dark; }

  &__overlay {
    position: absolute;
    inset: 0;
    background: rgba(#000, 0.55);
    z-index: 1;
  }

  &__content {
    position: relative;
    z-index: 2;
    text-align: center;
    padding: 100px 24px 60px;
    max-width: 720px;
  }

  &__heading {
    font-family: $font-family-heading;
    font-size: clamp(36px, 46px, 54px);
    font-weight: 800;
    color: $brand-white;
    text-transform: uppercase;
    line-height: 1.0;
    letter-spacing: -0.01em;
    margin: 0 0 20px;
    max-width: 780px;
  }

  &__sub {
    font-family: $font-family-body;
    font-size: clamp(24px, 28px, 32px);
    font-weight: 500;
    color: rgba($brand-white, 1);
    line-height: 1.7;
    margin: 0 0 36px;
    max-width: 480px;  }
}

// ── 2. Intro ─────────────────────────────────────────────────────────────────
.contact-intro {
  background-color: $brand-white;
  padding: 72px 0 68px;

  @media (max-width: 599px) { padding: 48px 0; }

  &__grid {
    display: grid;
    grid-template-columns: 45fr 55fr;
    gap: 64px;
    align-items: start;

    @media (max-width: 799px) {
      grid-template-columns: 1fr;
      gap: 28px;
    }
  }

  &__left {
    // Eyebrow override for light background
    :deep(.eyebrow) { color: $brand-silver; }
  }

  &__heading {
    font-family: $font-family-heading;
    font-size: clamp(32px, 5vw, 56px);
    font-weight: 800;
    color: $brand-dark;
    text-transform: uppercase;
    line-height: 0.96;
    letter-spacing: -0.01em;
    margin: 0 0 28px;
  }

  &__rule {
    width: 40px;
    height: 2px;
    background-color: $brand-taupe;
    border-radius: 1px;
  }

  &__right {
    padding-top: 40px;

    @media (max-width: 799px) { padding-top: 0; }
  }

  &__para {
    font-family: $font-family-body;
    font-size: 13px;
    font-weight: 300;
    color: $brand-dark;
    line-height: 1.75;
    margin: 0 0 16px;

    &:last-child { margin-bottom: 0; }
  }
}

// ── 3. Map ────────────────────────────────────────────────────────────────────
.contact-map {
  width: 100%;
  line-height: 0;
  overflow: hidden;

  iframe {
    width: 100%;
    display: block;
  }
}

// ── 4. Contact Details ────────────────────────────────────────────────────────
.contact-details {
  background-color: $brand-white;
  padding: 72px 0 80px;

  @media (max-width: 599px) { padding: 48px 0 60px; }

  &__inner {
    max-width: $max-content-width;
    margin: 0 auto;
    padding: 0 24px;
  }

  &__eyebrow {
    font-family: $font-family-body;
    font-size: 11px;
    font-weight: 300;
    letter-spacing: 0.08em;
    color: $brand-silver;
    margin: 0 0 12px;
  }

  &__heading {
    font-family: $font-family-heading;
    font-size: clamp(32px, 4.5vw, 52px);
    font-weight: 800;
    color: $brand-dark;
    text-transform: uppercase;
    line-height: 0.96;
    letter-spacing: -0.01em;
    margin: 0 0 28px;
  }

  &__rule {
    width: 36px;
    height: 2px;
    background-color: $brand-taupe;
    border-radius: 1px;
    margin-bottom: 40px;
  }

  // ── Data list ──────────────────────────────────────────────────────────────
  &__list {
    display: flex;
    flex-direction: column;
    gap: 28px;
    margin: 0;
    padding: 0;
  }

  &__item {
    display: flex;
    align-items: baseline;
    gap: 14px;

    &--block {
      flex-direction: column;
      gap: 6px;
    }
  }

  &__label {
    font-family: $font-family-body;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: $brand-taupe;
    white-space: nowrap;
    flex-shrink: 0;
  }

  &__value {
    font-family: $font-family-body;
    font-size: 14px;
    font-weight: 400;
    color: $brand-dark;
    line-height: 1.65;
    margin: 0;

    &--areas {
      text-transform: uppercase;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.04em;
      line-height: 1.8;
    }
  }

  &__link {
    color: $brand-dark;
    text-decoration: none;
    transition: color 0.2s;

    &:hover { color: $brand-taupe; }
    &:focus-visible { outline: 2px solid $brand-taupe; outline-offset: 2px; }

    &--phone {
      font-size: clamp(18px, 2.2vw, 24px);
      font-weight: 700;
    }

    &--upper { text-transform: uppercase; font-weight: 600; letter-spacing: 0.04em; }
  }

  // ── Social ─────────────────────────────────────────────────────────────────
  &__social {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-top: 40px;
  }

  &__social-link {
    display: flex;
    align-items: center;
    justify-content: center;
    color: $brand-silver;
    transition: color 0.2s;
    line-height: 0;

    &:hover { color: $brand-dark; }
    &:focus-visible { outline: 2px solid $brand-taupe; outline-offset: 3px; border-radius: 3px; }
  }
}
</style>
