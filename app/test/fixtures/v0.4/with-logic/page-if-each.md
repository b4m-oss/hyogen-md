<!--@hg
extend ./layout.md

const title = "Logic"
const items = ["apple", "banana"]
const isNight = true
@endhg-->
<!--@hg
block contents
@endhg-->
<!--
@hg
if isNight
@endhg-->
- night
<!--
@hg
else
@endhg-->
- day
<!--
@hg
endif
@endhg-->
<!--
@hg
each item in items
@endhg-->
* {{ item }}
<!--
@hg
endeach
@endhg-->
<!--@hg
endblock
@endhg-->

