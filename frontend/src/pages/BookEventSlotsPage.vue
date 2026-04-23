<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Message from 'primevue/message'
import Toast from 'primevue/toast'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import ruLocale from '@fullcalendar/core/locales/ru'
import type { DateClickArg } from '@fullcalendar/interaction'
import type { CalendarOptions, EventInput } from '@fullcalendar/core'
import { useToast } from 'primevue/usetoast'
import { createBooking, listAvailableSlots, listEventTypes } from '../shared/api/guestApi'
import { isApiError, isNotFoundError, isOutOfWindowError, isSlotConflictError, isValidationError } from '../shared/api/guards'
import { APP_CALENDAR_TIME_ZONE, APP_TIME_ZONE, fromMoscowDateKey, getMoscowDateKey } from '../shared/time/moscowTime'
import type { EventType, Slot } from '../shared/api/types'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const eventTypeId = computed(() => String(route.params.eventTypeId ?? ''))
const initialLoading = ref(true)
const slotsLoading = ref(false)
const submitting = ref(false)
const error = ref<string | null>(null)
const slots = ref<Slot[]>([])
const eventTypes = ref<EventType[]>([])
const selectedSlot = ref<Slot | null>(null)
const selectedDate = ref(getMoscowDateKey())
const slotMeta = ref<{
  timezone: string
  workdayStart: string
  workdayEnd: string
  slotDurationMinutes: number
} | null>(null)

const guestName = ref('')
const guestEmail = ref('')
const guestNote = ref('')

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const trimmedGuestEmail = computed<string>(() => guestEmail.value.trim())
const isGuestEmailValid = computed<boolean>(() => emailPattern.test(trimmedGuestEmail.value))
const showGuestEmailError = computed<boolean>(() => trimmedGuestEmail.value.length > 0 && !isGuestEmailValid.value)

const isFormValid = computed(
  () => guestName.value.trim().length > 0 && isGuestEmailValid.value && selectedSlot.value !== null,
)

const availableSlots = computed(() => slots.value.filter((slot) => slot.isAvailable))
const selectedEventType = computed<EventType | null>(
  () => eventTypes.value.find((eventType) => eventType.id === eventTypeId.value) ?? null,
)

const selectedDateEvents = computed<EventInput[]>(() => [
  {
    id: 'selected-day',
    start: selectedDate.value,
    end: selectedDate.value,
    allDay: true,
    display: 'background',
  },
])

const todayDate = getMoscowDateKey()

const calendarOptions = computed<CalendarOptions>(() => ({
  plugins: [dayGridPlugin, interactionPlugin],
  locales: [ruLocale],
  locale: 'ru',
  initialView: 'dayGridMonth',
  headerToolbar: {
    left: 'title',
    center: '',
    right: 'today prev,next',
  },
  buttonText: {
    today: 'Сегодня',
  },
  height: 'auto',
  fixedWeekCount: false,
  timeZone: APP_CALENDAR_TIME_ZONE,
  selectable: true,
  dayCellClassNames: (arg) => (arg.dateStr < todayDate ? ['fc-day-disabled-past'] : []),
  events: selectedDateEvents.value,
  dateClick: (arg: DateClickArg): void => {
    if (arg.dateStr < todayDate) {
      return
    }
    selectedDate.value = arg.dateStr
  },
}))

const selectedDateLabel = computed(() =>
  new Date(fromMoscowDateKey(selectedDate.value)).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: APP_TIME_ZONE,
  }),
)

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

function formatTime(value: string): string {
  const timezone = slotMeta.value?.timezone ?? APP_TIME_ZONE
  return new Date(value).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: timezone,
  })
}

const loadSlotsForDate = async (mode: 'initial' | 'refresh' = 'refresh'): Promise<void> => {
  if (mode === 'initial') {
    initialLoading.value = true
  } else {
    slotsLoading.value = true
  }
  error.value = null
  selectedSlot.value = null

  try {
    const result = await listAvailableSlots(eventTypeId.value, selectedDate.value)

    if (isApiError(result)) {
      if (isValidationError(result)) {
        error.value = 'Параметры запроса некорректны.'
      } else if (isNotFoundError(result)) {
        error.value = 'Тип события не найден.'
      } else {
        error.value = 'Не удалось получить слоты.'
      }
      slots.value = []
      slotMeta.value = null
      return
    }

    slots.value = result.items
    slotMeta.value = {
      timezone: result.timezone,
      workdayStart: result.workdayStart,
      workdayEnd: result.workdayEnd,
      slotDurationMinutes: result.slotDurationMinutes,
    }
  } catch {
    error.value = 'Не удалось получить слоты. Проверьте доступность API.'
    slots.value = []
    slotMeta.value = null
  } finally {
    if (mode === 'initial') {
      initialLoading.value = false
    } else {
      slotsLoading.value = false
    }
  }
}

