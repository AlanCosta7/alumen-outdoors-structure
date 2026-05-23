/**
 * CRUD genérico sobre o Firestore.
 *
 * Retornos padronizados:
 *   { ok: true,  value: T }
 *   { ok: false, error: Error }
 */

import {
  doc, getDocs, deleteDoc, addDoc, updateDoc,
  collection, query, where, onSnapshot, orderBy, limit,
  type WhereFilterOp,
} from 'firebase/firestore'

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

export function useCrud(options: CrudOptions = {}) {
  const { handleCallback = noop } = options
  const { $firestore } = useFirebase()

  function applyConstraints(baseRef: ReturnType<typeof collection>, opts: QueryOptions = {}) {
    const constraints = []
    if (opts.where)   for (const [f, op, v] of opts.where) constraints.push(where(f, op, v))
    if (opts.orderBy) constraints.push(orderBy(opts.orderBy.field, opts.orderBy.dir ?? 'asc'))
    if (opts.limit)   constraints.push(limit(opts.limit))
    return constraints.length ? query(baseRef, ...constraints) : baseRef
  }

  async function saveDoc({ collection: col, data }: { collection: string; data: object }): Promise<Result<ReturnType<typeof doc>>> {
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
    try {
      await deleteDoc(doc($firestore, col, id))
      handleCallback({ type: 'positive', message: 'Deleted successfully' })
      return ok(true as const)
    } catch (e) {
      handleCallback({ type: 'negative', message: 'Oops! Could not delete' })
      return fail(e as Error)
    }
  }

  async function fetchCollection(col: string, opts?: QueryOptions) {
    const q = applyConstraints(collection($firestore, col) as ReturnType<typeof collection>, opts)
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  }

  function subscribeCollection(
    col: string,
    onChange: (rows: Array<{ id: string } & Record<string, unknown>>) => void,
    opts?: QueryOptions,
  ) {
    const q = applyConstraints(collection($firestore, col) as ReturnType<typeof collection>, opts)
    return onSnapshot(q, snap => {
      onChange(snap.docs.map(d => ({ id: d.id, ...d.data() as Record<string, unknown> })))
    })
  }

  return { saveDoc, updateDocs, deleteDocs, fetchCollection, subscribeCollection }
}
