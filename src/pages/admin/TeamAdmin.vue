<template>
  <div class="q-pa-lg">

    <!-- Header -->
    <div class="adm-header">
      <div class="adm-header__left">
        <p class="adm-header__overline">Admin</p>
        <h1 class="adm-header__title">Equipe</h1>
        <p class="adm-header__desc">Membros exibidos na seção de equipe do site.</p>
      </div>
      <div class="adm-header__actions">
        <q-btn
          unelevated no-caps
          label="Novo Membro" icon="person_add"
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
    <div v-else-if="!members.length" class="adm-empty">
      <q-icon name="people" size="48px" class="adm-empty__icon" />
      <p class="adm-empty__title">Nenhum membro cadastrado</p>
      <p class="adm-empty__desc">Adicione os membros que aparecem na página sobre.</p>
      <q-btn unelevated no-caps label="Novo Membro" icon="person_add" color="positive" text-color="dark" @click="openNew" />
    </div>

    <!-- Cards grid -->
    <div v-else class="team-grid">
      <div
        v-for="member in sortedMembers"
        :key="member.id"
        class="adm-card adm-card--flush adm-card--interactive member-card"
        @click="openEdit(member)"
      >
        <!-- Photo -->
        <div class="member-card__photo">
          <img
            v-if="member.photo"
            :src="member.photo"
            :alt="member.name"
            class="member-card__img"
          />
          <div v-else class="member-card__placeholder flex flex-center">
            <q-icon name="person" size="40px" color="grey-7" />
          </div>
        </div>

        <!-- Info -->
        <div class="member-card__info q-pa-md">
          <div class="text-subtitle2 adm-text-primary text-weight-bold q-mb-xs">{{ member.name }}</div>
          <div class="text-caption adm-text-accent text-uppercase member-card__role q-mb-sm">{{ member.role }}</div>
          <div v-if="member.bio" class="text-caption adm-text-secondary ellipsis-2-lines">
            {{ member.bio }}
          </div>
        </div>

        <!-- Actions -->
        <div class="member-card__actions row items-center justify-between q-px-md q-pb-sm">
          <q-btn flat no-caps label="Editar" color="grey-5" size="sm" icon="edit"
            @click.stop="openEdit(member)" />
          <q-btn flat round dense icon="delete" color="negative" size="sm"
            :loading="deleting === member.id"
            aria-label="Remover membro"
            @click.stop="confirmDelete(member)" />
        </div>
      </div>
    </div>

    <!-- Dialog -->
    <q-dialog v-model="dialogOpen" persistent>
      <div class="adm-dialog" style="width:600px;max-width:96vw">

        <!-- Bar -->
        <div class="adm-dialog__bar">
          <q-icon :name="isEditing ? 'edit' : 'person_add'" class="adm-dialog__bar-icon" />
          <span class="adm-dialog__bar-title">
            {{ isEditing ? 'Editar Membro' : 'Novo Membro' }}
          </span>
          <q-btn flat round dense icon="close" color="grey-5" aria-label="Fechar" @click="close" />
        </div>

        <!-- Body -->
        <div class="adm-dialog__body">
          <div class="row q-col-gutter-md">

            <div class="col-12 col-sm-7">
              <q-input
                v-model="form.name"
                label="Nome *"
                filled dark dense
                lazy-rules
                :rules="[v => !!v || 'Campo obrigatório']"
              />
            </div>
            <div class="col-12 col-sm-5">
              <q-input
                v-model.number="form.order"
                label="Ordem de exibição"
                type="number"
                filled dark dense
              />
            </div>
            <div class="col-12">
              <q-input
                v-model="form.role"
                label="Cargo / Título *"
                filled dark dense
                hint="Ex: Lead Installer, Project Manager"
                lazy-rules
                :rules="[v => !!v || 'Campo obrigatório']"
              />
            </div>
            <div class="col-12">
              <q-input
                v-model="form.bio"
                label="Bio"
                type="textarea"
                filled dark dense
                autogrow
                hint="Breve descrição do membro"
              />
            </div>

            <div class="col-12">
              <div class="adm-card__divider" style="margin: 4px 0 16px" />
              <AdminImageField
                v-model="form.photo"
                label="Foto — URL"
                hint="Firebase Storage download URL"
                icon="person"
                badge="Foto"
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
            :label="isEditing ? 'Salvar Alterações' : 'Adicionar Membro'"
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

interface TeamMember {
  id?: string
  name:  string
  role:  string
  bio:   string
  photo: string
  order: number
}

const $q    = useQuasar()
const store = useCmsStore()

const loading = computed(() => !Array.isArray(store.team))
const members = computed<TeamMember[]>(() =>
  Array.isArray(store.team) ? (store.team as TeamMember[]) : [],
)
const sortedMembers = computed(() =>
  [...members.value].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
)

const { dialogOpen, isEditing, saving, deleting, form, openNew, openEdit, close, save, remove } =
  useAdminCrud<TeamMember>({
    collection: 'team',
    emptyForm: () => ({ name: '', role: '', bio: '', photo: '', order: 0 }),
  })

function confirmDelete(member: TeamMember & { id: string }) {
  $q.dialog({
    title: 'Remover Membro',
    message: `Remover "${member.name}" da equipe? Esta ação não pode ser desfeita.`,
    cancel: { label: 'Cancelar', flat: true, color: 'grey-4' },
    ok: { label: 'Remover', unelevated: true, color: 'negative' },
    dark: true,
  }).onOk(() => remove(member.id as string))
}
</script>

<style scoped lang="scss">
.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.member-card {
  overflow: hidden;
  display: flex;
  flex-direction: column;

  &__photo {
    aspect-ratio: 1 / 1;
    overflow: hidden;
    background: $adm-surface-2;
    border-bottom: 1px solid $adm-border;
  }

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top center;
    display: block;
    transition: transform 0.3s ease;
  }

  &:hover &__img { transform: scale(1.04); }

  &__placeholder {
    width: 100%;
    height: 100%;
  }

  &__info { flex: 1; }

  &__role {
    letter-spacing: 0.08em;
    font-size: 10px;
  }

  &__actions {
    border-top: 1px solid $adm-border;
    padding-top: 8px;
  }
}
</style>
