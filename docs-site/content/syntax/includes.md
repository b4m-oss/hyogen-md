---
title: Includes and Components
description: include, component, extend, and block templating.
---

# Includes and Components

Reuse content across files with `include`, parameterized `component`, and layout inheritance with `extend` + `block`.

## include

Inlines another `.md` file at the current position. No props. Parent scope variables are visible.

```markdown
<!--
@hg
include ./partials/description.md
@endhg
-->
```

Use `include` when you only need to splice content — no parameters.

## component

Register a component file under an alias, then call it in `{{ }}` expressions.

**Component file** (`city-item.md`):

```markdown
---
props:
  city:
    type: string
  population:
    type: number
---

Name: {{ city }} / Population: {{ population.toLocaleString('en-US') }}
```

**Parent file**:

```markdown
<!--
@hg
component city-item.md as cityItem
@endhg
-->

- {{ cityItem({ city: "Osaka", population: 2825000 }) }}
- {{ cityItem({ city: "Kobe", population: 1490000 }) }}
```

### Rules

| Rule | Detail |
|------|--------|
| Registration | `component <path> as <name>` in `@hg` |
| Call site | `{{ name({ ... }) }}` only |
| Output | Must be **single line** — multiline output errors |
| Alias scope | Visible in the defining file and included children |
| Alias collision | Error — choose unique names |
| extend inside component | Skipped with `extend_in_component` warning |

### In each loops

```markdown
<!--
@hg
component city-item.md as cityItem
const cities = [
  { name: "Osaka", population: 2825000 },
  { name: "Kobe", population: 1490000 },
]
@endhg
-->

<!--
@hg
each item in cities
@endhg
-->
- {{ cityItem({ city: item.name, population: item.population }) }}
<!--
@hg
endeach
@endhg
-->
```

## extend and block

Layout inheritance (Pug / Blade style). Only **single inheritance** — no layout chains.

**Layout** (`layout.md`):

```markdown
# {{ title }}

<!--
@hg
block contents
@endhg
-->

Default body text.

<!--
@hg
endblock
@endhg
-->
```

**Page** (`page.md`):

```markdown
<!--
@hg
extend layout.md
const title = "My Page"
@endhg
-->

<!--
@hg
block contents
@endhg
-->

Overridden body.

<!--
@hg
endblock
@endhg
-->
```

| Rule | Detail |
|------|--------|
| `extend` position | First `@hg` block (front matter may precede it) |
| Child body outside blocks | Ignored |
| Unoverridden blocks | Layout default kept |
| Close tag | `endblock` only |

## Circular references

Circular `include` / `component` / `extend` chains are detected, skipped, and reported as `circular_include` warnings.

## Related

- [Front matter](/syntax/front-matter) — component props
- [Paths and security](/syntax/paths-and-security) — path resolution
