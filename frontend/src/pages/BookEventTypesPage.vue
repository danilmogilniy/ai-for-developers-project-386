<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Skeleton from 'primevue/skeleton'
import Message from 'primevue/message'
import { listEventTypes } from '../shared/api/guestApi'
import type { EventType } from '../shared/api/types'

const router = useRouter()
const eventTypes = ref<EventType[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const hasItems = computed(() => eventTypes.value.length > 0)

const openEventType = (id: string): void => {
  void router.push(`/book/${id}`)
}

onMounted(async () => {
  try {
    const result = await listEventTypes()
    eventTypes.value = result.items
  } catch {
    error.value = 'Не удалось загрузить типы событий.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main class="app-page">
    <section class="app-shell app-stack">
      <Card>
        <template #title>Выберите тип события</template>
        <template #content>
          <p class="subtitle">Нажмите на карточку, чтобы выбрать удобный слот.</p>
        </template>
      </Card>

      <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>

      <div v-if="loading" class="cards">
        <Skeleton v-for="index in 2" :key="index" height="7rem" />
      </div>

      <div v-else-if="hasItems" class="cards" data-testid="event-types-list">
        <Card v-for="item in eventTypes" :key="item.id" :data-testid="`event-type-card-${item.id}`">
          <template #title>{{ item.title }}</template>
          <template #content>
            <div class="row">
              <span>{{ item.description || 'Описание не указано' }}</span>
              <Tag icon="pi pi-clock" :value="`${item.durationMinutes} мин`" />
            </div>
            <Button
              label="Выбрать"
              class="pick"
              :data-testid="`select-event-type-${item.id}`"
              @click="openEventType(item.id)"
            />
          </template>
        </Card>
      </div>

      <Message v-else severity="info" :closable="false">Типы событий пока не созданы.</Message>
    </section>
  </main>
</template>

<style scoped>
.subtitle {
  margin: 0;
}

.cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.row :deep(.p-tag) {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #86efac;
  font-weight: 600;
}

.row :deep(.p-tag .p-tag-icon) {
  color: #166534;
}

.pick {
  margin-top: 1rem;
}

@media (max-width: 960px) {
  .cards {
    grid-template-columns: 1fr;
  }
}
</style>
