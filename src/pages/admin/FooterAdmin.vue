<template>
  <div class="q-pa-lg">

    <!-- Header -->
    <div class="adm-header">
      <div class="adm-header__left">
        <p class="adm-header__overline">Admin</p>
        <h1 class="adm-header__title">Rodapé</h1>
        <p class="adm-header__desc">Tagline e links de redes sociais exibidos no rodapé.</p>
      </div>
      <div class="adm-header__actions">
        <q-chip
          :color="docId ? 'positive' : 'warning'"
          text-color="dark"
          :icon="docId ? 'cloud_done' : 'cloud_off'"
          :label="docId ? 'Sincronizado' : 'Sem dados no Firebase'"
          dense
        />
      </div>
    </div>

    <q-form @submit.prevent="save">

      <!-- ── Identidade ──────────────────────────────────────────────────────── -->
      <div class="adm-card q-mb-md">
        <p class="adm-card__title">
          <q-icon name="format_quote" size="16px" />Identidade
        </p>
        <q-input
          dark filled dense
          v-model="form.tagline"
          label="Tagline"
          hint="Frase exibida abaixo do logo no rodapé"
        />
      </div>

      <!-- ── Redes Sociais ──────────────────────────────────────────────────── -->
      <div class="adm-card q-mb-md">
        <p class="adm-card__title">
          <q-icon name="share" size="16px" />Redes Sociais
        </p>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-6">
            <q-input
              dark filled dense
              v-model="form.instagram"
              label="Instagram — URL completa"
              hint="Ex: https://www.instagram.com/alumenoutdoors"
              clearable
            >
              <template #prepend>
                <span class="adm-svg-icon" v-html="instagramSvg" aria-hidden="true" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-sm-6">
            <q-input
              dark filled dense
              v-model="form.facebook"
              label="Facebook — URL completa"
              hint="Ex: https://www.facebook.com/alumenoutdoors"
              clearable
            >
              <template #prepend>
                <span class="adm-svg-icon" v-html="facebookSvg" aria-hidden="true" />
              </template>
            </q-input>
          </div>
        </div>
      </div>

      <!-- ── Preview ────────────────────────────────────────────────────────── -->
      <div class="adm-card q-mb-xl">
        <p class="adm-card__title">
          <q-icon name="visibility" size="16px" />Preview
        </p>
        <div class="footer-preview">
          <p class="footer-preview__tagline">{{ form.tagline || '—' }}</p>
          <div class="footer-preview__social">
            <span v-if="form.instagram" class="footer-preview__link">
              <span class="adm-svg-icon adm-svg-icon--sm" v-html="instagramSvg" aria-hidden="true" />Instagram
            </span>
            <span v-if="form.facebook" class="footer-preview__link">
              <span class="adm-svg-icon adm-svg-icon--sm" v-html="facebookSvg" aria-hidden="true" />Facebook
            </span>
            <span v-if="!form.instagram && !form.facebook" class="text-caption adm-text-hint">
              Nenhuma rede social configurada
            </span>
          </div>
        </div>
      </div>

      <!-- ── Actions ──────────────────────────────────────────────────────────── -->
      <div class="row justify-end q-gutter-sm">
        <q-btn flat no-caps label="Descartar" color="grey-5" icon="undo" :disable="saving" @click="reset" />
        <q-btn unelevated no-caps type="submit" label="Salvar Rodapé" color="positive" text-color="dark" icon="save" :loading="saving" />
      </div>

    </q-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useCmsStore } from 'stores/cms'
import instagramSvg from 'src/assets/icons/instagram.svg?raw'
import facebookSvg  from 'src/assets/icons/facebook.svg?raw'

interface FooterDoc {
  id?:       string
  tagline?:  string
  instagram?: string
  facebook?: string
}

const $q    = useQuasar()
const store = useCmsStore()
const saving = ref(false)
const docId  = ref<string | null>(null)

const DEFAULTS = {
  tagline:   'Building with precision and purpose — Florida.',
  instagram: 'https://www.instagram.com/alumenoutdoors',
  facebook:  'https://www.facebook.com/alumenoutdoors',
}

const form = reactive({ ...DEFAULTS })

function syncFromStore() {
  const f = store.footer as FooterDoc | null
  if (!f) return
  docId.value = f.id ?? null
  Object.assign(form, {
    tagline:   f.tagline   ?? DEFAULTS.tagline,
    instagram: f.instagram ?? DEFAULTS.instagram,
    facebook:  f.facebook  ?? DEFAULTS.facebook,
  })
}

watch(() => store.footer, syncFromStore, { immediate: true, deep: true })

function reset() { syncFromStore() }

async function save() {
  saving.value = true
  try {
    const payload = { tagline: form.tagline, instagram: form.instagram, facebook: form.facebook }
    let result
    if (docId.value) {
      result = await store.updateDocs({ collection: 'footer', id: docId.value, data: payload })
    } else {
      result = await store.saveDoc({ collection: 'footer', data: payload })
      if (result?.value?.id) docId.value = result.value.id
    }
    if (result?.ok !== false) {
      $q.notify({ type: 'positive', message: 'Rodapé salvo!', timeout: 2500 })
    }
  } catch (e) {
    $q.notify({ type: 'negative', message: `Erro: ${(e as Error).message}` })
  } finally {
    saving.value = false
  }
}
</script>

<style scoped lang="scss">
.footer-preview {
  background: $adm-surface-2;
  border: 1px solid $adm-border;
  border-radius: 4px;
  padding: 20px 24px;

  &__tagline {
    font-size: 13px;
    font-weight: 300;
    color: $adm-text-2;
    margin: 0 0 12px;
    line-height: 1.6;
  }

  &__social {
    display: flex;
    gap: 16px;
  }

  &__link {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: $adm-text-2;
  }
}

// Inline SVG icon — inherits color via currentColor
.adm-svg-icon {
  display: inline-flex;
  align-items: center;
  color: $adm-text-2;

  :deep(svg) {
    width: 18px;
    height: 18px;
    fill: currentColor;
  }

  &--sm :deep(svg) {
    width: 14px;
    height: 14px;
  }
}
</style>
