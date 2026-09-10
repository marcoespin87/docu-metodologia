# Guía paso a paso — Probar la metodología SDD Spec-Anchored en 5 proyectos

**Objetivo:** ejecutar, en la práctica, cada uno de los 5 escenarios descritos en
`../metodologia-sdd-spec-anchored_v3.md` (sección 4 y 7), uno por carpeta:

```
proyectos/
  caso1/   Desde cero
  caso2/   Funcionalidad nueva
  caso3/   Modificación de un requerimiento existente
  caso4/   Migración de lenguaje
  caso5/   Código sin spec previo
```

Se reutiliza el mismo hilo conductor que usa la metodología como ejemplo
("sistema de gestión de pedidos": crear pedido, ver historial, cambiar
estado) para que cada caso tenga contexto de negocio real y no sea un
ejercicio abstracto.

**Encadenamiento entre casos:** los casos 2, 3 y 4 necesitan un sistema
previo con specs para poder aplicarse (no tiene sentido "agregar un filtro"
si no existe el historial). Por eso el orden recomendado es secuencial:

```
caso1 (nace el sistema) → caso2 (se copia y se le agrega el filtro)
                        → caso3 (se copia caso2 y se cambia la implementación del filtro)
                        → caso4 (se copia caso3 y se migra a otro lenguaje)
caso5 es independiente: parte de código "heredado" sin specs (puede construirse en paralelo)
```

Cada carpeta `casoN/` es un proyecto autocontenido (tiene su propio repo de
specs, su propio documento de arquitectura y su propio código). Cuando un
caso "hereda" del anterior, el primer paso dentro de ese caso es copiar el
contenido del caso anterior como punto de partida, no reescribirlo desde
cero.

---

## 0. Qué debe existir en cada proyecto (antes de tocar la fase 1)

Por cada `casoN/`, la estructura de documentos que pide la metodología
(sección 2) es:

```
casoN/
  AGENTS.md                     ← documento de arquitectura y convenciones
                                    (o CLAUDE.md / .cursorrules — el archivo
                                    que tu asistente de IA cargue al iniciar sesión)
  docs/
    specs/
      README.md                 ← índice: capacidad → spec
      spec-pedidos.md
      spec-historial.md
    plan-<tema>-<fecha>.md       ← plan transitorio del cambio en curso
  src/...                        ← el código real
```

**Plantilla fija del spec** (copiar tal cual, sección 2 de la metodología):

```markdown
# Spec: <nombre de la capacidad>

**Estado:** desplegado | parcial | en desarrollo · **Última revisión:** YYYY-MM-DD

## Propósito
## Comportamiento
## Invariantes (no negociables)   ← cada uno con su porqué
## Decisiones                     ← "- YYYY-MM-DD: decisión — porqué"
## Fuera de alcance
## Referencias                    ← código, migraciones, endpoints, docs
```

`AGENTS.md` (documento de arquitectura, sección 6) debe como mínimo decir:
patrón arquitectónico elegido, stack, comandos de build/test, y la regla
**3.1 "specs primero"**: *antes de proponer un cambio, leer el spec de la
capacidad afectada en `docs/specs/`.*

---

## Caso 1 — Desde cero (`proyectos/caso1`)

**Contexto:** no existe nada; se construye el sistema de pedidos por
primera vez.

1. **Exploración** — no hay spec que leer (es el único caso donde se salta
   este paso). Anotar solo la idea inicial: "necesitamos gestionar
   pedidos: crearlos, verlos en un historial, cambiarles el estado".
