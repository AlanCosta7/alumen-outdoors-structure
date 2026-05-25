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

        viteConf.plugins = viteConf.plugins || []

        // ── font-display: swap para fontes de ícones do Quasar ────────────────
        // @quasar/extras bundla Material Icons com `font-display: block`, que
        // bloqueia a renderização de texto por até 3 s (Lighthouse avisa).
        // Este plugin substitui pelo valor `swap` em todo CSS processado pelo
        // Vite, sem alterar node_modules.
        viteConf.plugins.push({
          name: 'font-display-swap',
          enforce: 'pre',
          transform(code, id) {
            if (!id.match(/\.css(\?.*)?$/) || !code.includes('font-display')) return null
            const updated = code.replace(/font-display\s*:\s*block/g, 'font-display: swap')
            return updated !== code ? { code: updated, map: null } : null
          },
        })

        // ── Strip admin-only assets from the public HTML document ─────────────
        // The `admin` chunk and its CSS are only needed by /admin routes.
        // Removing them from <head> saves ~124 KB of blocking resources for
        // public visitors (admin.js + admin.css).
        viteConf.plugins.push({
          name: 'strip-admin-assets',
          transformIndexHtml(html) {
            // Remove <link rel="stylesheet"> and <link rel="modulepreload">
            // for any chunk whose filename starts with "admin"
            return html
              .replace(/<link[^>]+href="[^"]*\/admin\.[^"]*\.css"[^>]*>/g, '')
              .replace(/<link[^>]+rel="modulepreload"[^>]+href="[^"]*\/admin\.[^"]*\.js"[^>]*>/g, '')
          },
        })

        // ── Defer render-blocking CSS ─────────────────────────────────────────
        // Converte os <link rel="stylesheet"> dos assets locais para
        // rel="preload" + onload (loadCSS pattern), eliminando o bloqueio de
        // renderização de 1.3 s do Quasar CSS + index CSS.
        //
        // Seguro em SPA Vue porque o HTML inicial é só <div id="q-app"></div> —
        // não há conteúdo visível antes do JS montar. Os assets são baixados em
        // paralelo com o JS; na prática o CSS chega antes do Vue terminar de
        // montar na maioria das conexões.
        //
        // Um CSS crítico inline mínimo (body bg + margin) evita flash branco
        // enquanto o bundle ainda não aplicou os estilos.
        viteConf.plugins.push({
          name: 'defer-render-blocking-css',
          // Roda DEPOIS do strip-admin-assets (plugins transformIndexHtml
          // são chamados na ordem em que são registados).
          transformIndexHtml(html) {
            // CSS crítico inline — apenas o suficiente para evitar flash:
            //   • background-color da página (#fbfbfa)
            //   • margin: 0 para evitar salto do scrollbar
            //   • #q-app min-height para reservar o espaço da viewport
            const critical = '<style>html,body{margin:0;padding:0;background-color:#fbfbfa}#q-app{min-height:100vh}</style>'

            // Substitui <link rel="stylesheet" href="/assets/…"> pelo padrão
            // preload + onload. Não toca em links externos (Google Fonts, etc.)
            // pois esses já usam o padrão media="print" onload.
            let result = html.replace(
              /<link rel="stylesheet" href="(\/assets\/[^"]+\.css)">/g,
              (_, href) =>
                `<link rel="preload" href="${href}" as="style" onload="this.onload=null;this.rel='stylesheet'">` +
                `<noscript><link rel="stylesheet" href="${href}"></noscript>`,
            )

            // Insere o CSS crítico imediatamente antes do </head>
            result = result.replace('</head>', `${critical}</head>`)

            return result
          },
        })

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
