<script setup lang="ts">
import { useRouter } from 'vue-router'
import Button from 'primevue/button'

const router = useRouter()

const goTo = (path: string): void => {
  void router.push(path)
}
</script>

<template>
  <header class="app-header">
    <div class="app-shell app-header__inner">
      <button class="brand" type="button" @click="goTo('/')">
        <span class="brand__dot" />
        <strong>CalendarFlow</strong>
      </button>

      <div class="header-actions">
        <Button
          class="book-button"
          label="Записаться"
          icon="pi pi-calendar-plus"
          severity="secondary"
          @click="goTo('/book')"
        />
        <Button label="Админка" icon="pi pi-cog" @click="goTo('/admin')" />
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 40;
  border-bottom: 1px solid var(--app-surface-border);
  background: color-mix(in srgb, var(--app-surface) 90%, transparent);
  backdrop-filter: blur(14px);
}

.app-header__inner {
  min-height: 4.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  border: 0;
  background: transparent;
  color: var(--app-text-primary);
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0;
  font: inherit;
  cursor: pointer;
}

.brand__dot {
  width: 0.9rem;
  height: 0.9rem;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--app-accent), #6ee7b7);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--app-accent) 20%, transparent);
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.header-actions :deep(.book-button.p-button) {
  background: #ecfeff;
  border-color: #67e8f9;
  color: #0f172a;
}

.header-actions :deep(.book-button.p-button:hover) {
  background: #cffafe;
  border-color: #22d3ee;
}

@media (max-width: 760px) {
  .app-header__inner {
    min-height: 4rem;
  }

  .brand strong {
    font-size: 0.95rem;
  }
}
</style>
