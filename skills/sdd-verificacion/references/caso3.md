# Caso 3 — Verificación y fusión

La verificación más exigente de los 4 Casos: nuevo comportamiento (o paridad, si fue solo cambio de implementación) **+** impacto en todo lo que dependía de lo anterior.

## Qué verificar

- Si el plan declaró cambio de Comportamiento: que el comportamiento nuevo sea exactamente el descrito, incluidos los casos borde mencionados en el plan.
- Si el plan declaró paridad (solo cambio de implementación): comparar entradas → salidas contra el comportamiento anterior, no solo leer el código nuevo y asumir que es equivalente.
- Cada dependiente identificado en `/sdd-exploracion`/`/sdd-propuesta`: confirmar que sigue funcionando, o que su ajuste (si lo hubo) también está cubierto y probado.
- Que el diff del spec sea coherente con el Caso: si el plan decía "solo Decisiones/Referencias" pero el diff real toca `Comportamiento`, es una discrepancia a señalar antes de cerrar — puede significar que el cambio terminó siendo más grande de lo que el plan preveía.
