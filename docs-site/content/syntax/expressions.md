---
title: Expressions
description: Mustache-style {{ }} expressions in hyogen.md.
---

# Expressions

Use `{{ expression }}` in Markdown body text to interpolate values. **Statements are not allowed** — only expressions.

## Variable reference

```markdown
Hello {{ name }}!
```

Member access and computed keys work like JavaScript:

```markdown
{{ user.name }}
{{ items[index] }}
```

## Default values (pipe)

Use `|` for fallback when the left side is falsy (`undefined`, `null`, `""`, `0`, `false`):

```markdown
{{ title | "Untitled" }}
{{ count | 0 }}
```

## Ternary operator

```markdown
{{ isNight ? "Dark" : "Light" }}
```

## Triple braces

`{{{ expression }}}` is supported. **Currently behaves the same as `{{ }}`** (no escaping). Reserved for a future escaping mode.

## Component calls

Registered components are called inside expressions:

```markdown
{{ cityItem({ city: "Osaka", population: 2825000 }) }}
```

See [Includes and components](/syntax/includes).

## What you cannot write

- Statements (`const`, `if`, loops)
- Arbitrary function calls (only registered components)
- Most method calls (only [`.toLocaleString`](/syntax/methods))

Logic belongs in `@hg` blocks. See [Hyogen blocks](/syntax/hg-blocks).

## Escaping

`{{ }}` does **not** HTML-escape output. Sanitize downstream if you render to HTML. Suspicious context values may emit warnings — see [Paths and security](/syntax/paths-and-security).
