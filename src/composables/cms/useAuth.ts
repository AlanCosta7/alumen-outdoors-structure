/**
 * Auth composable — login, logout e watch de auth state.
 *
 * Imports de firebase/auth são dinâmicos (lazy) — o chunk (~186 KB) não é
 * incluído no bundle inicial e só é carregado no primeiro uso.
 *
 * Sem estado reativo interno; use a store se precisar de reatividade.
 */

import type { User } from 'firebase/auth'

import { useFirebase } from 'src/firebase/init'

type Callback = (p: { type: string; message: string }) => void

export interface CmsUser {
  uid:           string
  email:         string | null
  emailVerified: boolean
  displayName:   string | null
  photoURL:      string | null
  providerId:    string | null
  phoneNumber:   string | null
}

export interface AuthOptions {
  handleCallback?: Callback
  errorMessages?:  Record<string, string>
}

const DEFAULT_ERROR_MESSAGES: Record<string, string> = {
  'auth/user-not-found':        'User not found.',
  'auth/wrong-password':        'Wrong password.',
  'auth/invalid-email':         'Invalid email.',
  'auth/email-already-in-use':  'Email already in use.',
  'auth/weak-password':         'Weak password. The password must be at least 6 characters long.',
}

const noop: Callback = () => {}

// Cached promise — firebase/auth (~186 KB) fetched only once
let _authModule: Promise<typeof import('firebase/auth')> | null = null
function authModule() {
  if (!_authModule) _authModule = import('firebase/auth')
  return _authModule
}

export function formatUser(user: User | null): CmsUser | null {
  if (!user) return null
  const { uid, email, emailVerified, displayName, photoURL, providerData, phoneNumber } = user
  const providerId = providerData?.length ? providerData[0].providerId : null
  return { uid, email, emailVerified, displayName, photoURL, providerId, phoneNumber }
}

export function useAuth(options: AuthOptions = {}) {
  const {
    handleCallback = noop,
    errorMessages  = DEFAULT_ERROR_MESSAGES,
  } = options
  const { $auth } = useFirebase()

  async function signIn({ email, password }: { email: string; password: string }) {
    if ($auth.currentUser) return formatUser($auth.currentUser)
    const { signInWithEmailAndPassword } = await authModule()
    try {
      const cred = await signInWithEmailAndPassword($auth, email, password)
      return formatUser(cred.user)
    } catch (e: unknown) {
      const code    = (e as { code?: string }).code
      const message = (code && errorMessages[code]) || 'Ops!'
      handleCallback({ type: 'negative', message })
      return false
    }
  }

  async function signOut(opts: { confirm?: () => Promise<boolean> } = {}) {
    if (typeof opts.confirm === 'function') {
      const proceed = await opts.confirm()
      if (!proceed) return false
    }
    const { signOut: fbSignOut } = await authModule()
    await fbSignOut($auth)
    handleCallback({ type: 'positive', message: 'You have been successfully logged out.' })
    return true
  }

  function watchAuth(onChange: (user: CmsUser | null) => void) {
    // Returns a stable unsubscribe function; wires up the listener once the
    // auth chunk loads (normally already cached by the login page).
    let realUnsub: (() => void) | null = null

    void authModule().then(({ onAuthStateChanged }) => {
      realUnsub = onAuthStateChanged($auth, user => onChange(formatUser(user)))
    })

    return () => { realUnsub?.() }
  }

  return {
    signIn,
    signOut,
    watchAuth,
    formatUser,
    get currentUser() { return formatUser($auth.currentUser) },
  }
}
