import { ref, reactive } from 'vue'
import { useCmsStore } from 'stores/cms'

interface UseAdminCrudOptions<T extends Record<string, unknown>> {
  collection: string
  emptyForm: () => T
}

export function useAdminCrud<T extends Record<string, unknown>>({
  collection,
  emptyForm,
}: UseAdminCrudOptions<T>) {
  const store = useCmsStore()

  const dialogOpen = ref(false)
  const isEditing  = ref(false)
  const saving     = ref(false)
  const deleting   = ref<string | null>(null)
  const editingId  = ref<string | null>(null)
  const form       = reactive<T>(emptyForm()) as T

  function openNew() {
    Object.assign(form, emptyForm())
    isEditing.value = false
    editingId.value = null
    dialogOpen.value = true
  }

  function openEdit(doc: T & { id: string }) {
    Object.assign(form, { ...emptyForm(), ...doc })
    isEditing.value = true
    editingId.value = doc.id
    dialogOpen.value = true
  }

  function close() {
    dialogOpen.value = false
  }

  async function save() {
    saving.value = true
    try {
      const payload = { ...form } as Record<string, unknown>
      delete payload.id

      if (isEditing.value && editingId.value) {
        await store.updateDocs({ collection, id: editingId.value, data: payload })
      } else {
        await store.saveDoc({ collection, data: payload })
      }
      close()
    } finally {
      saving.value = false
    }
  }

  async function remove(id: string) {
    deleting.value = id
    try {
      await store.deleteDocs({ collection, id })
    } finally {
      deleting.value = null
    }
  }

  return { dialogOpen, isEditing, saving, deleting, form, openNew, openEdit, close, save, remove }
}
