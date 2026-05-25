import { route } from 'quasar/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  // ── Admin auth guard ────────────────────────────────────────────────────────
  // Protege todas as rotas /admin/** (exceto /admin/login).
  // Aguarda o Firebase Auth restaurar a sessão antes de decidir o redirect,
  // evitando falsos redirects enquanto o token ainda está sendo rehydratado.
  router.beforeEach(async (to) => {
    if (!to.path.startsWith('/admin') || to.path === '/admin/login') return true

    try {
      const { getApp }  = await import('firebase/app')
      const { getAuth } = await import('firebase/auth')

      const auth = getAuth(getApp())

      // Se já há usuário sincronamente, libera imediatamente
      if (auth.currentUser) return true

      // Aguarda a restauração assíncrona da sessão (máx 5 s)
      await new Promise<void>((resolve) => {
        const unsub = auth.onAuthStateChanged((user) => {
          unsub()
          resolve()
          void user // silence "unused" warning
        })
        setTimeout(resolve, 5000) // fallback: não trava a navegação para sempre
      })

      if (auth.currentUser) return true
    } catch {
      // Firebase não inicializado (modo mock) — deixa passar
      return true
    }

    // Sem sessão → redireciona para login com destino salvo
    return { path: '/admin/login', query: { redirect: to.fullPath } }
  })

  return router
})
