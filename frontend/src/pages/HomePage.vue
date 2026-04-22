<script setup lang="ts">
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import heroDashlite from '../assets/calendar-hero-mockup-dashlite.png'

const router = useRouter()

const goToBooking = (): void => {
  void router.push('/book')
}

const goToAdmin = (): void => {
  void router.push('/admin')
}
</script>

<template>
  <div class="landing-page">
    <main class="app-shell">
      <header class="landing-header">
        <span class="landing-brand">
          <span class="landing-brand__dot" />
          CalendarFlow
        </span>
        <div class="hero-actions">
          <Button
            label="Записаться"
            icon="pi pi-calendar-plus"
            @click="goToBooking"
          />
          <Button
            label="Админка"
            icon="pi pi-cog"
            severity="contrast"
            variant="outlined"
            @click="goToAdmin"
          />
        </div>
      </header>

      <section class="hero-grid">
        <article class="hero-copy">
          <h1>CalendarFlow — встречи без лишних кликов</h1>
          <ul>
            <li>Выбор типа события и удобного времени для встречи</li>
            <li>Быстрое бронирование с подтверждением</li>
            <li>Управление типами встреч и просмотр записей в админке</li>
          </ul>
        </article>
        <article class="hero-preview surface-card">
          <img :src="heroDashlite" alt="Предпросмотр календаря и записей" />
        </article>
      </section>
    </main>
  </div>
</template>

<style scoped>
.hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
  align-items: center;
  gap: 1.5rem;
  margin-top: 4rem;
}

.hero-copy h1 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3.1rem);
  line-height: 1.08;
  letter-spacing: -0.02em;
}

.hero-copy ul {
  margin: 1.35rem 0 0;
  padding-left: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  color: rgba(248, 250, 252, 0.9);
}

.hero-actions {
  display: flex;
  gap: 0.75rem;
}

.hero-preview {
  padding: 1rem;
  background: rgba(15, 23, 42, 0.32);
  border-color: rgba(226, 232, 240, 0.2);
  box-shadow: var(--app-shadow-strong);
}

.hero-preview img {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  border-radius: 0.85rem;
}

@media (max-width: 960px) {
  .hero-grid {
    grid-template-columns: 1fr;
  }

  .hero-copy {
    order: 1;
  }

  .hero-preview {
    order: 2;
  }

  .hero-actions {
    width: 100%;
  }

  .hero-actions :deep(.p-button) {
    flex: 1;
    justify-content: center;
  }
}
</style>
