<template>
  <div class="q-pa-lg">

    <!-- Header -->
    <div class="adm-header">
      <div class="adm-header__left">
        <p class="adm-header__overline">Admin</p>
        <h1 class="adm-header__title">Textos das Páginas</h1>
        <p class="adm-header__desc">Edite o conteúdo exibido em cada seção do site.</p>
      </div>
    </div>

    <!-- ── Tabs ─────────────────────────────────────────────────────────────── -->
    <q-tabs
      v-model="activeTab"
      align="left"
      dense
      indicator-color="positive"
      active-color="positive"
      class="q-mb-lg adm-text-secondary"
    >
      <q-tab name="hero"       label="Home — Hero"      icon="home" />
      <q-tab name="process"    label="Home — Processo"   icon="engineering" />
      <q-tab name="story"      label="Sobre — História"  icon="auto_stories" />
      <q-tab name="values"     label="Sobre — Valores"   icon="verified" />
      <q-tab name="team-intro" label="Sobre — Equipe"    icon="group" />
    </q-tabs>

    <q-tab-panels v-model="activeTab" animated keep-alive class="bg-transparent">

      <!-- ════════════════════════════════════════════════════════════════════════
           TAB: HOME HERO
           ════════════════════════════════════════════════════════════════════ -->
      <q-tab-panel name="hero" class="q-pa-none">
        <SectionPanel
          title="Seção Hero — Home"
          description="Texto exibido na tela inicial do site."
          :saved="!!heroDocId"
        >
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-input dark filled dense v-model="hero.eyebrow"
                label="Eyebrow (texto acima do título)"
                hint="Ex: Florida's Premier Enclosure Specialists" />
            </div>
            <div class="col-12">
              <q-input dark filled dense v-model="hero.heading"
                label="Título principal" type="textarea" autogrow
                hint="Use \n para quebrar linha" />
            </div>
            <div class="col-12">
              <q-input dark filled dense v-model="hero.sub"
                label="Subtítulo" type="textarea" autogrow
                hint="Frase descritiva abaixo do título" />
            </div>
          </div>

          <div class="section-preview q-mt-md">
            <p class="adm-section-label">
              <q-icon name="visibility" size="14px" />Preview
            </p>
            <div class="hero-preview">
              <p class="hero-preview__eyebrow">{{ hero.eyebrow }}</p>
              <h2 class="hero-preview__heading" v-html="heroHeadingHtml" />
              <p class="hero-preview__sub">{{ hero.sub }}</p>
            </div>
          </div>

          <template #footer>
            <q-btn flat no-caps label="Descartar" color="grey-5" icon="undo"
              :disable="saving.hero" @click="resetSection('hero')" />
            <q-btn unelevated no-caps label="Salvar seção" color="positive" text-color="dark"
              icon="save" :loading="saving.hero" @click="saveSection('hero')" />
          </template>
        </SectionPanel>
      </q-tab-panel>

      <!-- ════════════════════════════════════════════════════════════════════════
           TAB: HOME PROCESS
           ════════════════════════════════════════════════════════════════════ -->
      <q-tab-panel name="process" class="q-pa-none">
        <SectionPanel
          title="Seção Processo — Home"
          description="Título, descrição e os 6 passos do processo."
          :saved="!!processDocId"
        >
          <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-12 col-sm-6">
              <q-input dark filled dense v-model="process.heading"
                label="Título da seção" type="textarea" autogrow
                hint="Use \n para quebrar linha" />
            </div>
            <div class="col-12 col-sm-6">
              <q-input dark filled dense v-model="process.desc"
                label="Descrição" type="textarea" autogrow
                hint="Parágrafo abaixo do título" />
            </div>
          </div>

          <p class="adm-section-label q-mb-md">
            <q-icon name="format_list_numbered" size="14px" />
            Passos ({{ process.steps.length }})
          </p>
          <div v-for="(step, i) in process.steps" :key="i" class="step-row q-mb-sm">
            <div class="step-row__number">{{ step.number }}</div>
            <div class="row q-col-gutter-sm col">
              <div class="col-12 col-sm-3">
                <q-input dark filled dense v-model="step.icon" label="Ícone Material" hint="Ex: search, build" />
              </div>
              <div class="col-12 col-sm-4">
                <q-input dark filled dense v-model="step.title" label="Título" />
              </div>
              <div class="col-12 col-sm-5">
                <q-input dark filled dense v-model="step.description" label="Descrição" type="textarea" autogrow />
              </div>
            </div>
          </div>

          <template #footer>
            <q-btn flat no-caps label="Descartar" color="grey-5" icon="undo"
              :disable="saving.process" @click="resetSection('process')" />
            <q-btn unelevated no-caps label="Salvar seção" color="positive" text-color="dark"
              icon="save" :loading="saving.process" @click="saveSection('process')" />
          </template>
        </SectionPanel>
      </q-tab-panel>

      <!-- ════════════════════════════════════════════════════════════════════════
           TAB: ABOUT STORY
           ════════════════════════════════════════════════════════════════════ -->
      <q-tab-panel name="story" class="q-pa-none">
        <SectionPanel
          title="Seção História — Sobre"
          description="Duas imagens lado a lado e parágrafos com suporte a HTML (bold com <strong>)."
          :saved="!!storyDocId"
        >
          <!-- Images -->
          <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-12 col-sm-6">
              <AdminImageField
                v-model="story.imageLeft"
                label="Imagem Esquerda — URL"
                hint="Imagem portrait exibida à esquerda (abaixo do título)"
                icon="image"
                badge="Sobre"
              />
            </div>
            <div class="col-12 col-sm-6">
              <AdminImageField
                v-model="story.imageRight"
                label="Imagem Direita — URL"
                hint="Imagem landscape exibida à direita (acima do texto)"
                icon="image"
                badge="Sobre"
              />
            </div>
          </div>

          <div class="adm-card__divider q-mb-md" style="margin-left:0;margin-right:0" />

          <!-- Paragraphs -->
          <p class="adm-section-label q-mb-xs">
            <q-icon name="text_fields" size="14px" />Parágrafos
            <span class="adm-hint q-ml-sm">Suporte a HTML — use &lt;strong&gt;texto&lt;/strong&gt; para negrito</span>
          </p>
          <AdminArrayField
            v-model="story.paragraphs"
            label="Parágrafos da História"
            item-label="parágrafo"
            placeholder="Use <strong>texto</strong> para negrito inline..."
            :multiline="true"
            class="q-mb-lg"
          />

          <template #footer>
            <q-btn flat no-caps label="Descartar" color="grey-5" icon="undo"
              :disable="saving.story" @click="resetSection('story')" />
            <q-btn unelevated no-caps label="Salvar seção" color="positive" text-color="dark"
              icon="save" :loading="saving.story" @click="saveSection('story')" />
          </template>
        </SectionPanel>
      </q-tab-panel>

      <!-- ════════════════════════════════════════════════════════════════════════
           TAB: ABOUT VALUES
           ════════════════════════════════════════════════════════════════════ -->
      <q-tab-panel name="values" class="q-pa-none">
        <SectionPanel
          title="Seção Valores — Sobre"
          description="Texto intro, 4 atributos (pills), imagem + bullets e closing statement."
          :saved="!!valuesDocId"
        >
          <!-- Intro text -->
          <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-12">
              <q-input dark filled dense v-model="values.intro"
                label="Texto introdutório"
                hint="Ex: Together, their partnership creates a balanced system:" />
            </div>
          </div>

          <div class="adm-card__divider q-mb-md" style="margin-left:0;margin-right:0" />

          <!-- Pills -->
          <p class="adm-section-label q-mb-sm">
            <q-icon name="label" size="14px" />Atributos (Pills)
          </p>
          <AdminArrayField
            v-model="values.pills"
            label="Atributos"
            item-label="atributo"
            placeholder="Ex: Technical precision in the field"
            class="q-mb-lg"
          />

          <div class="adm-card__divider q-mb-md" style="margin-left:0;margin-right:0" />

          <!-- Image -->
          <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-12 col-sm-8">
              <AdminImageField
                v-model="values.image"
                label="Imagem da seção — URL"
                hint="Imagem quadrada exibida à esquerda dos bullets"
                icon="image"
                badge="Sobre"
              />
            </div>
          </div>

          <div class="adm-card__divider q-mb-md" style="margin-left:0;margin-right:0" />

          <!-- Bullets -->
          <p class="adm-section-label q-mb-sm">
            <q-icon name="format_list_bulleted" size="14px" />Bullets (diferenciais)
          </p>
          <AdminArrayField
            v-model="values.bullets"
            label="Bullets"
            item-label="bullet"
            placeholder="Ex: We are not volume-driven."
            class="q-mb-lg"
          />

          <div class="adm-card__divider q-mb-md" style="margin-left:0;margin-right:0" />

          <!-- Statement -->
          <p class="adm-section-label q-mb-sm">
            <q-icon name="format_quote" size="14px" />Closing Statement (seção branca)
          </p>
          <AdminArrayField
            v-model="values.statement"
            label="Parágrafos"
            item-label="parágrafo"
            placeholder="Ex: Every enclosure we build..."
            :multiline="true"
            class="q-mb-lg"
          />

          <template #footer>
            <q-btn flat no-caps label="Descartar" color="grey-5" icon="undo"
              :disable="saving.values" @click="resetSection('values')" />
            <q-btn unelevated no-caps label="Salvar seção" color="positive" text-color="dark"
              icon="save" :loading="saving.values" @click="saveSection('values')" />
          </template>
        </SectionPanel>
      </q-tab-panel>

      <!-- ════════════════════════════════════════════════════════════════════════
           TAB: ABOUT TEAM INTRO
           ════════════════════════════════════════════════════════════════════ -->
      <q-tab-panel name="team-intro" class="q-pa-none">
        <SectionPanel
          title="Intro da Equipe — Sobre"
          description="Texto descritivo exibido ao lado do título da seção Team."
          :saved="!!teamIntroDocId"
        >
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-input
                dark filled dense
                v-model="teamIntro.description"
                label="Descrição da equipe"
                type="textarea"
                autogrow
                rows="4"
                hint="Texto exibido à direita do título 'Our Amazing Team'"
              />
            </div>
          </div>

          <template #footer>
            <q-btn flat no-caps label="Descartar" color="grey-5" icon="undo"
              :disable="saving['team-intro']" @click="resetSection('team-intro')" />
            <q-btn unelevated no-caps label="Salvar seção" color="positive" text-color="dark"
              icon="save" :loading="saving['team-intro']" @click="saveSection('team-intro')" />
          </template>
        </SectionPanel>
      </q-tab-panel>

    </q-tab-panels>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, defineComponent, h } from 'vue'
