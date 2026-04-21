### Hexlet tests and linter status:
[![Actions Status](https://github.com/danilmogilniy/ai-for-developers-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/danilmogilniy/ai-for-developers-project-386/actions)

## Call Calendar API contract

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