# Guía paso a paso — Metodología SDD Spec-Anchored aplicada a 5 casos

> **Fuente única de verdad:** `../metodologia-sdd-spec-anchored_v3.md`.
> Esta guía no reemplaza ese documento, lo traduce en acciones concretas
> **y en el prompt exacto para dárselo al agente en cada fase**. Cada
> sección cita entre paréntesis la parte del documento original de la que
> sale, para que puedas verificar que no se dejó nada afuera. Si algo acá
> contradice el original, manda el original.

---

## 0. Lo que no cambia entre casos (leer una sola vez, aplica siempre)

### 0.1 La regla de anclaje (sección 1)

> El MR que cambia comportamiento toca su spec en el mismo commit.

El spec no se actualiza "después": se actualiza como parte del cambio, y
el gate que lo garantiza es el merge del MR (o, en este ejercicio sin MRs
reales, el commit que cierra la fase).

### 0.2 El ciclo de 4 fases y sus gates (sección 1)

| Fase | Qué responde | Gate |
|---|---|---|
| Exploración *(obligatoria si existe spec de la capacidad)* | ¿Vale la pena el cambio? ¿Cómo encaja con lo existente? ¿Qué invariantes lo restringen? | — |
| Propuesta de cambio | ¿Qué se cambia, por qué, cómo, en qué tareas y cómo sabremos que quedó bien? | Aprobación humana del plan |
| Aplicación del cambio | Construcción efectiva + actualización del spec | Build/lint/tests en verde |
| Verificación y fusión | ¿Lo construido coincide con lo propuesto? ¿El spec describe lo que corre? | Revisión humana del diff del spec + merge |

Esta guía te da, para cada caso y cada fase, **el prompt a pegarle al
agente** y **qué gate tenés que cerrar vos antes de avanzar a la
siguiente fase**. No se avanza de fase sin cerrar el gate.

### 0.3 Los documentos y quién manda (sección 2)

| Documento | Cantidad | Vida | Qué contiene |
|---|---|---|---|
| **Spec** (`docs/specs/spec-<capacidad>.md`) | Uno por capacidad | Persistente | Comportamiento AS-BUILT, invariantes con su porqué, decisiones fechadas, fuera de alcance, referencias |
| **Índice de specs** (`docs/specs/README.md`) | 1 | Persistente | Convención + tabla capacidad → spec |
| **Plan** (`docs/plan-<tema>-<fecha>.md`) | Uno por cambio | Transitorio | Contexto, delta, decisiones tomadas, enfoque técnico, tareas, criterios de aceptación, pendientes de decisión |
| **Documento de arquitectura** (`AGENTS.md` en este ejercicio) | 1 por proyecto | Persistente | Patrón arquitectónico, límites, invariantes transversales, restricciones del entorno, comandos |

**Precedencia si dos documentos difieren:** `spec` > `AGENTS.md` >
memoria de sesión / apuntes / docs históricos.

**Por qué un spec por capacidad y no uno central (sección 2):** un solo
documento no escala — todo cambio tocaría el mismo archivo (conflictos
entre cambios paralelos) y el agente tendría que cargar el sistema
entero para cualquier tarea. Regla equivalente: **cada comportamiento
vive en exactamente un spec.**

**Plan vs. spec (sección 2):** el plan puede tener alternativas
descartadas, dudas y pendientes; el spec no — describe solo lo que corre.
**El plan no se archiva: se destila.** Lo que se construyó pasa al spec
(comportamiento → *Comportamiento*, decisiones → *Decisiones* con fecha,
lo excluido → *Fuera de alcance*). Lo que no se implementó no entra al
spec. Un plan con fases (F0, F1, F2…) alimenta el spec en varios cambios:
nace con `Estado: en desarrollo` y pasa a `parcial` / `desplegado` a
medida que entran las fases.

**Formato fijo del spec (copiar tal cual, sección 2):**

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

Las dos secciones que más valor aportan trabajando con un LLM son
**Invariantes con su porqué** y **Decisiones fechadas**: evitan que una
sesión futura "optimice" algo que fue una decisión deliberada. *Un
invariante sin porqué es una regla que el siguiente agente va a
cuestionar* — nunca dejes un invariante sin su "por qué".

**Qué NO va en un spec (sección 2):** checklists paso a paso (van en
scripts y sus docs), estados transitorios ("pendiente de deploy"), y
detalles que el código expresa mejor (firmas, tipos) — se referencian, no
se duplican.

### 0.4 Reglas operativas (sección 3 — aplican a TODO cambio, en cualquier caso)