import { useQuasar } from 'quasar'
import { useCmsStore } from 'stores/cms'
import AdminImageField from 'src/components/admin/AdminImageField.vue'
import AdminArrayField from 'src/components/admin/AdminArrayField.vue'

// ── Types ─────────────────────────────────────────────────────────────────────
interface PageDoc { id?: string; sectionId?: string; [k: string]: unknown }
interface Step    { number: string; icon: string; title: string; description: string }

// ── Store ─────────────────────────────────────────────────────────────────────
const $q    = useQuasar()
const store = useCmsStore()

type TabKey = 'hero' | 'process' | 'story' | 'values' | 'team-intro'
const activeTab = ref<TabKey>('hero')

const heroDocId      = ref<string | null>(null)
const processDocId   = ref<string | null>(null)
const storyDocId     = ref<string | null>(null)
const valuesDocId    = ref<string | null>(null)
const teamIntroDocId = ref<string | null>(null)

const saving = reactive<Record<TabKey, boolean>>({
  'hero': false, 'process': false, 'story': false, 'values': false, 'team-intro': false,
})

// ── Forms ─────────────────────────────────────────────────────────────────────
const hero = reactive({
  eyebrow: "Florida's Premier Enclosure Specialists",
  heading: 'Custom Pool Cages\n& Aluminum Enclosures',
  sub:     "Built to complement your home, withstand Florida's conditions, and deliver lasting value — from engineering to final inspection.",
})

