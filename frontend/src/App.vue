<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './widgets/AppHeader.vue'

const route = useRoute()
const isHomePage = computed(() => route.path === '/')
</script>

<template>
  <div class="app-root" :class="{ 'app-root--home': isHomePage }">
    <AppHeader v-if="!isHomePage" />
    <router-view />
  </div>
</template>