**3.1 Specs primero.** Al iniciar cualquier cambio, el agente lee el spec
de la capacidad afectada **antes** de proponer nada. Por eso `AGENTS.md`
debe decir explícitamente esta regla (ya está escrita así en cada
`casoN/AGENTS.md` de este ejercicio) — así se aplica en cada sesión sin
depender de que alguien se acuerde de pedirlo.

**3.2 Qué es y qué no es un cambio de comportamiento** — solo lo de la
izquierda obliga a tocar *Comportamiento* del spec:

| Toca spec (Comportamiento) | No toca spec (o solo *Decisiones*/*Referencias*) |
|---|---|
| Nueva capacidad o subcapacidad | Refactor interno sin efecto observable |
| Cambio en lo que el usuario/sistema observa | Estilos, textos sin cambio semántico |
| Nuevo invariante o decisión que restringe cambios futuros | Actualización de dependencias sin cambio de comportamiento |
| Eliminación de una capacidad | Cambio de implementación con el mismo comportamiento |

**3.3 Tamaño del cambio.** Un cambio = un MR/commit de vida corta (días,
no semanas) que deja el proyecto desplegable. Un requerimiento grande se
parte en fases con un plan padre; cada fase es un cambio con su propio
MR. Si una fase toca un punto sensible, va en cambio separado (y, si
aplica, con un modo *dry-run* antes de activarse).

**3.4 Criterios de aceptación antes de construir.** La propuesta incluye
cómo se va a verificar el cambio (casos concretos, no "funciona bien").
Se escriben **antes** del código, para que la verificación no la defina
quien construyó.

**3.5 Enforcement.** Por convención mientras el equipo sea de 1-3
personas. Si crece: checklist en el template de MR ("¿este MR cambia
comportamiento? → ¿tocó su spec?") y, opcionalmente, un check de CI que
exija cambios en `docs/specs/` cuando el diff toca código de una
capacidad con spec.

### 0.5 Arquitectura y decisiones estructurales (sección 6)

El patrón arquitectónico, los límites de cada servicio y cómo se
comunican **no son delta de comportamiento** y no van enterrados en el
plan de un solo cambio: viven en `AGENTS.md` (documento de arquitectura y
convenciones), único por proyecto.

- Se define en el primer cambio de un Caso 1 (o en la Fase 0 de un Caso 5).
- Se **lee** como contexto obligatorio en la Exploración/Propuesta de
  cualquier cambio (regla 3.1).
- Solo se actualiza mediante un cambio **dedicado** a arquitectura, nunca
  como efecto lateral de un cambio funcional.
- Invariantes transversales (concurrencia, seguridad, portabilidad) viven
  en `AGENTS.md`; los invariantes de **una** capacidad viven en su spec.

### 0.6 Por qué la verificación necesita un humano mínimo (sección 5)

Dejar que el mismo agente que construyó también verifique contra una spec
que él mismo redactó es un punto ciego que se verifica a sí mismo.
Mitigaciones, de menor a mayor costo — usalas en este orden según cuánto
te importa el cambio:

1. **Criterios de aceptación escritos antes de construir** (regla 3.4) — siempre.
2. **Vos revisás el diff del spec**, no todo el código — mínimo obligatorio.
3. **Verificación con contexto limpio**: otra sesión/agente que solo
   recibe spec + criterios + diff, sin el historial de la construcción —
   usalo en cambios que te generen dudas (caso3 y caso4 de este ejercicio
   son buenos candidatos, porque tocan invariantes o piden paridad
   exacta).

### 0.7 Los 5 escenarios y su tabla de trazabilidad (secciones 4 y 5)

| Caso | Punto de partida |
|---|---|
| 1 — Desde cero | No hay sistema ni specs |
| 2 — Funcionalidad nueva | Ya existe sistema + specs; se agrega algo nuevo |
| 3 — Modificación de requerimiento existente | El comportamiento que cambia ya está en un spec |
| 4 — Migración de lenguaje | Se reescribe en otro stack sin cambiar comportamiento |
| 5 — Código sin spec previo | Hay código, pero nunca se documentó formalmente |

Trazabilidad (quién aporta qué, sección 5) — esto es lo que determina
**qué tenés que poner vos en cada prompt** vs. **qué le toca generar al
agente**:

| Fase | Lo pones vos (input humano) | Lo genera el agente |
|---|---|---|
| Exploración | Idea/necesidad, contexto de negocio | Resumen del problema + camino sugerido + invariantes que lo restringen |
| Propuesta de cambio | Instrucción en lenguaje natural, mockups, stack si se fija, **respuestas a las decisiones abiertas** | Plan: delta + enfoque técnico + tareas + criterios de aceptación + pendientes |
| Aplicación del cambio | Aprobación del plan | Código + spec actualizado en el mismo cambio |
| Verificación y fusión | Revisión del diff del spec (mínimo) + decidir el merge | Reporte de coincidencia/discrepancias contra los criterios |

**Regla general:** intención, criterio de negocio, decisiones visuales y
resolución de decisiones abiertas = tuyo. Redacción, código, comparación
y destilado = del agente.

---

## 1. Cómo usar esta guía

Para cada caso de abajo, en cada fase vas a encontrar un bloque **"Prompt
para el agente"** (pegalo tal cual, ajustando rutas si cambiaste algo) y
un bloque **"Gate — qué revisás vos antes de seguir"**. No pases a la
fase siguiente sin cerrar el gate: es literalmente lo que dice la tabla
de la sección 0.2.

Trabajá **una carpeta a la vez** y en orden, porque caso2 parte de
caso1, caso3 de caso2 y caso4 de caso3 (caso5 es independiente y se puede
hacer en paralelo). Al empezar cada caso, decile al agente en qué carpeta
tiene que pararse (`cd proyectos/casoN`) para que no mezcle specs de
distintos casos.

---

## Caso 1 — Desde cero (`proyectos/caso1`)

**Contexto (sección 7):** no existe nada; se construye el sistema de
pedidos por primera vez.

**Trazabilidad de este caso:** Exploración — "no hay spec que leer".
Propuesta — delta = 100% del sistema. Aplicación — nacen los specs y
`AGENTS.md`. Verificación — se valida solo contra lo recién propuesto
(nada previo que romper).

### Fase 1 — Exploración

No hay spec que leer (único caso donde este paso casi no tiene insumo
previo), pero igual le pedís al agente que dé el resumen y el camino
sugerido que exige la trazabilidad de la sección 5.

**Prompt:**
```
Estamos en proyectos/caso1, un proyecto vacío. Vamos a construir un
sistema de gestión de pedidos desde cero: crear pedido, ver historial,
cambiar estado. Todavía no existe AGENTS.md ni docs/specs/.

Fase de Exploración de la metodología SDD spec-anchored (no hay spec que
leer en este caso). Dame:
1. Un resumen breve de las capacidades que identificás (pedidos,
   historial, y si ves alguna otra).
2. Qué invariantes de negocio deberían quedar fijados desde el inicio.
3. Un camino sugerido de implementación (fases chicas, no un monolito).

Todavía no escribas código ni el plan formal.
```

**Gate:** ninguno formal (la tabla de fases no exige gate acá), pero
confirmá que el resumen tiene sentido para vos antes de pedir el plan.

### Fase 2 — Propuesta de cambio

Acá vos aportás el stack si lo querés fijar (o dejás que lo proponga) y
cualquier decisión de negocio. El agente redacta el plan.

**Prompt:**
```
Seguimos en proyectos/caso1. Redactá el plan de este cambio en
docs/plan-sistema-pedidos-<fecha-de-hoy>.md, siguiendo el formato de
plan de la metodología (contexto, delta, stack elegido, enfoque técnico,
tareas/fases, criterios de aceptación concretos, pendientes de decisión).

Delta = 100% del sistema (Caso 1, desde cero).
Stack: Node.js sin dependencias externas, usando node:test para pruebas
(sin instalar nada). [Ajustá esto si querés otro stack.]

Los criterios de aceptación tienen que ser casos concretos y verificables
(regla 3.4 de la metodología), no "funciona bien". Pensalos por
capacidad: crear pedido, listar historial, cambiar estado.

No escribas código todavía — solo el plan.
```

**Gate — qué revisás vos antes de seguir:**
- [ ] El delta declarado es correcto (100%, ya que es Caso 1).
- [ ] Los criterios de aceptación son casos concretos, no vagos.
- [ ] No quedan "pendientes de decisión" sin resolver (si quedan,
      respondelos vos antes de aprobar).
- [ ] **Aprobás el plan explícitamente** ("dale, procedé con la
      aplicación") — ese es el gate de esta fase.

### Fase 3 — Aplicación del cambio

**Prompt:**
```
Plan aprobado. Aplicá el cambio en proyectos/caso1:

1. Construí el código según el plan aprobado en
   docs/plan-sistema-pedidos-<fecha>.md.
2. En el MISMO cambio, redactá:
   - docs/specs/spec-pedidos.md
   - docs/specs/spec-historial.md
   (formato fijo: Propósito, Comportamiento, Invariantes con su porqué,
   Decisiones fechadas, Fuera de alcance, Referencias — sección 2 de la
   metodología. No documentes checklists paso a paso ni detalles que el
   código ya expresa.)
3. Redactá AGENTS.md como documento de arquitectura: patrón elegido,
   stack, comandos, y la regla 3.1 ("specs primero") explícita para que
   cualquier sesión futura la lea antes de proponer un cambio.
4. Creá docs/specs/README.md como índice (capacidad → spec).
5. Corré los tests y confirmame que quedan en verde.
```

**Gate — qué revisás vos antes de seguir:**
- [ ] Build/lint/tests en verde (pedile al agente el output, no le
      creas de palabra).
- [ ] Los specs nuevos existen y siguen el formato fijo.
- [ ] `AGENTS.md` incluye la regla 3.1 en texto explícito.

### Fase 4 — Verificación y fusión

**Prompt:**
```
Contrastá lo construido en proyectos/caso1 contra los criterios de
aceptación del plan (docs/plan-sistema-pedidos-<fecha>.md). Como es
Caso 1, no hay nada previo que pueda romperse — validá solo lo nuevo.
Mostrame un resumen: qué criterio se cumple, con qué evidencia (qué test
lo prueba).
```

**Gate humano (obligatorio, sección 0.6):**
- [ ] Leíste el diff/contenido de `docs/specs/spec-pedidos.md` y
      `docs/specs/spec-historial.md` completo (nacen ahora, así que es
      lectura completa, no un diff chico).
- [ ] Cada invariante tiene su "por qué".
- [ ] Marcás el plan como **destilado** (lo construido ya vive en los
      specs) y das el visto bueno final de este caso.

---

## Caso 2 — Funcionalidad nueva (`proyectos/caso2`)

**Contexto (sección 7):** el historial ya existe como lista simple; se
agrega **filtrar por estado**.

**Trazabilidad de este caso:** Exploración — se leen los specs vecinos
para confirmar que no hay conflicto. Propuesta — delta **agregado**.
Aplicación — código nuevo + spec nuevo/sección nueva en el mismo cambio.
Verificación — lo nuevo + no-regresión.

### Paso 0 — Punto de partida (no es una fase de la metodología)

```bash
cp -r proyectos/caso1/. proyectos/caso2/
```

Esto no es opcional saltearlo: sin esto no existe "un sistema ya
existente con specs", que es la precondición de este caso.

### Fase 1 — Exploración

**Prompt:**
```
Estamos en proyectos/caso2 (copia de caso1). Fase de Exploración: leé
docs/specs/spec-historial.md completo. Decime:
1. ¿Tiene ya algún filtro o algo parecido?
2. ¿Agregar un filtro por estado choca con algún invariante existente
   de este spec o del de spec-pedidos.md?
Dame un resumen corto, no toques nada todavía.
```

**Gate:** confirmá que el resumen del agente coincide con lo que decís
vos que debería pasar (no hay conflicto) antes de pedir el plan.

### Fase 2 — Propuesta de cambio

**Prompt:**
```
Redactá el plan en docs/plan-filtro-estado-historial-<fecha>.md:
- Delta: AGREGADO (filtro por estado: pendiente, enviado, entregado,
  cancelado).
- Enfoque técnico: filtrado del lado del cliente (fuera de
  listarHistorial, sobre el historial ya obtenido) — es la opción más
  simple para el volumen actual de pedidos (YAGNI); documentá esto como
  decisión, no la mezcles en el enfoque técnico.
- Tareas concretas.
- Criterios de aceptación (regla 3.4): los 4 estados filtran
  correctamente; sin filtro el resultado es idéntico al historial
  completo; filtrar por un estado sin pedidos da lista vacía, no error.

No escribas código todavía.
```

**Gate:**
- [ ] El delta dice explícitamente "agregado".
- [ ] Los criterios cubren los 4 estados + el caso "sin filtro".
- [ ] Aprobás el plan.

### Fase 3 — Aplicación del cambio

**Prompt:**
```
Aplicá el cambio en proyectos/caso2:
1. Construí el filtro según el plan aprobado.
2. En el MISMO cambio, agregá a docs/specs/spec-historial.md una sección
   nueva dentro de *Comportamiento* describiendo el filtrado (sin
   mencionar la implementación — eso va en *Decisiones*), más una
   Decisión fechada de hoy explicando que el filtro es del lado del
   cliente y por qué.
3. Corré los tests y confirmame que quedan en verde (los viejos +
   los nuevos).
```

**Gate:**
- [ ] Tests en verde.
- [ ] *Comportamiento* del spec describe el filtro sin filtrar detalles
      de implementación (esos van solo en *Decisiones* — importa para
      que caso3 pueda cambiar la implementación tocando solo
      *Decisiones*/*Referencias*, regla 3.2).

