<template>
  <footer class="app-footer" role="contentinfo">
    <div class="app-footer__inner max-content">

      <!-- Col 1: Logo + social -->
      <div class="app-footer__brand">
        <router-link to="/" aria-label="Alumen Outdoors Structure — Home">
          <img
            src="/images/logotrans.png"
            alt="Alumen Outdoors Structure"
            width="260px"
            height="auto"
            loading="lazy"
            class="app-footer__logo"
          />
        </router-link>
        <div class="app-footer__social" aria-label="Social media links">
          <a
            v-if="footer.instagram"
            :href="footer.instagram"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow us on Instagram"
            class="app-footer__social-link"
          >
            <span class="app-footer__svg-icon" v-html="instagramSvg" aria-hidden="true" />
          </a>
          <a
            v-if="footer.facebook"
            :href="footer.facebook"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow us on Facebook"
            class="app-footer__social-link"
          >
            <span class="app-footer__svg-icon" v-html="facebookSvg" aria-hidden="true" />
          </a>
        </div>
      </div>

      <!-- Col 2: Company links -->
      <nav class="app-footer__nav" aria-label="Footer navigation">
        <p class="app-footer__heading">Company</p>
        <ul class="app-footer__links" role="list">
          <li><router-link to="/" class="app-footer__link">Home</router-link></li>
          <li><router-link to="/about" class="app-footer__link">About Us</router-link></li>
          <li>
            <router-link
              v-for="service in services"
              :key="service.slug"
              :to="`/services/${service.slug}`"
              class="app-footer__link"
            >{{ service.title }}</router-link>
          </li>
          <li><router-link to="/projects" class="app-footer__link">Projects</router-link></li>
          <li><router-link to="/contact" class="app-footer__link">Contact</router-link></li>
        </ul>
      </nav>

      <!-- Col 3: Contact info -->
      <address class="app-footer__contact">
        <p class="app-footer__heading">Contact Info</p>
        <ul class="app-footer__links" role="list">
          <li>
            <a :href="`tel:${config.phoneRaw}`" class="app-footer__link app-footer__link--icon">
              <q-icon name="phone" size="14px" />
              {{ config.phone }}
            </a>
          </li>
          <li>
            <a :href="`mailto:${config.email}`" class="app-footer__link app-footer__link--icon">
              <q-icon name="mail_outline" size="14px" />
              {{ config.email }}
            </a>
          </li>
          <li class="app-footer__hours">
            <q-icon name="schedule" size="14px" />
            <span>{{ config.hoursWeekday }}<br>{{ config.hoursSaturday }}</span>
          </li>
          <li class="app-footer__areas">
            <q-icon name="place" size="14px" />
            <span>Sarasota · Tampa · Bradenton<br>Venice · North Port</span>
          </li>
        </ul>
      </address>

    </div>

    <div class="app-footer__bottom">
      <div class="max-content app-footer__bottom-inner">
        <p>© {{ currentYear }} Alumen Outdoors Structure. All rights reserved. {{ config.license }}</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCmsStore } from 'stores/cms'
import instagramSvg from 'src/assets/icons/instagram.svg?raw'
import facebookSvg  from 'src/assets/icons/facebook.svg?raw'

interface ConfigDoc {
  phone?: string; phoneRaw?: string; email?: string; license?: string
  hoursWeekday?: string; hoursSaturday?: string
}
interface FooterDoc {
  tagline?: string; instagram?: string; facebook?: string
}

const store = useCmsStore()
const currentYear = new Date().getFullYear()

const config = computed(() => ({
  phone:         (store.config as ConfigDoc | null)?.phone         ?? '(941) 526-5425',
  phoneRaw:      (store.config as ConfigDoc | null)?.phoneRaw      ?? '+19415265425',
  email:         (store.config as ConfigDoc | null)?.email         ?? 'sales@skywayaluminum.com',
  license:       (store.config as ConfigDoc | null)?.license       ?? 'CGC1538497',
  hoursWeekday:  (store.config as ConfigDoc | null)?.hoursWeekday  ?? 'Mon–Fri: 8AM – 6PM',
  hoursSaturday: (store.config as ConfigDoc | null)?.hoursSaturday ?? 'Sat: 9AM – 2PM',
}))

