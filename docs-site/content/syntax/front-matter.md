---
title: Front Matter
description: YAML front matter for metadata and component prop contracts.
---

# Front Matter

Files can start with YAML front matter between `---` delimiters. It serves two roles:

1. **Document metadata** — injected as template variables at render start
2. **Component prop contracts** — type, required flag, and defaults (see [Includes and components](/syntax/includes))

## Document metadata

```markdown
---
title: About us
author: Team
---

# {{ title }}

Written by {{ author }}.
```

By default, front matter is **stripped** from output. Set `preserveFrontMatter: true` in render options to keep it.

## Size limit

Front matter source must be ≤ 64 KB. Larger files throw `frontmatter_too_large`.

## Component props contract

Define props in a component file's front matter:

```yaml
---
props:
  name:
    type: string
    isRequired: true
    default: "Guest"
  count:
    type: number
---
```

| Field | Meaning |
|-------|---------|
| `type` | `string`, `number`, `boolean`, `object`, or `array` |
| `isRequired` | When `true`, missing props emit `prop_missing` warning |
| `default` | Value used when the prop is not passed |

Omitting `type` infers from the default value or passed value.

## Scoping

Later bindings override earlier ones with the same name:

1. API `context`
2. File front matter
3. `@hg` declarations
4. Component call props (inside the component)

Component `as` aliases are an exception — they cannot collide. See [Includes and components](/syntax/includes).

## Security note

Do not store secrets in front matter. Use `serverContext` on the server instead. See [Paths and security](/syntax/paths-and-security).
