/**
 * @file generateImageVariants
 *
 * Triggered every time a file is finalized in Firebase Storage.
 * For any image uploaded to "media/" (excluding already-generated variants),
 * creates two WebP variants and stores them at predictable paths:
 *
 *   media/variants/thumb/{basename}.webp   → max 400 px wide, q72
 *   media/variants/medium/{basename}.webp  → max 900 px wide, q82
 *
 * The frontend can derive variant paths from the original URL without any
 * extra Firestore lookup, using the useImageVariant() composable.
 *
 * Loop prevention: files under "media/variants/" are skipped immediately.
 */

import * as functions from 'firebase-functions'
import * as admin      from 'firebase-admin'
import * as path       from 'path'
import * as os         from 'os'
import * as fs         from 'fs'
import sharp           from 'sharp'

// ── Variant definitions ───────────────────────────────────────────────────────
const VARIANTS: Array<{
  name:    'thumb' | 'medium'
  width:   number
  quality: number
}> = [
  { name: 'thumb',  width: 400, quality: 72 },
  { name: 'medium', width: 900, quality: 82 },
]

// Supported MIME types
const IMAGE_TYPES = new Set([
  'image/jpeg', 'image/jpg', 'image/png',
  'image/webp', 'image/gif', 'image/tiff', 'image/heic',
])

// ── Helper: derive basename without extension ─────────────────────────────────
function baseName(filePath: string): string {
  return path.basename(filePath, path.extname(filePath))
}

// ── Main function ─────────────────────────────────────────────────────────────
export const generateImageVariants = functions
  .region('us-central1')
  .runWith({ memory: '512MB', timeoutSeconds: 120 })
  .storage.object()
  .onFinalize(async (object) => {
    const filePath  = object.name ?? ''
    const bucket    = admin.storage().bucket(object.bucket)
    const mimeType  = object.contentType ?? ''

    // ── Guards ────────────────────────────────────────────────────────────────
    // 1. Only process images under "media/" (not variants, not other folders)
    if (!filePath.startsWith('media/') || filePath.startsWith('media/variants/')) {
      functions.logger.info(`Skipping non-media file: ${filePath}`)
      return null
    }

    // 2. Must be a supported image type
    if (!IMAGE_TYPES.has(mimeType)) {
      functions.logger.info(`Skipping non-image type: ${mimeType}`)
      return null
    }

    functions.logger.info(`Processing variants for: ${filePath}`)

    const base    = baseName(filePath) // e.g. "photo" from "media/photo.jpg"
    const tmpDir  = os.tmpdir()
    const tmpOrig = path.join(tmpDir, `orig_${base}${path.extname(filePath)}`)

    // ── Download original ─────────────────────────────────────────────────────
    await bucket.file(filePath).download({ destination: tmpOrig })

    // ── Generate each variant ─────────────────────────────────────────────────
    const results: Array<{ name: string; downloadUrl: string }> = []

    for (const variant of VARIANTS) {
      const outName  = `${base}.webp`
      const outPath  = `media/variants/${variant.name}/${outName}`
      const tmpOut   = path.join(tmpDir, `${variant.name}_${outName}`)

      try {
        await sharp(tmpOrig)
          .resize({ width: variant.width, withoutEnlargement: true })
          .webp({ quality: variant.quality, effort: 4 })
          .toFile(tmpOut)

        await bucket.upload(tmpOut, {
          destination: outPath,
          metadata: {
            contentType:   'image/webp',
            cacheControl:  'public, max-age=31536000, immutable',
            customMetadata: {
              originalPath: filePath,
              variant:      variant.name,
              generatedBy:  'generateImageVariants',
            },
          },
        })

        // Make the variant publicly readable and get its token
        const variantFile = bucket.file(outPath)
        const [meta]      = await variantFile.getMetadata()
        const token        = (meta.metadata as Record<string,string>)?.firebaseStorageDownloadTokens
                            ?? await variantFile.getSignedUrl({ action: 'read', expires: '2099-01-01' }).then(([u]) => u)

        // Build the canonical Firebase Storage download URL
        const encodedPath  = encodeURIComponent(outPath)
        const bucketName   = object.bucket
        const downloadUrl  = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media&token=${token}`

        results.push({ name: variant.name, downloadUrl })
        functions.logger.info(`✓ ${variant.name} → ${outPath}`)

        // Clean up temp file
        fs.unlinkSync(tmpOut)
      } catch (err) {
        functions.logger.error(`✗ Failed to generate ${variant.name}:`, err)
      }
    }

    // ── Store variant URLs as custom metadata on the original file ────────────
    // Frontend reads this with getMetadata() to get variant URLs without
    // an extra Firestore query.
    if (results.length > 0) {
      const customMetadata: Record<string, string> = {}
      for (const r of results) {
        customMetadata[`variant_${r.name}`] = r.downloadUrl
      }

      await bucket.file(filePath).setMetadata({ metadata: customMetadata })
      functions.logger.info(`Stored variant URLs in metadata of: ${filePath}`)
    }

    // Clean up original temp file
    try { fs.unlinkSync(tmpOrig) } catch { /* ignore */ }

    return null
  })
