<template>
  <section class="story section" aria-labelledby="story-heading">
    <div class="max-content">
      <div class="story__grid">

        <!-- ── Left: eyebrow + heading + image ───────────────────────────────── -->
        <div class="story__col-left">
          <p class="eyebrow">About Company</p>

          <h2 id="story-heading" class="story__heading heading-underline">
            We Build<br />With Precision<br />and Purpose
          </h2>

          <div class="story__img-wrap story__img-wrap--left" aria-hidden="true">
            <img
              v-if="section.imageLeft"
              :src="section.imageLeft"
              alt="Alumen team working on a project"
              loading="lazy"
              decoding="async"
              width="440"
              height="500"
              class="story__img"
            />
            <div v-else class="story__img-placeholder" />
          </div>
        </div>

        <!-- ── Right: image + body copy ──────────────────────────────────────── -->
        <div class="story__col-right">
          <div class="story__img-wrap story__img-wrap--right" aria-hidden="true">
            <img
              v-if="section.imageRight"
              :src="section.imageRight"
              alt="Completed aluminum enclosure project"
              loading="lazy"
              decoding="async"
              width="560"
              height="420"
              class="story__img"
            />
            <div v-else class="story__img-placeholder" />
          </div>

          <div class="story__copy">
            <p
              v-for="(para, i) in section.paragraphs"
              :key="i"
              v-html="para"
            />
          </div>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { usePageSection } from 'composables/usePageSection'

const DEFAULT_PARAGRAPHS = [
  'Alumen Outdoors Structure was founded on a simple principle: premium structures require premium standards. <strong>We are a high-end aluminum contractor specializing in custom pool cages, lanai extensions, and architectural enclosures designed to enhance both the strength and sophistication of your outdoor space.</strong> Every project we undertake reflects precision, structural discipline, and refined execution.',
  '<strong>Our company is led by partners Andre Queiroz and Jaspher Santos</strong>, whose complementary roles ensure that every client receives both technical excellence and a seamless professional experience.',
  '<strong>Andre Queiroz leads field operations and installation.</strong> With a hands-on approach and a relentless focus on craftsmanship, he oversees structural integrity, alignment, finishing detail, and quality control on every build. His commitment to precision ensures that every enclosure meets strict standards of durability and aesthetic balance.',
  '<strong>Jaspher Santos leads client relations and project coordination.</strong> From the initial consultation through final delivery, he ensures clear communication, transparency, and a structured process. His focus is to provide a smooth, organized experience while maintaining the elevated service standards expected from a premium contractor.',
]

const section = usePageSection('about-story', {
  imageLeft:  '',
  imageRight: '',
  paragraphs: DEFAULT_PARAGRAPHS as string[],
})
</script>

<style scoped lang="scss">
.story {
  background-color: $brand-white;

  // ── Two-column grid ─────────────────────────────────────────────────────────
  &__grid {
    display: grid;
    grid-template-columns: 45fr 55fr;
    gap: 28px;
    align-items: start;

    @media (max-width: 899px) {
      grid-template-columns: 1fr;
      gap: 40px;
    }
  }

  // ── Left column ─────────────────────────────────────────────────────────────
  &__col-left {
    display: flex;
    flex-direction: column;
  }

  &__heading {
    font-family: $font-family-heading;
    font-size: clamp(40px, 5.5vw, 60px);
    font-weight: 800;
    color: $brand-dark;
    text-transform: uppercase;
    line-height: 0.96;
    letter-spacing: -0.01em;
    margin: 0 0 0;
  }

  // ── Right column ────────────────────────────────────────────────────────────
  &__col-right {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  // ── Images ──────────────────────────────────────────────────────────────────
  &__img-wrap {
    overflow: hidden;

    &--left {
      aspect-ratio: 4 / 5;
      margin-top: 40px;

      @media (max-width: 899px) {
        aspect-ratio: 16 / 9;
        margin-top: 0;
      }
    }

    &--right {
      aspect-ratio: 4 / 3;
    }
  }

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  &__img-placeholder {
    width: 100%;
    height: 100%;
    background-color: $brand-green;
  }

  // ── Body copy ───────────────────────────────────────────────────────────────
  &__copy {
    display: flex;
    flex-direction: column;
    gap: 14px;

    p {
      font-family: $font-family-body;
      font-size: 14px;
      font-weight: 300;
      color: $brand-dark;
      line-height: 1.75;
      margin: 0;

      :deep(strong) {
        font-weight: 600;
        color: $brand-dark;
      }
    }
  }
}
</style>
