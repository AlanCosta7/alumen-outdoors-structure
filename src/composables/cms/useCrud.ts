/**
 * CRUD genérico sobre o Firestore.
 *
 * Imports de firebase/firestore são dinâmicos (lazy) — o chunk não é
 * incluído no bundle inicial e só é carregado quando o primeiro método
 * for chamado (tipicamente só no admin).
 *
 * Retornos padronizados:
 *   { ok: true,  value: T }
 *   { ok: false, error: Error }
 */

import type { WhereFilterOp, DocumentReference } from 'firebase/firestore'

import { useFirebase } from 'src/firebase/init'

type Callback = (p: { type: 'positive' | 'negative' | 'warning' | 'info'; message: string }) => void

export interface CrudOptions {
  handleCallback?: Callback
}

export interface QueryOptions {
  where?:   [string, WhereFilterOp, unknown][]
  orderBy?: { field: string; dir?: 'asc' | 'desc' }
  limit?:   number
}

type Result<T> = { ok: true; value: T } | { ok: false; error: Error }

const noop: Callback = () => {}
const ok   = <T>(value: T): Result<T>  => ({ ok: true, value })
const fail = (error: Error): Result<never> => ({ ok: false, error })

// Cached promise so the module is only fetched once across all calls
let _fsModule: Promise<typeof import('firebase/firestore')> | null = null
function fsModule() {
  if (!_fsModule) _fsModule = import('firebase/firestore')
  return _fsModule
}

export function useCrud(options: CrudOptions = {}) {
  const { handleCallback = noop } = options
  const { $firestore } = useFirebase()

  async function saveDoc({ collection: col, data }: { collection: string; data: object }): Promise<Result<DocumentReference>> {
    const { addDoc, collection } = await fsModule()
    try {
      const ref = await addDoc(collection($firestore, col), data)
      handleCallback({ type: 'positive', message: 'Saved successfully' })
      return ok(ref)
    } catch (e) {
      handleCallback({ type: 'negative', message: 'Oops! Could not save' })
      return fail(e as Error)
    }
  }

  async function updateDocs({ collection: col, id, data }: { collection: string; id: string; data: object }): Promise<Result<true>> {
    const { doc, updateDoc } = await fsModule()
    try {
      await updateDoc(doc($firestore, col, id), data)
      handleCallback({ type: 'positive', message: 'Saved successfully' })
      return ok(true as const)
    } catch (e) {
      handleCallback({ type: 'negative', message: 'Oops! Could not save' })
      return fail(e as Error)
    }
  }

  async function deleteDocs({ collection: col, id }: { collection: string; id: string }): Promise<Result<true>> {
    const { doc, deleteDoc } = await fsModule()
    try {
      await deleteDoc(doc($firestore, col, id))
      handleCallback({ type: 'positive', message: 'Deleted successfully' })
      return ok(true as const)
    } catch (e) {
      handleCallback({ type: 'negative', message: 'Oops! Could not delete' })
      return fail(e as Error)
    }
  }

  async function fetchCollection(col: string, opts: QueryOptions = {}) {
    const { collection, query, where, orderBy, limit, getDocs } = await fsModule()

    const constraints: Parameters<typeof query>[1][] = []
    if (opts.where)   for (const [f, op, v] of opts.where) constraints.push(where(f, op, v))
    if (opts.orderBy) constraints.push(orderBy(opts.orderBy.field, opts.orderBy.dir ?? 'asc'))
    if (opts.limit)   constraints.push(limit(opts.limit))

    const baseRef = collection($firestore, col)
    const q = constraints.length ? query(baseRef, ...constraints) : baseRef
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  }

  function subscribeCollection(
    col: string,
    onChange: (rows: Array<{ id: string } & Record<string, unknown>>) => void,
    opts: QueryOptions = {},
  ) {
    // Returns a stable unsubscribe function immediately; the actual Firestore
    // subscription is wired up asynchronously once the chunk loads (fast from cache).
    let realUnsub: (() => void) | null = null

    void fsModule().then(({ collection, query, where, orderBy, limit, onSnapshot }) => {
      const constraints: Parameters<typeof query>[1][] = []
      if (opts.where)   for (const [f, op, v] of opts.where) constraints.push(where(f, op, v))
      if (opts.orderBy) constraints.push(orderBy(opts.orderBy.field, opts.orderBy.dir ?? 'asc'))
      if (opts.limit)   constraints.push(limit(opts.limit))

      const baseRef = collection($firestore, col)
      const q = constraints.length ? query(baseRef, ...constraints) : baseRef
      realUnsub = onSnapshot(q, snap => {
        onChange(snap.docs.map(d => ({ id: d.id, ...d.data() as Record<string, unknown> })))
      })
    })

    return () => { realUnsub?.() }
  }

  return { saveDoc, updateDocs, deleteDocs, fetchCollection, subscribeCollection }
}
