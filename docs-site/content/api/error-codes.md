---
title: Error and Warning Codes
description: Diagnostic codes thrown or returned by hyogen-md.
---

# Error and Warning Codes

All codes use English message templates. Use [`formatDiagnosticLog`](/api/diagnostics) or `formatMessage` to format them.

## Errors (render aborts)

| Code | When |
|------|------|
| `file_not_found` | `include`, `component`, or `extend` target does not exist |
| `frontmatter_too_large` | Front matter source exceeds 64 KB |
| `duplicate_component_alias` | Same `component … as` alias registered twice in one file |
| `alias_collision` | Component `as` name collides with a variable or parent registration |
| `forbidden_property_access` | Access to a dangerous key (`__proto__`, `prototype`, `constructor`, `__defineGetter__`) |
| `parse_error` | Syntax outside the whitelist, malformed DSL, or missing client loader |
| `component_multiline_output` | Component rendered more than one line (components must be single-line) |
| `server_context_on_client` | `serverContext` passed to `renderClient` |
| `load_failed` | Loader failed for a reason other than not found |

Example error log:

```text
[hyogen:error] file_not_found
  path: ./missing.md
  from: ./page.md
  via: include
```

## Warnings (render continues)

| Code | When |
|------|------|
| `circular_include` | Circular `include` / `component` / `extend` reference — skipped |
| `nest_limit_exceeded` | `if` / `each` structural nesting exceeds 20 — block skipped |
| `extend_in_component` | `extend` inside a component — skipped |
| `prop_type_mismatch` | Component prop type does not match — value becomes `undefined` |
| `prop_missing` | Required component prop missing — value becomes `undefined` |
| `prop_unknown` | Unknown prop key passed to component — ignored |
| `suspicious_context_value` | Context value looks dangerous (XSS patterns) — not modified |

### suspicious_context_value reasons

| Reason | Detects |
|--------|---------|
| `contains_html_script_tag` | `<script` / `</script>` |
| `contains_event_handler` | `onerror=`, `onclick=`, `onload=` |
| `contains_dangerous_scheme` | `javascript:`, `vbscript:` |
| `contains_embed_tag` | `<iframe`, `<object`, `<embed` |
| `contains_meta_refresh` | `<meta … http-equiv` |

Warnings are collected in `RenderResult.warnings` and `BuildResult.warnings`. Errors are thrown as `HyogenError`.
