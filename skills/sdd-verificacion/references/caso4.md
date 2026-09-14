# Caso 4 — Verificación y fusión

Paridad de comportamiento — se mide con tests de caracterización, nunca alcanza con leer el código nuevo y que "se vea parecido".

## Qué verificar

- Los tests de caracterización de este módulo pasan igual contra la versión vieja (baseline) y la nueva — si no se corrieron contra ambas en este mismo ciclo, correrlos ahora.
- El diff del spec de este módulo toca **solo** `Referencias` y una `Decisión` fechada — si toca `Comportamiento` o `Invariantes`, señalarlo como discrepancia: algo de la migración cambió comportamiento sin que estuviera previsto.
- Ningún consumidor externo de la interfaz (API, CLI, lo que corresponda) necesita cambiar cómo la usa.

## Al cerrar

Si quedan más módulos por migrar, recordarle al usuario que el próximo repite el ciclo completo (`/sdd-propuesta` → `/sdd-aplicacion` → `/sdd-verificacion`) para ese módulo — no se arrastra el mismo plan para todos.