const DEFAULT_STEPS: Step[] = [
  { number: '1', icon: 'person_search',  title: 'Private Consultation & Site Evaluation', description: 'Every project begins with a detailed on-site consultation. We carefully assess your space, understand your goals, and evaluate structural and architectural considerations to ensure the final result integrates seamlessly with your home.\n\nWe don\'t offer one-size-fits-all solutions — we design with intention.' },
  { number: '2', icon: 'architecture',   title: 'Custom Design & Engineering',             description: 'Once measurements are finalized, we develop a tailored enclosure plan engineered for Florida\'s environmental conditions. Our focus is on structural integrity, clean lines, proportional balance, and long-term durability.\n\nPermits and compliance requirements are handled with precision.' },
  { number: '3', icon: 'inventory_2',    title: 'Material Selection & Preparation',        description: 'We use premium-grade aluminum and high-quality screening materials selected for strength, longevity, and refined appearance.\n\nPrecision begins long before the first anchor is set.' },
  { number: '4', icon: 'engineering',    title: 'Professional Installation',               description: 'Our installation process is methodical and detail-driven. We prioritize structural accuracy, clean framing alignment, and flawless screen tensioning.\n\nWe maintain organized job sites and treat your property with respect throughout the build.' },
  { number: '5', icon: 'fact_check',     title: 'Final Inspection & Client Walkthrough',   description: 'Upon completion, we conduct a full structural and aesthetic inspection to ensure the enclosure meets our standards.\n\nOur goal is simple: deliver a finished product that exceeds expectations.' },
  { number: '6', icon: 'verified_user',  title: 'Structural Validation',                   description: 'Every project is finalized with internal quality control protocols and detailed verification of structural and finishing standards.\n\nOur process doesn\'t end with completion — it is validated, recorded, and aligned with our standards.' },
]

