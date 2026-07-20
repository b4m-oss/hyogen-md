# hyogen-md

Extended Markdown template engine (`app/`) and a local playground (`playground/`).

## Playground

Local Vite + Vue UI over a virtual FS (no real disk). Uses `../app` source via Vite alias.

```bash
cd playground
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

```bash
cd playground && npm test   # pure-logic Vitest
```

## Library (`app/`)

```bash
cd app
npm install
npm test
npm run build
```
