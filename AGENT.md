# AGENT

- Ограничения: не изменять только `.github/workflows/hexlet-check.yml`.
- Типизация: избегать `any`, использовать строгие типы.
- Команда генерации OpenAPI: `cd spec && npm run build:openapi`.
- Команда проверки синхронизации OpenAPI: `cd spec && npm run check:openapi`.
- Source of truth контракта: TypeSpec.
- Точка входа TypeSpec: `spec/typespec/main.tsp`.
- OpenAPI генерируется из TypeSpec.
- Артефакт OpenAPI хранится в `spec/tsp-output/@typespec/openapi3/openapi.yaml`.
