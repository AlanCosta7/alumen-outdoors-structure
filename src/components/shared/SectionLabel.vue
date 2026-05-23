<template>
  <p class="section-label" :class="{ 'section-label--light': light }">
    <slot />
  </p>
</template>

<script setup lang="ts">
defineProps<{
  light?: boolean
}>()
</script>

<style scoped lang="scss">
.section-label {
  font-family: $font-family-body;
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: $brand-silver;
  margin: 0 0 12px;

  &--light {
    color: rgba($brand-white, 0.5);
  }
}
</style>
