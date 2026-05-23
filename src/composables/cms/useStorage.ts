/**
 * Storage composable — upload, listagem e deleção no Firebase Storage.
 *
 * Não chama Quasar Loading diretamente; expõe `onProgress(percent)` e
 * resolve promises com URLs em vez de mutar state externo.
 */

import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  list,
  listAll,
} from 'firebase/storage'

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
  console.info(`${logPrefix} ${message}`, data ?? '')
}

function logWarn(message: string, data?: Record<string, unknown>) {
  console.warn(`${logPrefix} ${message}`, data ?? '')
}

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function useStorage(options: StorageOptions = {}) {
  const {
    handleCallback  = noop,
    pathPrefix      = '',
    deletePathPrefix = 'galeria/',
  } = options
  const { $storage } = useFirebase()

  function uploadFile(
    file: File | Blob,
    opts: { id?: string; onProgress?: (percent: number) => void } = {},
  ): Promise<UploadResult> {
    if (!file) return Promise.reject(new Error('uploadFile: arquivo ausente'))
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
    const started = performance.now()
    logInfo('list files started', { path, maxResults })
    const ref  = storageRef($storage, path)
    const page = await list(ref, { maxResults })
    let successCount = 0
    let errorCount = 0
    const results = await Promise.all(
      page.items.map(async item => {
        try {
          const url = await getDownloadURL(storageRef($storage, item.fullPath))
          successCount++
          return { fullPath: item.fullPath, name: item.name, url }
        } catch (e) {
          errorCount++
          logWarn('download url failed', { fullPath: item.fullPath, error: (e as Error).message })
          return null
        }
      }),
    )
    logInfo('list files finished', {
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
    return listAll(storageRef($storage, path))
  }

  async function deleteFile(idOrPath: string, { fullPath = false } = {}) {
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