const process = reactive({
  heading: 'Built on Process.\nDelivered with Precision.',
  desc:    'Every project follows a structured approach — from the first site visit to the final inspection. No shortcuts, no surprises.',
  steps:   DEFAULT_STEPS.map(s => ({ ...s })),
})

// about-story — updated fields (imageLeft + imageRight, no metrics/foundingYear)
const story = reactive({
  imageLeft:  '',
  imageRight: '',
  paragraphs: [
    'Alumen Outdoors Structure was founded on a simple principle: premium structures require premium standards. <strong>We are a high-end aluminum contractor specializing in custom pool cages, lanai extensions, and architectural enclosures designed to enhance both the strength and sophistication of your outdoor space.</strong> Every project we undertake reflects precision, structural discipline, and refined execution.',
    '<strong>Our company is led by partners Andre Queiroz and Jaspher Santos</strong>, whose complementary roles ensure that every client receives both technical excellence and a seamless professional experience.',
    '<strong>Andre Queiroz leads field operations and installation.</strong> With a hands-on approach and a relentless focus on craftsmanship, he oversees structural integrity, alignment, finishing detail, and quality control on every build.',
    '<strong>Jaspher Santos leads client relations and project coordination.</strong> From the initial consultation through final delivery, he ensures clear communication, transparency, and a structured process.',
  ] as string[],
})

