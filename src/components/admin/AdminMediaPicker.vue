<template>
  <q-dialog
    v-model="isOpen"
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <div class="media-picker">

      <!-- ── Toolbar ──────────────────────────────────────────────────────────── -->
      <div class="media-picker__toolbar">
        <div class="media-picker__toolbar-left">
          <q-icon name="perm_media" size="20px" class="media-picker__toolbar-icon" />
          <div>
            <p class="media-picker__toolbar-title">Biblioteca de Imagens</p>
            <p class="media-picker__toolbar-sub">
              {{ images.length }} imagem{{ images.length !== 1 ? 'ns' : '' }} armazenada{{ images.length !== 1 ? 's' : '' }}
              <span v-if="metaLoading" class="media-picker__meta-loading">
                <q-spinner size="10px" color="grey-6" />
                ordenando...
              </span>
            </p>
          </div>
        </div>

        <div class="media-picker__toolbar-right">
          <!-- Upload -->
          <q-file
            v-model="uploadFiles"
            multiple
            accept="image/*"
            style="display:none"
            ref="fileInputRef"
            @update:model-value="handleUpload"
          />
          <q-btn
            unelevated no-caps
            label="Enviar Imagem"
            icon="upload"
            color="positive"
            text-color="dark"
            :loading="uploading"
            :disable="isMock"
            class="media-picker__upload-btn"
            @click="triggerUpload"
          >
            <q-tooltip v-if="isMock">Upload indisponível em modo mock</q-tooltip>
          </q-btn>

          <q-btn
            flat round dense
            icon="close"
            color="grey-5"
            aria-label="Fechar"
            @click="isOpen = false"
          />
        </div>
      </div>

      <!-- ── Upload progress ─────────────────────────────────────────────────── -->
      <q-linear-progress
        v-if="uploading"
        :value="uploadProgress / 100"
        color="positive"
        class="media-picker__progress"
        rounded
      />

      <!-- ── Search ──────────────────────────────────────────────────────────── -->
      <div class="media-picker__search-wrap">
        <q-input
          v-model="search"
          placeholder="Filtrar por nome..."
          filled dark dense clearable
          class="media-picker__search"
        >
          <template #prepend>
            <q-icon name="search" size="18px" color="grey-6" />
          </template>
        </q-input>
      </div>

      <!-- ── Mock warning ────────────────────────────────────────────────────── -->
      <div v-if="isMock" class="media-picker__mock-banner">
        <q-icon name="info" size="16px" />
        Modo mock ativo — conecte ao Firebase para fazer upload e gerenciar imagens.
        Cole uma URL externa diretamente no campo de imagem.
      </div>

      <!-- ── Loading ─────────────────────────────────────────────────────────── -->
      <div v-if="loading" class="media-picker__empty">
        <q-spinner-dots size="40px" color="grey-6" />
        <p>Carregando imagens...</p>
      </div>

      <!-- ── Empty ───────────────────────────────────────────────────────────── -->
      <div v-else-if="filtered.length === 0" class="media-picker__empty">
        <q-icon name="image_not_supported" size="48px" color="grey-7" />
        <p>{{ search ? 'Nenhuma imagem encontrada para este filtro.' : 'Nenhuma imagem na biblioteca.' }}</p>
        <q-btn
          v-if="!search && !isMock"
          unelevated no-caps
          label="Enviar primeira imagem"
          icon="upload"
          color="positive"
          text-color="dark"
          @click="triggerUpload"
        />
      </div>

      <!-- ── Grid ────────────────────────────────────────────────────────────── -->
      <div v-else class="media-picker__grid" @scroll.passive="onGridScroll">
        <div
          v-for="img in visibleImages"
          :key="img.url"
          class="media-tile"
          :class="{ 'media-tile--selected': isSelected(img.url) }"
          @click="selectImage(img.url)"
          role="button"
          :aria-label="`Selecionar ${img.name}`"
          :aria-pressed="isSelected(img.url)"
          tabindex="0"
          @keydown.enter="selectImage(img.url)"
          @keydown.space.prevent="selectImage(img.url)"
        >
          <img
            v-if="thumbMap[img.url]"
            :src="thumbMap[img.url]"
            :alt="img.name"
            class="media-tile__img"
            loading="lazy"
          />
          <div v-else class="media-tile__placeholder" aria-hidden="true">
            <q-icon name="image" size="24px" />
          </div>

          <div class="media-tile__overlay">
            <q-icon
              v-if="isSelected(img.url)"
              name="check_circle"
              size="28px"
              class="media-tile__check"
            />
            <!-- Badge de ordem de seleção em modo múltiplo -->
            <span
              v-if="multiple && isSelected(img.url)"
              class="media-tile__order"
            >{{ selectionOrder(img.url) }}</span>
            <p class="media-tile__name">{{ img.name }}</p>
          </div>

          <!-- Delete -->
          <q-btn
            flat round dense
            icon="delete"
            size="xs"
            color="negative"
            class="media-tile__delete"
            aria-label="Excluir imagem"
            @click.stop="confirmDelete(img)"
          />
        </div>

        <button
          v-if="visibleImages.length < filtered.length"
          class="media-picker__load-more"
          type="button"
          @click="showMoreImages"
        >
          Carregar mais {{ Math.min(PAGE_SIZE, filtered.length - visibleImages.length) }} imagens
        </button>
      </div>

      <!-- ── Footer CTA — modo simples ─────────────────────────────────────────── -->
      <div v-if="!multiple && selected" class="media-picker__footer">
        <div class="media-picker__footer-preview">
          <img :src="thumbMap[selected] ?? selected" alt="Selecionada" class="media-picker__footer-thumb" />
          <span class="media-picker__footer-url">{{ selected }}</span>
        </div>
        <div class="media-picker__footer-actions">
          <q-btn flat no-caps label="Cancelar" color="grey-5" @click="isOpen = false" />
          <q-btn
            unelevated no-caps
            label="Usar esta imagem"
            icon="check"
            color="positive"
            text-color="dark"
            @click="confirm"
          />
        </div>
      </div>

      <!-- ── Footer CTA — modo múltiplo ────────────────────────────────────────── -->
      <div v-if="multiple && selectedSet.size > 0" class="media-picker__footer media-picker__footer--multi">
        <div class="media-picker__footer-multi-info">
          <q-icon name="photo_library" size="16px" color="positive" />
          <span class="media-picker__footer-count">
            {{ selectedSet.size }} imagem{{ selectedSet.size !== 1 ? 'ns' : '' }} selecionada{{ selectedSet.size !== 1 ? 's' : '' }}
          </span>
          <button class="media-picker__footer-clear" @click="selectedSet.clear()">
            Limpar
          </button>
        </div>
        <!-- Strip de miniaturas selecionadas -->
        <div class="media-picker__footer-strip">
          <div
            v-for="url in [...selectedSet]"
            :key="url"
            class="media-picker__footer-strip-item"
          >
            <img :src="thumbMap[url] ?? url" alt="" />
            <button
              class="media-picker__footer-strip-remove"
              aria-label="Remover"
              @click="selectedSet.delete(url)"
            >
              <q-icon name="close" size="10px" />
            </button>
          </div>
        </div>
        <div class="media-picker__footer-actions">
          <q-btn flat no-caps label="Cancelar" color="grey-5" @click="isOpen = false" />
          <q-btn
            unelevated no-caps
            :label="`Adicionar ${selectedSet.size} imagem${selectedSet.size !== 1 ? 'ns' : ''}`"
            icon="check"
            color="positive"
            text-color="dark"
            @click="confirm"
          />
        </div>
      </div>

    </div>
  </q-dialog>
