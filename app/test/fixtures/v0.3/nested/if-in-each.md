<!--
@hg
const items = ["a", "b"]
@endhg
-->

# Nested

<!--
@hg
each item in items
@endhg
-->
<!--
@hg
if item === "a"
@endhg-->
- first: {{ item }}
<!--
@hg
endif
@endhg
-->
<!--
@hg
endeach
@endhg
-->