// about-values
const values = reactive({
  intro: 'Together, their partnership creates a balanced system:',
  pills: [
    'Technical precision in the field',
    'Professional structure in communication',
    'Disciplined project execution',
    'Refined client experience',
  ] as string[],
  image:   '',
  bullets: [
    'We are not volume-driven.',
    'We do not compete on price.',
    'We compete on quality, consistency, and long-term performance.',
  ] as string[],
  statement: [
    "Every enclosure we build is designed to complement your home, withstand Florida's conditions, and deliver lasting value. Our work is guided by intention — from engineering to final inspection.",
    'At Alumen Outdoors Structure, luxury is not defined by excess. It is defined by discipline, structure, and attention to detail.',
  ] as string[],
})

// about-team
const teamIntro = reactive({
  description: 'Our team is composed of skilled professionals dedicated to precision and quality. We work with a structured approach to deliver refined, reliable results. Every project is handled with attention to detail and clear communication. Our goal is to provide a seamless experience and exceptional craftsmanship.',
})

// ── Hero preview ──────────────────────────────────────────────────────────────
const heroHeadingHtml = computed(() => hero.heading.replace(/\n/g, '<br>'))

// ── Sync from store ───────────────────────────────────────────────────────────
function findSection(sectionId: string) {
  const pages = Array.isArray(store.pages) ? (store.pages as PageDoc[]) : []
  return pages.find(p => p.sectionId === sectionId) ?? null
}

function syncAll() {
  // hero
  const h = findSection('home-hero')
  if (h) {
    heroDocId.value = h.id ?? null
    Object.assign(hero, {
      eyebrow: h['eyebrow'] ?? hero.eyebrow,
      heading: h['heading'] ?? hero.heading,
      sub:     h['sub']     ?? hero.sub,
    })
  }

  // process
  const p = findSection('home-process')
  if (p) {
    processDocId.value = p.id ?? null
    process.heading = (p['heading'] as string) ?? process.heading
    process.desc    = (p['desc']    as string) ?? process.desc
    if (Array.isArray(p['steps']) && (p['steps'] as Step[]).length) {
      process.steps.splice(0, process.steps.length, ...(p['steps'] as Step[]).map(s => ({ ...s })))
    }
  }

  // about-story (new schema: imageLeft, imageRight, paragraphs)
  const s = findSection('about-story')
  if (s) {
    storyDocId.value  = s.id ?? null
    story.imageLeft   = (s['imageLeft']  as string) ?? story.imageLeft
    story.imageRight  = (s['imageRight'] as string) ?? story.imageRight
    if (Array.isArray(s['paragraphs'])) {
      story.paragraphs.splice(0, story.paragraphs.length, ...(s['paragraphs'] as string[]))
    }
  }

  // about-values
  const v = findSection('about-values')
  if (v) {
    valuesDocId.value = v.id ?? null
    values.intro      = (v['intro'] as string) ?? values.intro
    values.image      = (v['image'] as string) ?? values.image
    if (Array.isArray(v['pills']))     values.pills.splice(0,     values.pills.length,     ...(v['pills']     as string[]))
    if (Array.isArray(v['bullets']))   values.bullets.splice(0,   values.bullets.length,   ...(v['bullets']   as string[]))
    if (Array.isArray(v['statement'])) values.statement.splice(0, values.statement.length, ...(v['statement'] as string[]))
  }

  // about-team
  const t = findSection('about-team')
  if (t) {
    teamIntroDocId.value    = t.id ?? null
    teamIntro.description   = (t['description'] as string) ?? teamIntro.description
  }
}

watch(() => store.pages, syncAll, { immediate: true, deep: true })

function resetSection(_tab: TabKey) { syncAll() }

