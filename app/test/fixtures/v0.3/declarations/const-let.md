<!--
@hg
const text = "hello"
let fooBar = "initial"
fooBar = "updated"
const object = { animal: "duck", state: "sitting" }
@endhg
-->

- {{ text }}
- {{ fooBar }}
- {{ object.animal }} is {{ object.state }}
