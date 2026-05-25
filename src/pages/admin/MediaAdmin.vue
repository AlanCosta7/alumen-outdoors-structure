<template>
  <div class="media-admin q-pa-lg">

    <div class="row items-center q-mb-lg">
      <q-icon name="image" size="28px" class="q-mr-sm text-primary" />
      <div>
        <h1 class="text-h5 text-weight-bold q-my-none">Otimização de Imagens</h1>
        <p class="text-caption text-grey-6 q-my-none">
          Gera variantes WebP (thumb 400px · medium 900px) para todas as imagens do Storage
        </p>
      </div>
    </div>

    <!-- Status cards -->
    <div class="row q-gutter-md q-mb-xl">
      <q-card flat bordered class="col-12 col-sm-auto status-card">
        <q-card-section class="row items-center no-wrap">
          <q-icon name="cloud_done" size="36px" color="positive" class="q-mr-md" />
          <div>
            <div class="text-h4 text-weight-bold text-positive">{{ stats.withVariants }}</div>
            <div class="text-caption text-grey-6">Com variantes geradas</div>
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="col-12 col-sm-auto status-card">
        <q-card-section class="row items-center no-wrap">
          <q-icon name="hourglass_empty" size="36px" color="warning" class="q-mr-md" />
          <div>
            <div class="text-h4 text-weight-bold text-warning">{{ stats.pending }}</div>
            <div class="text-caption text-grey-6">Aguardando processamento</div>
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="col-12 col-sm-auto status-card">
        <q-card-section class="row items-center no-wrap">
          <q-icon name="photo_library" size="36px" color="grey-6" class="q-mr-md" />
          <div>
            <div class="text-h4 text-weight-bold">{{ stats.total }}</div>
            <div class="text-caption text-grey-6">Total de imagens</div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Backfill section -->
    <q-card flat bordered class="q-mb-lg">
      <q-card-section>
        <div class="text-subtitle1 text-weight-bold q-mb-xs">Processar imagens existentes</div>
        <p class="text-body2 text-grey-7 q-mb-md">
          Imagens enviadas antes da Cloud Function ser ativada não têm variantes.
          Clique abaixo para processar todas de uma vez. Isso pode levar alguns minutos.
        </p>

        <q-banner v-if="backfillResult" class="q-mb-md" :class="backfillResult.error ? 'bg-red-1' : 'bg-green-1'" rounded>
          <template #avatar>
            <q-icon :name="backfillResult.error ? 'error' : 'check_circle'"
              :color="backfillResult.error ? 'negative' : 'positive'" />
          </template>
          <span v-if="backfillResult.error">{{ backfillResult.error }}</span>
          <span v-else>
            {{ backfillResult.processed }} imagens processadas.
            {{ backfillResult.errors }} com erro.
          </span>
        </q-banner>

        <q-btn
          unelevated
          :loading="backfilling"
          :disable="stats.pending === 0"
          color="primary"
          icon="auto_fix_high"
          :label="stats.pending === 0 ? 'Todas as imagens já processadas' : `Processar ${stats.pending} imagens`"
          @click="runBackfill"
        />

        <q-linear-progress
          v-if="backfilling"
          indeterminate
          color="primary"
          class="q-mt-md"
          rounded
        />
      </q-card-section>
    </q-card>

    <!-- Image list -->
    <q-card flat bordered>
      <q-card-section class="row items-center">
        <div class="text-subtitle1 text-weight-bold col">Imagens no Storage</div>
        <q-btn flat dense icon="refresh" label="Atualizar" :loading="loading" @click="loadFiles" />
      </q-card-section>

      <q-separator />

      <q-card-section v-if="loading" class="text-center q-py-xl">
        <q-spinner size="40px" color="primary" />
        <div class="text-caption text-grey-6 q-mt-sm">Carregando arquivos...</div>
      </q-card-section>

      <q-list v-else separator>
        <q-item v-for="file in files" :key="file.path" class="q-py-sm">
          <q-item-section avatar>
            <q-avatar size="48px" square rounded>
              <img v-if="file.thumbUrl" :src="file.thumbUrl" style="object-fit:cover" />
              <q-icon v-else name="image" color="grey-4" size="32px" />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-weight-medium text-body2" style="word-break:break-all">
              {{ file.path }}
            </q-item-label>
            <q-item-label caption class="q-mt-xs">
              <q-chip
                dense
                :color="file.hasVariants ? 'positive' : 'warning'"
                text-color="white"
                :icon="file.hasVariants ? 'check' : 'hourglass_empty'"
                :label="file.hasVariants ? 'Variantes OK' : 'Sem variantes'"
                style="font-size:11px"
              />
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-btn
              v-if="!file.hasVariants"
              flat dense round icon="auto_fix_high" color="primary"
              :loading="file.processing"
              @click="processOne(file)"
            >
              <q-tooltip>Gerar variantes</q-tooltip>
            </q-btn>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// ── Types ─────────────────────────────────────────────────────────────────────

interface StorageFile {
  path: string
  hasVariants: boolean
  thumbUrl: string
  mediumUrl: string
  processing: boolean
}

interface BackfillResult {
  processed: number
  errors: number
  error?: string
}

// ── State ─────────────────────────────────────────────────────────────────────

const loading    = ref(false)
const backfilling = ref(false)
const files       = ref<StorageFile[]>([])
const backfillResult = ref<BackfillResult | null>(null)

const VARIANT_RE = /_(thumb|medium)\.(webp)$/i
const IMAGE_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'])

