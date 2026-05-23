<template>
  <div class="q-pa-lg">

    <!-- Header -->
    <div class="adm-header">
      <div class="adm-header__left">
        <p class="adm-header__overline">Admin</p>
        <h1 class="adm-header__title">Configurações do Site</h1>
        <p class="adm-header__desc">Contato, horários e imagens exibidos em todo o site.</p>
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

      <!-- ── Contato ──────────────────────────────────────────────────────────── -->
      <div class="adm-card q-mb-md">
        <p class="adm-card__title">
          <q-icon name="phone" size="16px" />Contato
        </p>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-6">
            <q-input
              dark filled dense
              v-model="form.phone"
              label="Telefone (exibido no site)"
              hint="Ex: (941) 526-5425"
            />
          </div>
          <div class="col-12 col-sm-6">
            <q-input
              dark filled dense
              v-model="form.phoneRaw"
              label="Telefone (link tel:)"
              hint="Sem espaços — Ex: +19415265425"
            />
          </div>
          <div class="col-12 col-sm-6">
            <q-input
              dark filled dense
              v-model="form.email"
              label="E-mail"
              type="email"
              hint="Exibido no topbar e rodapé"
            />
          </div>
          <div class="col-12 col-sm-6">
            <q-input
              dark filled dense
              v-model="form.license"
              label="Licença / CGC"
              hint="Ex: CGC1538497 — aparece no rodapé"
            />
          </div>
        </div>
      </div>

      <!-- ── Horários ─────────────────────────────────────────────────────────── -->
      <div class="adm-card q-mb-md">
        <p class="adm-card__title">
          <q-icon name="schedule" size="16px" />Horários de Atendimento
        </p>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-4">
            <q-input
              dark filled dense
              v-model="form.hoursTopbar"
              label="Topbar (compacto)"
              hint="Ex: Mon–Sat: 7am – 6pm"
            />
          </div>
          <div class="col-12 col-sm-4">
            <q-input
              dark filled dense
              v-model="form.hoursWeekday"
              label="Rodapé — Seg a Sex"
              hint="Ex: Mon–Fri: 8AM – 6PM"
            />
          </div>
          <div class="col-12 col-sm-4">
            <q-input
              dark filled dense
              v-model="form.hoursSaturday"
              label="Rodapé — Sábado"
              hint="Ex: Sat: 9AM – 2PM"
            />
          </div>
        </div>
      </div>

      <!-- ── Imagens ──────────────────────────────────────────────────────────── -->
      <div class="adm-card q-mb-xl">
        <p class="adm-card__title">
          <q-icon name="image" size="16px" />Imagens
        </p>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <AdminImageField
              v-model="form.heroImage"
              label="Hero Image — URL"
              hint="Imagem de fundo da seção hero na home"
              icon="wallpaper"
              badge="Hero (home)"
            />
          </div>
          <div class="col-12 col-md-6">
            <AdminImageField
              v-model="form.featureImage"
              label="Feature Image — URL"
              hint="Foto de destaque entre o processo e o formulário"
              icon="photo"
              badge="Feature (home)"
            />
          </div>
        </div>
      </div>

      <!-- ── Actions ──────────────────────────────────────────────────────────── -->
      <div class="row justify-end q-gutter-sm">
        <q-btn
          flat no-caps
          label="Descartar"
          color="grey-5"
          icon="undo"
          :disable="saving"
          @click="reset"
        />
        <q-btn
          unelevated no-caps
          type="submit"
          label="Salvar Configurações"
          color="positive"
          text-color="dark"
          icon="save"
          :loading="saving"
        />
      </div>

    </q-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useCmsStore } from 'stores/cms'
import AdminImageField from 'src/components/admin/AdminImageField.vue'

// ── Types ─────────────────────────────────────────────────────────────────────
interface ConfigDoc {
  id?:           string
  phone?:        string
  phoneRaw?:     string
  email?:        string
  license?:      string
  hoursTopbar?:  string
  hoursWeekday?: string
  hoursSaturday?: string
  heroImage?:    string
  featureImage?: string
}

// ── Store & state ─────────────────────────────────────────────────────────────
const $q    = useQuasar()
const store = useCmsStore()
const saving = ref(false)
const docId  = ref<string | null>(null)

const DEFAULTS: Required<Omit<ConfigDoc, 'id'>> = {
  phone:         '(941) 526-5425',
  phoneRaw:      '+19415265425',
  email:         'sales@skywayaluminum.com',
  license:       'CGC1538497',
  hoursTopbar:   'Mon–Sat: 7am – 6pm',
  hoursWeekday:  'Mon–Fri: 8AM – 6PM',
  hoursSaturday: 'Sat: 9AM – 2PM',
  heroImage:     '',
  featureImage:  '',
}

const form = reactive({ ...DEFAULTS })

// ── Sync from store ───────────────────────────────────────────────────────────
function syncFromStore() {
  const cfg = store.config as ConfigDoc | null
  if (!cfg) return
  docId.value = cfg.id ?? null
  Object.assign(form, {
    phone:         cfg.phone         ?? DEFAULTS.phone,
    phoneRaw:      cfg.phoneRaw      ?? DEFAULTS.phoneRaw,
    email:         cfg.email         ?? DEFAULTS.email,
    license:       cfg.license       ?? DEFAULTS.license,
    hoursTopbar:   cfg.hoursTopbar   ?? DEFAULTS.hoursTopbar,
    hoursWeekday:  cfg.hoursWeekday  ?? DEFAULTS.hoursWeekday,
    hoursSaturday: cfg.hoursSaturday ?? DEFAULTS.hoursSaturday,
    heroImage:     cfg.heroImage     ?? DEFAULTS.heroImage,
    featureImage:  cfg.featureImage  ?? DEFAULTS.featureImage,
  })
}

watch(() => store.config, syncFromStore, { immediate: true, deep: true })

function reset() { syncFromStore() }

// ── Save ─────────────────────────────────────────────────────────────────────
async function save() {
  saving.value = true
  try {
    const payload: Omit<ConfigDoc, 'id'> = { ...form }
    let result
    if (docId.value) {
      result = await store.updateDocs({ collection: 'config', id: docId.value, data: payload })
    } else {
      result = await store.saveDoc({ collection: 'config', data: payload })
      if (result?.value?.id) docId.value = result.value.id
    }
    if (result?.ok !== false) {
      $q.notify({ type: 'positive', message: 'Configurações salvas!', timeout: 2500 })
    }
  } catch (e) {
    $q.notify({ type: 'negative', message: `Erro ao salvar: ${(e as Error).message}` })
  } finally {
    saving.value = false
  }
}
</script>
