<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Message from 'primevue/message'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import ruLocale from '@fullcalendar/core/locales/ru'
import type { CalendarOptions, EventClickArg } from '@fullcalendar/core'
import { listUpcomingBookings } from '../shared/api/ownerApi'
import type { Booking } from '../shared/api/types'
import {
  mapBookingsToCalendarEvents,
  type BookingEventMeta,
} from '../shared/calendar/bookingCalendar'
import { APP_CALENDAR_TIME_ZONE, APP_TIME_ZONE } from '../shared/time/moscowTime'

const router = useRouter()
const loading = ref(true)
const error = ref<string | null>(null)
const bookings = ref<Booking[]>([])
const selectedEvent = ref<(BookingEventMeta & { startAt: string; endAt: string }) | null>(null)
const isDetailsDialogVisible = ref(false)

const calendarEvents = computed(() => mapBookingsToCalendarEvents(bookings.value))

const calendarOptions = computed<CalendarOptions>(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
  locales: [ruLocale],
  locale: 'ru',
  initialView: 'dayGridMonth',
  headerToolbar: {
    left: 'title',
    center: '',
    right: 'today prev,next dayGridMonth,timeGridWeek,timeGridDay,listWeek',
  },
  buttonText: {
    today: 'Сегодня',
    month: 'Месяц',
    week: 'Неделя',
    day: 'День',
    list: 'Список',
  },
  timeZone: APP_CALENDAR_TIME_ZONE,
  events: calendarEvents.value,
  height: 'auto',
  dayMaxEvents: 3,
  eventClick: (arg: EventClickArg): void => {
    const meta = arg.event.extendedProps as BookingEventMeta
    selectedEvent.value = {
      ...meta,
      startAt: arg.event.startStr,
      endAt: arg.event.endStr,
    }
    isDetailsDialogVisible.value = true
  },
}))

const formatDateTime = (value: string): string =>
  new Date(value).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: APP_TIME_ZONE,
  })

const openEventTypesPage = (): void => {
  void router.push('/admin/event-types')
}

const closeDetailsDialog = (): void => {
  isDetailsDialogVisible.value = false
  selectedEvent.value = null
}

onMounted(async () => {
  try {
    const bookingsResponse = await listUpcomingBookings()
    bookings.value = bookingsResponse.items
  } catch {
    error.value = 'Не удалось загрузить данные админки.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main class="app-page">
    <section class="app-shell app-stack">
      <div class="toolbar">
        <Button label="Управление типами событий" icon="pi pi-cog" @click="openEventTypesPage" />
      </div>

      <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
      <Message v-else-if="loading" severity="info" :closable="false">Загружаем предстоящие записи...</Message>

      <Card v-else class="calendar-card">
        <template #title>Предстоящие записи</template>
        <template #content>
          <div data-testid="admin-bookings-calendar">
            <FullCalendar :options="calendarOptions" />
          </div>
        </template>
      </Card>

      <Dialog
        v-model:visible="isDetailsDialogVisible"
        header="Информация о записи"
        modal
        :style="{ width: 'min(40rem, 95vw)' }"
        @hide="closeDetailsDialog"
      >
        <div v-if="selectedEvent" class="details-grid" data-testid="booking-details-dialog">
          <p data-testid="booking-details-event-type"><strong>Тип события:</strong> {{ selectedEvent.eventTypeTitle }}</p>
          <p><strong>Начало:</strong> {{ formatDateTime(selectedEvent.startAt) }}</p>
          <p><strong>Окончание:</strong> {{ formatDateTime(selectedEvent.endAt) }}</p>
          <p data-testid="booking-details-guest-name"><strong>Гость:</strong> {{ selectedEvent.guestName }}</p>
          <p data-testid="booking-details-guest-email"><strong>Email:</strong> {{ selectedEvent.guestEmail }}</p>
          <p v-if="selectedEvent.guestNote"><strong>Заметка:</strong> {{ selectedEvent.guestNote }}</p>
          <p><strong>Создано:</strong> {{ formatDateTime(selectedEvent.createdAt) }}</p>
        </div>
      </Dialog>
    </section>
  </main>
</template>

<style scoped>
.toolbar {
  display: flex;
  justify-content: flex-end;
}

.calendar-card :deep(.fc) {
  width: 100%;
}

.calendar-card :deep(.fc .fc-button-primary) {
  background: #fff;
  border-color: #cbd5e1;
  color: #334155;
  box-shadow: none;
}

.calendar-card :deep(.fc .fc-button-primary:hover) {
  background: #f8fafc;
  border-color: #94a3b8;
  color: #1e293b;
}

.calendar-card :deep(.fc .fc-button-primary:focus) {
  box-shadow: 0 0 0 0.15rem rgba(148, 163, 184, 0.35);
}

.calendar-card :deep(.fc .fc-button-primary:disabled) {
  background: #f8fafc;
  border-color: #e2e8f0;
  color: #94a3b8;
}

.calendar-card :deep(.fc .fc-button-primary.fc-button-active) {
  background: #f1f5f9;
  border-color: #94a3b8;
  color: #0f172a;
}

.details-grid {
  display: grid;
  gap: 0.5rem;
}

.details-grid p {
  margin: 0;
}
</style>