</template>

<script lang="ts">
/**
 * Caches a nível de MÓDULO
 * ─────────────────────────────────────────────────────────────────────────────
 * Declarados fora do <script setup> para que vivam durante toda a sessão do
 * browser, independente de quantas vezes o dialog abre/fecha ou o componente
 * monta/desmonta.  Na segunda abertura do picker nada é rebuscado — tudo vem
 * do cache local.
 */
import { shallowReactive } from 'vue'

/** url → timeCreated em ms  (ordenação por mais recente) */
export const metaCache: Map<string, number> = new Map()

/** url original → url da variante thumb  (exibição no grid) */
export const thumbMap: Record<string, string> = shallowReactive({})
</script>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useCmsStore, IS_MOCK_MODE } from 'src/stores/cms'
import { getApp } from 'firebase/app'
import { getStorage, ref as storageRef, getMetadata } from 'firebase/storage'
import { populateVariantCache, resolveImageVariant } from 'src/composables/cms/useImageVariant'

// ── Props / emits ──────────────────────────────────────────────────────────────
const props = defineProps<{
  modelValue: boolean
  initialSelected?: string
  /** Permite selecionar múltiplas imagens de uma vez (para galeria) */
  multiple?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [v: boolean]
  /** Modo simples: emite a URL escolhida */
  'select': [url: string]
  /** Modo múltiplo: emite o array de URLs escolhidas */
  'select-multiple': [urls: string[]]
}>()

