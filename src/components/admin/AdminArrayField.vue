<template>
  <div class="adm-array">
    <div class="adm-array__header">
      <span class="adm-array__label">
        {{ label }}
        <q-badge
          :label="modelValue.length"
          :color="modelValue.length ? 'positive' : 'grey-7'"
          class="q-ml-xs"
        />
      </span>
    </div>

    <!-- Items -->
    <transition-group name="list" tag="div">
      <div
        v-for="(_, i) in modelValue"
        :key="i"
        class="adm-array__item"
      >
        <span class="adm-array__item-num">{{ i + 1 }}</span>
        <q-input
          :model-value="modelValue[i]"
          @update:model-value="update(i, $event as string)"
          :placeholder="placeholder || `Item ${i + 1}`"
          :type="multiline ? 'textarea' : 'text'"
          :autogrow="multiline"
          filled dark dense
          class="col"
        />
        <q-btn
          flat round dense
          icon="delete"
          color="negative"
          size="sm"
          class="q-mt-xs"
          :aria-label="`Remover item ${i + 1}`"
          @click="remove(i)"
        />
      </div>
    </transition-group>

    <!-- Empty -->
    <div v-if="!modelValue.length" class="adm-array__empty text-caption adm-text-hint q-py-xs">
      Nenhum item. Clique em "Adicionar" para começar.
    </div>

    <!-- Add -->
    <div class="adm-array__add row items-center gap-sm">
      <q-btn
        flat no-caps dense
        icon="add_circle_outline"
        :label="`Adicionar ${itemLabel || 'item'}`"
        color="positive"
        size="sm"
        @click="add"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: string[]
  label?:      string
  itemLabel?:  string
  placeholder?: string
  multiline?:  boolean
}>(), {
  label:      'Items',
  itemLabel:  'item',
  multiline:  false,
})

const emit = defineEmits<{ 'update:modelValue': [v: string[]] }>()

function update(i: number, val: string) {
  const arr = [...props.modelValue]
  arr[i] = val
  emit('update:modelValue', arr)
}

function remove(i: number) {
  const arr = [...props.modelValue]
  arr.splice(i, 1)
  emit('update:modelValue', arr)
}

function add() {
  emit('update:modelValue', [...props.modelValue, ''])
}
</script>

<style scoped>
.list-enter-active,
.list-leave-active { transition: all 0.2s ease; }
.list-enter-from   { opacity: 0; transform: translateY(-6px); }
.list-leave-to     { opacity: 0; transform: translateX(8px); }

.gap-sm { gap: 8px; }
</style>
