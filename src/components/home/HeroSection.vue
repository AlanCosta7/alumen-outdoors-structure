<template>
  <section class="hero" :aria-label="`Hero — ${section.heading}`">
    <div class="hero__overlay" aria-hidden="true" />

    <!--
      LCP element: usar <img> em vez de background-image CSS permite ao browser
      descobrir e priorizar esta imagem no preload scanner, reduzindo o LCP.
      fetchpriority="high" instrui o browser a buscar antes de outros recursos.
    -->
    <img
      v-if="props.imageUrl"
      :src="props.imageUrl"
      alt=""
      aria-hidden="true"
      fetchpriority="high"
      decoding="async"
      class="hero__bg-img"
    />

    <div class="hero__content max-content">
      <p class="hero__eyebrow">{{ section.eyebrow }}</p>
      <h1 class="hero__heading" v-html="headingHtml" />
      <p class="hero__sub">{{ section.sub }}</p>

      <div class="hero__actions">
        <q-btn
          unelevated
          no-caps
          label="Get a Free Estimate"
          to="/contact"
          class="hero__btn hero__btn--primary"
          aria-label="Get a free estimate — go to contact page"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePageSection } from 'composables/usePageSection'

const props = withDefaults(defineProps<{
  imageUrl?: string
}>(), {
  imageUrl: '',
})

const section = usePageSection('home-hero', {
  eyebrow: "Florida's Premier Enclosure Specialists",
  heading: 'Custom Pool Cages &\nAluminum Enclosures',
  sub: "Built with precision. Designed to elevate your outdoor living.",
})

const headingHtml = computed(() =>
  section.value.heading.replace(/\n/g, '<br>'),
)
</script>

<style scoped lang="scss">
.hero {
  margin-top: -80px;
  position: relative;
  min-height: 92vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $brand-dark;
  overflow: hidden;

  @media (max-width: 599px) { min-height: 85vh; }

  // Imagem de fundo como <img> — cobre o container como background-size: cover
  &__bg-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    display: block;
    z-index: 0;
  }

  &__overlay {
    position: absolute;
    inset: 0;
    background: rgba(black, 0.60);
    z-index: 1;
  }

  &__content {
    position: relative;
    z-index: 2;
    padding-top: 80px;
    padding-bottom: 80px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;

    @media (max-width: 599px) {
      padding-top: 48px;
      padding-bottom: 48px;
    }
  }

  &__eyebrow {
    font-family: $font-family-body;
    font-size: 11px;
    font-weight: 400;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: $brand-white;
    margin: 0 0 16px;
    opacity: 0.75;
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
    max-width: 480px;
  }

  &__actions {
    display: flex;
    justify-content: center;
  }

  &__btn {
    font-family: $font-family-body;
    font-weight: 600;
    font-size: 13px;
    letter-spacing: 0.06em;
    border-radius: 10px;
    padding: 14px 32px;
    min-height: 44px;

    &:focus-visible { outline: 2px solid $brand-green; outline-offset: 3px; }

    &--primary {
      background-color: $brand-green !important;
      color: $brand-dark !important;
    }
  }
}
</style>
