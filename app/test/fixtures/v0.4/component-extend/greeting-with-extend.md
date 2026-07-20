<!--@hg
extend ../basic/layout.md

const who = "Ada"
@endhg-->
<!--@hg
block contents
@endhg-->Hello {{ who }}.<!--@hg
endblock
@endhg-->
Non-block markdown should be ignored.

