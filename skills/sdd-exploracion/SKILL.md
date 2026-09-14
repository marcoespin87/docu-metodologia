---
name: sdd-exploracion
description: This skill should be used when the user explicitly invokes "/sdd-exploracion" to start the Exploration phase of the Spec-Anchored SDD methodology — reading the affected capability's spec (if any), identifying which of the 5 starting scenarios applies (from-scratch, new feature, modify existing requirement, language migration, or undocumented legacy code), and summarizing the problem before any plan is written. Manual-only: never auto-triggers from conversation content.
argument-hint: [descripción de la idea o necesidad del cambio]
disable-model-invocation: true
---

# sdd-exploracion — Fase 1: Exploración

Primera fase del ciclo de la metodología SDD Spec-Anchored. Determinar qué existe hoy, cuál de los 5 escenarios de partida aplica, y qué restringe el cambio propuesto — antes de escribir ningún plan.

No construir nada en esta fase. No escribir el plan todavía (eso es `/sdd-propuesta`). El único artefacto que esta fase puede llegar a crear es el spec candidato de la Fase 0 (Caso 5) — todo lo demás es un resumen en la conversación.

Leer `${CLAUDE_PLUGIN_ROOT}/skills/_shared/convenciones.md` antes de tocar cualquier archivo: define dónde viven los specs, el índice y el documento de arquitectura en cualquier proyecto.

## Paso 1 — Leer el estado actual del repo

Buscar, en la raíz del proyecto donde se invocó el skill (no en el repo del plugin):

1. `docs/specs/` — ¿existe? ¿tiene algún `spec-*.md`?
2. Un archivo de contexto de arquitectura: `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, o `docs/arquitectura.md`.
3. Código fuente relevante a lo que el usuario está pidiendo (aunque no tenga spec).

Si `$ARGUMENTS` no deja claro qué se quiere cambiar, preguntar antes de seguir — no asumir.

## Paso 2 — Identificar la capacidad afectada

Una capacidad es la porción del sistema que el spec describiría (ver el criterio de tamaño en `convenciones.md`). A partir del pedido del usuario, nombrar la capacidad en kebab-case (ej. `carrito-compras`, `autenticacion`). Si no es obvio a cuál capacidad existente pertenece, o si es nueva, decirlo explícitamente.

## Paso 3 — Detectar el Caso (árbol de decisión)

Seguir este orden, no saltar pasos:

1. **¿`docs/specs/` no existe o está vacío?**
   - **Y no hay código relevante para lo pedido** → **Caso 1** (desde cero). Ir a `references/caso1-desde-cero.md`.
   - **Y sí hay código para la capacidad en cuestión, aunque no tenga spec** → **Caso 5** (código sin spec previo). Ir a `references/caso5-fase0-ingenieria-inversa.md` — esta rama tiene su propio flujo y gate, descrito ahí, y no sigue el resto de este documento.
2. **`docs/specs/` existe. ¿Hay un spec para esta capacidad puntual?**
   - **No, pero el sistema ya tiene otras capacidades documentadas** → **Caso 2** (funcionalidad nueva). Ir a `references/caso2-funcionalidad-nueva.md`.
   - **No, pero SÍ hay código de esta capacidad ya corriendo sin documentar** (capacidad "huérfana" dentro de un sistema por lo demás documentado) → **Caso 5**, igual que arriba, pero acotado a esa capacidad.
   - **Sí, existe spec de esta capacidad. ¿Qué pide el usuario?**
     - Agregar algo que el spec **todavía no describe** — una subcapacidad nueva tal que el comportamiento ya documentado sigue siendo cierto sin ningún matiz después del cambio (ej. sección 7 de la metodología: agregar un filtro por estado a un historial que ya tenía spec — sin usar el filtro, la lista sigue idéntica) → sigue siendo **Caso 2** (funcionalidad nueva), con la única diferencia de que acá el spec ya existe y en `/sdd-aplicacion` se le agrega una sección nueva en vez de nacer uno. Ir a `references/caso2-funcionalidad-nueva.md`.
     - Cambiar/eliminar algo que el spec ya describe (comportamiento u obligado a tocar implementación) → **Caso 3** (modificación de un requerimiento existente). Ir a `references/caso3-modificacion-existente.md`.
     - Reescribir en otro lenguaje/stack sin cambiar el comportamiento → **Caso 4** (migración de lenguaje). Ir a `references/caso4-migracion-lenguaje.md`.

   **Cómo distinguir agregar de cambiar, cuando el spec ya existe:** no preguntar si el spec va a cambiar (las tres ramas lo cambian). Preguntar si lo que el spec **ya describe hoy** sigue siendo cierto, sin ningún matiz, después del cambio. Si sí → Caso 2 (se suma algo encima). Si algo que el spec ya prometía deja de cumplirse, o pasa a comportarse distinto → Caso 3.

**No asumir el Caso en silencio.** Anunciarlo explícitamente al usuario ("Esto es un Caso N porque...") antes de seguir con el resto de la fase — es la decisión que más condiciona todo lo que sigue, y es barata de corregir acá y cara de corregir después.

## Paso 4 — Ejecutar la rama del Caso detectado

Cada `references/casoN-*.md` dice exactamente qué leer, qué preguntar y qué resumen dejar para esa rama. Seguirlo. Todas las ramas (excepto Caso 5) terminan produciendo:

- Un resumen del problema (2-4 frases).
- El **Caso** confirmado.
- El **delta tentativo**: AGREGADO / MODIFICADO / ELIMINADO / NULO / 100% del sistema.
- Los **invariantes existentes** que restringen el cambio (citados del spec leído, con su "porqué").

Este resumen es el input que `/sdd-propuesta` va a necesitar a continuación — dejarlo explícito en la respuesta, no implícito.

## Paso 5 — Cerrar la fase

Terminar siempre indicándole al usuario:
- Qué Caso se detectó y por qué.
- Que la próxima fase es `/sdd-propuesta` (excepto en Caso 5, donde primero hay que cerrar la revisión humana de la Fase 0 — ver esa referencia).
- Si quedó algo por confirmar antes de seguir (nombre de la capacidad, alcance), preguntarlo ahora, no dejarlo para la fase siguiente.

## Sesión nueva sin historial de esta fase

Si `/sdd-propuesta`, `/sdd-aplicacion` o `/sdd-verificacion` se invocan sin que esta fase haya corrido en la misma conversación, ese skill va a intentar re-derivar el Caso y el delta leyendo el repo (spec existente, plan más reciente sin destilar). Para que eso funcione, cuando esta fase detecte un Caso, es preferible dejarlo escrito en el plan más adelante (lo hace `/sdd-propuesta`) en vez de solo mencionarlo en el chat.

## Referencias

- `${CLAUDE_PLUGIN_ROOT}/skills/_shared/convenciones.md` — rutas y nombres de archivo.
- `${CLAUDE_PLUGIN_ROOT}/skills/_shared/plantilla-spec.md` — formato fijo del spec (necesario para leer specs existentes con criterio, y obligatorio en la rama Caso 5).
- `references/caso1-desde-cero.md`
- `references/caso2-funcionalidad-nueva.md`
- `references/caso3-modificacion-existente.md`
- `references/caso4-migracion-lenguaje.md`
- `references/caso5-fase0-ingenieria-inversa.md`
