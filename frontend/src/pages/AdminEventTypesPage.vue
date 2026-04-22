<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import Message from 'primevue/message'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { isApiError, isNotFoundError, isValidationError } from '../shared/api/guards'
import {
  createEventType,
  deleteEventType,
  listOwnerEventTypes,
  updateEventType,
} from '../shared/api/ownerApi'
import type { EventType } from '../shared/api/types'

type FormMode = 'create' | 'edit'

const toast = useToast()

const loading = ref(true)
const submitting = ref(false)
const deleting = ref(false)
const error = ref<string | null>(null)
const eventTypes = ref<EventType[]>([])

const isFormDialogVisible = ref(false)
const formMode = ref<FormMode>('create')
const editingEventTypeId = ref<string | null>(null)

const title = ref('')
const description = ref('')
const durationMinutes = ref<number | null>(15)

const isDeleteDialogVisible = ref(false)
const deletingEventType = ref<EventType | null>(null)

const isFormValid = computed(
  () =>
    title.value.trim().length > 0 &&
    durationMinutes.value !== null &&
    durationMinutes.value >= 5 &&
    durationMinutes.value <= 240,
)

const formTitle = computed(() => (formMode.value === 'create' ? 'Добавить тип события' : 'Редактировать тип события'))
const formSubmitLabel = computed(() => (formMode.value === 'create' ? 'Создать' : 'Сохранить'))

const resetForm = (): void => {
  title.value = ''
  description.value = ''
  durationMinutes.value = 15
  editingEventTypeId.value = null
}

const loadEventTypes = async (): Promise<void> => {
  loading.value = true
  error.value = null

  try {
    const result = await listOwnerEventTypes()
    eventTypes.value = result.items
  } catch {
    error.value = 'Не удалось загрузить типы событий.'
    eventTypes.value = []
  } finally {
    loading.value = false
  }
}

const openCreateDialog = (): void => {
  formMode.value = 'create'
  resetForm()
  isFormDialogVisible.value = true
}

const openEditDialog = (item: EventType): void => {
  formMode.value = 'edit'
  editingEventTypeId.value = item.id
  title.value = item.title
  description.value = item.description ?? ''
  durationMinutes.value = item.durationMinutes
  isFormDialogVisible.value = true
}

const closeFormDialog = (): void => {
  isFormDialogVisible.value = false
  resetForm()
}

const submitForm = async (): Promise<void> => {
  if (!isFormValid.value || durationMinutes.value === null) {
    return
  }

  submitting.value = true
  try {
    if (formMode.value === 'create') {
      const result = await createEventType({
        title: title.value.trim(),
        description: description.value.trim() || undefined,
        durationMinutes: durationMinutes.value,
      })

      if (isApiError(result)) {
        toast.add({
          severity: 'error',
          summary: 'Ошибка',
          detail: isValidationError(result) ? 'Проверьте корректность полей.' : 'Не удалось создать тип события.',
          life: 3500,
        })
        return
      }

      toast.add({ severity: 'success', summary: 'Готово', detail: 'Тип события создан.', life: 3000 })
    } else {
      if (!editingEventTypeId.value) {
        return
      }

      const result = await updateEventType(editingEventTypeId.value, {
        title: title.value.trim(),
        description: description.value.trim() || undefined,
        durationMinutes: durationMinutes.value,
      })

      if (isApiError(result)) {
        const detail = isValidationError(result)
          ? 'Проверьте корректность полей.'
          : isNotFoundError(result)
            ? 'Тип события не найден.'
            : 'Не удалось сохранить изменения.'

        toast.add({ severity: 'error', summary: 'Ошибка', detail, life: 3500 })
        return
      }

      toast.add({ severity: 'success', summary: 'Готово', detail: 'Тип события обновлен.', life: 3000 })
    }

    closeFormDialog()
    await loadEventTypes()
  } catch {
    toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось выполнить операцию.', life: 3500 })
  } finally {
    submitting.value = false
  }
}

