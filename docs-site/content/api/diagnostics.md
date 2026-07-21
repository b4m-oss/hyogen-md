---
title: Diagnostics
description: Warnings, errors, and formatDiagnosticLog for hyogen-md.
---

# Diagnostics

hyogen-md reports problems as structured diagnostics. The library **does not** write to `console` automatically — you decide how to log or display them.

## Warnings vs errors

| Kind | Behavior | Returned in `warnings` |
|------|----------|------------------------|
| **Warning** | Render continues; affected feature is skipped or degraded | Yes |
| **Error** | Render aborts; thrown as `HyogenError` | No |

```ts
type HyogenDiagnostic = {
  code: string
  message: string
  path?: string
  details?: Record<string, unknown>
}

type HyogenWarning = HyogenDiagnostic
type HyogenError = Error & HyogenDiagnostic
```

## Handling warnings

```ts
const { markdown, warnings } = await renderServer(source, context)

for (const w of warnings) {
  console.warn(formatDiagnosticLog('warning', w))
}
```

## Handling errors

```ts
import { formatDiagnosticLog } from '@b4moss/hyogen-md'

try {
  await renderServer(source)
} catch (err) {
  if (err && typeof err === 'object' && 'code' in err) {
    console.error(formatDiagnosticLog('error', err as HyogenError))
  }
  throw err
}
```

## formatDiagnosticLog

Formats a diagnostic as multi-line text. Exported from both `@b4moss/hyogen-md` and `@b4moss/hyogen-md/client`.

```ts
import { formatDiagnosticLog } from '@b4moss/hyogen-md'

formatDiagnosticLog('error', {
  code: 'file_not_found',
  message: 'File not found: ./missing.md',
  details: {
    path: './missing.md',
    from: './page.md',
    via: 'include',
  },
})
```

Output:

```text
[hyogen:error] file_not_found
  path: ./missing.md
  from: ./page.md
  via: include
```

Format rules:

- Line 1: `[hyogen:{kind}] {code}`
- Following lines: `details` keys as `  {key}: {value}` (2-space indent)
- `details.path` takes priority over top-level `path`
- Keys with `undefined` values are omitted

## formatMessage

Resolve a code to the English message template (from the built-in catalog):

```ts
import { formatMessage } from '@b4moss/hyogen-md'

formatMessage('file_not_found', {
  path: './x.md',
  from: './page.md',
  via: 'include',
})
// "File not found: ./x.md (referenced from ./page.md via include)"
```

## Related

- [Error and warning codes](/api/error-codes) — full code table
