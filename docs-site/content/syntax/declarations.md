---
title: Declarations
description: const, let, and reassignment in @hg blocks.
---

# Declarations

Inside `@hg` blocks, use JavaScript-like declarations to bind template variables.

## const and let

```markdown
<!--
@hg
const text = "foo bar"
let mutable = "original"
@endhg
-->

- {{ text }}
- {{ mutable }}
```

## Reassignment

```markdown
<!--
@hg
let foo = "before"
foo = "after"
@endhg
-->

{{ foo }}
```

## Objects and arrays

```markdown
<!--
@hg
const object = {
  animal: "duck",
  state: "sitting",
}
const list = ["apple", "banana"]
@endhg
-->

- {{ object.animal }} is {{ object.state }}
- {{ list[0] }}
```

## Template literals

Backtick strings with `${expression}` are allowed. Expressions inside `${}` follow the same whitelist as `{{ }}`:

```markdown
<!--
@hg
const name = "world"
const msg = `hello ${name}`
@endhg
-->

{{ msg }}
```

Component calls are **not** allowed inside template literal expressions.

## Allowed updates

- `++` / `--` (prefix and postfix)
- Compound assignment: `+=`, `-=`, `*=`, `/=`

## Not allowed

- `function` declarations and arrow functions
- `import` / `require`
- Destructuring assignment
- `try` / `catch`, `new`

Reserved words (`if`, `each`, `include`, etc.) cannot be used as identifiers. See [Hyogen blocks](/syntax/hg-blocks).
