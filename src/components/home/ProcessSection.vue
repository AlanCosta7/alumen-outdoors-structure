<template>
  <section class="process section--dark" aria-labelledby="process-heading">
    <div class="max-content">

      <!-- Lead: overline + heading -->
      <div class="process__lead">
        <p class="process__overline">Our Process</p>
        <h2 id="process-heading" class="process__heading heading-underline" v-html="headingHtml" />
      </div>

      <!-- Full-width 3×2 steps grid -->
      <ol class="process__grid" aria-label="Our 6-step process">
        <li
          v-for="step in section.steps"
          :key="step.number"
          class="process-step"
        >
          <div class="process-step__icon" aria-hidden="true">
            <q-icon :name="step.icon" size="44px" />
          </div>
          <h3 class="process-step__title">{{ step.number }}. {{ step.title }}</h3>
          <p
            v-for="(para, i) in splitParas(step.description)"
            :key="i"
            class="process-step__desc"
          >{{ para }}</p>
        </li>
      </ol>

    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePageSection } from 'composables/usePageSection'

const DEFAULT_STEPS = [
  {
    number: '1',
    icon: 'person_search',
    title: 'Private Consultation & Site Evaluation',
    description:
      'Every project begins with a detailed on-site consultation. We carefully assess your space, understand your goals, and evaluate structural and architectural considerations to ensure the final result integrates seamlessly with your home.\n\nWe don\'t offer one-size-fits-all solutions — we design with intention.',
  },
  {
    number: '2',
    icon: 'architecture',
    title: 'Custom Design & Engineering',
    description:
      'Once measurements are finalized, we develop a tailored enclosure plan engineered for Florida\'s environmental conditions. Our focus is on structural integrity, clean lines, proportional balance, and long-term durability. Every detail — from layout to framing alignment — is considered before installation begins.\n\nPermits and compliance requirements are handled with precision to ensure a smooth and professional process.',
  },
  {
    number: '3',
    icon: 'inventory_2',
    title: 'Material Selection & Preparation',
    description:
      'We use premium-grade aluminum and high-quality screening materials selected for strength, longevity, and refined appearance. Before installation, all materials are prepared and organized to ensure efficiency and craftsmanship on site.\n\nPrecision begins long before the first anchor is set.',
  },
  {
    number: '4',
    icon: 'engineering',
    title: 'Professional Installation',
    description:
      'Our installation process is methodical and detail-driven. We prioritize structural accuracy, clean framing alignment, and flawless screen tensioning. Every connection point, panel line, and finishing detail is inspected for consistency and strength.\n\nWe maintain organized job sites and treat your property with respect throughout the build.',
  },
  {
    number: '5',
    icon: 'fact_check',
    title: 'Final Inspection & Client Walkthrough',
    description:
      'Upon completion, we conduct a full structural and aesthetic inspection to ensure the enclosure meets our standards.\n\nWe then walk the project with you, reviewing the details and answering any questions. Our goal is simple: deliver a finished product that exceeds expectations — not just meets them.',
  },
  {
    number: '6',
    icon: 'verified_user',
    title: 'Structural Validation',
    description:
      'Every project is finalized with internal quality control protocols and detailed verification of structural and finishing standards.\n\nWe document specifications, materials, and installation details to ensure consistency, traceability, and long-term performance.\n\nOur process doesn\'t end with completion — it is validated, recorded, and aligned with our standards of execution.',
  },
]

const section = usePageSection('home-process', {
  heading: 'Built on Process.\nDelivered with\nPrecision.',
  steps: DEFAULT_STEPS as unknown as Record<string, string>[],
})

const headingHtml = computed(() =>
  section.value.heading.replace(/\n/g, '<br>'),
)

// Split description on double-newline to render multi-paragraph
function splitParas(text: unknown): string[] {
  return String(text ?? '').split('\n\n').filter(Boolean)
}
</script>

<style scoped lang="scss">
// ── Section ───────────────────────────────────────────────────────────────────
.process {
  background-color: $brand-dark;
  color: $brand-white;
  padding: $section-padding-y 0;
  // Skip layout + paint for offscreen content — massive scroll perf win on mobile.
  // contain-intrinsic-size matches approximate rendered height to prevent jump.
  content-visibility: auto;
  contain-intrinsic-size: 0 720px;

  @media (max-width: 599px) { contain-intrinsic-size: 0 900px; }

  @media (max-width: 599px) { padding: $section-padding-y-sm 0; }

  // ── Lead: overline + heading ──────────────────────────────────────────────
  &__lead {
    margin-bottom: 72px;

    @media (max-width: 899px) { margin-bottom: 48px; }
    @media (max-width: 599px) { margin-bottom: 36px; }
  }

  &__overline {
    font-family: $font-family-body;
    font-size: 11px;
    font-weight: 400;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: $brand-silver;
    margin: 0 0 16px;
  }

  &__heading {
    font-family: $font-family-heading;
    font-size: clamp(44px, 6.5vw, 68px);
    font-weight: 800;
    color: $brand-white;
    text-transform: uppercase;
    line-height: 0.96;
    letter-spacing: -0.01em;
    margin: 0;
  }

  // ── Steps grid ────────────────────────────────────────────────────────────
  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    column-gap: 32px;
    row-gap: 64px;
    list-style: none;
    margin: 0;
    padding: 0;

    @media (max-width: 899px) {
      grid-template-columns: repeat(2, 1fr);
      column-gap: 24px;
      row-gap: 48px;
    }

    @media (max-width: 499px) {
      grid-template-columns: 1fr;
      row-gap: 40px;
    }
  }
}

// ── Step item ─────────────────────────────────────────────────────────────────
.process-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0;

  &__icon {
    color: rgba($brand-white, 0.32);
    margin-bottom: 28px;
    line-height: 1;
  }

  &__title {
    font-family: $font-family-heading;
    font-size: clamp(18px, 2.4vw, 26px);
    font-weight: 800;
    color: $brand-white;
    text-transform: uppercase;
    letter-spacing: 0.01em;
    line-height: 1.1;
    margin: 0 0 20px;
  }

  &__desc {
    font-family: $font-family-body;
    font-size: 13px;
    font-weight: 300;
    color: $brand-silver;
    line-height: 1.7;
    margin: 0 0 12px;
    max-width: 300px; // keeps text comfortable at the wider viewport

    &:last-child { margin-bottom: 0; }
  }
}
</style>