const footer = computed(() => ({
  tagline:   (store.footer as FooterDoc | null)?.tagline   ?? 'Building with precision and purpose — Florida.',
  instagram: (store.footer as FooterDoc | null)?.instagram ?? '',
  facebook:  (store.footer as FooterDoc | null)?.facebook  ?? '',
}))

const services = [
  { slug: 'custom-pool-cage-installation',     title: 'Pool Cage Installation' },
  { slug: 'extended-lanai-construction',        title: 'Lanai Construction' },
  { slug: 'front-back-porch-enclosures',        title: 'Porch Enclosures' },
  { slug: 'full-pool-cage-lanai-rescreening',   title: 'Rescreening' },
  { slug: 'pool-cage-painting-restoration',     title: 'Painting & Restoration' },
  { slug: 'screen-repair-individual-panels',    title: 'Screen Repair' },
]
</script>

<style scoped lang="scss">
.app-footer {
  background-color: $brand-dark;
  color: $brand-silver;

  &__inner {
    display: grid;
    grid-template-columns: 1.4fr 1fr 1.2fr;
    gap: 48px;
    padding-top: 56px;
    padding-bottom: 48px;

    @media (max-width: 767px) {
      grid-template-columns: 1fr 1fr;
      gap: 32px;
    }

    @media (max-width: 599px) {
      grid-template-columns: 1fr;
      gap: 32px;
    }
  }

  &__brand {
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: center;
  }

  &__logo {
    height: 60px;
    width: 260px;
    object-fit: cover;
    filter: brightness(0.9);
  }

  &__tagline {
    font-family: $font-family-body;
    font-size: 13px;
    font-weight: 300;
    line-height: 1.6;
    color: rgba($brand-silver, 0.7);
    margin: 0;
  }

  &__social {
    display: flex;
    gap: 8px;
    margin-top: 4px;
  }

  &__social-link {
    color: $secondary;
    transition: color 0.2s;
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: flex-start;

    &:hover,
    &:focus-visible {
      color: $brand-white;
    }

    &:focus-visible {
      outline: 2px solid $brand-green;
      outline-offset: 2px;
      border-radius: 2px;
    }
  }

  // Inline SVG — inherits color from parent __social-link
  &__svg-icon {
    display: flex;
    align-items: center;
    justify-content: center;

    :deep(svg) {
      width: 44px;
      height: 44px;
      fill: currentColor;
    }
  }

  &__heading {
    font-family: $font-family-body;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: $brand-white;
    margin: 0 0 16px;
  }

  &__links {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__link {
    font-family: $font-family-body;
    font-size: 13px;
    font-weight: 300;
    color: $brand-silver;
    text-decoration: none;
    transition: color 0.2s;
    display: block;

    &--icon {
      display: flex;
      align-items: flex-start;
      gap: 8px;

      .q-icon { flex-shrink: 0; margin-top: 1px; }
    }

    &:hover,
    &:focus-visible {
      color: $brand-white;
    }

    &:focus-visible {
      outline: 2px solid $brand-green;
      outline-offset: 2px;
      border-radius: 2px;
    }
  }

  &__hours,
  &__areas {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-family: $font-family-body;
    font-size: 13px;
    font-weight: 300;
    color: $brand-silver;

    .q-icon { flex-shrink: 0; margin-top: 2px; }

    span { line-height: 1.6; }
  }

  &__contact {
    font-style: normal;
  }

  &__bottom {
    border-top: 1px solid rgba($brand-silver, 0.15);
  }

  &__bottom-inner {
    padding-top: 20px;
    padding-bottom: 20px;

    p {
      font-family: $font-family-body;
      font-size: 12px;
      font-weight: 300;
      color: rgba($brand-silver, 0.6);
      margin: 0;
      text-align: center;
    }
  }
}
</style>
