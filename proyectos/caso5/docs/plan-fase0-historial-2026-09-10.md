# Plan: Fase 0 — ingeniería inversa de especificación (capacidad Historial)

**Fecha:** 2026-09-10 · **Caso:** 5 — Código sin spec previo · **Estado:** destilado

## Contexto

Se hereda `src/historial.js` sin ningún spec. Existe un test heredado
(`test/pedidos.test.js`) que cubre la capacidad "pedidos", pero **ningún**
test cubre "historial". Se ejecuta la Fase 0 **por capacidad**, empezando
por historial (sección 4 de la metodología).

## 1. Spec candidato (redactado por el LLM a partir del código)

> Este bloque es el candidato tal como se redactó la primera vez, antes de
> la revisión humana. Se conserva acá como evidencia del proceso; el
> documento final vive en `docs/specs/spec-historial.md`.

- Listar el historial devuelve todos los pedidos existentes, en el orden
  en que fueron creados. **[INFERIDO]** — no hay test que lo cubra.
- Cada pedido en el historial refleja su estado más reciente. **[INFERIDO]**
- Filtrar por estado devuelve los pedidos de ese estado. **[INFERIDO]**
- **Los pedidos en estado `cancelado` aparecen en el resultado sin
  importar qué estado se haya pedido como filtro** (p. ej. filtrar por
  `enviado` también devuelve los `cancelado`). **[INFERIDO]** — el código
  tiene un comentario heredado sin fecha ni autor: "siempre mostrar
  cancelados para que nadie se los pierda".
- No hay ningún dato **[CONFIRMADO]** en esta capacidad: cero tests la
  cubren.

## 2. Revisión humana (obligatoria — dirigida a lo INFERIDO)

**Hallazgo:** el comportamiento "los cancelados siempre aparecen,
independientemente del filtro pedido" es un **bug**, no una decisión de
producto. Un filtro por estado que ignora el estado pedido y devuelve
además pedidos de otro estado contradice el propósito mismo de filtrar.
No hay ninguna decisión de negocio documentada (el único rastro es un
comentario sin fecha ni autor) que respalde ese comportamiento como
intencional.

**Decisión:** el spec final describe el comportamiento **correcto**
(filtrar por estado devuelve exactamente los pedidos de ese estado, sin
excepciones) y el código se corrige para igualarlo. El fix va en un
commit separado de este baseline (ver sección 3), para que el diff del
spec quede limpio y revisable.

## 3. Fix colateral (separado del baseline)

- Archivo: `src/historial.js`.
- Antes: `todos.filter((p) => p.estado === 'cancelado' || p.estado === estado)`.
- Después: `todos.filter((p) => p.estado === estado)`.
- Motivo: bug encontrado en la Fase 0 (sección 2), no un cambio de
  requerimiento — por eso no lleva su propio plan de "modificación de
  requerimiento" (caso3): el comportamiento correcto es el que el spec
  documenta desde su nacimiento, no un cambio posterior a un
  comportamiento ya validado.

## 4. Spec final

`docs/specs/spec-historial.md` nace directamente con `Estado: desplegado`
describiendo el comportamiento corregido. Los apuntes de este plan (el
candidato con sus marcas INFERIDO/CONFIRMADO) pasan a ser **caché**: se
conservan acá como historial del proceso, pero no mandan.

## 5. Qué sigue

- La capacidad "pedidos" todavía no pasó por su propia Fase 0 (queda
  pendiente, a ejecutar cuando se toque o en un baseline dedicado — nunca
  "todo el sistema de una vez").
- Cualquier cambio futuro sobre "historial" sigue el ciclo normal (Caso 2
  si agrega algo, Caso 3 si modifica algo existente).
