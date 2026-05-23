<template>
  <q-page>
    <!-- Page Hero -->
    <header class="projects-hero" aria-label="Our Projects">
      <div class="projects-hero__overlay" aria-hidden="true" />
      <div class="max-content projects-hero__content">
        <p class="projects-hero__eyebrow">Portfolio</p>
        <h1 class="projects-hero__heading">
          Our Completed<br />Projects
        </h1>
        <p class="projects-hero__sub">
          Every structure tells a story. Browse our portfolio of pool cages,
          extended lanais, and porch enclosures installed across Florida's Gulf Coast.
        </p>
      </div>
    </header>

    <!-- Filter + Grid -->
    <section class="projects-content section" aria-labelledby="projects-filter-label">
      <div class="max-content">

        <!-- Category filter -->
        <div class="projects-filter" role="group" aria-labelledby="projects-filter-label">
          <p id="projects-filter-label" class="projects-filter__label">Filter by Category</p>
          <div class="projects-filter__tabs">
            <button
              v-for="cat in categories"
              :key="cat.value"
              class="projects-filter__tab"
              :class="{ 'projects-filter__tab--active': activeCategory === cat.value }"
              :aria-pressed="activeCategory === cat.value"
              @click="activeCategory = cat.value"
            >
              {{ cat.label }}
            </button>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="projects-loading" aria-busy="true">
          <q-spinner-dots size="36px" color="positive" />
        </div>

        <!-- Empty state -->
        <div v-else-if="!filteredProjects.length" class="projects-empty" role="status">
          <q-icon name="photo_library" size="48px" class="projects-empty__icon" aria-hidden="true" />
          <p class="projects-empty__text">
            {{ allProjects.length ? 'No projects in this category yet.' : 'Projects coming soon.' }}
          </p>
        </div>

        <!-- Grid -->
        <div v-else class="projects-grid" role="list" :aria-label="`${filteredProjects.length} projects`">
          <article
            v-for="project in filteredProjects"
            :key="project.id"
            class="project-card"
            role="listitem"
          >
            <div class="project-card__img-wrap" aria-hidden="true">
              <img
                v-if="project.coverImage"
                :src="project.coverImage"
                :alt="project.title"
                loading="lazy"
                decoding="async"
                width="640"
                height="480"
                class="project-card__img"
              />
              <div v-else class="project-card__img-placeholder" />
              <div class="project-card__overlay" aria-hidden="true" />
            </div>

            <div class="project-card__body">
              <span class="project-card__category">{{ project.category }}</span>
              <h2 class="project-card__title">{{ project.title }}</h2>
              <p v-if="project.location" class="project-card__location">
                <q-icon name="place" size="14px" aria-hidden="true" />
                {{ project.location }}
              </p>
              <p v-if="project.description" class="project-card__desc">
                {{ project.description }}
              </p>
            </div>
          </article>
        </div>

      </div>
    </section>

    <!-- CTA -->
    <section class="projects-cta section--dark" aria-labelledby="projects-cta-heading">
      <div class="max-content projects-cta__inner">
        <div>
          <p class="projects-cta__eyebrow">Ready for yours?</p>
          <h2 id="projects-cta-heading" class="projects-cta__heading">
            Let's Build Your Next Project.
          </h2>
        </div>
        <q-btn
          unelevated
          no-caps
          label="Get A Free Quote"
          to="/contact"
          class="projects-cta__btn"
          aria-label="Get a free quote — go to contact page"
        />
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMeta } from 'quasar'
import { useCmsStore } from 'stores/cms'

// ── Types ─────────────────────────────────────────────────────────────────────
interface ProjectDoc {
  id: string
  title: string
  category: string
  location?: string
  description?: string
  coverImage?: string
  gallery?: string[]
  order?: number
}

// ── CMS ───────────────────────────────────────────────────────────────────────
const store = useCmsStore()

const loading = computed(() => !Array.isArray(store.projects))

