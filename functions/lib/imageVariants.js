"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateImageVariants = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const fs = __importStar(require("fs"));
const sharp_1 = __importDefault(require("sharp"));
// ── Variant definitions ───────────────────────────────────────────────────────
const VARIANTS = [
    { name: 'thumb', width: 400, quality: 72 },
    { name: 'medium', width: 900, quality: 82 },
];
// Supported MIME types
const IMAGE_TYPES = new Set([
    'image/jpeg', 'image/jpg', 'image/png',
    'image/webp', 'image/gif', 'image/tiff', 'image/heic',
]);
// ── Helper: derive basename without extension ─────────────────────────────────
function baseName(filePath) {
    return path.basename(filePath, path.extname(filePath));
}
// ── Main function ─────────────────────────────────────────────────────────────
exports.generateImageVariants = functions
    .region('us-central1')
    .runWith({ memory: '512MB', timeoutSeconds: 120 })
    .storage.object()
    .onFinalize(async (object) => {
    var _a, _b, _c, _d;
    const filePath = (_a = object.name) !== null && _a !== void 0 ? _a : '';
    const bucket = admin.storage().bucket(object.bucket);
    const mimeType = (_b = object.contentType) !== null && _b !== void 0 ? _b : '';
    // ── Guards ────────────────────────────────────────────────────────────────
    // 1. Only process images under "media/" (not variants, not other folders)
    if (!filePath.startsWith('media/') || filePath.startsWith('media/variants/')) {
        functions.logger.info(`Skipping non-media file: ${filePath}`);
        return null;
    }
    // 2. Must be a supported image type
    if (!IMAGE_TYPES.has(mimeType)) {
        functions.logger.info(`Skipping non-image type: ${mimeType}`);
        return null;
    }
    functions.logger.info(`Processing variants for: ${filePath}`);
    const base = baseName(filePath); // e.g. "photo" from "media/photo.jpg"
    const tmpDir = os.tmpdir();
    const tmpOrig = path.join(tmpDir, `orig_${base}${path.extname(filePath)}`);
    // ── Download original ─────────────────────────────────────────────────────
    await bucket.file(filePath).download({ destination: tmpOrig });
    // ── Generate each variant ─────────────────────────────────────────────────
    const results = [];
    for (const variant of VARIANTS) {
        const outName = `${base}.webp`;
        const outPath = `media/variants/${variant.name}/${outName}`;
        const tmpOut = path.join(tmpDir, `${variant.name}_${outName}`);
        try {
            await (0, sharp_1.default)(tmpOrig)
                .resize({ width: variant.width, withoutEnlargement: true })
                .webp({ quality: variant.quality, effort: 4 })
                .toFile(tmpOut);
            await bucket.upload(tmpOut, {
                destination: outPath,
                metadata: {
                    contentType: 'image/webp',
                    cacheControl: 'public, max-age=31536000, immutable',
                    customMetadata: {
                        originalPath: filePath,
                        variant: variant.name,
                        generatedBy: 'generateImageVariants',
                    },
                },
            });
            // Make the variant publicly readable and get its token
            const variantFile = bucket.file(outPath);
            const [meta] = await variantFile.getMetadata();
            const token = (_d = (_c = meta.metadata) === null || _c === void 0 ? void 0 : _c.firebaseStorageDownloadTokens) !== null && _d !== void 0 ? _d : await variantFile.getSignedUrl({ action: 'read', expires: '2099-01-01' }).then(([u]) => u);
            // Build the canonical Firebase Storage download URL
            const encodedPath = encodeURIComponent(outPath);
            const bucketName = object.bucket;
            const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media&token=${token}`;
            results.push({ name: variant.name, downloadUrl });
            functions.logger.info(`✓ ${variant.name} → ${outPath}`);
            // Clean up temp file
            fs.unlinkSync(tmpOut);
        }
        catch (err) {
            functions.logger.error(`✗ Failed to generate ${variant.name}:`, err);
        }
    }
    // ── Store variant URLs as custom metadata on the original file ────────────
    // Frontend reads this with getMetadata() to get variant URLs without
    // an extra Firestore query.
    if (results.length > 0) {
        const customMetadata = {};
        for (const r of results) {
            customMetadata[`variant_${r.name}`] = r.downloadUrl;
        }
        await bucket.file(filePath).setMetadata({ metadata: customMetadata });
        functions.logger.info(`Stored variant URLs in metadata of: ${filePath}`);
    }
    // Clean up original temp file
    try {
        fs.unlinkSync(tmpOrig);
    }
    catch ( /* ignore */_e) { /* ignore */ }
    return null;
});
//# sourceMappingURL=imageVariants.js.map