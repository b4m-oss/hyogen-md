---
title: Control Flow
description: if, else, else if, each, and C-style loops in hyogen blocks.
---

# Control Flow

Structural directives (`if`, `each`) wrap Markdown body text between hyogen comment blocks. Imperative loops run entirely inside `@hg` blocks.

## if / else / endif

Pug-style — open with a hyogen block, write Markdown, close with another block:

```markdown
<!--
@hg
const isNight = true
@endhg
-->

<!--
@hg
if isNight
@endhg
-->
I can see the full moon.
<!--
@hg
else
@endhg
-->
I can see the shiny sun.
<!--
@hg
endif
@endhg
-->
```

Conditions use the same expression rules as `{{ }}`. Truthy / falsy follows JavaScript.

### else if

```markdown
<!--
@hg
if score >= 90
@endhg
-->
Grade A.
<!--
@hg
else if score >= 60
@endhg
-->
Grade B.
<!--
@hg
else
@endhg
-->
Grade C.
<!--
@hg
endif
@endhg
-->
```

Empty branches (no body) are allowed. Unmatched `if` or extra `endif` causes `parse_error`.

## each / endeach

Loop over arrays or iterable-like values. Body is Markdown between blocks:

```markdown
<!--
@hg
const fruits = ["apple", "banana", "orange"]
@endhg
-->

<!--
@hg
each item in fruits
@endhg
-->
- {{ item }}
<!--
@hg
endeach
@endhg
-->
```

Object arrays:

```markdown
<!--
@hg
each item in data
@endhg
-->

- {{ item.key }} is {{ item.value }}

<!--
@hg
endeach
@endhg
-->
```

Loop variables and parent scope are both visible inside the body.

## Nesting limit

`if` and `each` structural nesting is limited to **20 levels combined**. Exceeding the limit skips the block and emits `nest_limit_exceeded`.

Nested `if` inside `each` (and vice versa) is allowed within the limit.

## C-style for and do…while

These run entirely inside `@hg` blocks (no Markdown body between markers):

```markdown
<!--
@hg
for (let i = 0; i < 3; i++) {
  // imperative logic only
}
@endhg
-->
```

`while` alone, `for…of`, and `for…in` are **not** allowed.

## Ternary in expressions

For simple branching in text, prefer ternary inside `{{ }}`:

```markdown
{{ isNight ? "Dark" : "Light" }}
```

See [Expressions](/syntax/expressions).
