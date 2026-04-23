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

## Deploy on Render

This repository is configured for two Render services via `render.yaml`:

- `call-calendar-backend` (`Web Service`) for API.
- `call-calendar-frontend` (`Static Site`) for UI.

### Deploy with Blueprint

1. In Render dashboard, create a new Blueprint service from this repository.
2. Render will create both services from `render.yaml`.
3. After first deploy, open frontend service settings and set:
   - `VITE_API_BASE_URL=https://<your-backend-service>.onrender.com`
4. Trigger frontend redeploy after updating `VITE_API_BASE_URL`.

### Expected result

- Frontend URL opens UI on `/`.
- Backend URL returns API info on `/` and health status on `/health`.