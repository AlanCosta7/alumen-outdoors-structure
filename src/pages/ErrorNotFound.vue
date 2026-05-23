<template>
  <div class="not-found" role="main">
    <div class="not-found__overlay" aria-hidden="true" />
    <div class="not-found__content">
      <p class="not-found__eyebrow">Error</p>
      <p class="not-found__code" aria-hidden="true">404</p>
      <h1 class="not-found__heading">Page Not Found</h1>
      <p class="not-found__sub">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div class="not-found__actions">
        <q-btn
          unelevated no-caps
          label="Go Home"
          to="/"
          class="not-found__btn not-found__btn--primary"
          aria-label="Return to homepage"
        />
        <q-btn
          flat no-caps
          label="Contact Us"
          to="/contact"
          class="not-found__btn not-found__btn--ghost"
          aria-label="Go to contact page"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMeta } from 'quasar'

useMeta({
  title: 'Page Not Found | Alumen Outdoors Structure',
  meta: {
    robots: { name: 'robots', content: 'noindex, nofollow' },
  },
})
</script>

<style scoped lang="scss">
.not-found {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $brand-dark;
  text-align: center;
  padding: 40px 24px;

  &__overlay {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at center, rgba($brand-green, 0.04) 0%, transparent 70%);
    pointer-events: none;
  }

  &__content {
    position: relative;
    z-index: 1;
    max-width: 560px;
  }

  &__eyebrow {
    font-family: $font-family-body;
    font-size: 11px;
    font-weight: 400;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: $brand-green;
    margin: 0 0 12px;
  }

  &__code {
    font-family: $font-family-heading;
    font-size: clamp(100px, 20vw, 180px);
    font-weight: 800;
    color: rgba($brand-white, 0.06);
    line-height: 1.0;
    margin: 0;
    letter-spacing: -0.04em;
    user-select: none;
  }

  &__heading {
    font-family: $font-family-heading;
    font-size: clamp(28px, 5vw, 48px);
    font-weight: 800;
    color: $brand-white;
    text-transform: uppercase;
    margin: -24px 0 16px;
    line-height: 1.0;
  }

  &__sub {
    font-family: $font-family-body;
    font-size: 15px;
    font-weight: 300;
    color: $brand-silver;
    line-height: 1.7;
    margin: 0 0 36px;
  }

  &__actions {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 12px;
  }

  &__btn {
    font-family: $font-family-body;
    font-weight: 600;
    font-size: 13px;
    letter-spacing: 0.08em;
    border-radius: 0;
    padding: 14px 32px;
    min-height: 48px;

    &:focus-visible { outline: 2px solid $brand-green; outline-offset: 3px; }

    &--primary {
      background-color: $brand-green !important;
      color: $brand-dark !important;
    }

    &--ghost {
      color: $brand-white !important;
      border: 1px solid rgba($brand-white, 0.35) !important;

      &:hover { border-color: $brand-white !important; }
    }
  }
}
</style>