2. **Propuesta de cambio** — crear `docs/plan-sistema-pedidos-<fecha>.md`
   con:
   - Delta = 100% del sistema (todo es nuevo).
   - Stack elegido (justificar brevemente; algo simple alcanza — p. ej.
     Node.js + Express + almacenamiento en memoria o SQLite — el objetivo
     de este ejercicio es probar la metodología, no construir un producto).
   - Tareas/fases (p. ej.: F0 modelo de pedido + crear pedido, F1
     historial, F2 cambio de estado).
   - Criterios de aceptación por capacidad (concretos: "POST /pedidos crea
     un pedido en estado `pendiente`", "GET /pedidos devuelve todos los
     pedidos creados", "PATCH /pedidos/:id/estado cambia el estado y lo
     refleja en el historial").
   - Pendientes de decisión, si los hay (resolverlos con el humano antes
     de construir).
3. **Aplicación del cambio** — construir el sistema completo y, en el
   mismo commit/MR, redactar:
   - `docs/specs/spec-pedidos.md` (capacidad "crear pedido" + "cambiar
     estado").
   - `docs/specs/spec-historial.md` (capacidad "ver historial").
   - `AGENTS.md` con el patrón arquitectónico y comandos.
   - `docs/specs/README.md` con la tabla capacidad → spec.
4. **Verificación y fusión** — contrastar lo construido contra los
   criterios de aceptación del plan (no hay nada previo que pueda
   romperse). Revisión humana del spec recién nacido. Commit final del
   caso1. Marcar el plan como **destilado** (lo construido ya vive en los
   specs).

**Entregable de salida de caso1** (lo que caso2 va a copiar): código +
`AGENTS.md` + `docs/specs/` con `spec-pedidos.md` y `spec-historial.md` en
`Estado: desplegado`.

---

## Caso 2 — Funcionalidad nueva (`proyectos/caso2`)

**Contexto:** el historial de pedidos ya existe como lista simple; se
agrega la capacidad de **filtrar por estado** (pendiente, enviado,
entregado, cancelado).

0. **Punto de partida:** copiar todo el contenido de `proyectos/caso1/`
   (código, `AGENTS.md`, `docs/specs/`) a `proyectos/caso2/`. Este paso no
   es una fase de la metodología, es la condición para que exista "un
   sistema ya existente con specs" que el caso requiere.
1. **Exploración** — leer `docs/specs/spec-historial.md`; confirmar que no
   tiene filtros y que agregar uno no choca con ningún invariante
   existente. Anotar el resultado (una o dos frases alcanza).
2. **Propuesta de cambio** — crear
   `docs/plan-filtro-estado-historial-<fecha>.md`:
   - Delta = **agregado** (filtro por estado).
   - Enfoque técnico (p. ej. reutilizar el componente/endpoint existente,
     filtrado en cliente para esta primera versión — se documenta como
     decisión, ver caso3).
   - Tareas.
   - Criterios de aceptación: "los 4 estados filtran correctamente", "sin
     filtro seleccionado la lista es idéntica a la actual".
3. **Aplicación del cambio** — construir el filtro y, **en el mismo MR**,
   agregar la sección "Filtrado por estado" a `spec-historial.md`
   (Comportamiento + Decisión fechada "filtrado en cliente" + Referencias
   al código nuevo).
4. **Verificación y fusión** — el filtro cumple los criterios + no hay
   regresión en el historial sin filtro. Revisión humana del **diff del
   spec** (no de todo el código). Merge. `docs/specs/README.md` no cambia
   de forma (la capacidad ya estaba indexada), pero si el spec cambió su
   `Última revisión`, reflejarlo.

**Entregable de salida de caso2:** lo mismo que caso1 + filtro en cliente +
`spec-historial.md` con la sección de filtrado y la decisión fechada.

---

## Caso 3 — Modificación de un requerimiento existente (`proyectos/caso3`)

**Contexto:** ya con el filtro implementado (caso2), el equipo descubre
que filtrar en el cliente no escala y decide que **debe resolverse en el
servidor**. El comportamiento observable no cambia.

0. **Punto de partida:** copiar `proyectos/caso2/` completo a
   `proyectos/caso3/`.
1. **Exploración** — ubicar en `spec-historial.md` la sección del filtro y
   la decisión "filtrado en cliente" que se va a reemplazar.
2. **Propuesta de cambio** — crear
   `docs/plan-filtro-estado-a-servidor-<fecha>.md`:
   - Aplicar la regla **3.2**: como el comportamiento observable **no
     cambia** (mismos 4 estados, mismo resultado), el delta solo toca
     *Decisiones* y *Referencias* del spec, no *Comportamiento*.
   - Enfoque técnico: nuevo endpoint de filtrado server-side.
   - Criterios de aceptación: "paridad exacta de resultados con el filtro
     actual para los 4 estados" + "tiempo de respuesta bajo un umbral
     definido (p. ej. <200ms con N pedidos)".
3. **Aplicación del cambio** — reemplazar la lógica de cliente por la
   llamada al servidor. En el mismo MR, actualizar en `spec-historial.md`
   **solo**:
   - *Decisiones*: `"- <fecha>: filtro pasa a servidor — el cliente no
     escala con N pedidos"`.
   - *Referencias*: nuevo endpoint.
   - *Comportamiento* queda igual (es la evidencia de que se aplicó bien
     la regla 3.2; si tuvieras que tocar Comportamiento, no sería este
     caso sino un delta "modificado" pleno).
4. **Verificación y fusión** — paridad para los 4 estados + nada que
   dependía del filtrado en cliente se rompió. Revisión humana del diff
   (chico: unas líneas de Decisiones/Referencias). Merge.

**Entregable de salida de caso3:** sistema con filtro server-side +
`spec-historial.md` con la decisión fechada de la migración de
implementación.

---

## Caso 4 — Migración de lenguaje (`proyectos/caso4`)

**Contexto:** el sistema de pedidos, ya maduro, se reescribe de su stack
original (p. ej. Node.js) a otro lenguaje (p. ej. Go), **sin cambiar
comportamiento**.

0. **Punto de partida:** copiar `proyectos/caso3/` completo a
   `proyectos/caso4/` (o al menos su `docs/specs/`, que es lo que realmente
   viaja a este caso — el código viejo se usa solo de referencia durante
   la reescritura).
1. **Exploración** — leer **todos** los specs (`spec-pedidos.md`,
   `spec-historial.md`) como inventario completo de lo que el sistema debe
   seguir haciendo. No se lee el código original en busca de qué hacer;
   se lee el spec.
2. **Propuesta de cambio** — crear `docs/plan-migracion-go-<fecha>.md`:
   - Delta = **nulo** (ningún comportamiento nuevo).
   - Estrategia de migración módulo por módulo (empezar por historial,
     luego pedidos), con equivalencias de librerías entre el stack viejo y
     el nuevo.
   - **Tests de caracterización** derivados de cada spec (uno por cada
     ítem de *Comportamiento* e *Invariante*), que deben poder correr
     contra ambas implementaciones (vieja y nueva) y dar el mismo
     resultado.
3. **Aplicación del cambio** — reescribir el módulo de historial (incluido
   el filtro server-side) en el nuevo lenguaje, **guiado por el spec, no
   por la sintaxis del código original**. En el mismo MR, el spec **solo**
   actualiza *Referencias* (nuevas rutas/estructura de carpetas) y agrega
   una *Decisión* fechada de la migración ("- <fecha>: módulo historial
   migrado a Go — plan de migración X").
4. **Verificación y fusión** — correr los tests de caracterización contra
   la implementación nueva; deben pasar igual que contra la vieja
   (paridad de comportamiento, no solo lectura del diff). Merge módulo por
   módulo (cada módulo migrado es su propio MR/cambio, según regla 3.3).
   Repetir el ciclo para el módulo de pedidos.

**Entregable de salida de caso4:** el sistema completo reescrito en el
nuevo lenguaje, con los mismos specs (solo Referencias/Decisiones
actualizadas) y una suite de tests de caracterización que sirve de
evidencia de paridad.

---

## Caso 5 — Código sin spec previo (`proyectos/caso5`)

**Contexto:** se "hereda" el sistema de pedidos, construido sin
documentación formal, y se quiere aplicar la metodología desde ahora. Este
caso es independiente de los anteriores.

0. **Punto de partida:** construir (o copiar y luego *borrar los
   `docs/specs/` y el `AGENTS.md`* de) una versión del sistema de pedidos
   **sin ningún spec**, simulando código heredado. Puede incluir a
   propósito un bug pequeño y disimulado (p. ej. el filtro no excluye
   bien los pedidos `cancelado`) para poder probar el paso de revisión
   humana de la Fase 0.
1. **Fase 0 (una sola vez, por capacidad, incremental — sección 4):**
   - El LLM analiza el código de **una** capacidad a la vez (empezar por
     historial) y redacta un **spec candidato**
     (`docs/specs/spec-historial.md`, `Estado: en desarrollo`), marcando
     explícitamente en cada afirmación si está **CONFIRMADO** (hay test o
     doc que lo respalda) o **INFERIDO** (solo se dedujo leyendo el
     código).
   - No hacer "todo el sistema de una vez": repetir capacidad por
     capacidad (historial, luego pedidos).
2. **Revisión humana (obligatoria, no opcional)** — dirigida a lo
   **INFERIDO**: ¿es comportamiento correcto o un bug? En este ejercicio,
   detectar el bug sembrado en el punto 0 (p. ej. "el filtro, tal como
   está documentado, no excluye bien los cancelados").
   - Si es un bug: **no se documenta como comportamiento válido**. Se
     corrige el spec para reflejar el comportamiento *correcto* y el fix
     del código va en un **MR separado** del baseline (para que el diff
     del spec quede limpio y revisable).
   - Si es código muerto o un servicio sin consumidores: se elimina en un
     MR separado también.
3. **Spec validado** — una vez confirmado/corregido, el spec pasa a
   `Estado: desplegado`. Cualquier apunte previo (memoria de sesiones,
   notas sueltas) pasa a ser **caché**: se puede conservar como índice,
   pero deja de mandar (precedencia: spec > arquitectura > memoria/apuntes).
4. **De ahí en adelante** — cualquier cambio sobre la capacidad ya
   *baseline-ada* sigue el ciclo normal (Caso 2 si es algo agregado, Caso
   3 si modifica algo existente). Las demás capacidades (pedidos) pasan
   por su propia Fase 0 cuando se toquen, o en un baseline dedicado si se
   quiere cerrar todo de una vez (siempre incremental, nunca "todo junto").

**Entregable de salida de caso5:** `docs/specs/spec-historial.md` (y luego
`spec-pedidos.md`) con `Estado: desplegado`, un MR de fix separado para el
bug encontrado, y `AGENTS.md` recién creado con la regla 3.1 ("specs
primero") para que los próximos cambios ya no repitan la Fase 0.

---

## Checklist de entregables por caso

| Caso | ¿Parte de? | Documento que nace/cambia | Evidencia de verificación |
|---|---|---|---|
| 1 | nada | `spec-pedidos.md`, `spec-historial.md`, `AGENTS.md`, índice | cumple criterios propuestos (nada que romper) |
| 2 | caso1 | sección nueva en `spec-historial.md` | filtro funciona + no-regresión + diff de spec revisado |
| 3 | caso2 | *Decisiones* + *Referencias* en `spec-historial.md` (Comportamiento intacto) | paridad exacta + nada dependiente se rompió |
| 4 | caso3 | *Referencias* + *Decisión* de migración (Comportamiento intacto) | tests de caracterización en verde en el nuevo stack |
| 5 | código heredado propio | `spec-historial.md` nace vía Fase 0 (`en desarrollo` → `desplegado`) | revisión humana completa de lo inferido + bug corregido en MR separado |

## Estado actual de cada carpeta (ya construido)

Los 5 casos ya tienen el mínimo descrito arriba implementado y verificado:

| Caso | Stack | Tests | Resultado |
|---|---|---|---|
| `caso1/` | Node.js (sin deps) | `npm test` | 9/9 ✔ |
| `caso2/` | Node.js (sin deps) | `npm test` | 13/13 ✔ |
| `caso3/` | Node.js (sin deps) | `npm test` | 13/13 ✔ |
| `caso4/` | Python (stdlib) + Node archivado en `legacy-node/` | `python -m unittest discover -s tests -v` | 13/13 ✔ (paridad con los 13/13 de `legacy-node`) |
| `caso5/` | Node.js (sin deps) | `npm test` | 6/6 ✔ (2 heredados + 4 nacidos en la Fase 0) |

Nota sobre caso4: la metodología usa Go como ejemplo de migración; acá se
usó Python porque es el runtime disponible en este entorno (Go no estaba
instalado). Documentado en `caso4/docs/plan-migracion-python-2026-09-10.md`.

Cada carpeta incluye su propio `README.md` con los comandos exactos para
correr tests y la demo manual (`src/cli.js` o `src/cli.py`).

## Notas de ejecución generales

- **Un cambio = un MR chico** (regla 3.3). Dentro de cada `casoN`, no hace
  falta simular MRs de Git reales si no quieren llevar el repo tan lejos,
  pero sí conviene hacer **un commit por fase** (Propuesta, Aplicación,
  Verificación) para poder mirar después el diff del spec de forma
  aislada, que es justo lo que la metodología pide revisar.
- **Criterios de aceptación antes de construir** (regla 3.4): redactarlos
  en el plan de cada caso antes de escribir código, no después.
- El **plan no se archiva, se destila** (sección 2): al cerrar cada caso,
  lo que se construyó pasa al spec y el archivo
  `docs/plan-*.md` puede quedar en la carpeta solo como registro histórico
  transitorio (no hace falta borrarlo, pero no manda nada una vez fusionado).
- Si quieren una verificación más estricta (mitigación 3 de la sección
  "Por qué la verificación necesita un humano mínimo"), pueden pedirle a
  una sesión/agente distinto que revise cada caso recibiendo solo spec +
  criterios + diff, sin el historial de construcción.
