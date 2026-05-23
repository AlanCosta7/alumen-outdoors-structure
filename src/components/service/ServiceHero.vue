<template>
  <header class="service-intro" aria-labelledby="service-intro-heading">
    <div class="max-content service-intro__grid">

      <!-- Left: eyebrow + title + rule -->
      <div class="service-intro__left">
        <p class="service-intro__eyebrow">Service</p>
        <h1 id="service-intro-heading" class="service-intro__heading">
          {{ title }}
        </h1>
        <div class="service-intro__rule" aria-hidden="true" />
      </div>

      <!-- Right: HTML description -->
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div class="service-intro__right" v-html="description" />

    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<style scoped lang="scss">
.service-intro {
  background-color: $brand-white;
  padding: 64px 0 60px;

  @media (max-width: 599px) { padding: 48px 0; }

  &__grid {
    display: grid;
    grid-template-columns: 45fr 55fr;
    gap: 64px;
    align-items: start;

    @media (max-width: 799px) {
      grid-template-columns: 1fr;
      gap: 24px;
    }
  }

  // ── Left col ────────────────────────────────────────────────────────────────
  &__eyebrow {
    font-family: $font-family-body;
    font-size: 11px;
    font-weight: 400;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: $brand-silver;
    margin: 0 0 14px;
  }

  &__heading {
    font-family: $font-family-heading;
    font-size: clamp(28px, 4.5vw, 52px);
    font-weight: 800;
    color: $brand-dark;
    text-transform: uppercase;
    line-height: 0.96;
    letter-spacing: -0.01em;
    margin: 0 0 24px;
  }

  &__rule {
    width: 36px;
    height: 2px;
    background-color: $brand-taupe;
    border-radius: 1px;
  }

  // ── Right col ───────────────────────────────────────────────────────────────
  &__right {
    padding-top: 36px;

    @media (max-width: 799px) { padding-top: 0; }

    :deep(p) {
      font-family: $font-family-body;
      font-size: 13px;
      font-weight: 300;
      color: $brand-dark;
      line-height: 1.75;
      margin: 0 0 16px;

      &:last-child { margin-bottom: 0; }
    }
  }
}
</style>
