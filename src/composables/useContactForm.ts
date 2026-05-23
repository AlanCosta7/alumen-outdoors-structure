/**
 * Formulário de contato.
 *
 * `firebase/functions` (~80KB) é importado de forma dinâmica apenas no
 * momento do submit — não entra no bundle inicial do site.
 */

import { reactive, ref } from 'vue'
import { useQuasar } from 'quasar'

export interface ContactPayload {
  name:    string
  email:   string
  phone:   string
  message: string
}

export function useContactForm() {
  const $q = useQuasar()

  const form = reactive<ContactPayload>({
    name:    '',
    email:   '',
    phone:   '',
    message: '',
  })

  const loading = ref(false)
  const sent    = ref(false)

  function reset() {
    form.name    = ''
    form.email   = ''
    form.phone   = ''
    form.message = ''
    sent.value   = false
  }

  async function submit() {
    if (loading.value) return
    loading.value = true
    try {
      // Importação lazy — firebase/functions só chega ao cliente neste momento
      const [{ getFunctions, httpsCallable }, { getApp }] = await Promise.all([
        import('firebase/functions'),
        import('firebase/app'),
      ])

      const functions = getFunctions(getApp())
      const sendEmail = httpsCallable<ContactPayload, { ok: boolean }>(functions, 'sendContactEmail')
      const result    = await sendEmail({ ...form })

      if (result.data.ok) {
        sent.value = true
        reset()
        $q.notify({
          type:    'positive',
          message: 'Message sent! We\'ll get back to you shortly.',
          timeout: 4000,
        })
      } else {
        throw new Error('Function returned ok: false')
      }
    } catch {
      $q.notify({
        type:    'negative',
        message: 'Something went wrong. Please call us at (941) 526-5425.',
        timeout: 5000,
      })
    } finally {
      loading.value = false
    }
  }

  return { form, loading, sent, submit, reset }
}
