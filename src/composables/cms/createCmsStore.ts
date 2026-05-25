/**
 * Factory de Pinia store para o CMS.
 *
 * O projeto passa a lista de coleções, singletons e callbacks de UI —
 * assim a lógica de dados permanece desacoplada do Quasar.
 */

import { defineStore } from 'pinia'
import { ref, reactive, toRefs } from 'vue'
import { useCrud }   from './useCrud'
import { useAuth }   from './useAuth'
import { useStorage } from './useStorage'

type Callback = (p: { type: string; message: string }) => void

export interface CreateStoreOptions {
  id?:             string
  collections?:    string[]
  singletons?:     string[] | Set<string>
  handleCallback?: Callback
  confirmSignOut?: () => Promise<boolean>
  storageOptions?: {
    pathPrefix?:       string
    deletePathPrefix?: string
  }
}

const DEFAULT_COLLECTIONS = ['config', 'pages', 'faixa', 'footer']
const DEFAULT_SINGLETONS  = ['config', 'footer']

export function createCmsStore(options: CreateStoreOptions = {}) {
  const {
    id             = 'cms',
    collections    = DEFAULT_COLLECTIONS,
    singletons     = DEFAULT_SINGLETONS,
    handleCallback,
    confirmSignOut,
    storageOptions = {},
  } = options

  const singletonSet = new Set(singletons)

  return defineStore(id, () => {
    // Composables instanciados UMA vez (lazy, na 1ª chamada à store)
    const crud    = useCrud({ handleCallback })
    const auth    = useAuth({ handleCallback })
    const storage = useStorage({ handleCallback, ...storageOptions })

    // State: reactive cujas chaves são as coleções
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = reactive(
      Object.fromEntries(
        collections.map(c => [c, singletonSet.has(c) ? null : []])
      ) as Record<string, any>
    )

    const currentUser  = ref<unknown>(null)
    const error        = ref<unknown>(null)
    const listaGaleria = ref<string[]>([])
    const firstPage    = ref<unknown>(null)
    const dialogPay    = reactive<{ show: boolean; data: unknown }>({ show: false, data: null })
    const _subs: Array<() => void> = []

    // ---- Hydration
    // Critical collections render above-the-fold content and subscribe
    // immediately.  Non-critical ones are staggered (50ms apart) to avoid
    // 7 simultaneous onSnapshot callbacks saturating the main thread.
    const CRITICAL = new Set(['config', 'services'])

    function hydrate() {
      const critical    = collections.filter(c => CRITICAL.has(c))
      const nonCritical = collections.filter(c => !CRITICAL.has(c))

      // Subscribe critical collections right away
      for (const col of critical) {
        const unsub = crud.subscribeCollection(col, lista => {
          data[col] = singletonSet.has(col) ? (lista[0] ?? null) : lista
        })
        _subs.push(unsub)
      }

      // Stagger non-critical ones to spread the onSnapshot burst
      nonCritical.forEach((col, i) => {
        const timer = setTimeout(() => {
          const unsub = crud.subscribeCollection(col, lista => {
            data[col] = singletonSet.has(col) ? (lista[0] ?? null) : lista
          })
          _subs.push(unsub)
        }, (i + 1) * 60) // 60ms, 120ms, 180ms, 240ms, …
        _subs.push(() => clearTimeout(timer))
      })
    }

    function unsubscribeAll() {
      while (_subs.length) {
        const u = _subs.pop()
        try { u?.() } catch { /* ignore */ }
      }
    }

    // ---- Auth
    async function signIn(payload: { email: string; password: string }) {
      const user = await auth.signIn(payload)
      if (user) currentUser.value = user
      return user
    }

    async function signOut() {
      const ok = await auth.signOut({ confirm: confirmSignOut })
      if (ok) currentUser.value = null
      return ok
    }

    function watchAuth() {
      return auth.watchAuth(user => { currentUser.value = user })
    }

    // ---- CRUD passthrough
    const saveDoc             = (p: Parameters<typeof crud.saveDoc>[0])             => crud.saveDoc(p)
    const updateDocs          = (p: Parameters<typeof crud.updateDocs>[0])          => crud.updateDocs(p)
    const deleteDocs          = (p: Parameters<typeof crud.deleteDocs>[0])          => crud.deleteDocs(p)
    const fetchCollection     = (...a: Parameters<typeof crud.fetchCollection>)     => crud.fetchCollection(...a)
    const subscribeCollection = (...a: Parameters<typeof crud.subscribeCollection>) => crud.subscribeCollection(...a)

    // ---- Storage helpers
    async function uploadPhotoURL({ file, id: customId, onProgress }: {
      file: File
      id?: string
      onProgress?: (pct: number) => void
    }) {
      try {
        const result = await storage.uploadFile(file, { id: customId, onProgress })
        if (result?.url && !listaGaleria.value.includes(result.url)) {
          listaGaleria.value.push(result.url)
        }
        return result
      } catch (err) {
        error.value = err
        return null
      }
    }

    async function getImg(opts?: { path?: string; maxResults?: number }) {
      const started = performance.now()
      console.info('[CmsStore] phase: getImg started', {
        at: new Date().toISOString(),
        opts: opts ?? null,
        currentItems: listaGaleria.value.length,
      })
      try {
        const items = await storage.listFiles(opts)
        listaGaleria.value = items.map(i => i.url)
        console.info('[CmsStore] phase: getImg finished', {
          at: new Date().toISOString(),
          returned: listaGaleria.value.length,
          ms: Math.round(performance.now() - started),
        })
        return listaGaleria.value
      } catch (e) {
        console.warn('[CmsStore] phase: getImg failed', {
          at: new Date().toISOString(),
          error: (e as Error).message,
          ms: Math.round(performance.now() - started),
        })
        throw e
      }
    }

    function deletImg(idOrPath: string) {
      return storage.deleteFile(idOrPath)
    }

    function atualizar() {
      firstPage.value    = null
      listaGaleria.value = []
      return getImg()
    }

    function setDialogPay(item: Partial<typeof dialogPay>) {
      Object.assign(dialogPay, item)
    }

    return {
      ...toRefs(data),
      currentUser,
      error,
      listaGaleria,
      firstPage,
      dialogPay,
      hydrate,
      unsubscribeAll,
      signIn,
      signOut,
      watchAuth,
      saveDoc,
      updateDocs,
      deleteDocs,
      fetchCollection,
      subscribeCollection,
      uploadPhotoURL,
      getImg,
      deletImg,
      atualizar,
      setDialogPay,
    }
  })
}
