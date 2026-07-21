---
title: Methods
description: Allowed method calls in hyogen.md expressions.
---

# Methods

Method calls in `{{ }}` and `@hg` expressions are restricted to a small whitelist. Arbitrary chaining (`.map`, `.trim`, etc.) is not allowed.

## toLocaleString

The only permitted method is `.toLocaleString(...)`. Arguments follow JavaScript conventions — the library does not validate them.

```markdown
<!--
@hg
const population = 2825000
@endhg
-->

Population: {{ population.toLocaleString('en-US') }}
```

Output:

```markdown
Population: 2,825,000
```

Works on component props too:

```markdown
{{ population.toLocaleString('ja-JP') }}
```

## Template literals

`.toLocaleString` is also allowed inside `` `${…}` `` in `@hg` blocks:

```markdown
<!--
@hg
const n = 1000
const label = `count: ${n.toLocaleString()}`
@endhg
-->
```

## Function calls

The only callable functions are **registered components** (`component … as name`):

```markdown
{{ cityItem({ city: "Osaka", population: 2825000 }) }}
```

There are no built-in functions in v0.10.0.

## Not allowed

```markdown
{{ items.map(x => x.name) }}   <!-- parse_error -->
{{ text.trim() }}              <!-- parse_error -->
{{ Math.max(a, b) }}           <!-- parse_error -->
```

Use `@hg` declarations or component templates to prepare values instead.