const openDeleteDialog = (item: EventType): void => {
  deletingEventType.value = item
  isDeleteDialogVisible.value = true
}

const closeDeleteDialog = (): void => {
  isDeleteDialogVisible.value = false
  deletingEventType.value = null
}

const confirmDelete = async (): Promise<void> => {
  if (!deletingEventType.value) {
    return
  }

  deleting.value = true
  try {
    const result = await deleteEventType(deletingEventType.value.id)

    if (isApiError(result)) {
      const detail = isNotFoundError(result) ? 'Тип события уже удален.' : 'Не удалось удалить тип события.'
      toast.add({ severity: 'error', summary: 'Ошибка', detail, life: 3500 })
      return
    }

    toast.add({ severity: 'success', summary: 'Готово', detail: 'Тип события удален.', life: 3000 })
    closeDeleteDialog()
    await loadEventTypes()
  } catch {
    toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось удалить тип события.', life: 3500 })
  } finally {
    deleting.value = false
  }
}

onMounted(async () => {
  await loadEventTypes()
})
</script>

<template>
  <main class="app-page">
    <Toast />
    <section class="app-shell app-stack">
      <div class="toolbar">
        <Button label="Добавить тип" icon="pi pi-plus" @click="openCreateDialog" />
      </div>

      <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
      <Message v-else-if="loading" severity="info" :closable="false">Загружаем типы событий...</Message>

      <Card v-else>
        <template #title>Управление типами событий</template>
        <template #content>
          <DataTable :value="eventTypes" dataKey="id">
            <Column field="title" header="Название" />
            <Column field="description" header="Описание">
              <template #body="slotProps">
                {{ slotProps.data.description || 'Описание не указано' }}
              </template>
            </Column>
            <Column field="durationMinutes" header="Длительность">
              <template #body="slotProps">{{ slotProps.data.durationMinutes }} мин</template>
            </Column>
            <Column header="Действия">
              <template #body="slotProps">
                <div class="actions">
                  <Button
                    label="Редактировать"
                    icon="pi pi-pencil"
                    size="small"
                    outlined
                    @click="openEditDialog(slotProps.data)"
                  />
                  <Button
                    label="Удалить"
                    icon="pi pi-trash"
                    size="small"
                    severity="danger"
                    outlined
                    @click="openDeleteDialog(slotProps.data)"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>
    </section>

    <Dialog
      v-model:visible="isFormDialogVisible"
      :header="formTitle"
      modal
      :style="{ width: 'min(40rem, 95vw)' }"
      @hide="closeFormDialog"
    >
      <div class="app-form-grid">
        <label class="app-field app-field-full">
          <span>Название</span>
          <InputText v-model="title" />
        </label>
        <label class="app-field app-field-full">
          <span>Описание</span>
          <Textarea v-model="description" rows="4" />
        </label>
        <label class="app-field">
          <span>Длительность (мин)</span>
          <InputNumber
            v-model="durationMinutes"
            :min="5"
            :max="240"
            :use-grouping="false"
            :min-fraction-digits="0"
            :max-fraction-digits="0"
          />
        </label>
      </div>

      <template #footer>
        <Button label="Отмена" severity="secondary" outlined @click="closeFormDialog" />
        <Button :label="formSubmitLabel" :disabled="!isFormValid" :loading="submitting" @click="submitForm" />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="isDeleteDialogVisible"
      header="Подтвердите удаление"
      modal
      :style="{ width: 'min(30rem, 95vw)' }"
      @hide="closeDeleteDialog"
    >
      <p class="delete-text">
        Удалить тип события
        <strong v-if="deletingEventType">"{{ deletingEventType.title }}"</strong>?
      </p>
      <template #footer>
        <Button label="Отмена" severity="secondary" outlined @click="closeDeleteDialog" />
        <Button label="Удалить" severity="danger" :loading="deleting" @click="confirmDelete" />
      </template>
    </Dialog>
  </main>
</template>

<style scoped>
.toolbar {
  display: flex;
  justify-content: flex-end;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.delete-text {
  margin: 0;
}
</style>