### Fase 4 — Verificación y fusión

**Prompt:**
```
Contrastá el filtro construido contra los criterios de aceptación del
plan. Además confirmá que el historial SIN filtro sigue devolviendo
exactamente lo mismo que en caso1 (no-regresión). Mostrame el resultado.
```

**Gate humano:**
- [ ] Revisaste el **diff** de `docs/specs/spec-historial.md` (no todo
      el código) — es la sección nueva + la decisión fechada.
- [ ] No-regresión confirmada.
- [ ] Merge/commit final de este caso.

---

## Caso 3 — Modificación de un requerimiento existente (`proyectos/caso3`)

**Contexto (sección 7):** con el filtro ya implementado (caso2), el
equipo decide que filtrar en cliente no escala y **debe resolverse en el
servidor**. El comportamiento observable **no cambia**.

**Trazabilidad de este caso:** Exploración — se ubica la porción puntual
del spec que cambia. Propuesta — delta **modificado/eliminado**; declara
si toca un invariante. Verificación — la más exigente: nuevo
comportamiento (si lo hubiera) + impacto en lo dependiente.

### Paso 0 — Punto de partida

```bash
cp -r proyectos/caso2/. proyectos/caso3/
```

### Fase 1 — Exploración

**Prompt:**
```
Estamos en proyectos/caso3 (copia de caso2). Fase de Exploración: ubicá
en docs/specs/spec-historial.md la sección del filtro y la Decisión
fechada "filtrado en cliente". Confirmame: ¿el *Comportamiento* del spec
menciona dónde se implementa el filtro, o solo describe el resultado
observable? Necesito saber si este cambio va a tocar *Comportamiento* o
solo *Decisiones*/*Referencias* (regla 3.2 de la metodología).
```

