/**
 * useImageVariant
 *
 * Converte uma URL de imagem original (Firebase Storage) na URL da variante
 * correspondente (thumb | medium), gerada pela Cloud Function
 * `generateImageVariants`.
 *
 * Estratégia:
 *  1. A função backend armazena as URLs das variantes no custom metadata do
 *     arquivo original (campos `variant_thumb` e `variant_medium`).
 *  2. O frontend chama `getMetadata()` na primeira acesso a cada imagem e
 *     cacheia o resultado em memória (módulo-nível, persiste enquanto o app
 *     estiver aberto).
 *  3. Enquanto a variante não estiver disponível (imagem recém-enviada ou
 *     variante ainda sendo gerada), retorna a URL original como fallback.
 *
 * Tamanhos gerados pela função:
 *   thumb  → max 400px largura, WebP q72  (admin grids, seletores)
 *   medium → max 900px largura, WebP q82  (seções de página, carrosséis)
 *   full   → URL original, sem modificação (lightbox, hero full-bleed)
 */

import { ref, watch, isRef, type Ref } from 'vue'
import { IS_MOCK_MODE }   from 'stores/cms'

export type ImageSize = 'thumb' | 'medium' | 'full'

// ── Cache persistente de variantes por URL original ───────────────────────────
// key: `${originalUrl}:${size}` → value: variantUrl | null (null = não disponível)
const variantCache = new Map<string, string | null>()
// Controla quais metadatas já foram buscados (evita chamadas duplicadas)
const metaFetched  = new Set<string>()

// ── Helpers ───────────────────────────────────────────────────────────────────
function urlToStoragePath(url: string): string {
  const match = url.match(/\/o\/([^?]+)/)
  return match ? decodeURIComponent(match[1]) : ''
}

function cacheKey(url: string, size: ImageSize) {
  return `${url}:${size}`
}

/**
 * Busca o metadata do arquivo original e extrai as URLs de variante,
 * armazenando-as no cache.  Chamado de forma lazy na primeira solicitação.
 */
async function fetchAndCacheVariants(originalUrl: string): Promise<void> {
  if (metaFetched.has(originalUrl)) return
  metaFetched.add(originalUrl)

  if (IS_MOCK_MODE) return

  try {
    const [{ getApp }, { getStorage, ref: storageRef, getMetadata }] = await Promise.all([
      import('firebase/app'),
      import('firebase/storage'),
    ])

    const path    = urlToStoragePath(originalUrl)
    if (!path) return

    const storage = getStorage(getApp())
    const meta    = await getMetadata(storageRef(storage, path))
    const custom  = (meta.customMetadata ?? {}) as Record<string, string>

    for (const size of ['thumb', 'medium'] as const) {
      const key = cacheKey(originalUrl, size)
      variantCache.set(key, custom[`variant_${size}`] ?? null)
    }
  } catch {
    // Arquivo inacessível ou variante ainda não gerada — manter null (fallback)
  }
}

// ── API pública ───────────────────────────────────────────────────────────────

/**
 * Composable reativo.
 *
 * Uso em componentes Vue:
 *   const src = useImageVariant(imageUrl, 'medium')
 *   // src.value → URL da variante ou original como fallback
 *
 * @param originalUrl - URL original do Firebase Storage (pode ser ref reativa)
 * @param size        - 'thumb' | 'medium' | 'full'
 */
export function useImageVariant(
  originalUrl: string | Ref<string>,
  size: ImageSize,
): Ref<string> {
  const getUrl = () => (typeof originalUrl === 'string' ? originalUrl : originalUrl.value)

  const result = ref<string>(getUrl())

  async function resolve() {
    const url = getUrl()
    if (!url || size === 'full') {
      result.value = url
      return
    }

    // Retornar do cache se disponível
    const key = cacheKey(url, size)
    if (variantCache.has(key)) {
      result.value = variantCache.get(key) ?? url
      return
    }

    // Mostrar original enquanto busca o metadata (sem bloquear renderização)
    result.value = url

    await fetchAndCacheVariants(url)

    result.value = variantCache.get(key) ?? url
  }

  // Re-resolve whenever the source URL changes (e.g. store loads asynchronously)
  if (isRef(originalUrl)) {
    watch(originalUrl, () => { void resolve() })
  }

  void resolve()

  return result
}

/**
 * Versão não-reativa para uso em listas (ServicesGrid, MediaPicker).
 * Inicia a busca em background e retorna a URL correta assim que disponível.
 */
export async function resolveImageVariant(
  originalUrl: string,
  size: ImageSize,
): Promise<string> {
  if (!originalUrl || size === 'full') return originalUrl

  const key = cacheKey(originalUrl, size)
  if (variantCache.has(key)) return variantCache.get(key) ?? originalUrl

  await fetchAndCacheVariants(originalUrl)
  return variantCache.get(key) ?? originalUrl
}

/**
 * Popula o cache de variantes a partir de um customMetadata já obtido externamente.
 * Use quando você já fez getMetadata() por outro motivo (ex: buscar timestamp)
 * e quer evitar uma segunda chamada HTTP só para as variantes.
 */
export function populateVariantCache(
  originalUrl: string,
  customMetadata: Record<string, string>,
): void {
  metaFetched.add(originalUrl) // marca como buscado — fetchAndCacheVariants não irá repetir
  for (const size of ['thumb', 'medium'] as const) {
    variantCache.set(cacheKey(originalUrl, size), customMetadata[`variant_${size}`] ?? null)
  }
}

/**
 * Pré-carrega variantes de uma lista de URLs em paralelo.
 * Chame quando uma lista de imagens é exibida para popular o cache antes
 * da renderização individual.
 */
export async function prefetchVariants(
  urls: string[],
  size: ImageSize,
): Promise<void> {
  if (IS_MOCK_MODE || size === 'full') return
  const uncached = urls.filter(u => u && !metaFetched.has(u))
  if (!uncached.length) return

  await Promise.allSettled(uncached.map(fetchAndCacheVariants))
}
