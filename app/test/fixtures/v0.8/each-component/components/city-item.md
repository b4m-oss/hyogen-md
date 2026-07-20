---
props:
  city:
    type: string
  population:
    type: number
---

Name: {{ city }} / Population: {{ population.toLocaleString('ja-JP') }} ({{ region }})