**Gate:** con la respuesta del agente, confirmá vos mismo (regla 3.2) que
como el resultado observable no cambia, el delta es
"modificado-implementación", no "modificado-comportamiento".

### Fase 2 — Propuesta de cambio

**Prompt:**
```
Redactá el plan en docs/plan-filtro-estado-a-servidor-<fecha>.md:
- El comportamiento observable NO cambia (mismos 4 estados, mismos
  resultados). Aplicá la regla 3.2: el delta solo va a tocar *Decisiones*
  y *Referencias* del spec, *Comportamiento* queda intacto.
- Enfoque técnico: mover el filtrado a listarHistorial (o el endpoint
  equivalente), resuelto del lado del servidor.
- Criterios de aceptación: paridad EXACTA de resultados con el filtro
  actual para los 4 estados, y (si aplica) tiempo de respuesta bajo un
  umbral.

No escribas código todavía.
```

**Gate:**
- [ ] El plan declara explícitamente que *Comportamiento* no cambia.
- [ ] Los criterios piden paridad exacta, no "funciona parecido".
- [ ] Aprobás el plan.

### Fase 3 — Aplicación del cambio

**Prompt:**
```
Aplicá el cambio en proyectos/caso3:
1. Reemplazá la lógica de filtrado en cliente por la resolución en
   servidor. Eliminá el módulo de filtrado en cliente si queda sin uso
   (código muerto).
2. En docs/specs/spec-historial.md, actualizá SOLO *Decisiones* (agregá
   la decisión fechada de hoy: "filtro pasa a servidor — el cliente no
   escala") y *Referencias*. NO toques *Comportamiento*: si te parece que
   tenés que tocarlo, parate y avisame antes de seguir, porque significa
   que esto no es un Caso 3 sino un delta "modificado" pleno.
3. Corré los tests (incluida la paridad con el filtro anterior) y
   confirmame que quedan en verde.
```