// ── State ──────────────────────────────────────────────────────────────────────
const $q       = useQuasar()
const store    = useCmsStore()
const isMock   = IS_MOCK_MODE

const loading        = ref(false)
const uploading      = ref(false)
const uploadProgress = ref(0)
const uploadFiles    = ref<File[] | null>(null)
const search         = ref('')
const PAGE_SIZE      = 48
const visibleLimit   = ref(PAGE_SIZE)
// Modo simples: string única
const selected       = ref(props.initialSelected ?? '')
// Modo múltiplo: Set reativo de URLs na ordem de clique
const selectedSet    = ref(new Set<string>())
// Mantém a ordem de seleção para exibir badges numéricos
const selectionList  = ref<string[]>([])
const fileInputRef   = ref<{ pickFiles: () => void } | null>(null)

// ── Images from store ──────────────────────────────────────────────────────────
interface GalleryItem { url: string; name: string; timeCreated?: number }

const metaLoading = ref(false)
// thumbMap e metaCache vêm do bloco <script> (nível de módulo) — não declarar aqui

function urlToStoragePath(url: string): string {
  const match = url.match(/\/o\/([^?]+)/)
  return match ? decodeURIComponent(match[1]) : ''
}

function urlToName(url: string): string {
  return decodeURIComponent(url.split('/o/').pop()?.split('?')[0] ?? url)
    .replace(/^media\//, '')
}

// Unsorted list from store (names + cached times if already fetched)
const images = computed<GalleryItem[]>(() =>
  (store.listaGaleria as string[]).map((url: string) => ({
    url,
    name: urlToName(url),
    timeCreated: metaCache.get(url),
  }))
)

// Sorted list: items with known timeCreated first (desc), then unknown ones
const sortedImages = computed<GalleryItem[]>(() => {
  const list = [...images.value]
  list.sort((a, b) => {
    if (a.timeCreated && b.timeCreated) return b.timeCreated - a.timeCreated
    if (a.timeCreated) return -1
    if (b.timeCreated) return 1
    return 0
  })
  return list
})

const filtered = computed(() => {
  const base = sortedImages.value
  if (!search.value.trim()) return base
  const q = search.value.toLowerCase()
  return base.filter(i => i.name.toLowerCase().includes(q))
})

const visibleImages = computed(() => filtered.value.slice(0, visibleLimit.value))

const logPrefix = '[AdminMediaPicker]'

function logInfo(message: string, data?: Record<string, unknown>) {
  console.info(`${logPrefix} ${message}`, data ?? '')
}

function logWarn(message: string, data?: Record<string, unknown>) {
  console.warn(`${logPrefix} ${message}`, data ?? '')
}

function waitForIdle() {
  return new Promise<void>(resolve => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => resolve(), { timeout: 300 })
      return
    }
    window.setTimeout(resolve, 16)
  })
}

watch(search, () => {
  visibleLimit.value = PAGE_SIZE
  void fetchMissingMetadata(visibleImages.value, { reason: 'search' })
})

