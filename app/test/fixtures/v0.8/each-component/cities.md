<!--
@hg
component ./components/city-item.md as cityItem
@endhg
-->

<!--
@hg
const cities = [
  { name: "Osaka", population: 2825000 },
  { name: "Kobe", population: 1490000 },
]
@endhg
-->

# City list

<!--
@hg
each item in cities
@endhg
-->
- {{ cityItem({ city: item.name, population: item.population }) }}
<!--
@hg
endeach
@endhg
-->
