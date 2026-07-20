<!--
@hg
component ./components/greet.md as greet
@endhg
-->

# {{ title }}

<!--
@hg
include ./partials/body.md
@endhg
-->

- {{ greet({ name: "Ada" }) }}
