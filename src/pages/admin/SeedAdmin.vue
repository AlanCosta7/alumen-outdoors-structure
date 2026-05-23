<template>
  <div class="q-pa-md">
    <!-- Header -->
    <div class="row items-start justify-between q-mb-lg">
      <div>
        <p class="text-overline text-grey-5 q-mb-none">Admin</p>
        <h1 class="text-h5 text-white q-mt-none q-mb-xs" style="font-weight:700">
          Seed Firebase
        </h1>
        <p class="text-caption text-grey-5 q-mb-none">
          Push the current mock data to your production Firebase project.
        </p>
      </div>

      <!-- Mode badge -->
      <q-chip
        :color="isMockMode ? 'warning' : 'positive'"
        text-color="dark"
        :icon="isMockMode ? 'warning' : 'cloud_done'"
        :label="isMockMode ? 'Mock Mode — Firebase not configured' : 'Firebase Connected'"
        class="q-mt-sm"
      />
    </div>

    <!-- Firebase not configured warning -->
    <q-banner
      v-if="isMockMode"
      class="q-mb-lg"
      rounded
      inline-actions
      style="background: rgba(255,193,7,0.1); border: 1px solid rgba(255,193,7,0.3);"
    >
      <template #avatar>
        <q-icon name="info" color="warning" size="24px" />
      </template>
      <div class="text-body2 text-white">
        Firebase is not configured. To seed production, add your credentials to
        <code class="q-px-xs" style="background:rgba(255,255,255,0.1); border-radius:3px;">.env</code>
        and rebuild the app.
      </div>
    </q-banner>

    <!-- Collection cards -->
    <div class="seed-grid">
      <q-card
        v-for="col in collections"
        :key="col.key"
        dark flat bordered
        class="seed-card"
      >
        <q-card-section class="q-pb-sm">
          <div class="row items-center justify-between q-mb-xs">
            <div class="row items-center gap-sm">
              <q-icon :name="col.icon" color="positive" size="20px" class="q-mr-xs" />
              <span class="text-subtitle1 text-white text-weight-bold">{{ col.label }}</span>
            </div>
            <q-badge :label="`${col.items.length} items`" color="grey-8" />
          </div>

          <!-- Item preview list -->
          <q-list dense class="q-mt-sm">
            <q-item
              v-for="item in col.items.slice(0, 3)"
              :key="item.id"
              class="q-px-none q-py-xs"
            >
              <q-item-section>
                <q-item-label class="text-grey-3 text-caption">
                  {{ getItemLabel(col.key, item) }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon
                  :name="seededIds[col.key]?.has(item.id) ? 'check_circle' : 'radio_button_unchecked'"
                  :color="seededIds[col.key]?.has(item.id) ? 'positive' : 'grey-7'"
                  size="16px"
                />
              </q-item-section>
            </q-item>
            <q-item v-if="col.items.length > 3" class="q-px-none q-py-xs">
              <q-item-section>
                <q-item-label class="text-grey-6 text-caption">
                  + {{ col.items.length - 3 }} more
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-separator dark />

        <q-card-actions>
          <q-btn
            flat no-caps
            :label="seededIds[col.key]?.size === col.items.length ? 'Re-seed Collection' : 'Seed Collection'"
            :color="seededIds[col.key]?.size === col.items.length ? 'grey-5' : 'positive'"
            :loading="seedingCol === col.key"
            :disable="isMockMode || col.items.length === 0"
            size="sm"
            @click="seedCollection(col.key, col.items)"
          />
        </q-card-actions>
      </q-card>
    </div>

    <!-- Seed all button -->
    <div class="q-mt-xl row justify-end gap-md">
      <q-btn
        v-if="!isMockMode"
        flat no-caps
        label="Reset Mock Data"
        color="grey-5"
        icon="restart_alt"
        :disable="isMockMode"
        @click="handleReset"
      />
      <q-btn
        unelevated no-caps
        label="Seed All Collections"
        color="positive"
        text-color="dark"
        icon="cloud_upload"
        :loading="seedingAll"
        :disable="isMockMode"
        @click="seedAll"
      />
    </div>

    <!-- Progress log -->
    <q-card v-if="log.length" dark flat bordered class="q-mt-lg">
      <q-card-section>
        <p class="text-overline text-grey-5 q-mb-sm">Seed Log</p>
        <div
          v-for="(entry, i) in log"
          :key="i"
          class="text-caption q-py-xs"
          :class="entry.type === 'error' ? 'text-negative' : entry.type === 'success' ? 'text-positive' : 'text-grey-4'"
        >
          <q-icon :name="entry.type === 'error' ? 'error' : entry.type === 'success' ? 'check' : 'info'" size="12px" class="q-mr-xs" />
          {{ entry.message }}
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useQuasar } from 'quasar'
import { useCmsStore, IS_MOCK_MODE } from 'stores/cms'
import { useMockCmsStore } from 'stores/mockCms'