const allProjects = computed<ProjectDoc[]>(() =>
  Array.isArray(store.projects) ? (store.projects as ProjectDoc[]) : []
)

// ── Filter ────────────────────────────────────────────────────────────────────
const ALL = 'all'
const activeCategory = ref(ALL)

const categories = computed(() => {
  const unique = [...new Set(allProjects.value.map((p) => p.category).filter(Boolean))]
  return [
    { value: ALL, label: 'All Projects' },
    ...unique.map((c) => ({ value: c, label: c })),
  ]
})

const filteredProjects = computed(() =>
  activeCategory.value === ALL
    ? allProjects.value
    : allProjects.value.filter((p) => p.category === activeCategory.value)
)

// ── SEO ───────────────────────────────────────────────────────────────────────
useMeta({
  title: 'Completed Projects — Pool Cages & Enclosures | Alumen Outdoors Structure',
  meta: {
    description: {
      name: 'description',
      content: 'Browse 1,200+ completed pool cages, extended lanais, and porch enclosures installed across Sarasota, Tampa, Bradenton, Venice & North Port, FL.',
    },
    robots:   { name: 'robots',   content: 'index, follow' },
    keywords: { name: 'keywords', content: 'pool cage projects Florida, aluminum enclosure portfolio, completed lanai projects, Sarasota pool cage gallery' },

    // Open Graph
    ogTitle:       { property: 'og:title',       content: 'Completed Projects | Alumen Outdoors Structure' },
    ogDescription: { property: 'og:description', content: 'Browse our portfolio of custom pool cages, extended lanais, and porch enclosures built across Florida\'s Gulf Coast.' },
    ogUrl:         { property: 'og:url',         content: 'https://alumenoutdoors.com/projects' },
    ogImage:       { property: 'og:image',       content: 'https://alumenoutdoors.com/og-image.jpg' },
    ogImageAlt:    { property: 'og:image:alt',   content: 'Portfolio of pool cage and enclosure projects by Alumen Outdoors Structure' },
    ogType:        { property: 'og:type',        content: 'website' },

    // Twitter / X
    twCard:        { name: 'twitter:card',        content: 'summary_large_image' },
    twTitle:       { name: 'twitter:title',       content: 'Completed Projects | Alumen Outdoors Structure' },
    twDescription: { name: 'twitter:description', content: 'Pool cages, lanais, and porch enclosures built across Florida\'s Gulf Coast.' },
    twImage:       { name: 'twitter:image',       content: 'https://alumenoutdoors.com/og-image.jpg' },
  },
  link: {
    canonical: { rel: 'canonical', href: 'https://alumenoutdoors.com/projects' },
  },
})
</script>

<style scoped lang="scss">
// ── Hero ──────────────────────────────────────────────────────────────────────
.projects-hero {
  position: relative;
  min-height: 50vh;
  display: flex;
  align-items: flex-end;
  background-color: $brand-dark;
  padding-bottom: 64px;

  @media (max-width: 599px) {
    min-height: 42vh;
    padding-bottom: 48px;
  }

  &__overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      105deg,
      rgba($brand-dark, 0.95) 0%,
      rgba($brand-dark, 0.65) 100%
    );
    z-index: 1;
  }

  &__content {
    position: relative;
    z-index: 2;
    padding-top: 120px;
    max-width: 720px;

    @media (max-width: 599px) { padding-top: 80px; }
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

  &__heading {
    font-family: $font-family-heading;
    font-size: clamp(36px, 6vw, 68px);
    font-weight: 800;
    color: $brand-white;
    text-transform: uppercase;
    line-height: 1.0;
    letter-spacing: -0.01em;
    margin: 0 0 16px;
  }

  &__sub {
    font-family: $font-family-body;
    font-size: clamp(14px, 1.6vw, 16px);
    font-weight: 300;
    color: rgba($brand-white, 0.72);
    line-height: 1.7;
    margin: 0;
    max-width: 540px;
  }
}

