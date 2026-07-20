<!--
@hg
const show = true
const data = ["x", "y"]
@endhg
-->

# Nested

<!--
@hg
if show
@endhg
-->
<!--
@hg
each item in data
@endhg
-->
- {{ item }}
<!--
@hg
endeach
@endhg
-->
<!--
@hg
endif
@endhg
-->