**Gate:**
- [ ] *Comportamiento* del spec quedó **byte a byte igual** (revisalo
      vos, no le preguntes solo al agente).
- [ ] Tests de paridad en verde.

### Fase 4 — Verificación y fusión

**Prompt:**
```
Confirmá paridad exacta del filtro para los 4 estados frente a caso2, y
que nada que dependía del filtrado en cliente quedó roto (buscá
referencias sueltas al módulo eliminado). Mostrame el resultado.
```

**Gate humano (el más exigente de los 5, según la trazabilidad):**
- [ ] Revisaste el diff del spec: solo *Decisiones* + *Referencias*
      cambiaron.
- [ ] Confirmaste que no quedó código muerto ni referencias rotas.
- [ ] Considerá acá la mitigación 3 de la sección 0.6 (verificación con
      contexto limpio): pedile a una sesión nueva que revise spec +
      criterios + diff sin el historial de la construcción, ya que este
      caso toca un invariante implícito (paridad de comportamiento).
- [ ] Merge/commit final.

---

## Caso 4 — Migración de lenguaje (`proyectos/caso4`)

**Contexto (sección 7):** el sistema, ya maduro, se reescribe en otro
stack **sin cambiar comportamiento**. La metodología usa Go como ejemplo;
en este entorno no hay Go instalado, así que se migra a **Python**
(dejalo así o cambiá el stack destino si tenés otro disponible — lo que
importa es que el prompt lo declare como decisión explícita).

