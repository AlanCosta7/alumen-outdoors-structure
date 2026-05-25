/**
 * Storage composable — upload, listagem e deleção no Firebase Storage.
 *
 * Imports de firebase/storage são dinâmicos (lazy) — o chunk (~50 KB) não é
 * incluído no bundle inicial e só é carregado no primeiro uso (admin).
 *
 * Não chama Quasar Loading diretamente; expõe `onProgress(percent)` e
 * resolve promises com URLs em vez de mutar state externo.
 */

import { useFirebase } from 'src/firebase/init'

type Callback = (p: { type: string; message: string }) => void

export interface StorageOptions {
  handleCallback?: Callback
  pathPrefix?:       string
  deletePathPrefix?: string
}

export interface UploadResult {
  id:       string
  url:      string
  fullPath: string
}

const noop = () => {}
const logPrefix = '[Storage]'

function logInfo(message: string, data?: Record<string, unknown>) {
  console.info(`${logPrefix} ${message}`, {
    at: new Date().toISOString(),
    ...(data ?? {}),
  })
}

function logWarn(message: string, data?: Record<string, unknown>) {
  console.warn(`${logPrefix} ${message}`, {
    at: new Date().toISOString(),
    ...(data ?? {}),
  })
}

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

// Cached promise — firebase/storage (~50 KB) fetched only once
let _storageModule: Promise<typeof import('firebase/storage')> | null = null
function storageModule() {
  if (!_storageModule) _storageModule = import('firebase/storage')
  return _storageModule
}

export function useStorage(options: StorageOptions = {}) {
  const {
    handleCallback   = noop,
    pathPrefix       = '',
    deletePathPrefix = 'galeria/',
  } = options
  const { $storage } = useFirebase()

  async function uploadFile(
    file: File | Blob,
    opts: { id?: string; onProgress?: (percent: number) => void } = {},
  ): Promise<UploadResult> {
    if (!file) return Promise.reject(new Error('uploadFile: arquivo ausente'))
    const { ref: storageRef, uploadBytesResumable, getDownloadURL } = await storageModule()

    const id         = opts.id ?? generateId()
    const onProgress = opts.onProgress ?? noop
    const fullPath   = `${pathPrefix}${id}`
    const ref        = storageRef($storage, fullPath)

    return new Promise((resolve, reject) => {
      const task = uploadBytesResumable(ref, file)
      task.on(
        'state_changed',
        snap => onProgress((snap.bytesTransferred / snap.totalBytes) * 100),
        error => {
          handleCallback({ type: 'negative', message: 'Upload failed' })
          reject(error)
        },
        async () => {
          try {
            const url = await getDownloadURL(task.snapshot.ref)
            handleCallback({ type: 'positive', message: 'Image uploaded successfully' })
            resolve({ id, url, fullPath })
          } catch (e) { reject(e) }
        },
      )
    })
  }

  async function listFiles({ path = pathPrefix, maxResults = 200 } = {}) {
    const { ref: storageRef, list, getDownloadURL } = await storageModule()

    const started = performance.now()
    logInfo('phase: listFiles started', { path, maxResults })
    const ref  = storageRef($storage, path)
    const listStarted = performance.now()
    const page = await list(ref, { maxResults })
    logInfo('phase: storage list() finished', {
      path,
      itemCount: page.items.length,
      hasNextPage: Boolean(page.nextPageToken),
      ms: Math.round(performance.now() - listStarted),
    })
    let successCount = 0
    let errorCount = 0
    const urlStarted = performance.now()
    logInfo('phase: download urls started', {
      path,
      itemCount: page.items.length,
    })
    const results = await Promise.all(
      page.items.map(async item => {
        const itemStarted = performance.now()
        try {
          const url = await getDownloadURL(storageRef($storage, item.fullPath))
          successCount++
          const itemMs = Math.round(performance.now() - itemStarted)
          if (itemMs > 1000) {
            logWarn('slow download url', {
              fullPath: item.fullPath,
              ms: itemMs,
            })
          }
          return { fullPath: item.fullPath, name: item.name, url }
        } catch (e) {
          errorCount++
          logWarn('download url failed', { fullPath: item.fullPath, error: (e as Error).message })
          return null
        }
      }),
    )
    logInfo('phase: download urls finished', {
      path,
      requested: page.items.length,
      returned: successCount,
      errors: errorCount,
      ms: Math.round(performance.now() - urlStarted),
    })
    logInfo('phase: listFiles finished', {
      path,
      storageItems: page.items.length,
      returned: successCount,
      errors: errorCount,
      hasNextPage: Boolean(page.nextPageToken),
      ms: Math.round(performance.now() - started),
    })
    return results.filter(Boolean) as Array<{ fullPath: string; name: string; url: string }>
  }

  async function listAllFiles({ path = pathPrefix } = {}) {
    const { ref: storageRef, listAll } = await storageModule()
    return listAll(storageRef($storage, path))
  }

  async function deleteFile(idOrPath: string, { fullPath = false } = {}) {
    const { ref: storageRef, deleteObject } = await storageModule()
    const path = fullPath ? idOrPath : `${deletePathPrefix}${idOrPath}`
    try {
      await deleteObject(storageRef($storage, path))
      handleCallback({ type: 'positive', message: 'Image deleted' })
      return { ok: true }
    } catch (e) {
      handleCallback({ type: 'negative', message: 'Oops! Could not delete an image' })
      return { ok: false, error: e as Error }
    }
  }

  return { uploadFile, listFiles, listAllFiles, deleteFile }
}
