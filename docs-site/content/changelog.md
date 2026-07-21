---
title: Changelog
description: Library release history and the docs-site version track.
---

# Changelog

## Where to find release notes

The canonical changelog for the **library** lives on GitHub:

- [user-docs/changelog.md](https://github.com/b4m-oss/hyogen-md/blob/develop/user-docs/changelog.md) (English)
- [user-docs/changelog_ja.md](https://github.com/b4m-oss/hyogen-md/blob/develop/user-docs/changelog_ja.md) (Japanese)

That file covers npm releases (`0.10.0`, etc.) and notable Playground changes.

## Docs-site version track

This documentation site uses a separate **docs track** that does not bump the library SemVer:

| Track | Example | What changes |
|-------|---------|--------------|
| Library | `0.10.0` | `@b4moss/hyogen-md` on npm |
| Docs site | `0.10.0-docs.8` | Nuxt site, Playground integration, content pages |

Docs milestones (`docs.5` … `docs.8`) are recorded in the GitHub changelog under tags like `0.10.0-docs.5`. The library `package.json` version stays at `0.10.0` while docs work ships independently.

When a docs milestone mentions site features (Playground on Netlify, theme toggle, API pages), look for the matching `0.10.0-docs.*` entry in the GitHub changelog.

## Current library version

**@b4moss/hyogen-md@0.10.0** — the API and syntax documented here match this release.