function showApiError(message: string): void {
  toast.add({ severity: 'error', summary: 'Ошибка', detail: message, life: 4000 })
}

const loadEventTypes = async (): Promise<void> => {
  try {
    const result = await listEventTypes()
    eventTypes.value = result.items
  } catch {
    eventTypes.value = []
  }
}

onMounted(async () => {
  await loadEventTypes()
  await loadSlotsForDate('initial')
})

watch(selectedDate, async () => {
  await loadSlotsForDate('refresh')
})

watch(eventTypeId, async () => {
  await loadSlotsForDate('refresh')
})

const submit = async (): Promise<void> => {
  if (!selectedSlot.value || !isFormValid.value) {
    return
  }

  submitting.value = true
  try {
    const result = await createBooking({
      eventTypeId: eventTypeId.value,
      startAt: selectedSlot.value.startAt,
      guest: {
        name: guestName.value.trim(),
        email: guestEmail.value.trim(),
        note: guestNote.value.trim() || undefined,
      },
    })

    if (!isApiError(result)) {
      toast.add({ severity: 'success', summary: 'Готово', detail: 'Бронирование создано', life: 3500 })
      await wait(900)
      void router.push('/book')
      return
    }

    if (isValidationError(result)) {
      showApiError('Проверьте корректность заполненных полей.')
    } else if (isOutOfWindowError(result)) {
      showApiError('Слот находится вне доступного окна бронирования.')
    } else if (isSlotConflictError(result)) {
      showApiError('Слот уже занят, выберите другой.')
      await loadSlotsForDate()
    } else if (isNotFoundError(result)) {
      showApiError('Тип события не найден.')
    } else {
      showApiError('Не удалось завершить бронирование.')
    }
  } catch {
    showApiError('Не удалось создать бронирование.')
  } finally {
    submitting.value = false
  }
}

</script>

<template>
  <main class="app-page">
    <Toast />
    <section class="app-shell app-stack">
      <Card>
        <template #title>Выбор слота и бронирование</template>
        <template #content>
          <p>Название события: {{ selectedEventType?.title ?? eventTypeId }}</p>
          <p v-if="selectedEventType?.description">{{ selectedEventType.description }}</p>
        </template>
      </Card>

      <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
      <Message v-else-if="initialLoading" severity="info" :closable="false">Загружаем доступные слоты...</Message>

      <Card v-else>
        <template #title>Доступные слоты</template>
        <template #content>
          <div class="slots-layout">
            <div class="calendar-pane">
              <FullCalendar :options="calendarOptions" />
            </div>

            <div class="slots-pane">
              <div class="slots-meta">
                <p><strong>Дата:</strong> {{ selectedDateLabel }}</p>
                <p v-if="slotMeta">
                  <strong>Окно:</strong> {{ slotMeta.workdayStart }} - {{ slotMeta.workdayEnd }},
                  {{ slotMeta.slotDurationMinutes }} мин
                </p>
                <p v-if="slotMeta"><strong>TZ:</strong> {{ slotMeta.timezone }}</p>
              </div>

              <Message v-if="slotsLoading" severity="info" :closable="false">
                Обновляем слоты для выбранной даты...
              </Message>

              <div class="slots-list">
                <Button
                  v-for="slot in slots"
                  :key="slot.startAt"
                  class="slot-item"
                  :class="{ 'slot-item-selected': selectedSlot?.startAt === slot.startAt }"
                  :label="`${formatTime(slot.startAt)} - ${formatTime(slot.endAt)}`"
                  :outlined="selectedSlot?.startAt !== slot.startAt"
                  :severity="slot.isAvailable ? 'secondary' : 'contrast'"
                  :disabled="!slot.isAvailable"
                  @click="selectedSlot = slot"
                />
              </div>

              <Message v-if="slots.length === 0" severity="info" :closable="false">
                На выбранную дату слоты не найдены.
              </Message>
              <Message v-else-if="availableSlots.length === 0" severity="warn" :closable="false">
                На выбранную дату нет свободных слотов.
              </Message>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #title>Контакты гостя</template>
        <template #content>
          <div class="app-form-grid">
            <label class="app-field">
              <span>Имя</span>
              <InputText v-model="guestName" />
            </label>
            <label class="app-field">
              <span>Email</span>
              <InputText v-model="guestEmail" type="email" autocomplete="email" />
              <small v-if="showGuestEmailError" class="field-error">Введите корректный email.</small>
            </label>
            <label class="app-field app-field-full">
              <span>Заметка</span>
              <Textarea v-model="guestNote" rows="4" />
            </label>
          </div>
          <Button
            label="Подтвердить бронирование"
            class="submit"
            :disabled="!isFormValid || initialLoading || slotsLoading"
            :loading="submitting"
            @click="submit"
          />
        </template>
      </Card>
    </section>
  </main>