const $q = useQuasar()
const store = useCmsStore()
const mockStore = useMockCmsStore()

const isMockMode = IS_MOCK_MODE

interface LogEntry { type: 'info' | 'success' | 'error'; message: string }

const log = ref<LogEntry[]>([])
const seedingCol = ref<string | null>(null)
const seedingAll = ref(false)
const seededIds = reactive<Record<string, Set<string>>>({})

// ── Collections to seed ───────────────────────────────────────────────────────
const collections = computed(() => [
  { key: 'config',   label: 'Config',    icon: 'settings',      items: mockStore.config   ? [mockStore.config]   : [] as Record<string, string>[] },
  { key: 'footer',   label: 'Footer',    icon: 'web',           items: mockStore.footer   ? [mockStore.footer]   : [] as Record<string, string>[] },
  { key: 'pages',    label: 'Pages',     icon: 'description',   items: mockStore.pages    as Record<string, string>[] },
  { key: 'services', label: 'Services',  icon: 'build',         items: mockStore.services as Record<string, string>[] },
  { key: 'projects', label: 'Projects',  icon: 'photo_library', items: mockStore.projects as Record<string, string>[] },
  { key: 'team',     label: 'Team',      icon: 'people',        items: mockStore.team     as Record<string, string>[] },
])

function getItemLabel(colKey: string, item: Record<string, string>): string {
  if (colKey === 'config')  return 'Site configuration'
  if (colKey === 'footer')  return 'Footer content'
  if (colKey === 'pages')   return item['sectionId'] ?? item.id
  if (colKey === 'team')    return item.name ?? item.id
  return item.title ?? item.name ?? item.id
}

// Singletons — se já existir no Firebase, fazemos update; senão, criamos
const SINGLETONS = new Set(['config', 'footer'])

// ── Seed helpers ──────────────────────────────────────────────────────────────
function addLog(type: LogEntry['type'], message: string) {
  log.value.push({ type, message })
}

function getExistingId(colKey: string): string | null {
  if (colKey === 'config') return (store.config as Record<string,string> | null)?.id ?? null
  if (colKey === 'footer') return (store.footer as Record<string,string> | null)?.id ?? null
  return null
}

async function seedCollection(colKey: string, items: Record<string, unknown>[]) {
  if (isMockMode || !items.length) return

  seedingCol.value = colKey
  addLog('info', `Seeding "${colKey}" (${items.length} items)…`)

  if (!seededIds[colKey]) seededIds[colKey] = new Set()

  let ok = 0
  let fail = 0

  for (const item of items) {
    const { id, ...payload } = item
    try {
      let result

      if (SINGLETONS.has(colKey)) {
        // Singleton: update se já existe no Firestore, senão cria
        const existingId = getExistingId(colKey)
        if (existingId) {
          addLog('info', `  ${colKey}: atualizando doc existente (${existingId})`)
          result = await store.updateDocs({ collection: colKey, id: existingId, data: payload })
        } else {
          addLog('info', `  ${colKey}: criando novo doc`)
          result = await store.saveDoc({ collection: colKey, data: payload })
        }
      } else {
        // Coleção normal: sempre cria (seed não verifica duplicatas por design)
        result = await store.saveDoc({ collection: colKey, data: { ...payload } })
      }

      if (result?.ok) {
        seededIds[colKey].add(id as string)
        ok++
      } else {
        fail++
        addLog('error', `  ✗ ${colKey}/${id}: ${JSON.stringify(result)}`)
      }
    } catch (err) {
      fail++
      addLog('error', `  ✗ Failed to seed item "${id}": ${(err as Error).message}`)
    }
  }

  addLog(
    fail === 0 ? 'success' : 'error',
    `  ${colKey}: ${ok} seeded, ${fail} failed`,
  )
  seedingCol.value = null
}

async function seedAll() {
  log.value = []
  seedingAll.value = true
  addLog('info', 'Starting full seed…')

  for (const col of collections.value) {
    await seedCollection(col.key, col.items)
  }

  addLog('success', 'Seed complete. Refresh the admin to see live data.')
  seedingAll.value = false

  $q.notify({ type: 'positive', message: 'All collections seeded to Firebase!', timeout: 4000 })
}

function handleReset() {
  $q.dialog({
    title: 'Reset Mock Data?',
    message: 'This will restore all collections to the original mock.json values and clear any local edits. Continue?',
    cancel: { label: 'Cancel', flat: true, color: 'grey-4' },
    ok: { label: 'Reset', unelevated: true, color: 'warning', textColor: 'dark' },
    dark: true,
  }).onOk(() => mockStore.resetToMock())
}
</script>

<style scoped lang="scss">
.seed-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.seed-card { background: rgba(255,255,255,0.03); }

.gap-md { gap: 12px; }
.gap-sm { gap: 6px; }
</style>