watch(visibleImages, imgs => {
  void fetchMissingMetadata(imgs, { reason: 'visible-change' })
})

function showMoreImages() {
  const before = visibleLimit.value
  visibleLimit.value = Math.min(filtered.value.length, visibleLimit.value + PAGE_SIZE)
  logInfo('show more images', {
    before,
    after: visibleLimit.value,
    totalFiltered: filtered.value.length,
  })
}

function onGridScroll(event: Event) {
  const el = event.currentTarget as HTMLElement
  const remaining = el.scrollHeight - el.scrollTop - el.clientHeight
  if (remaining < 360 && visibleImages.value.length < filtered.value.length) {
    showMoreImages()
  }
}

// ── Fetch / cache de metadata ──────────────────────────────────────────────────

/**
 * Adiciona entradas novas no thumbMap sem apagar as existentes.
 * Como thumbMap é módulo-nível, entradas de aberturas anteriores ficam intactas
 * e aparecem instantaneamente sem nenhuma chamada HTTP.
 */
async function buildThumbMap(targetImages = visibleImages.value) {
  const started = performance.now()
  const missing = targetImages.map(i => i.url).filter(u => u && !thumbMap[u])
  if (!missing.length) return
  let resolvedCount = 0
  let fallbackCount = 0
  let errorCount = 0
  // resolveImageVariant lê do variantCache (módulo-nível) — sem HTTP se já cacheado
  await Promise.allSettled(
    missing.map(async (url) => {
      try {
        const resolved = await resolveImageVariant(url, 'thumb')
        if (resolved && resolved !== url) {
          thumbMap[url] = resolved
          resolvedCount++
        } else {
          fallbackCount++
        }
      } catch (e) {
        errorCount++
        logWarn('thumb resolve failed', { url, error: (e as Error).message })
      }
    })
  )
  logInfo('thumb batch finished', {
    requested: missing.length,
    resolved: resolvedCount,
    withoutVariant: fallbackCount,
    errors: errorCount,
    ms: Math.round(performance.now() - started),
  })
}

/**
 * Busca metadata apenas para imagens que ainda não estão em metaCache.
 * Uma única chamada getMetadata() extrai timestamp (ordenação) + URLs de variante.
 *
 * Na segunda abertura do picker: metaCache já tem tudo → retorna imediatamente
 * sem spinner e sem nenhuma requisição HTTP.
 */
async function fetchMissingMetadata(
  targetImages = visibleImages.value,
  opts: { reason?: string; background?: boolean } = {},
) {
  if (IS_MOCK_MODE) { void buildThumbMap(targetImages); return }

  const uncached = targetImages.filter(i => !metaCache.has(i.url))

  if (!uncached.length) {
    // Tudo cacheado — só garante que thumbMap tem entradas para imagens novas
    // adicionadas por outra aba/sessão (raro, mas seguro)
    void buildThumbMap(targetImages)
    return
  }

  metaLoading.value = true
  const started = performance.now()
  let successCount = 0
  let errorCount = 0
  logInfo('metadata batch started', {
    reason: opts.reason ?? 'unknown',
    requested: uncached.length,
    visible: visibleImages.value.length,
    total: images.value.length,
  })
  try {
    const storage = getStorage(getApp())
    const BATCH   = 6   // evita saturar o Firebase e mantém o browser responsivo

    for (let i = 0; i < uncached.length; i += BATCH) {
      await Promise.allSettled(
        uncached.slice(i, i + BATCH).map(async (img) => {
          const path = urlToStoragePath(img.url)
          if (!path) return
          try {
            const meta = await getMetadata(storageRef(storage, path))
            metaCache.set(img.url, new Date(meta.timeCreated).getTime())
            successCount++
            // Aproveita o metadata já buscado para popular variantCache —
            // sem segunda chamada HTTP para as variantes
            populateVariantCache(
              img.url,
              (meta.customMetadata ?? {}) as Record<string, string>,
            )
          } catch (e) {
            errorCount++
            logWarn('metadata fetch failed', { path, error: (e as Error).message })
          }
        })
      )
      if (opts.background) await waitForIdle()
    }
  } finally {
    metaLoading.value = false
  }
  logInfo('metadata batch finished', {
    reason: opts.reason ?? 'unknown',
    requested: uncached.length,
    success: successCount,
    errors: errorCount,
    ms: Math.round(performance.now() - started),
  })

  // Adiciona thumbs novas ao mapa (lê do variantCache — sem HTTP)
  void buildThumbMap(targetImages)
}

