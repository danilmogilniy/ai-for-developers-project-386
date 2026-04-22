# AGENT

- Ограничения: не изменять только `.github/workflows/hexlet-check.yml`.
- Типизация: избегать `any`, использовать строгие типы.
- Фронтенд: отдельная часть приложения в `frontend/` (`Vue 3 + TypeScript + PrimeVue`).
- UI работает только через API по контракту (`spec/tsp-output/@typespec/openapi3/openapi.yaml`).

- Source of truth контракта: TypeSpec.
- Точка входа TypeSpec: `spec/typespec/main.tsp`.
- OpenAPI генерируется из TypeSpec.
- Артефакт OpenAPI: `spec/tsp-output/@typespec/openapi3/openapi.yaml`.

- Команда генерации OpenAPI: `cd spec && npm run build:openapi`.
- Команда проверки синхронизации OpenAPI: `cd spec && npm run check:openapi`.
- Команда запуска Prism mock: `cd spec && npm run prism:mock` (порт `4010`).

- Команда генерации TS-типов API для фронтенда: `cd frontend && npm run generate:api-types`.
- Запуск фронтенда с Prism: `cd frontend && npm run dev` (использует `.env.development`).
- Запуск фронтенда с реальным backend: `cd frontend && npm run dev:backend` (использует `.env.backend`).

- Smoke-check перед сдачей:
  - `cd frontend && npm run build`;
  - проверить guest flow: event types → slots → booking;
  - проверить owner flow: upcoming bookings + create event type.