**Trazabilidad de este caso:** Exploración — se leen TODOS los specs como
inventario. Propuesta — delta **nulo**; protagonismo del enfoque técnico
y los tests de caracterización. Verificación — paridad de comportamiento,
tests de caracterización en verde, no solo lectura.

### Paso 0 — Punto de partida

```bash
cp -r proyectos/caso3/. proyectos/caso4/
```

### Fase 1 — Exploración

**Prompt:**
```
Estamos en proyectos/caso4 (copia de caso3). Fase de Exploración para una
migración de lenguaje: leé TODOS los specs en docs/specs/ como inventario
completo de lo que el sistema tiene que seguir haciendo. No leas el
código fuente todavía buscando "qué hacer" — el spec es la fuente de
verdad para la migración, no la sintaxis original. Confirmame que
entendiste el inventario completo (capacidades, invariantes, decisiones
vigentes).
```

**Gate:** confirmá que el agente listó TODAS las capacidades existentes
(pedidos + historial), no solo una.

### Fase 2 — Propuesta de cambio

**Prompt:**
```
Redactá el plan en docs/plan-migracion-python-<fecha>.md (o el stack que
elijas):
- Delta: NULO (ningún comportamiento nuevo).
- Estrategia de migración módulo por módulo, guiada por los specs, no por
  el código Node.
- Equivalencias de librerías/runner de tests.
- Tests de caracterización: derivados de CADA ítem de *Comportamiento* e
  *Invariantes* de cada spec, para que corran (conceptualmente) contra
  ambas implementaciones y den el mismo resultado.
- Criterios de aceptación: los tests de caracterización en el nuevo
  stack pasan igual que en el original; el spec al final solo va a
  actualizar *Referencias* y una *Decisión* fechada de la migración.

No escribas código todavía.
```