async function fetchBackgroundMetadata() {
  const remaining = images.value.filter(i => !metaCache.has(i.url) && !visibleImages.value.some(v => v.url === i.url))
  if (!remaining.length) return
  await waitForIdle()
  void fetchMissingMetadata(remaining, { reason: 'background-sort', background: true })
}

// ── Dialog open/close ──────────────────────────────────────────────────────────
const isOpen = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

watch(isOpen, async (open) => {
  if (!open) return
  selected.value = props.initialSelected ?? ''
  selectedSet.value = new Set()
  selectionList.value = []
  search.value = ''
  visibleLimit.value = PAGE_SIZE
  logInfo('dialog opened', {
    cachedImages: images.value.length,
    cachedMetadata: metaCache.size,
    cachedThumbs: Object.keys(thumbMap).length,
  })
  if (!isMock && images.value.length === 0) {
    loading.value = true
    const started = performance.now()
    try {
      await store.getImg()
      logInfo('image list loaded', {
        total: images.value.length,
        ms: Math.round(performance.now() - started),
      })
    } catch (e) {
      logWarn('image list failed', { error: (e as Error).message })
      $q.notify({ type: 'negative', message: `Erro ao carregar imagens: ${(e as Error).message}` })
    } finally {
      loading.value = false
    }
  }
  // Prioriza apenas as imagens visíveis; o restante roda em baixa prioridade.
  void fetchMissingMetadata(visibleImages.value, { reason: 'dialog-open' })
  void fetchBackgroundMetadata()
})

// ── Upload ─────────────────────────────────────────────────────────────────────
function triggerUpload() {
  fileInputRef.value?.pickFiles()
}

async function handleUpload(files: File[] | null) {
  if (!files?.length) return
  uploading.value = true
  uploadProgress.value = 0
  const total = files.length
  let done = 0
  try {
    for (const file of files) {
      logInfo('upload started', { name: file.name, size: file.size, type: file.type })
      await store.uploadPhotoURL({
        file,
        onProgress: (pct: number) => {
          uploadProgress.value = Math.round((done / total) * 100 + pct / total)
        },
      })
      logInfo('upload finished', { name: file.name })
      done++
    }
    uploadProgress.value = 100
    await store.getImg()
    // Fetch metadata for newly uploaded images (not yet in cache)
    void fetchMissingMetadata()
  } catch (e) {
    logWarn('upload failed', { error: (e as Error).message })
    $q.notify({ type: 'negative', message: `Erro no upload: ${(e as Error).message}` })
  } finally {
    uploading.value = false
    uploadProgress.value = 0
    uploadFiles.value = null
  }
}

// ── Select / confirm ───────────────────────────────────────────────────────────
function isSelected(url: string): boolean {
  return props.multiple ? selectedSet.value.has(url) : selected.value === url
}

function selectionOrder(url: string): number {
  return selectionList.value.indexOf(url) + 1
}

function selectImage(url: string) {
  if (props.multiple) {
    if (selectedSet.value.has(url)) {
      selectedSet.value.delete(url)
      selectionList.value = selectionList.value.filter(u => u !== url)
    } else {
      selectedSet.value.add(url)
      selectionList.value.push(url)
    }
    // Força reatividade do Set
    selectedSet.value = new Set(selectedSet.value)
  } else {
    selected.value = selected.value === url ? '' : url
  }
}

function confirm() {
  if (props.multiple) {
    if (!selectedSet.value.size) return
    emit('select-multiple', [...selectionList.value])
  } else {
    if (!selected.value) return
    emit('select', selected.value)
  }
  isOpen.value = false
}