// ── Filter ────────────────────────────────────────────────────────────────────
.projects-filter {
  margin-bottom: 48px;

  &__label {
    font-family: $font-family-body;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: $brand-silver;
    margin: 0 0 16px;
  }

  &__tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
  }

  &__tab {
    font-family: $font-family-body;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: $brand-silver;
    background: transparent;
    border: 1px solid rgba($brand-silver, 0.2);
    padding: 10px 20px;
    cursor: pointer;
    transition: background-color 0.2s, color 0.2s, border-color 0.2s;

    &:hover {
      color: $brand-white;
      border-color: rgba($brand-white, 0.3);
      background-color: rgba($brand-dark, 0.06);
    }

    &:focus-visible { outline: 2px solid $brand-green; outline-offset: 2px; }

    &--active {
      background-color: $brand-dark;
      color: $brand-white;
      border-color: $brand-dark;
    }
  }
}

// ── Loading / empty ───────────────────────────────────────────────────────────
.projects-loading,
.projects-empty {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.projects-empty {
  &__icon { color: rgba($brand-silver, 0.3); }

  &__text {
    font-family: $font-family-body;
    font-size: 14px;
    font-weight: 300;
    color: $brand-silver;
    margin: 0;
  }
}

// ── Grid ──────────────────────────────────────────────────────────────────────
.projects-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2px;

  @media (max-width: 1023px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 599px)  { grid-template-columns: 1fr; }
}

.project-card {
  overflow: hidden;
  background-color: $brand-dark;

  &__img-wrap {
    position: relative;
    aspect-ratio: 4 / 3;
    overflow: hidden;
  }

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.4s ease;
  }

  &__img-placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
  }

  &__overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to top,
      rgba($brand-dark, 0.6) 0%,
      transparent 50%
    );
    opacity: 0;
    transition: opacity 0.3s;
  }

  &__body {
    padding: 20px 20px 24px;
  }

  &__category {
    display: inline-block;
    font-family: $font-family-body;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: $brand-green;
    margin-bottom: 8px;
  }

  &__title {
    font-family: $font-family-heading;
    font-size: 18px;
    font-weight: 700;
    color: $brand-white;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    margin: 0 0 6px;
    line-height: 1.2;
  }

  &__location {
    display: flex;
    align-items: center;
    gap: 4px;
    font-family: $font-family-body;
    font-size: 12px;
    font-weight: 300;
    color: $brand-silver;
    margin: 0 0 10px;
  }

  &__desc {
    font-family: $font-family-body;
    font-size: 13px;
    font-weight: 300;
    color: rgba($brand-silver, 0.8);
    line-height: 1.6;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &:hover {
    .project-card__img { transform: scale(1.03); }
    .project-card__overlay { opacity: 1; }
  }
}

// ── CTA strip ─────────────────────────────────────────────────────────────────
.projects-cta {
  padding: 64px 0;
  background-color: $brand-dark;

  &__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 32px;

    @media (max-width: 767px) {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  &__eyebrow {
    font-family: $font-family-body;
    font-size: 11px;
    font-weight: 400;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: $brand-green;
    margin: 0 0 10px;
  }

  &__heading {
    font-family: $font-family-heading;
    font-size: clamp(24px, 3.5vw, 40px);
    font-weight: 800;
    color: $brand-white;
    text-transform: uppercase;
    margin: 0;
    line-height: 1.05;
  }

  &__btn {
    flex-shrink: 0;
    background-color: $brand-green !important;
    color: $brand-dark !important;
    font-family: $font-family-body;
    font-weight: 600;
    font-size: 13px;
    letter-spacing: 0.08em;
    border-radius: 0;
    padding: 14px 32px;
    min-height: 48px;

    &:focus-visible { outline: 2px solid $brand-white; outline-offset: 3px; }
  }
}
</style>
