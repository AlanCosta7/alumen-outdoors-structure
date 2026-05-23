<template>
  <!-- Two sections rendered as one component: dark block + white closing statement -->
  <div>

    <!-- ── Dark block ──────────────────────────────────────────────────────────── -->
    <section class="values section--dark" aria-label="Our values and approach">
      <div class="max-content">

        <!-- Intro heading -->
        <p class="values__intro">{{ section.intro }}</p>

        <!-- 4 attribute pills -->
        <ul class="values__pills" role="list" aria-label="Partnership attributes">
          <li
            v-for="pill in section.pills"
            :key="pill"
            class="values__pill"
            role="listitem"
          >
            {{ pill }}
          </li>
        </ul>

        <!-- Image + bullet list row -->
        <div class="values__bottom-row">

          <!-- Image -->
          <div class="values__img-wrap" aria-hidden="true">
            <img
              v-if="section.image"
              :src="section.image"
              alt="Alumen Outdoors Structure — quality driven approach"
              loading="lazy"
              decoding="async"
              width="480"
              height="480"
              class="values__img"
            />
            <div v-else class="values__img-placeholder" />
          </div>

          <!-- Bullet list -->
          <ul class="values__bullets" aria-label="Our commitments">
            <li
              v-for="bullet in section.bullets"
              :key="bullet"
              class="values__bullet"
            >
              {{ bullet }}
            </li>
          </ul>

        </div>
      </div>
    </section>

    <!-- ── White closing statement ─────────────────────────────────────────────── -->
    <section class="statement section" aria-label="Our philosophy">
      <div class="max-content">
        <p
          v-for="(para, i) in section.statement"
          :key="i"
          class="statement__p"
        >
          {{ para }}
        </p>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
import { usePageSection } from 'composables/usePageSection'

const section = usePageSection('about-values', {
  intro: 'Together, their partnership creates a balanced system:',

  pills: [
    'Technical precision in the field',
    'Professional structure in communication',
    'Disciplined project execution',
    'Refined client experience',
  ] as string[],

  image: '',

  bullets: [
    'We are not volume-driven.',
    'We do not compete on price.',
    'We compete on quality, consistency, and long-term performance.',
  ] as string[],

  statement: [
    'Every enclosure we build is designed to complement your home, withstand Florida\'s conditions, and deliver lasting value. Our work is guided by intention — from engineering to final inspection.',
    'At Alumen Outdoors Structure, luxury is not defined by excess. It is defined by discipline, structure, and attention to detail.',
  ] as string[],
})
</script>

<style scoped lang="scss">
// ── Dark block ─────────────────────────────────────────────────────────────────
.values {
  background-color: $brand-dark;
  padding: 48px 0 52px;

  // Intro text
  &__intro {
    font-family: $font-family-body;
    font-size: 14px;
    font-weight: 400;   // not bold — regular weight like the prototype
    color: $brand-white;
    line-height: 1.5;
    margin: 0 0 24px;
    max-width: 360px;
  }

  // ── Pills ──────────────────────────────────────────────────────────────────
  &__pills {
    list-style: none;
    margin: 0 0 32px;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;

    @media (max-width: 899px)  { grid-template-columns: repeat(2, 1fr); }
    @media (max-width: 499px)  { grid-template-columns: 1fr; }
  }

  &__pill {
    border: 1px solid rgba($brand-white, 0.2);
    border-radius: 8px;
    padding: 16px 12px;
    text-align: center;
    font-family: $font-family-body;
    font-size: 13px;
    font-weight: 400;
    color: rgba($brand-white, 0.88);
    line-height: 1.45;
  }

  // ── Bottom row: image + bullets ────────────────────────────────────────────
  &__bottom-row {
    display: grid;
    // Left col fixed at 45% — matches prototype proportion
    grid-template-columns: 45fr 55fr;
    gap: 40px;
    align-items: center;

    @media (max-width: 699px) {
      grid-template-columns: 1fr;
      gap: 24px;
    }
  }

  &__img-wrap {
    // Landscape, not square — this is what the prototype shows
    aspect-ratio: 4 / 3;
    overflow: hidden;
    width: 100%;
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

  // ── Bullet list ────────────────────────────────────────────────────────────
  &__bullets {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  &__bullet {
    font-family: $font-family-body;
    font-size: 14px;
    font-weight: 400;
    color: $brand-white;
    line-height: 1.65;
    padding-left: 18px;
    position: relative;

    &::before {
      content: '•';
      position: absolute;
      left: 0;
      top: 0;
      color: $brand-white;
      font-size: 14px;
      line-height: 1.65;
    }
  }
}

// ── White closing statement ────────────────────────────────────────────────────
.statement {
  background-color: $brand-white;

  &__p {
    font-family: $font-family-body;
    font-size: 14px;
    font-weight: 300;
    color: $brand-dark;
    line-height: 1.75;
    margin: 0 0 16px;
    max-width: 600px;

    &:last-child { margin-bottom: 0; }
  }
}
</style>