// ── Save ──────────────────────────────────────────────────────────────────────
async function saveSection(tab: TabKey) {
  saving[tab] = true

  type MapEntry = { docId: typeof heroDocId; payload: () => Record<string, unknown> }
  const MAP: Record<TabKey, MapEntry> = {
    'hero':       { docId: heroDocId,      payload: () => ({ sectionId: 'home-hero',    ...hero }) },
    'process':    { docId: processDocId,   payload: () => ({ sectionId: 'home-process', ...process, steps: process.steps.map(s => ({ ...s })) }) },
    'story':      { docId: storyDocId,     payload: () => ({ sectionId: 'about-story',  imageLeft: story.imageLeft, imageRight: story.imageRight, paragraphs: [...story.paragraphs] }) },
    'values':     { docId: valuesDocId,    payload: () => ({ sectionId: 'about-values', intro: values.intro, image: values.image, pills: [...values.pills], bullets: [...values.bullets], statement: [...values.statement] }) },
    'team-intro': { docId: teamIntroDocId, payload: () => ({ sectionId: 'about-team',   description: teamIntro.description }) },
  }

  const { docId, payload } = MAP[tab]

  try {
    let result
    if (docId.value) {
      result = await store.updateDocs({ collection: 'pages', id: docId.value, data: payload() })
    } else {
      result = await store.saveDoc({ collection: 'pages', data: payload() })
      if (result?.value?.id) docId.value = result.value.id
    }
    if (result?.ok !== false) {
      $q.notify({ type: 'positive', message: 'Seção salva!', timeout: 2000 })
    }
  } catch (e) {
    $q.notify({ type: 'negative', message: `Erro: ${(e as Error).message}` })
  } finally {
    saving[tab] = false
  }
}

// ── SectionPanel sub-component ────────────────────────────────────────────────
const SectionPanel = defineComponent({
  props: {
    title:       { type: String, required: true },
    description: { type: String, default: '' },
    saved:       { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    return () => h('div', { class: 'adm-card section-panel' }, [
      h('div', { class: 'section-panel__header' }, [
        h('div', {}, [
          h('p', { class: 'section-panel__title' }, props.title),
          props.description
            ? h('p', { class: 'text-caption q-mb-none', style: 'color:#666' }, props.description)
            : null,
        ]),
        h('q-chip', {
          color: props.saved ? 'positive' : 'warning',
          textColor: 'dark',
          icon: props.saved ? 'cloud_done' : 'cloud_off',
          label: props.saved ? 'No Firebase' : 'Não salvo',
          dense: true,
        }),
      ]),
      h('div', { class: 'q-mb-lg' }, slots.default?.()),
      h('div', { class: 'section-panel__footer' }, slots.footer?.()),
    ])
  },
})
</script>

<style scoped lang="scss">
.section-panel {
  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding-bottom: 20px;
    margin-bottom: 24px;
    border-bottom: 1px solid $adm-border;
  }

  &__title {
    font-size: 15px;
    font-weight: 600;
    color: $adm-text;
    margin: 0 0 2px;
    font-family: $font-family-body;
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding-top: 16px;
    border-top: 1px solid $adm-border;
  }
}

.adm-hint {
  font-size: 11px;
  color: $adm-text-3;
  font-weight: 400;
}

.step-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  background: $adm-surface-2;
  border: 1px solid $adm-border;
  padding: 12px;
  border-radius: 4px;
  transition: border-color 0.15s;

  &:hover { border-color: $adm-border-hi; }

  &__number {
    min-width: 26px;
    height: 26px;
    border-radius: 50%;
    background: $adm-border;
    color: $adm-text-3;
    font-size: 10px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 6px;
    font-family: $font-family-body;
  }
}

.section-preview {
  background: $adm-surface-2;
  border: 1px dashed $adm-border;
  border-radius: 4px;
  padding: 16px 20px;
}

.hero-preview {
  &__eyebrow {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: $adm-accent;
    margin: 0 0 8px;
  }
  &__heading {
    font-size: clamp(16px, 3vw, 26px);
    font-weight: 800;
    color: $adm-text;
    text-transform: uppercase;
    margin: 0 0 8px;
    line-height: 1.1;
    font-family: $font-family-heading;
  }
  &__sub {
    font-size: 13px;
    font-weight: 300;
    color: $adm-text-2;
    line-height: 1.6;
    margin: 0;
  }
}
</style>
