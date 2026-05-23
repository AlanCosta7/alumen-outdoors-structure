import { boot } from 'quasar/wrappers'
import { initFirebase, useFirebaseLazy } from 'src/firebase/init'
import { useCmsStore, IS_MOCK_MODE } from 'stores/cms'

export default boot(async () => {
  if (IS_MOCK_MODE) {
    const store = useCmsStore()
    store.hydrate()
    store.watchAuth(() => {})
    console.info('[CMS] Mock mode — Firebase não configurado.')
    return
  }

  // 1. Inicializa apenas o Firebase App (≈2KB) — síncrono, sem bloquear o bundle
  initFirebase({
    apiKey:            process.env.FIREBASE_API_KEY            as string,
    authDomain:        process.env.FIREBASE_AUTH_DOMAIN        as string,
    projectId:         process.env.FIREBASE_PROJECT_ID         as string,
    storageBucket:     process.env.FIREBASE_STORAGE_BUCKET     as string,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID as string,
    appId:             process.env.FIREBASE_APP_ID             as string,
    measurementId:     process.env.FIREBASE_MEASUREMENT_ID,
  }, {
    authLanguage:    'en-US',
    enableAnalytics: false,
  })

  // 2. Carrega Firestore/Auth/Storage de forma lazy (chunks separados pelo Vite)
  await useFirebaseLazy()

  // 3. Inicia as subscrições Firestore e o watcher de auth
  const store = useCmsStore()
  store.hydrate()
  store.watchAuth(() => {})
})
