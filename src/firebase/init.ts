/**
 * Inicialização singleton do Firebase.
 *
 * Estratégia de performance:
 *  - O boot importa APENAS firebase/app (2KB gzip) para inicializar o App.
 *  - Firestore, Auth e Storage são inicializados de forma lazy na primeira
 *    chamada a useFirebase(). Dessa forma os ~500KB de SDK não entram no
 *    bundle crítico (first paint) — só chegam quando a store precisa deles.
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'

export interface FirebaseConfig {
  apiKey:             string
  authDomain:         string
  projectId:          string
  storageBucket:      string
  messagingSenderId?: string
  appId:              string
  measurementId?:     string
}

export interface InitOptions {
  authLanguage?:    string
  enableAnalytics?: boolean
}

// Usamos unknown aqui para evitar imports estáticos dos SDKs de serviço.
// Os tipos reais são resolvidos nos composables que chamam useFirebase().
export interface FirebaseServices {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $firestore: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $auth:      any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $storage:   any
  analytics:  null
}

let _app:      FirebaseApp | null = null
let _services: FirebaseServices | null = null
let _opts:     InitOptions = {}
let _configKey: string | null = null

function fingerprint(c: FirebaseConfig) {
  return `${c.projectId}:${c.appId}`
}

/**
 * Inicializa apenas o Firebase App (≈2KB gzip).
 * Chamado no boot — não bloqueia o bundle de serviços (Firestore/Auth/Storage).
 */
export function initFirebase(config: FirebaseConfig, options: InitOptions = {}): void {
  const key = fingerprint(config)
  if (_app) {
    if (_configKey && _configKey !== key) {
      console.warn('[firebase/init] initFirebase chamado com config diferente — ignorando.')
    }
    return
  }

  const normalizedConfig = {
    ...config,
    storageBucket: config.storageBucket?.startsWith('gs://')
      ? config.storageBucket
      : `gs://${config.storageBucket}`,
  }

  _app       = getApps().length ? getApps()[0] : initializeApp(normalizedConfig)
  _opts      = options
  _configKey = key
}

/**
 * Retorna os serviços Firebase, inicializando-os de forma lazy na primeira chamada.
 * Os imports dinâmicos garantem que Firestore/Auth/Storage só entram no bundle
 * quando este composable é chamado pela primeira vez.
 */
export async function useFirebaseLazy(): Promise<FirebaseServices> {
  if (_services) return _services

  if (!_app) {
    throw new Error(
      '[firebase/init] Firebase não inicializado. Chame initFirebase() no boot primeiro.'
    )
  }

  const { authLanguage = 'en-US', enableAnalytics = false } = _opts

  // Imports dinâmicos — Vite cria chunks separados para cada um
  const [{ getFirestore }, { getAuth }, { getStorage }] = await Promise.all([
    import('firebase/firestore'),
    import('firebase/auth'),
    import('firebase/storage'),
  ])

  const $firestore = getFirestore(_app)
  const $auth      = getAuth(_app)
  const $storage   = getStorage(_app)

  $auth.languageCode = authLanguage

  if (enableAnalytics && typeof window !== 'undefined') {
    import('firebase/analytics').then(({ getAnalytics, isSupported }) => {
      isSupported().then(ok => { if (ok) getAnalytics(_app!) }).catch(() => {})
    })
  }

  _services = { $firestore, $auth, $storage, analytics: null }
  return _services
}

/**
 * Versão síncrona — retorna os serviços já inicializados.
 * Lança se useFirebaseLazy() ainda não foi resolvido.
 */
export function useFirebase(): FirebaseServices {
  if (!_services) {
    throw new Error(
      '[firebase/init] Serviços Firebase ainda não carregados. ' +
      'Aguarde useFirebaseLazy() resolver antes de chamar useFirebase().'
    )
  }
  return _services
}
