import { computed } from 'vue'
import { useCmsStore } from 'stores/cms'

/**
 * Returns a page section doc merged with `defaults`.
 * Looks up by `sectionId` in the `pages` collection.
 * Falls back to `defaults` if the doc is not found or the store is loading.
 */
export function usePageSection<T extends Record<string, unknown>>(
  sectionId: string,
  defaults: T,
): ReturnType<typeof computed<T>> {
  const store = useCmsStore()

  return computed<T>(() => {
    const pages = Array.isArray(store.pages) ? (store.pages as Record<string, unknown>[]) : []
    const found = pages.find((p) => p['sectionId'] === sectionId) ?? {}
    return { ...defaults, ...found } as T
  })
}
