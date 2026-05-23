<template>
  <section
    v-if="members.length"
    class="team"
    aria-labelledby="team-heading"
  >
    <div class="max-content">

      <!-- ── Header: eyebrow + heading (left) / description (right) ──────────── -->
      <div class="team__header">
        <div class="team__header-left">
          <p class="eyebrow">Team</p>
          <h2 id="team-heading" class="team__heading heading-underline">
            Our Amazing<br />Team
          </h2>
        </div>
        <div class="team__header-right">
          <p class="team__desc">{{ section.description }}</p>
        </div>
      </div>

      <!-- ── Cards ───────────────────────────────────────────────────────────── -->
      <div class="team__grid" role="list" aria-label="Team members">
        <article
          v-for="member in sorted"
          :key="member.id"
          class="team-card"
          role="listitem"
        >
          <!-- Photo -->
          <div class="team-card__photo-wrap" aria-hidden="true">
            <img
              v-if="member.photo"
              :src="member.photo"
              :alt="member.name"
              loading="lazy"
              decoding="async"
              width="360"
              height="480"
              class="team-card__photo"
            />
            <div v-else class="team-card__photo-placeholder">
              <q-icon name="person" size="56px" class="team-card__placeholder-icon" aria-hidden="true" />
            </div>
          </div>

          <!-- Info -->
          <div class="team-card__body">
            <h3 class="team-card__name">{{ member.name }}</h3>
            <p class="team-card__role">{{ member.role }}</p>
          </div>
        </article>
      </div>

    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePageSection } from 'composables/usePageSection'

interface TeamMember {
  id: string
  name: string
  role: string
  bio?: string
  photo?: string
  order?: number
}

const props = defineProps<{
  members: TeamMember[]
}>()

// Sort by order field from CMS
const sorted = computed(() =>
  [...props.members].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
)

const section = usePageSection('about-team', {
  description:
    'Our team is composed of skilled professionals dedicated to precision and quality. We work with a structured approach to deliver refined, reliable results. Every project is handled with attention to detail and clear communication. Our goal is to provide a seamless experience and exceptional craftsmanship.',
})
</script>

<style scoped lang="scss">
.team {
  background-color: $brand-dark;
  padding: 72px 0 64px;

  // ── Header ────────────────────────────────────────────────────────────────
  &__header {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 56px;
    align-items: start;
    margin-bottom: 52px;

    @media (max-width: 899px) {
      grid-template-columns: 1fr;
      gap: 20px;
      margin-bottom: 40px;
    }
  }

  &__header-left {
    // Override global .eyebrow color for dark background
    :deep(.eyebrow) { color: $secondary; }
  }

  &__heading {
    font-family: $font-family-heading;
    font-size: clamp(36px, 5vw, 54px);
    font-weight: 800;
    color: $brand-white;
    text-transform: uppercase;
    line-height: 0.96;
    letter-spacing: -0.01em;
    margin: 0;
  }

  &__header-right {
    // Align description text with heading top
    padding-top: 28px;

    @media (max-width: 899px) { padding-top: 0; }
  }

  &__desc {
    font-family: $font-family-body;
    font-size: 13px;
    font-weight: 300;
    color: $brand-white;
    line-height: 1.75;
    margin: 0;
  }

  // ── Cards grid ────────────────────────────────────────────────────────────
  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;

    @media (max-width: 699px) { grid-template-columns: 1fr; }
  }
}

// ── Card ───────────────────────────────────────────────────────────────────────
.team-card {
  display: flex;
  flex-direction: column;

  // Photo wrapper
  &__photo-wrap {
    aspect-ratio: 3 / 4;
    overflow: hidden;
    border-radius: 6px;
    background-color: #2a2a2a;
  }

  &__photo {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top center;
    display: block;
    transition: transform 0.45s ease;
  }

  &__photo-placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(160deg, #2e2e2e 0%, #1a1a1a 100%);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__placeholder-icon { color: rgba($brand-silver, 0.25); }

  // Text below photo
  &__body {
    padding: 16px 4px 0;
    text-align: center;
  }

  &__name {
    font-family: $font-family-heading;
    font-size: clamp(15px, 1.8vw, 19px);
    font-weight: 800;
    color: $brand-white;
    text-transform: uppercase;
    letter-spacing: 0.01em;
    line-height: 1.15;
    margin: 0 0 5px;
  }

  &__role {
    font-family: $font-family-body;
    font-size: 12px;
    font-weight: 400;
    color: rgba($brand-silver, 0.75);
    margin: 0;
    line-height: 1.4;
  }

  // Subtle photo zoom on hover
  &:hover .team-card__photo { transform: scale(1.04); }
}
</style>
