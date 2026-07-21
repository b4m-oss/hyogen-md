---
title: Install
description: Install @b4moss/hyogen-md
---

# Install

```bash
npm install @b4moss/hyogen-md
```

## Quick start (server)

```ts
import { renderServer } from '@b4moss/hyogen-md'

const result = await renderServer('# Hello {{ name }}', {
  context: { name: 'world' },
})
```

Full API and template syntax pages will be added in docs.7.
