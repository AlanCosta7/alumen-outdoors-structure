/* eslint-env node */
require('dotenv').config()

const path = require('path')
const { configure } = require('quasar/wrappers')

module.exports = configure(function (/* ctx */) {
  return {
    boot: [
      'cms',
    ],

    css: [
      'app.scss',
    ],

    extras: [
      'material-icons',
    ],

    build: {
      target: {
        browser: ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
        node: 'node18',
      },

      vueRouterMode: 'history',

      extendViteConf(viteConf) {
        viteConf.resolve = viteConf.resolve || {}
        viteConf.resolve.alias = {
          ...viteConf.resolve.alias,
          'composables': path.resolve(__dirname, 'src/composables'),
        }

        // ── Build optimizations ───────────────────────────────────────────────
        viteConf.build = viteConf.build || {}

        // Chunk splitting estratégico por domínio de código
        viteConf.build.rollupOptions = {
          ...(viteConf.build.rollupOptions || {}),
          output: {
            manualChunks(id) {
              // Firebase: cada serviço em chunk próprio → tree-shaking máximo
              if (id.includes('@firebase/firestore') || id.includes('firebase/firestore'))
                return 'firebase-firestore'
              if (id.includes('@firebase/auth') || id.includes('firebase/auth'))
                return 'firebase-auth'
              if (id.includes('@firebase/storage') || id.includes('firebase/storage'))
                return 'firebase-storage'
              if (id.includes('@firebase/functions') || id.includes('firebase/functions'))
                return 'firebase-functions'
              if (id.includes('@firebase/') || id.includes('firebase/app'))
                return 'firebase-core'

              // Admin: separado completamente do site público
              if (id.includes('src/pages/admin') || id.includes('src/components/admin') || id.includes('src/layouts/AdminLayout'))
                return 'admin'

              // Quasar e Vue: vendor estável com cache longo
              if (id.includes('node_modules/quasar'))   return 'quasar'
              if (id.includes('node_modules/vue'))       return 'vue'
              if (id.includes('node_modules/pinia'))     return 'pinia'
            },
          },
        }

        // Remove console.log em produção
        viteConf.build.minify = 'esbuild'
        viteConf.esbuild = {
          ...(viteConf.esbuild || {}),
          drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
        }
      },

      // Variáveis de ambiente expostas ao bundle do cliente
      env: {
        FIREBASE_API_KEY:            process.env.FIREBASE_API_KEY,
        FIREBASE_AUTH_DOMAIN:        process.env.FIREBASE_AUTH_DOMAIN,
        FIREBASE_PROJECT_ID:         process.env.FIREBASE_PROJECT_ID,
        FIREBASE_STORAGE_BUCKET:     process.env.FIREBASE_STORAGE_BUCKET,
        FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
        FIREBASE_APP_ID:             process.env.FIREBASE_APP_ID,
        FIREBASE_MEASUREMENT_ID:     process.env.FIREBASE_MEASUREMENT_ID,
      },
    },

    devServer: {
      open: false,
    },

    framework: {
      config: {
        notify: {
          position: 'bottom-right',
          timeout: 2500,
        },
      },

      plugins: [
        'Notify',
        'Loading',
        'Dialog',
        'Meta',
      ],
    },

    animations: [],

    ssr: {
      pwa: false,
      prodPort: 3000,
      middlewares: ['render'],
    },

    pwa: {
      workboxMode: 'generateSW',
      injectPwaMetaTags: true,
      swFilename: 'sw.js',
      manifestFilename: 'manifest.json',
      useCredentialsForManifestTag: false,
    },
  }
})
