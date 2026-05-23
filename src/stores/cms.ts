import { Notify, Dialog } from 'quasar'
import { createCmsStore } from 'src/composables/cms/createCmsStore'
import { useMockCmsStore } from './mockCms'

// ── Firebase store (usado quando FIREBASE_API_KEY está configurado) ────────────
const _firebaseCmsStore = createCmsStore({
  id: 'cms',
  collections: ['config', 'pages', 'faixa', 'footer', 'services', 'projects', 'team'],
  singletons:  ['config', 'footer'],

  handleCallback: ({ type, message }: { type: string; message: string }) =>
    Notify.create({ type, message, timeout: 2500 }),

  confirmSignOut: () =>
    new Promise<boolean>(resolve => {
      Dialog.create({
        title:     'Sair do painel?',
        message:   'Tem certeza que deseja encerrar a sessão?',
        cancel:    true,
        persistent: true,
      })
        .onOk(()    => resolve(true))
        .onCancel(() => resolve(false))
    }),

  storageOptions: {
    pathPrefix:       'media/',
    deletePathPrefix: 'media/',
  },
})

// ── Export unificado ───────────────────────────────────────────────────────────
// FIREBASE_API_KEY presente → store real do Firebase.
// Caso contrário → store mock (localStorage, sem rede).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useCmsStore: any = process.env.FIREBASE_API_KEY
  ? _firebaseCmsStore
  : useMockCmsStore

export const IS_MOCK_MODE = !process.env.FIREBASE_API_KEY
