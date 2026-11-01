# Manifest schema v1

`manifest.v1.json` is a JSON Schema (2020-12) for one NerdyStore listing (`nexploy/<letter>/<id>/manifest.yml`).
Unknown keys are allowed, so older manifests and clients keep working.

Editor hint (YAML language server), at the top of a manifest:

```yaml
# yaml-language-server: $schema=../../../schema/manifest.v1.json
```

## CI (`.github/workflows/schema.yml`)

| Job | Command | Effect |
| --- | --- | --- |
| `schema-core` | `node scripts/validate_manifests.js --mode core` | **Blocking.** YAML parses and has `type`, `name`, `category`, `mainService` (all current manifests do). |
| `schema-strict` | `node scripts/validate_manifests.js --mode strict` | **Warn only** (`continue-on-error`). Full schema; Ajv failures are errors, extra lints are warnings. |

Strict-mode lints (always warnings): `id` ≠ folder name, missing local icon/screenshot file, `latest`/`stable` version or imageTag, legacy `gallery`.

Run locally:

```sh
npm i --no-save --no-package-lock ajv@8 ajv-formats@3 yaml@2
node scripts/validate_manifests.js --mode core
node scripts/validate_manifests.js --mode strict
```

## Migration: warnings → required

1. **Now (this change):** core keys enforced; full schema reported as warnings. No manifest changes needed.
2. **Backfill (separate PR):** per manifest, add `schemaVersion: 1`, `id`, `kind`, `summary` (from today's `description`), `license`, `platforms`, `maintainer`, `icon`; move categories to slugs and `gallery` → `screenshots`; add ports/volumes from compose.
3. **Enforce:** once strict reports 0 errors, drop `continue-on-error` from `schema-strict`. Unpinned versions and `gallery` stay warnings.

Nexterm header-comment items (`@name`, `@description`, …) can later be mapped to the same keys and checked with the same schema.
