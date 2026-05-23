import { defineStore } from 'pinia'
import { reactive, ref, toRefs } from 'vue'
import { Notify, Dialog } from 'quasar'
import mockData from 'src/data/mock.json'

// ── localStorage helpers ──────────────────────────────────────────────────────
const LS_PREFIX = 'mock_cms_'

function loadList<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(LS_PREFIX + key)
    if (raw) return JSON.parse(raw) as T[]
  } catch { /* ignore */ }
  return structuredClone(fallback) as T[]
}

function saveList(key: string, value: unknown[]) {
  try { localStorage.setItem(LS_PREFIX + key, JSON.stringify(value)) } catch { /* ignore */ }
}

function loadSingle<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(LS_PREFIX + key)
    if (raw) return JSON.parse(raw) as T
  } catch { /* ignore */ }
  return structuredClone(fallback) as T
}

function saveSingle(key: string, value: unknown) {
  try { localStorage.setItem(LS_PREFIX + key, JSON.stringify(value)) } catch { /* ignore */ }
}

function clearAll() {
  ['config', 'footer', 'faixa', 'pages', 'services', 'projects', 'team']
    .forEach(k => localStorage.removeItem(LS_PREFIX + k))
}

// ── Store ─────────────────────────────────────────────────────────────────────
export const useMockCmsStore = defineStore('mockCms', () => {
  const data = reactive({
    config:   loadSingle('config',   mockData.config),
    footer:   loadSingle('footer',   mockData.footer),
    faixa:    loadList('faixa',      mockData.faixa),
    pages:    loadList('pages',      mockData.pages),
    services: loadList('services',   mockData.services),
    projects: loadList('projects',   mockData.projects),
    team:     loadList('team',       mockData.team),
  })

  const currentUser = ref<{ email: string; uid: string } | null>(null)
  const error = ref<Error | null>(null)
  const listaGaleria = ref([])
  const firstPage = ref(null)
  const dialogPay = reactive({ show: false, data: null as null })

  // ── Auth (mock) ───────────────────────────────────────────────────────────
  function watchAuth(cb: (user: null) => void) { cb(null) }

  async function signIn({ email, password }: { email: string; password: string }) {
    if (email === 'admin@alumen.dev' && password === 'admin123') {
      currentUser.value = { email, uid: 'mock-admin' }
      Notify.create({ type: 'positive', message: 'Signed in (mock mode)', timeout: 2500 })
    } else {
      Notify.create({
        type: 'negative',
        message: 'Mock credentials: admin@alumen.dev / admin123',
        timeout: 5000,
      })
    }
  }

  async function signOut() {
    await new Promise<boolean>((resolve) => {
      Dialog.create({
        title: 'Sair do painel?',
        message: 'Tem certeza que deseja encerrar a sessão?',
        cancel: true,
        persistent: true,
      })
        .onOk(() => { currentUser.value = null; resolve(true) })
        .onCancel(() => resolve(false))
    })
  }

  function hydrate() { /* no-op in mock mode */ }
  function unsubscribeAll() { /* no-op */ }
  function setDialogPay(v: unknown) { Object.assign(dialogPay, v) }

  // ── CRUD ──────────────────────────────────────────────────────────────────
  async function saveDoc({ collection, data: docData }: { collection: string; data: Record<string, unknown> }) {
    const id = `mock_${Date.now()}`
    const arr = data[collection as keyof typeof data] as Record<string, unknown>[]
    arr.push({ id, ...docData })
    saveList(collection, arr)
    Notify.create({ type: 'positive', message: 'Saved (mock)', timeout: 2000 })
    return { ok: true, value: { id } }
  }

  async function updateDocs({ collection, id, data: docData }: { collection: string; id: string; data: Record<string, unknown> }) {
    const arr = data[collection as keyof typeof data] as Record<string, unknown>[]
    const idx = arr.findIndex((d) => d.id === id)
    if (idx !== -1) arr[idx] = { ...arr[idx], ...docData }
    saveList(collection, arr)
    Notify.create({ type: 'positive', message: 'Saved (mock)', timeout: 2000 })
    return { ok: true, value: true }
  }

  async function deleteDocs({ collection, id }: { collection: string; id: string }) {
    const arr = data[collection as keyof typeof data] as Record<string, unknown>[]
    const filtered = arr.filter((d) => d.id !== id)
    ;(data as Record<string, unknown>)[collection] = filtered
    saveList(collection, filtered)
    Notify.create({ type: 'positive', message: 'Deleted (mock)', timeout: 2000 })
    return { ok: true, value: true }
  }

  // Stubs for methods called by cms-firebase internal components
  async function fetchCollection(col: string) { return data[col as keyof typeof data] ?? [] }
  function subscribeCollection() { return () => { /* unsubscribe noop */ } }
  async function uploadPhotoURL() { return { ok: false, error: new Error('Not supported in mock mode') } }
  async function getImg() { return '' }
  async function deletImg() { return { ok: true } }
  function atualizar() { /* noop */ }

  // ── Reset ─────────────────────────────────────────────────────────────────
  function resetToMock() {
    Object.assign(data, {
      config:   structuredClone(mockData.config),
      footer:   structuredClone(mockData.footer),
      faixa:    structuredClone(mockData.faixa),
      pages:    structuredClone(mockData.pages),
      services: structuredClone(mockData.services),
      projects: structuredClone(mockData.projects),
      team:     structuredClone(mockData.team),
    })
    clearAll()
    Notify.create({ type: 'info', message: 'Reset to original mock data', timeout: 3000 })
  }

  return {
    // Collections
    ...toRefs(data),
    // Extra state
    currentUser, error, listaGaleria, firstPage, dialogPay,
    // Auth
    watchAuth, signIn, signOut,
    // Lifecycle
    hydrate, unsubscribeAll,
    // CRUD
    saveDoc, updateDocs, deleteDocs,
    fetchCollection, subscribeCollection,
    uploadPhotoURL, getImg, deletImg,
    atualizar, setDialogPay,
    // Dev helpers
    resetToMock,
  }
})