const stats = computed(() => ({
  total:        files.value.length,
  withVariants: files.value.filter(f => f.hasVariants).length,
  pending:      files.value.filter(f => !f.hasVariants).length,
}))

// ── Firebase lazy imports ─────────────────────────────────────────────────────

let _appMod:     Promise<typeof import('firebase/app')>     | null = null
let _storageMod: Promise<typeof import('firebase/storage')> | null = null
let _funcsMod:   Promise<typeof import('firebase/functions')> | null = null
let _authMod:    Promise<typeof import('firebase/auth')>    | null = null

function appMod()     { return (_appMod     ??= import('firebase/app')) }
function storageMod() { return (_storageMod ??= import('firebase/storage')) }
function funcsMod()   { return (_funcsMod   ??= import('firebase/functions')) }
function authMod()    { return (_authMod    ??= import('firebase/auth')) }

/**
 * Garante que há um usuário autenticado e retorna um token fresco.
 * Lança FunctionsError-like se não houver sessão ativa.
 */
async function requireFreshToken(): Promise<string> {
  const [{ getApp }, { getAuth }] = await Promise.all([appMod(), authMod()])
  const user = getAuth(getApp()).currentUser
  if (!user) {
    throw new Error('Sessão expirada. Faça logout e entre novamente.')
  }
  // force=true renova o token se estiver a menos de 5 min do vencimento
  return user.getIdToken(true)
}

// ── Load files ────────────────────────────────────────────────────────────────

async function loadFiles() {
  loading.value = true
  try {
    const [{ getApp }, { getStorage, ref: sRef, listAll, getMetadata, getDownloadURL }] =
      await Promise.all([appMod(), storageMod()])

    const storage = getStorage(getApp())
    const root    = sRef(storage, '/')
    const result  = await listAll(root)

    // Also list subdirectories
    const allFiles = [...result.items]
    await Promise.all(
      result.prefixes.map(async (prefix) => {
        const sub = await listAll(prefix)
        allFiles.push(...sub.items)
      }),
    )

    // Filter images only, skip variants
    const imageRefs = allFiles.filter((f) => !VARIANT_RE.test(f.name))

    const fileData = await Promise.allSettled(
      imageRefs.map(async (fileRef) => {
        const meta = await getMetadata(fileRef)
        if (!IMAGE_TYPES.has(meta.contentType ?? '')) return null

        const hasVariants = !!meta.customMetadata?.variant_medium
        const thumbUrl    = meta.customMetadata?.variant_thumb ?? ''

        return {
          path: fileRef.fullPath,
          hasVariants,
          thumbUrl,
          mediumUrl: meta.customMetadata?.variant_medium ?? '',
          processing: false,
        } as StorageFile
      }),
    )

    files.value = fileData
      .filter((r): r is PromiseFulfilledResult<StorageFile | null> => r.status === 'fulfilled' && r.value !== null)
      .map(r => r.value as StorageFile)
      .sort((a, b) => Number(a.hasVariants) - Number(b.hasVariants))
  } catch (err) {
    console.error('Failed to load files:', err)
    $q.notify({ type: 'negative', message: 'Erro ao carregar arquivos do Storage' })
  } finally {
    loading.value = false
  }
}

// ── Backfill ──────────────────────────────────────────────────────────────────

async function runBackfill() {
  backfilling.value  = true
  backfillResult.value = null

  try {
    // Verify active session + refresh token before calling the protected function
    await requireFreshToken()

    const [{ getApp }, { getFunctions, httpsCallable }] =
      await Promise.all([appMod(), funcsMod()])

    const functions  = getFunctions(getApp())
    const backfillFn = httpsCallable<void, { processed: number; results: Array<{ file: string; status: string }> }>(
      functions,
      'processExistingImages',
    )

    const { data } = await backfillFn()
    const errors   = data.results.filter(r => r.status !== 'ok').length

    backfillResult.value = { processed: data.processed, errors }
    $q.notify({
      type: errors === 0 ? 'positive' : 'warning',
      message: `${data.processed} imagens processadas${errors > 0 ? `, ${errors} com erro` : ''}`,
    })

    // Reload list to reflect new variants
    await loadFiles()
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    backfillResult.value = { processed: 0, errors: 0, error: msg }
    $q.notify({ type: 'negative', message: `Erro no backfill: ${msg}` })
  } finally {
    backfilling.value = false
  }
}

// ── Process single file ───────────────────────────────────────────────────────

async function processOne(file: StorageFile) {
  file.processing = true
  try {
    await requireFreshToken()

    const [{ getApp }, { getFunctions, httpsCallable }] =
      await Promise.all([appMod(), funcsMod()])

    const functions  = getFunctions(getApp())
    const backfillFn = httpsCallable<{ files: string[] }, { processed: number; results: Array<{ file: string; status: string }> }>(
      functions,
      'processExistingImages',
    )

    await backfillFn({ files: [file.path] })
    $q.notify({ type: 'positive', message: `Variantes geradas para ${file.path}` })
    await loadFiles()
  } catch (err: unknown) {
    $q.notify({ type: 'negative', message: `Erro: ${err instanceof Error ? err.message : String(err)}` })
  } finally {
    file.processing = false
  }
}

// ── Init ──────────────────────────────────────────────────────────────────────

onMounted(() => { void loadFiles() })
</script>

<style scoped lang="scss">
.media-admin {
  max-width: 960px;
  margin: 0 auto;
}

.status-card {
  min-width: 200px;
}
</style>