**Gate:**
- [ ] El plan declara delta nulo.
- [ ] Hay una lista concreta de tests de caracterización, uno por cada
      ítem de comportamiento/invariante de los specs (no "escribir
      tests" en abstracto).
- [ ] Aprobás el plan.

### Fase 3 — Aplicación del cambio

**Prompt:**
```
Aplicá la migración en proyectos/caso4:
1. Archivá el código Node.js actual en legacy-node/ (referencia, no se
   ejecuta más como implementación viva).
2. Reescribí cada módulo en el stack nuevo, guiándote por
   docs/specs/spec-pedidos.md y docs/specs/spec-historial.md — no por
   legacy-node/src/*.js.
3. Escribí los tests de caracterización del plan.
4. En docs/specs/*.md, actualizá SOLO *Referencias* (nuevas rutas) y
   agregá una *Decisión* fechada de hoy sobre la migración. NO toques
   *Comportamiento* ni *Invariantes*.
5. Corré la suite nueva Y la suite vieja (legacy-node) y mostrame ambos
   resultados lado a lado.
```

**Gate:**
- [ ] Misma cantidad de tests / mismos casos cubiertos en ambos stacks.
- [ ] Ambas suites en verde.
- [ ] *Comportamiento* e *Invariantes* de los specs, sin cambios.

### Fase 4 — Verificación y fusión

**Prompt:**
```
Mostrame, capacidad por capacidad, la paridad entre los tests de
caracterización del stack nuevo y los tests originales de legacy-node:
misma cantidad de casos, mismo resultado. Esto es la verificación de
Caso 4 (paridad de comportamiento, no solo lectura de diff).
```

**Gate humano:**
- [ ] Paridad confirmada con evidencia (no "el agente dice que sí").
- [ ] Diff del spec: solo *Referencias* + *Decisión* de migración.
- [ ] Si el sistema tuviera más módulos, repetirías este ciclo
      módulo por módulo (regla 3.3: cada módulo migrado es su propio
      cambio) — en este ejercicio se hizo junto por ser un sistema chico,
      dejalo anotado en el plan si es tu caso real.
- [ ] Merge/commit final.

---

## Caso 5 — Código sin spec previo (`proyectos/caso5`)

**Contexto (sección 4, "Caso 5 — Fase 0"):** se hereda código sin
documentación formal y se quiere aplicar la metodología desde ahora. Es
**independiente** de los casos 1-4. Antes del ciclo normal se ejecuta,
**una sola vez, por capacidad e incremental** (nunca "todo el sistema de
una vez"), la Fase 0 de ingeniería inversa de especificación.

### Paso 0 — Punto de partida

Un sistema "heredado": código sin `AGENTS.md` ni `docs/specs/`, con como
mucho algún test suelto preexistente (no formal, no completo). Si estás
haciendo este ejercicio para practicar, pedile al agente que simule esto
con un bug pequeño y disimulado en alguna capacidad, para poder probar de
verdad el paso de revisión humana.

### Fase 0 — Ingeniería inversa de especificación (por capacidad)

**Paso 0.1 — Candidato.**

**Prompt:**
```
Estamos en proyectos/caso5, un proyecto heredado sin docs/specs/ ni
AGENTS.md. Vamos a aplicar la Fase 0 de la metodología SDD spec-anchored,
UNA capacidad a la vez — empezá por "historial", no toques "pedidos"
todavía.

Analizá src/historial.js (y los tests existentes, si los hay, en
test/historial.test.js). Redactá un spec CANDIDATO en
docs/specs/spec-historial.md, Estado: en desarrollo, con el formato fijo
de spec (Propósito, Comportamiento, Invariantes, Decisiones, Fuera de
alcance, Referencias). En *Comportamiento*, marcá cada afirmación como
[CONFIRMADO] (hay un test que lo respalda) o [INFERIDO] (lo dedujiste
solo leyendo el código). No corrijas nada todavía, ni siquiera si te
parece raro — documentá lo que el código HACE, marcado como inferido.
```

**Gate:** ninguno formal todavía — esto es insumo para la revisión, no el
spec final.

**Paso 0.2 — Revisión humana (obligatoria, sección 4: "no es opcional").**

Esto lo hacés **vos**, no se lo delegás al agente (aunque podés pedirle
ayuda para que te resalte qué mirar):

**Prompt (para que te ayude a enfocar la revisión):**
```
De todo lo que marcaste como [INFERIDO] en el spec candidato de
historial, listame cada ítem por separado y decime, para cada uno, qué
pasaría si estuviera mal (qué reporte o funcionalidad se vería afectado).
No me digas si es correcto o no — quiero decidirlo yo.
```

**Checklist de revisión humana (vos, no el agente):**
- [ ] Revisaste cada ítem [INFERIDO] uno por uno.
- [ ] Para cada uno: ¿es comportamiento correcto o un bug?
- [ ] Si es un bug: **no se documenta como comportamiento válido.**

**Paso 0.3 — Si encontraste un bug: fix separado del baseline.**

**Prompt:**
```
Encontré que [describí el bug, ej: "el filtro por estado siempre incluye
los pedidos cancelado, sin importar qué estado pedí"]. Esto es un bug, no
una decisión de producto documentada.

Hacé lo siguiente:
1. Corregí el código en src/historial.js para el comportamiento correcto.
2. Agregá un test de regresión que hoy fallaría con el bug viejo.
3. Redactá docs/plan-fase0-historial-<fecha>.md documentando todo el
   proceso: el candidato tal como se redactó (con sus marcas
   INFERIDO/CONFIRMADO), el hallazgo de la revisión humana, y este fix —
   dejalo explícito como "fix colateral separado del baseline", no como
   un cambio de requerimiento (no es Caso 3: el comportamiento correcto
   es el que el spec documenta desde que nace, no un cambio posterior a
   algo ya validado).
4. Reescribí docs/specs/spec-historial.md como spec FINAL, Estado:
   desplegado, describiendo el comportamiento CORRECTO (no el bug), y
   agregá el hallazgo como Decisión fechada de hoy. Si el bug revela algo
   que vale la pena fijar como invariante para que no se reintroduzca,
   agregalo con su porqué.
5. Corré los tests y confirmame que quedan en verde.
```

Si la revisión **no** encuentra ningún bug, saltás directo a reescribir
el spec como `desplegado` sin el paso de fix.

**Paso 0.4 — Cierre de la Fase 0.**

**Prompt:**
```
Creá docs/specs/README.md como índice, marcando "historial" con spec
desplegado y "pedidos" como pendiente de su propia Fase 0 (todavía no la
hicimos — es incremental, por capacidad).

Redactá AGENTS.md (nace ahora, sección 6 de la metodología, porque este
es el primer documento de arquitectura del proyecto): patrón
arquitectónico, stack, comandos, y la regla 3.1 explícita. Aclará que
"pedidos" todavía no tiene spec y que cualquier cambio sobre esa
capacidad debe empezar por su propia Fase 0.
```

**Gate humano de cierre de Fase 0:**
- [ ] El spec final describe el comportamiento **correcto**, no el
      inferido con bug.
- [ ] El bug (si hubo) tiene su fix documentado como "separado del
      baseline" en el plan.
- [ ] Lo que había en memoria de sesión, apuntes o docs sueltas del
      código heredado pasa a ser **caché**: se puede conservar como
      índice, pero deja de mandar (spec > AGENTS.md > apuntes).
- [ ] Merge/commit del baseline.

### De acá en adelante

Cualquier cambio sobre "historial" ya sigue el ciclo normal: Caso 2 si
agrega algo, Caso 3 si modifica algo existente (usá esas secciones de
esta misma guía como plantilla, adaptando las rutas a `proyectos/caso5`).
"Pedidos" pasa por su propia Fase 0 recién cuando se toque, o en un
baseline dedicado — nunca documentando todo el sistema de una sola vez.

---

## 2. Checklist final por caso (para no saltearte ningún gate)

| Caso | Exploración | Propuesta (gate: aprobación) | Aplicación (gate: tests verdes) | Verificación (gate: diff de spec revisado por vos) |
|---|---|---|---|---|
| 1 | Sin spec previo — solo idea | Delta 100% | Nacen specs + AGENTS.md | Se valida contra criterios propuestos |
| 2 | Lee spec-historial.md | Delta agregado | Sección nueva en spec | + No-regresión |
| 3 | Ubica sección + decisión a reemplazar | Delta solo Decisiones/Referencias | Comportamiento intacto | El más exigente: paridad + impacto en dependientes |
| 4 | Lee TODOS los specs | Delta nulo + tests de caracterización | legacy archivado + reescritura guiada por spec | Paridad de comportamiento, no solo lectura |
| 5 | No aplica (Fase 0 primero) | Candidato confirmado/inferido | Fix separado si hay bug | Revisión humana completa, no solo diff |

## 3. Notas de cierre

- **Nunca saltees un gate** para "ir más rápido": son justamente los
  puntos donde la metodología mete un control humano porque el agente
  que construye no debería ser el único que verifica (sección 0.6).
- Si en algún momento el agente te propone tocar `AGENTS.md` como efecto
  lateral de un cambio funcional, frenalo (sección 0.5): la arquitectura
  se cambia con un cambio dedicado, no de rebote.
- Si el equipo creciera más allá de 1-3 personas, la regla 3.5 pide
  formalizar esto con un checklist en el template de MR y,
  opcionalmente, un check de CI. No hace falta para este ejercicio, pero
  quedó documentado acá para no perderlo de vista.

## 4. Estado de lo ya construido (referencia)

Los 5 casos ya tienen el mínimo implementado y verificado siguiendo esta
guía:

| Caso | Stack | Tests | Resultado |
|---|---|---|---|
| `caso1/` | Node.js (sin deps) | `npm test` | 9/9 ✔ |
| `caso2/` | Node.js (sin deps) | `npm test` | 13/13 ✔ |
| `caso3/` | Node.js (sin deps) | `npm test` | 13/13 ✔ |
| `caso4/` | Python (stdlib) + Node archivado en `legacy-node/` | `python -m unittest discover -s tests -v` | 13/13 ✔ (paridad con los 13/13 de `legacy-node`) |
| `caso5/` | Node.js (sin deps) | `npm test` | 6/6 ✔ (2 heredados + 4 nacidos en la Fase 0) |

Cada carpeta tiene su `README.md` con los comandos exactos. Usá esta
guía si querés rehacer cualquier caso desde cero con más trazabilidad, o
como plantilla para un caso 6+ que no esté en el documento original.
