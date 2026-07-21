import type { VirtualFs } from "../fs/virtualFs";

/** Fixed context for playground renders (no UI editor). */
export const FIXED_CONTEXT = {
  siteName: "hyogen playground",
  region: "Kansai",
};

export const DEMO_ENTRY = "/src/index.md";

const DEMO_FILES: Record<string, string> = {
  "/src/index.md": `<!--
@hg
extend ./layouts/base.md

const title = "Welcome"
const showTips = true
const features = ["extend", "include", "component", "if", "each"]
@endhg
-->

<!--
@hg
block contents
@endhg
-->

<!--
@hg
component ./components/badge.md as badge
@endhg
-->

<!--
@hg
include ./partials/intro.md
@endhg
-->

## Features

<!--
@hg
if showTips
@endhg
-->
Tip: edit this file and watch \`/out\` update.
<!--
@hg
endif
@endhg
-->

<!--
@hg
each name in features
@endhg
-->
- {{ badge({ label: name }) }}
<!--
@hg
endeach
@endhg
-->

<!--
@hg
endblock
@endhg
-->
`,

  "/src/layouts/base.md": `# {{ title }} — {{ siteName }}

<!--
@hg
block contents
@endhg
-->
(default contents)
<!--
@hg
endblock
@endhg
-->

---
region: {{ region }}
`,

  "/src/partials/intro.md": `This is the **hyogen playground** demo seed.
`,

  "/src/components/badge.md": `---
props:
  label:
    type: string
    isRequired: true
---
\`{{ label }}\`
`,
};

/** Apply demo project files into an empty-ish VirtualFs. */
export function applyDemoSeed(fs: VirtualFs): void {
  for (const [path, content] of Object.entries(DEMO_FILES)) {
    fs.writeSrc(path, content);
  }
}

export function demoFileMap(): Record<string, string> {
  return { ...DEMO_FILES };
}