</template>

<style scoped>
.submit {
  margin-top: 1rem;
}

.field-error {
  color: #b91c1c;
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.header-row p {
  margin: 0;
}

.slots-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(18rem, 22rem);
  gap: 1rem;
}

.slots-meta p {
  margin: 0 0 0.5rem;
}

.slots-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
  max-height: 24rem;
  overflow: auto;
  padding-right: 0.25rem;
}

.slot-item {
  justify-content: flex-start;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;
}

.slots-list :deep(.slot-item.p-button.p-button-secondary:enabled:hover) {
  background: #ffffff;
  border-color: #1f2937;
}

.slots-list :deep(.slot-item.p-button:enabled:focus-visible) {
  outline: 2px solid #93c5fd;
  outline-offset: 1px;
}

.slots-list :deep(.slot-item.p-button:disabled) {
  opacity: 1;
  background: #f8fafc;
  border-color: #e2e8f0;
  color: #94a3b8;
}

.slots-list :deep(.slot-item.p-button:disabled .p-button-label) {
  color: #94a3b8;
}

.slots-list :deep(.slot-item.p-button.p-button-secondary) {
  background: #f8fafc;
  border-color: #94a3b8;
  color: #0f172a;
}

.slots-list :deep(.slot-item.p-button.p-button-secondary .p-button-label) {
  color: #0f172a;
}

.slots-list :deep(.slot-item.p-button.p-button-secondary.p-button-outlined) {
  background: #ffffff;
  border-color: #64748b;
  color: #0f172a;
}

.slots-list :deep(.slot-item.p-button.p-button-secondary.p-button-outlined .p-button-label) {
  color: #0f172a;
}

.slots-list :deep(.slot-item.slot-item-selected.p-button.p-button-secondary) {
  background: #dcfce7;
  border-color: #86efac;
  color: #166534;
}

.slots-list :deep(.slot-item.slot-item-selected.p-button.p-button-secondary:enabled:hover) {
  background: #dcfce7;
  border-color: #86efac;
  color: #166534;
}

.slots-list :deep(.slot-item.slot-item-selected.p-button.p-button-secondary .p-button-label) {
  color: #166534;
}

.calendar-pane :deep(.fc .fc-button-primary) {
  background: #fff;
  border-color: #cbd5e1;
  color: #334155;
  box-shadow: none;
}

.calendar-pane :deep(.fc .fc-button-primary:hover) {
  background: #f8fafc;
  border-color: #94a3b8;
  color: #1e293b;
}

.calendar-pane :deep(.fc .fc-button-primary:focus) {
  box-shadow: 0 0 0 0.15rem rgba(148, 163, 184, 0.35);
}

.calendar-pane :deep(.fc .fc-button-primary:disabled) {
  background: #f8fafc;
  border-color: #e2e8f0;
  color: #94a3b8;
}

.calendar-pane :deep(.fc .fc-button-primary.fc-button-active) {
  background: #f1f5f9;
  border-color: #94a3b8;
  color: #0f172a;
}

.calendar-pane :deep(.fc .fc-daygrid-day.fc-day-today) {
  background-color: rgba(59, 130, 246, 0.08);
}

.calendar-pane :deep(.fc .fc-day-disabled-past) {
  background-color: rgba(148, 163, 184, 0.08);
}

.calendar-pane :deep(.fc .fc-day-disabled-past .fc-daygrid-day-number) {
  color: #94a3b8;
}

@media (max-width: 960px) {
  .slots-layout {
    grid-template-columns: 1fr;
  }

  .slots-list {
    grid-template-columns: 1fr;
  }
}
</style>
