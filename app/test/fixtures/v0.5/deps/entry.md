<!--@hg
extend ./layouts/base.md
@endhg-->

<!--@hg
block content
@endhg-->
# Entry
<!--@hg
include ./partials/included.md
@endhg-->
<!--@hg
component ./components/widget.md as widget
@endhg-->
{{ widget({ label: "x" }) }}
<!--@hg
endblock
@endhg-->
