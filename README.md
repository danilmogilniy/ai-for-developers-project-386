### Hexlet tests and linter status:
[![Actions Status](https://github.com/danilmogilniy/ai-for-developers-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/danilmogilniy/ai-for-developers-project-386/actions)

## Call Calendar

This repository includes:
- `spec/` — Design First API contract (`TypeSpec` → `OpenAPI`).
- `frontend/` — UI application (`Vue 3 + TypeScript + PrimeVue`), integrated with API contract.

## API contract (`spec/`)

This repository follows a Design First workflow. The API contract is authored in TypeSpec and emitted to OpenAPI.

### Install dependencies

```bash
cd spec
npm install
```

### Generate OpenAPI

```bash
cd spec
npm run build:openapi
```

Generated file:

- `spec/tsp-output/@typespec/openapi3/openapi.yaml`

### Check OpenAPI is synchronized

```bash
cd spec
npm run check:openapi
```

The check command rebuilds OpenAPI from TypeSpec and fails if `openapi.yaml` has unstaged changes.

### Run Prism mock server from contract

```bash
cd spec
npm run prism:mock
```

By default Prism serves the API mock at `http://localhost:4010`.

## Frontend (`frontend/`)

### Install dependencies

```bash
cd frontend
npm install
```

### Generate API TypeScript types from OpenAPI

```bash
cd frontend
npm run generate:api-types
```

### Run frontend with Prism mock API (default)

```bash
cd spec
npm run prism:mock
```

In a second terminal:

```bash
cd frontend
npm run dev
```

Frontend reads `VITE_API_BASE_URL` from `.env.development` (`http://localhost:4010`).

### Run frontend with real backend API

Set backend URL in `frontend/.env.backend` (default `http://localhost:3000`) and run:

```bash
cd frontend
npm run dev:backend
```