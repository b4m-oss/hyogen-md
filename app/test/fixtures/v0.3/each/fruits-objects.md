<!--
@hg
const data = [
  { key: "apple", value: "red" },
  { key: "banana", value: "yellow" },
  { key: "orange", value: "orange" },
]
@endhg
-->

# Fruits color

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
