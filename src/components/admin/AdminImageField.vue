<template>
  <div>
    <!-- Input row -->
    <div class="adm-img-field__row">
      <q-input
        :model-value="modelValue"
        @update:model-value="$emit('update:modelValue', $event)"
        :label="label"
        :hint="hint"
        filled dark dense
        clearable
        class="adm-img-field__input"
        @clear="$emit('update:modelValue', '')"
      >
        <template #prepend>
          <q-icon :name="icon" color="grey-6" size="18px" />
        </template>
      </q-input>

      <q-btn
        unelevated no-caps
        icon="perm_media"
        label="Selecionar"
        color="grey-8"
        text-color="grey-3"
        dense
        class="adm-img-field__pick-btn"
        aria-label="Abrir biblioteca de imagens"
        @click="pickerOpen = true"
      />
    </div>

    <!-- Preview -->
    <div v-if="modelValue && !imgFailed" class="adm-img-preview q-mt-xs">
      <img
        :src="modelValue"
        :alt="label"
        class="adm-img-preview__img"
        @error="imgFailed = true"
        @load="imgFailed = false"
      />
      <span v-if="badge" class="adm-img-preview__badge">{{ badge }}</span>
      <q-btn
        flat round dense
        icon="close"
        size="xs"
        class="adm-img-preview__clear"
        aria-label="Remover imagem"
        @click="$emit('update:modelValue', '')"
      />
    </div>

    <!-- Error state -->
    <div v-else-if="modelValue && imgFailed" class="adm-img-empty q-mt-xs">
      <q-icon name="broken_image" size="18px" />
      <span>URL inválida ou imagem inacessível</span>
    </div>

    <!-- Empty state -->
    <div v-else class="adm-img-empty q-mt-xs">
      <q-icon name="image_not_supported" size="18px" />
      <span>Sem imagem definida</span>
    </div>

    <!-- Media picker dialog -->
    <AdminMediaPicker
      v-model="pickerOpen"
      :initial-selected="modelValue"
      @select="onPickerSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import AdminMediaPicker from './AdminMediaPicker.vue'

const props = withDefaults(defineProps<{
  modelValue: string
  label?: string
  hint?: string
  icon?: string
  badge?: string
}>(), {
  label: 'Image URL',
  hint:  'Firebase Storage download URL',
  icon:  'image',
  badge: '',
})

const emit = defineEmits<{ 'update:modelValue': [v: string] }>()

const imgFailed  = ref(false)
const pickerOpen = ref(false)

watch(() => props.modelValue, () => { imgFailed.value = false })

function onPickerSelect(url: string) {
  emit('update:modelValue', url)
}
</script>

<style scoped lang="scss">
.adm-img-field {
  &__row {
    display: flex;
    gap: 8px;
    align-items: flex-start;
  }

  &__input { flex: 1; min-width: 0; }

  &__pick-btn {
    flex-shrink: 0;
    height: 40px;
    font-size: 12px;
    letter-spacing: 0.02em;
    border-radius: 4px;
  }
}
</style>
