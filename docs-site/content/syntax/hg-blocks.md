---
title: Hyogen Blocks
description: HTML comment blocks with @hg and @@ shorthand syntax.
---

# Hyogen Blocks

hyogen.md logic lives inside HTML comments so Markdown previews stay clean.

## Standard form

```markdown
<!--
@hg
const greeting = "hello"
@endhg
-->
```

Variants that work equally:

```markdown
<!--@hg
const x = 1
@endhg-->
```

```markdown
<!--@hg /* one-line block */ @endhg-->
```

## Shorthand form

`@@` … `@@` is equivalent to `@hg` … `@endhg`:

```markdown
<!--@@
include ./partials/header.md
@@-->
```

```markdown
<!--@@ include ./partials/footer.md @@-->
```

Use `/* */` for inline comments in one-line blocks (not `//`, which ends at newline).

## What goes inside

| Category | Examples |
|----------|----------|
| Declarations | `const`, `let`, reassignment |
| Includes | `include`, `component … as`, `extend` |
| Control flow | `if` / `else` / `each` (structural — wrap Markdown body) |
| Loops | `for (…)`, `do … while` |

See [Declarations](/syntax/declarations) and [Control flow](/syntax/control-flow).

## Code fences are ignored

Hyogen blocks inside fenced code blocks are **not** executed:

````markdown
```html
<!-- @hg const x = 1 @endhg -->
```
````

## Output preservation

By default, hyogen comment blocks are removed from output. Set `preserveHgComments: true` to keep them for debugging.

## JS comments inside blocks

```markdown
<!--
@hg

// line comment

/* block comment */

@endhg
-->
```
