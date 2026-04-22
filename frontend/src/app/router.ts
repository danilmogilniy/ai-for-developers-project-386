import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import BookEventTypesPage from '../pages/BookEventTypesPage.vue'
import BookEventSlotsPage from '../pages/BookEventSlotsPage.vue'
import AdminBookingsPage from '../pages/AdminBookingsPage.vue'
import AdminEventTypesPage from '../pages/AdminEventTypesPage.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', component: HomePage },
  { path: '/book', component: BookEventTypesPage },
  { path: '/book/:eventTypeId', component: BookEventSlotsPage, props: true },
  { path: '/admin', component: AdminBookingsPage },
  { path: '/admin/event-types', component: AdminEventTypesPage },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
