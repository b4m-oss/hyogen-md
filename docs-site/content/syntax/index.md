---
title: Template Syntax
description: hyogen.md template syntax — expressions, blocks, includes, and control flow.
---

# Template Syntax

hyogen.md extends Markdown with HTML-comment directives and Mustache-style expressions. Everything below is available in **@b4moss/hyogen-md@0.10.0**.

## Two layers

| Layer | Where | What you can write |
|-------|-------|-------------------|
| **Expressions** | `{{ }}` / `{{{ }}}` in Markdown body | Expressions only — no statements |
| **Logic blocks** | `<!-- @hg … @endhg -->` or `<!--@@ … @@-->` | Declarations, includes, `if` / `each`, and more |

## Topics

### Data and output

- [Front matter](/syntax/front-matter) — YAML metadata and component props
- [Expressions](/syntax/expressions) — `{{ }}`, defaults, ternary
- [Methods](/syntax/methods) — `.toLocaleString` and allowed calls

### Blocks and directives

- [Hyogen blocks](/syntax/hg-blocks) — `@hg` / `@endhg` and `@@` shorthand
- [Declarations](/syntax/declarations) — `const`, `let`, reassignment
- [Includes and components](/syntax/includes) — `include`, `component … as`, `extend` + `block`
- [Control flow](/syntax/control-flow) — `if` / `else` / `each`

### Safety

- [Paths and security](/syntax/paths-and-security) — `.doc_root`, `_` partials, XSS notes

## Minimal example

```markdown
---
title: Greeting
---

# {{ title }}

<!--
@hg
const name = "world"
@endhg
-->

Hello {{ name | "stranger" }}!
```

Rendered:

```markdown
# Greeting

Hello world!
```

Try it in the [Playground](/playground).