// ── Delete ─────────────────────────────────────────────────────────────────────

/**
 * Firebase Storage download URLs encode the storage path in the `o/` segment.
 * Example: https://firebasestorage.googleapis.com/v0/b/BUCKET/o/media%2Ffilename.webp?alt=media&token=TOKEN
 *
 * `deletImg(id)` builds the delete path as `deletePathPrefix + id` = `media/` + id,
 * so we must return only the filename, without the `media/` prefix.
 */
function extractStorageId(url: string): string {
  try {
    const match = url.match(/\/o\/([^?]+)/)
    if (match) {
      const fullPath = decodeURIComponent(match[1]) // e.g. "media/filename.webp"
      return fullPath.replace(/^media\//, '')       // → "filename.webp"
    }
  } catch { /* ignore */ }
  // Fallback: return the URL as-is (will likely fail, but at least shows the error)
  return url
}

function confirmDelete(img: GalleryItem) {
  $q.dialog({
    title: 'Excluir imagem',
    message: `Deseja excluir permanentemente "${img.name}"?`,
    ok: { label: 'Excluir', color: 'negative', unelevated: true, noCaps: true },
    cancel: { label: 'Cancelar', flat: true, noCaps: true, color: 'grey-5' },
    dark: true,
  }).onOk(async () => {
    const storageId = extractStorageId(img.url)
    const result = await store.deletImg(storageId)
    if (result?.ok !== false) {
      if (selected.value === img.url) selected.value = ''
      selectedSet.value.delete(img.url)
      selectionList.value = selectionList.value.filter(u => u !== img.url)
      await store.getImg()
    }
  })
}
</script>

<style scoped lang="scss">
.media-picker {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: $adm-bg;
  overflow: hidden;

  // ── Toolbar
  &__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 16px 24px;
    background-color: $adm-surface;
    border-bottom: 1px solid $adm-border;
    flex-shrink: 0;
  }

  &__toolbar-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__toolbar-icon { color: $adm-accent; }

  &__toolbar-title {
    font-family: $font-family-body;
    font-size: 15px;
    font-weight: 600;
    color: $adm-text;
    margin: 0;
  }

  &__toolbar-sub {
    font-family: $font-family-body;
    font-size: 12px;
    color: $adm-text-3;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  &__meta-loading {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: $adm-text-3;
  }

  &__toolbar-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__upload-btn { font-size: 12px; }

  // ── Progress
  &__progress {
    flex-shrink: 0;
    height: 3px;
    border-radius: 0;
  }

  // ── Search
  &__search-wrap {
    padding: 16px 24px 0;
    flex-shrink: 0;
  }

  &__search { max-width: 400px; }

  // ── Mock banner
  &__mock-banner {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 12px 24px 0;
    padding: 10px 14px;
    background-color: rgba($adm-warning, 0.10);
    border: 1px solid rgba($adm-warning, 0.25);
    border-radius: 4px;
    font-family: $font-family-body;
    font-size: 12px;
    color: $adm-warning;
    flex-shrink: 0;
  }

  // ── Empty / loading
  &__empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    color: $adm-text-3;
    font-family: $font-family-body;
    font-size: 14px;
    p { margin: 0; }
  }

  // ── Grid
  &__grid {
    flex: 1;
    overflow-y: auto;
    padding: 16px 24px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    grid-auto-rows: 128px;
    grid-auto-flow: row;
    gap: 8px;
    align-content: start;

    @media (max-width: 599px) {
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      grid-auto-rows: 96px;
      padding: 12px 16px;
    }
  }

  &__load-more {
    grid-column: 1 / -1;
    min-height: 44px;
    border: 1px solid $adm-border-hi;
    border-radius: 4px;
    background: $adm-surface;
    color: $adm-text;
    font-family: $font-family-body;
    font-size: 12px;
    cursor: pointer;

    &:hover {
      border-color: $adm-accent;
      color: $adm-accent;
    }
  }

  // ── Footer
  &__footer {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 12px 24px;
    background-color: $adm-surface;
    border-top: 1px solid $adm-border-hi;

    @media (max-width: 599px) {
      flex-direction: column;
      align-items: stretch;
    }

    // Modo múltiplo: layout em coluna
    &--multi {
      flex-direction: column;
      align-items: stretch;
      gap: 10px;
      padding: 12px 24px;
    }
  }

  &__footer-preview {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    flex: 1;
  }

  &__footer-thumb {
    width: 48px;
    height: 36px;
    object-fit: cover;
    border-radius: 3px;
    border: 1px solid $adm-border-hi;
    flex-shrink: 0;
  }

  &__footer-url {
    font-family: $font-family-body;
    font-size: 11px;
    color: $adm-text-3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  // ── Footer multi
  &__footer-multi-info {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: $font-family-body;
    font-size: 13px;
    color: $adm-text;
  }

  &__footer-count { font-weight: 600; }

  &__footer-clear {
    background: none;
    border: none;
    cursor: pointer;
    font-family: $font-family-body;
    font-size: 11px;
    color: $adm-text-3;
    text-decoration: underline;
    padding: 0;
    margin-left: 4px;

    &:hover { color: $adm-accent; }
  }

  // Strip de miniaturas selecionadas
  &__footer-strip {
    display: flex;
    gap: 6px;
    overflow-x: auto;
    padding-bottom: 2px;

    &::-webkit-scrollbar { height: 3px; }
    &::-webkit-scrollbar-thumb { background: $adm-border-hi; border-radius: 2px; }
  }

  &__footer-strip-item {
    position: relative;
    flex-shrink: 0;
    width: 52px;
    height: 40px;
    border-radius: 3px;
    overflow: hidden;
    border: 1px solid $adm-border-hi;

    img { width: 100%; height: 100%; object-fit: cover; display: block; }
  }

  &__footer-strip-remove {
    position: absolute;
    top: 2px;
    right: 2px;
    width: 16px;
    height: 16px;
    background: rgba(0,0,0,0.7);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $brand-white;
    padding: 0;

    &:hover { background: rgba($adm-negative, 0.85); }
  }

  &__footer-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
    justify-content: flex-end;
  }
}

