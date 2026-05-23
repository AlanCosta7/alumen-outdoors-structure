<template>
  <div class="gallery-field">

    <!-- Label row -->
    <div class="gallery-field__header">
      <p class="adm-section-label" style="margin:0">
        <q-icon name="photo_library" size="14px" />
        {{ label }}
        <span class="gallery-field__count">({{ modelValue.length }})</span>
      </p>
      <q-btn
        unelevated no-caps dense
        icon="add_photo_alternate"
        label="Adicionar foto"
        color="grey-8"
        text-color="grey-3"
        size="sm"
        class="gallery-field__add-btn"
        @click="pickerOpen = true"
      />
    </div>

    <!-- Thumbnails grid -->
    <div v-if="modelValue.length" class="gallery-field__grid">
      <div
        v-for="(url, i) in modelValue"
        :key="`${url}-${i}`"
        class="gallery-field__thumb"
      >
        <img
          :src="thumbMap[url] ?? url"
          :alt="`Gallery photo ${i + 1}`"
          class="gallery-field__img"
          loading="lazy"
        />

        <!-- Position badge -->
        <span class="gallery-field__pos">{{ i + 1 }}</span>

        <!-- Actions overlay -->
        <div class="gallery-field__overlay">
          <q-btn
            flat round dense
            icon="arrow_back"
            size="xs"
            color="white"
            aria-label="Mover para esquerda"
            :disable="i === 0"
            @click.stop="move(i, -1)"
          />
          <q-btn
            flat round dense
            icon="delete"
            size="xs"
            color="negative"
            aria-label="Remover foto"
            @click.stop="remove(i)"
          />
          <q-btn
            flat round dense
            icon="arrow_forward"
            size="xs"
            color="white"
            aria-label="Mover para direita"
            :disable="i === modelValue.length - 1"
            @click.stop="move(i, 1)"
          />
        </div>
      </div>

      <!-- Add more slot (always visible at end) -->
      <button
        class="gallery-field__add-tile"
        aria-label="Adicionar nova foto"
        @click="pickerOpen = true"
      >
        <q-icon name="add" size="24px" class="gallery-field__add-icon" />
        <span class="gallery-field__add-label">Adicionar</span>
      </button>
    </div>

    <!-- Empty state -->
    <div v-else class="gallery-field__empty" @click="pickerOpen = true">
      <q-icon name="add_photo_alternate" size="32px" class="gallery-field__empty-icon" />
      <p class="gallery-field__empty-text">
        Clique para adicionar fotos à galeria
      </p>
    </div>

    <!-- Media picker (multi-select) -->
    <AdminMediaPicker
      v-model="pickerOpen"
      multiple
      @select-multiple="onAddMultiple"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import AdminMediaPicker from './AdminMediaPicker.vue'
import { prefetchVariants, resolveImageVariant } from 'src/composables/cms/useImageVariant'

const props = withDefaults(defineProps<{
  modelValue: string[]
  label?: string
}>(), {
  label: 'Galeria de Fotos',
})

const emit = defineEmits<{ 'update:modelValue': [v: string[]] }>()

const pickerOpen = ref(false)

// Thumbnail variant map (thumb = 400px WebP) for the grid preview
const thumbMap = ref<Record<string, string>>({})

async function resolveThumbUrls(urls: string[]) {
  if (!urls.length) return
  await prefetchVariants(urls, 'thumb')
  const entries = await Promise.all(
    urls.map(async (url) => [url, await resolveImageVariant(url, 'thumb')] as const)
  )
  thumbMap.value = { ...thumbMap.value, ...Object.fromEntries(entries) }
}

// Resolve whenever the gallery array changes
watch(
  () => props.modelValue,
  (urls) => { void resolveThumbUrls(urls) },
  { immediate: true },
)

function onAddMultiple(urls: string[]) {
  const existing = new Set(props.modelValue)
  const newUrls  = urls.filter(u => u && !existing.has(u))
  if (!newUrls.length) return
  emit('update:modelValue', [...props.modelValue, ...newUrls])
}

function remove(index: number) {
  const next = [...props.modelValue]
  next.splice(index, 1)
  emit('update:modelValue', next)
}

function move(index: number, direction: -1 | 1) {
  const next = [...props.modelValue]
  const target = index + direction
  if (target < 0 || target >= next.length) return
  ;[next[index], next[target]] = [next[target], next[index]]
  emit('update:modelValue', next)
}
</script>

<style scoped lang="scss">
.gallery-field {
  // ── Header row ──────────────────────────────────────────────────────────────
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
  }

  &__count {
    font-size: 11px;
    font-weight: 400;
    color: $adm-text-3;
    margin-left: 4px;
  }

  &__add-btn {
    font-size: 11px;
    letter-spacing: 0.02em;
    border-radius: 4px;
    flex-shrink: 0;
  }

  // ── Thumbnails grid ──────────────────────────────────────────────────────────
  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 8px;
  }

  &__thumb {
    position: relative;
    aspect-ratio: 4 / 3;
    border-radius: 6px;
    overflow: hidden;
    background: $adm-surface-2;
    border: 1px solid $adm-border;
    cursor: default;

    &:hover .gallery-field__overlay { opacity: 1; }
  }

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  &__pos {
    position: absolute;
    top: 4px;
    left: 6px;
    font-size: 10px;
    font-weight: 700;
    color: $adm-text;
    background: rgba(#000, 0.55);
    border-radius: 3px;
    padding: 1px 5px;
    line-height: 1.6;
    pointer-events: none;
  }

  &__overlay {
    position: absolute;
    inset: 0;
    background: rgba(#000, 0.60);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.2s;
  }

  // ── Add-more tile ────────────────────────────────────────────────────────────
  &__add-tile {
    aspect-ratio: 4 / 3;
    border-radius: 6px;
    background: $adm-surface-2;
    border: 1px dashed $adm-border-hi;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    transition: border-color 0.15s, background-color 0.15s;

    &:hover {
      border-color: $adm-accent;
      background: rgba($adm-accent, 0.05);

      .gallery-field__add-icon,
      .gallery-field__add-label { color: $adm-accent; }
    }

    &:focus-visible { outline: 2px solid $adm-accent; }
  }

  &__add-icon  { color: $adm-text-3; transition: color 0.15s; }
  &__add-label {
    font-size: 10px;
    font-weight: 500;
    color: $adm-text-3;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    transition: color 0.15s;
  }

  // ── Empty state ──────────────────────────────────────────────────────────────
  &__empty {
    border: 1px dashed $adm-border-hi;
    border-radius: 6px;
    padding: 32px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    cursor: pointer;
    transition: border-color 0.15s, background-color 0.15s;

    &:hover {
      border-color: $adm-accent;
      background: rgba($adm-accent, 0.04);

      .gallery-field__empty-icon,
      .gallery-field__empty-text { color: $adm-accent; }
    }
  }

  &__empty-icon { color: $adm-text-3; transition: color 0.15s; }

  &__empty-text {
    font-size: 12px;
    font-weight: 400;
    color: $adm-text-3;
    margin: 0;
    text-align: center;
    transition: color 0.15s;
  }
}
</style>
