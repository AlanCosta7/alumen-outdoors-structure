<template>
  <div class="q-pa-lg">

    <!-- Header -->
    <div class="adm-header">
      <div class="adm-header__left">
        <p class="adm-header__overline">Admin</p>
        <h1 class="adm-header__title">Serviços</h1>
        <p class="adm-header__desc">Gerencie os serviços exibidos no site.</p>
      </div>
      <div class="adm-header__actions">
        <q-btn
          unelevated no-caps
          label="Novo Serviço" icon="add"
          color="positive" text-color="dark"
          @click="openNew"
        />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-center q-py-xl">
      <q-spinner-dots size="32px" color="positive" />
    </div>

    <!-- Empty -->
    <div v-else-if="!services.length" class="adm-empty">
      <q-icon name="build" size="48px" class="adm-empty__icon" />
      <p class="adm-empty__title">Nenhum serviço cadastrado</p>
      <p class="adm-empty__desc">Clique em "Novo Serviço" para começar a construir o portfólio.</p>
      <q-btn unelevated no-caps label="Novo Serviço" icon="add" color="positive" text-color="dark" @click="openNew" />
    </div>

    <!-- Table -->
    <q-table
      v-else
      :rows="sortedServices"
      :columns="columns"
      row-key="id"
      dark flat bordered
      :rows-per-page-options="[10, 25, 0]"
      class="adm-table"
    >
      <!-- Thumbnail + title -->
      <template #body-cell-title="{ row }">
        <q-td>
          <div class="row items-center gap-md no-wrap">
            <div class="svc-thumb">
              <img
                v-if="row.heroImage"
                :src="row.heroImage"
                :alt="row.title"
                class="svc-thumb__img"
              />
              <q-icon v-else name="build" size="20px" color="grey-7" />
            </div>
            <div>
              <div class="text-weight-medium adm-text-primary">{{ row.title }}</div>
              <div class="text-caption adm-text-hint">{{ row.slug }}</div>
            </div>
          </div>
        </q-td>
      </template>

      <template #body-cell-subtitle="{ row }">
        <q-td>
          <div class="text-caption adm-text-secondary ellipsis" style="max-width:260px">
            {{ row.subtitle || '—' }}
          </div>
        </q-td>
      </template>

      <template #body-cell-gallery="{ row }">
        <q-td class="text-center">
          <q-badge
            :label="`${(row.gallery ?? []).length} foto${(row.gallery ?? []).length !== 1 ? 's' : ''}`"
            :color="(row.gallery ?? []).length ? 'positive' : 'grey-7'"
          />
        </q-td>
      </template>

      <template #body-cell-actions="{ row }">
        <q-td class="text-right">
          <div class="row-actions adm-row-actions">
            <q-btn flat round dense icon="edit" color="grey-4" size="sm"
              aria-label="Editar" @click="openEdit(row)" />
            <q-btn flat round dense icon="delete" color="negative" size="sm"
              :loading="deleting === row.id"
              aria-label="Excluir" @click="confirmDelete(row)" />
          </div>
        </q-td>
      </template>
    </q-table>

    <!-- Dialog -->
    <q-dialog v-model="dialogOpen" persistent>
      <div class="adm-dialog" style="width:900px;max-width:96vw">

        <!-- Bar -->
        <div class="adm-dialog__bar">
          <q-icon :name="isEditing ? 'edit' : 'add_circle'" class="adm-dialog__bar-icon" />
          <span class="adm-dialog__bar-title">
            {{ isEditing ? 'Editar Serviço' : 'Novo Serviço' }}
          </span>
          <q-btn flat round dense icon="close" color="grey-5" aria-label="Fechar" @click="close" />
        </div>

        <!-- Body -->
        <div class="adm-dialog__body">
          <div class="row q-col-gutter-md">

            <!-- Identificação -->
            <div class="col-12">
              <p class="adm-section-label"><q-icon name="label" size="14px" />Identificação</p>
            </div>
            <div class="col-12 col-sm-6">
              <q-input
                v-model="form.title"
                label="Título *"
                filled dark dense
                lazy-rules
                :rules="[v => !!v || 'Campo obrigatório']"
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-input
                v-model="form.slug"
                label="Slug *"
                filled dark dense
                hint="Ex: custom-pool-cage-installation"
                lazy-rules
                :rules="[v => !!v || 'Campo obrigatório']"
              />
            </div>
            <div class="col-12">
              <q-input v-model="form.subtitle" label="Subtítulo" filled dark dense />
            </div>
            <div class="col-12 col-sm-2">
              <q-input
                v-model.number="form.order"
                label="Ordem"
                type="number"
                filled dark dense
                hint="Posição na lista"
              />
            </div>

            <!-- Conteúdo -->
            <div class="col-12">
              <div class="adm-card__divider" style="margin: 8px 0 16px" />
              <p class="adm-section-label"><q-icon name="description" size="14px" />Conteúdo</p>
            </div>
            <div class="col-12">
              <q-input
                v-model="form.description"
                label="Descrição"
                type="textarea"
                filled dark dense
                autogrow
                hint="HTML permitido"
              />
            </div>
            <div class="col-12">
              <AdminArrayField
                v-model="form.features"
                label="Benefícios / Features"
                item-label="benefício"
                placeholder="Ex: 10-year structural warranty"
              />
            </div>

            <!-- Imagens -->
            <div class="col-12">
              <div class="adm-card__divider" style="margin: 8px 0 16px" />
              <p class="adm-section-label"><q-icon name="image" size="14px" />Imagens</p>
            </div>
            <div class="col-12">
              <AdminImageField
                v-model="form.heroImage"
                label="Foto Principal (feature photo)"
                hint="Exibida como imagem full-bleed no final da página do serviço"
                icon="wallpaper"
                badge="Hero"
              />
            </div>

            <!-- Galeria -->
            <div class="col-12">
              <div class="adm-card__divider" style="margin: 8px 0 16px" />
              <AdminGalleryField
                v-model="form.gallery"
                label="Galeria de Fotos"
              />
            </div>

          </div>
        </div>

        <!-- Footer -->
        <div class="adm-dialog__footer">
          <q-btn flat no-caps label="Cancelar" color="grey-5" @click="close" />
          <q-btn
            unelevated no-caps
            color="positive" text-color="dark"
            :label="isEditing ? 'Salvar Alterações' : 'Criar Serviço'"
            :loading="saving"
            @click="save"
          />
        </div>
      </div>
    </q-dialog>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useQuasar } from 'quasar'