// ── Tile
.media-tile {
  position: relative;
  width: 100%;
  height: 100%;
  min-width: 0;
  background-color: $adm-surface-2;
  border: 2px solid $adm-border;
  box-sizing: border-box;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
  contain: paint;

  &:hover { border-color: $adm-border-hi; }
  &:focus-visible { outline: 2px solid $adm-accent; outline-offset: 2px; }

  &--selected {
    border-color: $adm-accent !important;
    box-shadow: 0 0 0 1px rgba($adm-accent, 0.45);
  }

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  &__placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $adm-text-3;
    background:
      linear-gradient(135deg, rgba(255,255,255,0.04), transparent),
      $adm-surface-2;
  }

  &__overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 6px 8px;
    opacity: 0;
    transition: opacity 0.15s;

    .media-tile:hover &,
    .media-tile--selected & { opacity: 1; }
  }

  &__check {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: $adm-accent;
    filter: drop-shadow(0 0 4px rgba(0,0,0,0.8));
  }

  // Badge com número de ordem de seleção (modo múltiplo)
  &__order {
    position: absolute;
    top: 6px;
    left: 6px;
    min-width: 20px;
    height: 20px;
    padding: 0 5px;
    background: $adm-accent;
    color: $brand-dark;
    border-radius: 10px;
    font-family: $font-family-body;
    font-size: 11px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    box-shadow: 0 1px 4px rgba(0,0,0,0.5);
  }

  &__name {
    font-family: $font-family-body;
    font-size: 10px;
    color: rgba(255,255,255,0.75);
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__delete {
    position: absolute;
    top: 4px;
    right: 4px;
    opacity: 0;
    transition: opacity 0.15s;
    background-color: rgba(0,0,0,0.6) !important;

    .media-tile:hover & { opacity: 1; }
  }
}
</style>
