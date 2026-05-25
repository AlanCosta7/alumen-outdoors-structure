<template>
  <section class="contact-form" :class="{ 'contact-form--dark': dark }" :aria-label="ariaLabel">
    <div class="contact-form__inner">
      <h2 class="contact-form__heading">Get In Touch</h2>
      <p class="contact-form__sub">
        Ready to upgrade your space? Contact Alumen Outdoor Structures and get started today.
      </p>

      <form
        v-if="!sent"
        class="contact-form__form"
        novalidate
        @submit.prevent="handleSubmit"
        aria-label="Contact form"
      >
        <div class="row q-col-gutter-md">
          <div class="col-12">
            <q-input
              v-model="form.name"
              label="Name"
              outlined
              :dark="dark"
              class="contact-form__input"
              lazy-rules
              :rules="[val => !!val.trim() || 'Name is required']"
              aria-required="true"
              autocomplete="name"
            />
          </div>

          <div class="col-12 col-sm-6">
            <q-input
              v-model="form.email"
              label="E-mail"
              type="email"
              outlined
              :dark="dark"
              class="contact-form__input"
              lazy-rules
              :rules="[
                val => !!val.trim() || 'E-mail is required',
                val => /.+@.+\..+/.test(val) || 'Enter a valid e-mail'
              ]"
              aria-required="true"
              autocomplete="email"
            />
          </div>

          <div class="col-12 col-sm-6">
            <q-input
              v-model="form.phone"
              label="Phone"
              type="tel"
              outlined
              :dark="dark"
              class="contact-form__input"
              autocomplete="tel"
            />
          </div>

          <div class="col-12">
            <q-input
              v-model="form.message"
              label="Talk about the service..."
              type="textarea"
              outlined
              :dark="dark"
              class="contact-form__input"
              rows="5"
              lazy-rules
              :rules="[val => !!val.trim() || 'Please describe your project']"
              aria-required="true"
            />
          </div>

          <div class="col-12 flex justify-end">
            <q-btn
              type="submit"
              label="Submit Request"
              :loading="loading"
              :disable="loading"
              unelevated
              no-caps
              class="contact-form__submit"
            >
              <template #loading>
                <q-spinner-dots size="20px" />
              </template>
            </q-btn>
          </div>
        </div>
      </form>

      <!-- Success state -->
      <div v-else class="contact-form__success" role="status" aria-live="polite">
        <q-icon name="check_circle" size="48px" class="contact-form__success-icon" />
        <p class="contact-form__success-text">
          Thank you! We'll be in touch soon.
        </p>
        <q-btn flat no-caps label="Send another message" @click="reset" class="contact-form__reset" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useContactForm } from 'src/composables/useContactForm'

const props = withDefaults(defineProps<{
  dark?: boolean
  ariaLabel?: string
}>(), {
  dark: false,
  ariaLabel: 'Contact section',
})

const { form, loading, sent, submit, reset } = useContactForm()

async function handleSubmit() {
  await submit()
}
</script>

<style scoped lang="scss">
.contact-form {
  padding: $section-padding-y 0;
  background-color: $brand-white;
  content-visibility: auto;
  contain-intrinsic-size: 0 480px;

  @media (max-width: 599px) { contain-intrinsic-size: 0 560px; }

  &--dark {
    background-color: $brand-dark;

    .contact-form__heading,
    .contact-form__sub { color: $brand-white; }
  }

  &__inner {
    max-width: 580px;
    margin: 0 auto;
    padding: 0 24px;

    @media (max-width: 599px) { padding: 0 16px; }
  }

  &__heading {
    font-family: $font-family-body;
    font-size: clamp(26px, 3.5vw, 40px);
    font-weight: 600;
    color: $brand-dark;
    margin: 0 0 10px;
    line-height: 1.1;
  }

  &__sub {
    font-family: $font-family-body;
    font-size: 13px;
    font-weight: 300;
    color: #5f5f5f;
    line-height: 1.65;
    margin: 0 0 28px;
  }

  &__form { width: 100%; }

  &__input {
    :deep(.q-field__control) { border-radius: 0; }
  }

  &__submit {
    background-color: $brand-dark !important;
    color: $brand-white !important;
    font-family: $font-family-body;
    font-weight: 600;
    font-size: 13px;
    letter-spacing: 0.06em;
    padding: 12px 32px;
    border-radius: 10px;
    min-height: 44px;

    &:focus-visible { outline: 2px solid $brand-green; outline-offset: 2px; }
  }

  &__success {
    text-align: center;
    padding: 40px 0;
  }

  &__success-icon { color: $brand-green; }

  &__success-text {
    font-family: $font-family-body;
    font-size: 18px;
    font-weight: 300;
    color: $brand-dark;
    margin: 16px 0;
  }

  &__reset { color: $brand-silver !important; }
}
</style>