import { useCmsStore } from 'stores/cms'
import { useAdminCrud } from 'src/composables/useAdminCrud'
import AdminImageField from 'src/components/admin/AdminImageField.vue'
import AdminArrayField from 'src/components/admin/AdminArrayField.vue'
import AdminGalleryField from 'src/components/admin/AdminGalleryField.vue'

interface ServiceDoc {
  id?: string
  slug:        string
  title:       string
  subtitle:    string
  description: string
  heroImage:   string
  features:    string[]
  gallery:     string[]
  order:       number
}

const $q    = useQuasar()
const store = useCmsStore()

const loading  = computed(() => !Array.isArray(store.services))
const services = computed<ServiceDoc[]>(() =>
  Array.isArray(store.services) ? (store.services as ServiceDoc[]) : [],
)
const sortedServices = computed(() =>
  [...services.value].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
)

const { dialogOpen, isEditing, saving, deleting, form, openNew, openEdit, close, save, remove } =
  useAdminCrud<ServiceDoc>({
    collection: 'services',
    emptyForm: () => ({
      slug: '', title: '', subtitle: '', description: '',
      heroImage: '', features: [], gallery: [], order: 0,
    }),
  })

function confirmDelete(row: ServiceDoc & { id: string }) {
  $q.dialog({
    title: 'Excluir Serviço',
    message: `Excluir "${row.title}"? Esta ação não pode ser desfeita.`,
    cancel: { label: 'Cancelar', flat: true, color: 'grey-4' },
    ok: { label: 'Excluir', unelevated: true, color: 'negative' },
    dark: true,
  }).onOk(() => remove(row.id as string))
}

const columns = [
  { name: 'title',    label: 'Título / Slug',  field: 'title',    align: 'left' as const, sortable: true },
  { name: 'subtitle', label: 'Subtítulo',      field: 'subtitle', align: 'left' as const },
  { name: 'gallery',  label: 'Galeria',         field: 'gallery',  align: 'center' as const },
  { name: 'order',    label: 'Ordem',          field: 'order',    align: 'center' as const, sortable: true },
  { name: 'actions',  label: '',               field: 'id',       align: 'right' as const },
]
</script>

<style scoped lang="scss">
.gap-md { gap: 12px; }

.svc-thumb {
  width: 48px;
  height: 36px;
  border-radius: 3px;
  overflow: hidden;
  background: $adm-surface-2;
  border: 1px solid $adm-border;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}
</style>
