# Caso 5 — Código sin spec previo (Fase 0: ingeniería inversa de especificación)

Hay código real corriendo, pero nunca se documentó formalmente. Antes del ciclo normal de 4 fases, hay que ejecutar, **una sola vez por capacidad y de forma incremental**, la Fase 0. Nunca documentar "todo el sistema de una vez" — no es revisable por un humano.

Esta rama reemplaza el resto del flujo de Exploración para la capacidad en cuestión. No sigue a `/sdd-propuesta` hasta que el spec candidato de esta capacidad quede validado.

## Paso 1 — Elegir UNA capacidad

Si el usuario no especificó cuál, elegir la más chica o más aislada del código para empezar (menos dependencias con el resto). Decir explícitamente cuál se eligió y por qué. No intentar cubrir varias capacidades en la misma invocación.

## Paso 2 — Redactar el spec candidato

Usar `${CLAUDE_PLUGIN_ROOT}/skills/_shared/plantilla-spec.md` como formato, con una regla adicional obligatoria para Fase 0: **marcar cada afirmación de Comportamiento e Invariantes como `[Confirmado por test]`, `[Confirmado por docs]` o `[Inferido del código]`** — nunca mezclar dos etiquetas en el mismo ítem; si una parte de un ítem está confirmada y otra inferida, partirlo en dos ítems separados.

- `[Confirmado por test]`: hay un test que ejercita exactamente ese comportamiento y pasa.
- `[Confirmado por docs]`: hay documentación previa (README, comentarios, tickets) que lo describe, aunque no haya test.
- `[Inferido del código]`: solo se dedujo leyendo el código — es lo que el código *hace*, no necesariamente lo que *debería* hacer.

`Estado` del spec candidato: `en desarrollo` — todavía no pasó la revisión humana.

## Paso 3 — Señalar bugs y código muerto aparte, sin corregirlos

Si durante la lectura aparece algo que parece un bug (comportamiento que contradice lo que el resto del sistema asume, o un caso no manejado que debería estarlo) o código muerto (funciones/rutas que nadie invoca), **listarlo aparte, fuera del spec**, con la ruta exacta. No corregirlo en este paso — la corrección va en un cambio separado, después de que el humano confirme que efectivamente es un bug y no una decisión rara pero intencional.

## Paso 4 — Documento de arquitectura, si todavía no existe

Si el proyecto no tiene `AGENTS.md`/`CLAUDE.md`/`.cursorrules`/`docs/arquitectura.md`, este es el momento de crearlo (sección 6 de la metodología: nace en el primer cambio de un Caso 1, o en la Fase 0 de un Caso 5). Contenido mínimo en `convenciones.md`. Si ya existe uno, no tocarlo en este paso — se actualiza aparte, por un cambio dedicado.

## Paso 5 — Índice

Crear `docs/specs/README.md` si no existe (tabla Capacidad → Spec). Si ya existe, agregar la fila de esta capacidad.

## Paso 6 — Gate: revisión humana obligatoria

Esto **no es opcional**, a diferencia del resto de los gates de Exploración que son solo una confirmación rápida. Presentar al humano, en este orden:

1. Todo lo marcado `[Inferido del código]` — esto es lo que más riesgo tiene de documentar un bug como si fuera comportamiento correcto.
2. Los bugs/código muerto detectados en el Paso 3.
3. Preguntar explícitamente, por cada ítem inferido: "¿esto es comportamiento correcto, o es un bug?"

No avanzar a `/sdd-propuesta` para esta capacidad hasta tener esa confirmación. Cuando el humano confirma o corrige el spec candidato:

- Si confirma que lo inferido es correcto: cambiar `Estado` a `desplegado`.
- Si corrige algo: reescribir esa parte del spec para describir el comportamiento **correcto** (no el bugueado), y anotar en las Decisiones que se detectó una discrepancia durante la Fase 0.
- Si se confirmaron bugs o código muerto reales: dejarlos anotados como pendientes de un cambio de corrección aparte — **ese fix va en un MR/cambio separado del que crea el spec**, para que el diff del spec quede limpio y revisable por sí solo.

## Qué pasa después

Una vez que el spec de esta capacidad queda en `Estado: desplegado`, cualquier cambio futuro sobre ella deja de ser Fase 0: se comporta como Caso 2 (si agrega algo) o Caso 3 (si modifica algo) — usar `/sdd-exploracion` de nuevo normalmente, va a detectar el spec y seguir el árbol de decisión estándar. Las demás capacidades del sistema heredado siguen pasando por esta misma Fase 0, una por una, cuando se las toque (o en un baseline dedicado si se quiere adelantar trabajo).
