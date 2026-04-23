# AGENT

- Ограничения: не изменять `.github/workflows/hexlet-check.yml`.
- Типизация: избегать `any`, использовать строгие типы.

- Монорепо состоит из:
  - `spec/` — контракт API (`TypeSpec` -> `OpenAPI`);
  - `backend/` — backend (`Fastify + TypeScript`);
  - `frontend/` — UI (`Vue 3 + TypeScript + PrimeVue`).

- Source of truth контракта: TypeSpec.
- Точка входа TypeSpec: `spec/typespec/main.tsp`.
- Артефакт OpenAPI: `spec/tsp-output/@typespec/openapi3/openapi.yaml`.
- UI и backend должны соответствовать контракту OpenAPI.

- Контракт (`spec/`):
  - генерация OpenAPI: `cd spec && npm run build:openapi`;
  - проверка синхронизации OpenAPI: `cd spec && npm run check:openapi`;
  - запуск Prism mock: `cd spec && npm run prism:mock` (порт `4010`);
  - запуск Prism proxy: `cd spec && npm run prism:proxy`.

- Backend (`backend/`):
  - dev-режим: `cd backend && npm run dev`;
  - проверка типов: `cd backend && npm run check`;
  - тесты: `cd backend && npm run test`;
  - сборка: `cd backend && npm run build`.

- Frontend (`frontend/`):
  - генерация API-типов: `cd frontend && npm run generate:api-types`;
  - запуск с Prism: `cd frontend && npm run dev` (использует `.env.development`);
  - запуск с реальным backend: `cd frontend && npm run dev:backend` (использует `.env.backend`);
  - сборка: `cd frontend && npm run build`.

- Smoke-check перед сдачей:
  - `cd backend && npm run check && npm run test`;
  - `cd frontend && npm run build`;
  - проверить guest flow: event types -> slots -> booking;
  - проверить owner flow: upcoming bookings + create event type.
