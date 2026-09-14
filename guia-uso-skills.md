# Guía de uso — Skills SDD Spec-Anchored

Esta guía es un manual de referencia para instalar y usar las skills de la metodología SDD
Spec-Anchored. Está pensada para cualquier persona a la que se le entreguen estas skills,
sin necesitar contexto previo de cómo fueron creadas. El ejemplo de la sección 4 usa el
"Sistema 1 — Gestor de notas" descrito en `ejemplos-prueba-skills.md`; ese archivo, cuando
está disponible, trae más ejemplos y una checklist de verificación por fase.

---

## 1. Qué son estas skills

El paquete incluye 4 skills, una por fase del ciclo descrito en
`metodologia-sdd-spec-anchored_v3.md`:

| Fase | Skill |
|---|---|
| 1. Exploración | `sdd-exploracion` |
| 2. Propuesta de cambio | `sdd-propuesta` |
| 3. Aplicación del cambio | `sdd-aplicacion` |
| 4. Verificación y fusión | `sdd-verificacion` |

Las cuatro tienen `disable-model-invocation: true` en su `SKILL.md`: nunca se activan solas
por el contexto de la conversación, sino únicamente cuando la persona usuaria escribe de forma
explícita `/sdd-exploracion`, `/sdd-propuesta`, etc. Esto es intencional: cada fase funciona
como un punto de control que exige una decisión explícita para avanzar a la siguiente.

---

## 2. Instalación manual en un repositorio de trabajo

Las skills se instalan copiando archivos — no requieren ningún mecanismo de plugin ni
publicación externa. El único paso que cambia según la herramienta de agentes que se use es el
nombre de la carpeta de destino (sección 2.1); el resto del proceso es igual para todas.

### Pasos

1. **Ubicar la carpeta `skills/` recibida.** Debe contener las cuatro subcarpetas de las
   skills (`sdd-exploracion`, `sdd-propuesta`, `sdd-aplicacion`, `sdd-verificacion`) y una
   subcarpeta común, `_shared/`, con las plantillas y convenciones que todas usan.
2. **Copiar esa carpeta completa** dentro de la carpeta de skills que corresponda a la
   herramienta de agentes que se vaya a usar (ver la tabla de la sección 2.1). Si esa carpeta
   no existe todavía en el repositorio de destino, se crea al copiar los archivos.
3. **Abrir la herramienta de agentes correspondiente dentro de ese repositorio de destino** (o
   reiniciar la sesión, si ya estaba abierta, para que detecte las skills nuevas).
4. **Verificar la instalación:** escribir `/` en el chat y confirmar que aparecen los cuatro
   comandos: `/sdd-exploracion`, `/sdd-propuesta`, `/sdd-aplicacion`, `/sdd-verificacion`. Las
   tres herramientas cubiertas en esta guía convierten cada skill en un comando de este tipo.

### 2.1 Nombre de la carpeta según la herramienta de agentes

Cada herramienta busca las skills en su propia carpeta convencional. La tabla indica dónde
copiar la carpeta recibida según cuál se use:

| Herramienta | Carpeta en el repositorio (nivel proyecto) | Carpeta personal (aplica a todos los proyectos) |
|---|---|---|
| Claude Code | `.claude/skills/` | `~/.claude/skills/` |
| GitHub Copilot | `.github/skills/` — también reconoce `.claude/skills/` o `.agents/skills/` si ya existen en el repositorio | `~/.copilot/skills/` o `~/.agents/skills/` |
| Google Antigravity | `.agents/skills/` | `~/.gemini/antigravity/skills/` |

Notas sobre la tabla:

- **Claude Code es la excepción que no comparte carpeta con nadie más:** no reconoce
  `.agents/skills/` ni `.github/skills/`, así que siempre necesita su propia copia en
  `.claude/skills/`.
- **GitHub Copilot es flexible:** si el repositorio ya tiene `.claude/skills/` o
  `.agents/skills/` copiada para otra herramienta, Copilot ya las detecta ahí — no hace falta
  una copia adicional en `.github/skills/` a menos que se lo quiera usar de forma aislada.
- **Antigravity cambió el nombre de su carpeta:** las versiones más antiguas usaban
  `.agent/skills/` (singular). La versión actual usa `.agents/skills/` (plural) como carpeta
  por defecto; `.agent/skills/` todavía funciona por compatibilidad hacia atrás, pero conviene
  usar el nombre en plural en instalaciones nuevas.

**Atajo para cubrir las tres herramientas a la vez:** copiando la carpeta recibida tanto en
`.claude/skills/` como en `.agents/skills/` dentro del mismo repositorio de destino, quedan
cubiertas Claude Code, Antigravity y GitHub Copilot con solo dos copias — Copilot reconoce
cualquiera de las dos carpetas sin necesitar una tercera en `.github/skills/`.

### Notas importantes

- La subcarpeta `_shared/` debe copiarse junto con las cuatro skills, en cada carpeta destino.
  Los archivos `SKILL.md` la referencian para aplicar el formato correcto de plan y de spec
  (`convenciones.md`, `plantilla-plan.md`, `plantilla-spec.md`); si falta, las skills no van a
  poder seguir ese formato.
- Esta copia es manual y no se actualiza sola. Si más adelante se recibe una versión nueva de
  las skills (por ejemplo, con correcciones), hay que repetir el paso 2 y sobrescribir la
  carpeta completa en cada ubicación donde estén instaladas.
- Las tres herramientas cubiertas en esta guía respetan `disable-model-invocation: true` con el
  mismo efecto: la skill nunca se activa sola por el contexto de la conversación, solo cuando
  se la invoca por su nombre con `/`. Si en alguna versión de alguna de estas herramientas un
  comando no aparece en el listado a pesar de estar bien copiado, conviene confirmar la versión
  instalada antes de asumir un error en las skills.

---

## 3. Qué necesita el repositorio de destino

Nada de antemano. Las skills crean lo que falta a medida que se necesita:

| Documento | Dónde vive | Nace en |
|---|---|---|
| Spec por capacidad | `docs/specs/spec-<capacidad>.md` | Caso 1 / Caso 2 / Fase 0 de Caso 5 |
| Índice de specs | `docs/specs/README.md` | Caso 1 / cuando nace el primer spec nuevo |
| Plan del cambio | `docs/plan-<tema>-<fecha>.md` | `/sdd-propuesta`, en cada cambio |
| Documento de arquitectura | `AGENTS.md` / `CLAUDE.md` / `.cursorrules` / `docs/arquitectura.md` | Primer cambio de Caso 1, o Fase 0 de Caso 5 |

Si el repositorio de destino ya cuenta con un `AGENTS.md`, `CLAUDE.md` o `.cursorrules`, las
skills lo usan como documento de arquitectura y no crean uno paralelo. El formato exacto de
cada documento está definido en `skills/_shared/convenciones.md`, `plantilla-plan.md` y
`plantilla-spec.md`.

---

## 4. Cómo usar cada skill — genérico y con ejemplo

El ejemplo recorre **Caso 1 (desde cero)** completo, las 4 fases en secuencia, sobre el
"Gestor de notas" del documento `ejemplos-prueba-skills.md` (Sistema 1). Cada prompt se
ejecuta en el orden dado, dentro de la misma conversación.

### 4.1 `/sdd-exploracion` — Fase 1: Exploración

**Cuándo se usa:** siempre como primer paso de cualquier cambio, incluso cuando a primera
vista parece obvio cuál es el Caso — esta fase es la que deja el Caso y el delta registrados
explícitamente, en lugar de asumidos.

**Qué hace, en orden:**
1. Lee `docs/specs/`, el documento de arquitectura y el código relevante del repositorio de
   destino.
2. Nombra la capacidad afectada en kebab-case.
3. Recorre el árbol de decisión y detecta el Caso (1 a 5), anunciándolo explícitamente junto
   con la razón.
4. Ejecuta la rama correspondiente a ese Caso (`references/casoN-*.md`) y arma un resumen:
   problema, Caso, delta tentativo, invariantes existentes que restringen el cambio.

**Qué solicita:** nada más que la idea del cambio, si `$ARGUMENTS` ya la trae clara. Si la
idea es ambigua, pregunta antes de continuar.

**Qué deja como resultado:** un resumen en el chat (en Caso 1 todavía no se crea ningún
archivo). Esta fase no tiene un gate humano propio — el único paso es la confirmación del
Caso detectado.

**Ejemplo:**
```
/sdd-exploracion Quiero construir un gestor de notas personal: crear una nota con título y
cuerpo, listar todas las notas, y eliminar una nota. No existe nada todavía, ni código ni
specs, en este repositorio.
```
Respuesta esperada: detecta **Caso 1** (no hay `docs/specs/` ni código), delta **100% del
sistema**, sin invariantes previos, y sugiere una única capacidad tentativa: `notas`.

---

### 4.2 `/sdd-propuesta` — Fase 2: Propuesta de cambio

**Cuándo se usa:** después de que Exploración confirmó el Caso. Nunca antes — sin un Caso
confirmado no hay base para decidir qué debe contener el plan.

**Qué hace, en orden:**
1. Recupera el Caso y el delta de la conversación (o los vuelve a derivar si es una sesión
   nueva, sin adivinarlos).
2. Reúne la instrucción completa de qué construir, preguntando lo que falte (stack, nombres,
   prioridades).
3. Carga la rama del Caso correspondiente (`references/casoN.md`) para saber qué debe
   contener el plan.
4. Resuelve, junto con la persona usuaria, cualquier decisión abierta.
5. Escribe `docs/plan-<tema>-<fecha>.md` siguiendo `plantilla-plan.md` al pie de la letra, con
   criterios de aceptación concretos.

**Qué solicita:** las decisiones que solo la persona usuaria puede tomar (stack, alcance,
nombres) — nunca las asume ni las deja como "TBD" en el plan.

**Qué deja como resultado:** el archivo del plan, y un **gate**: solicita aprobación explícita
antes de cerrar la fase. No avanza a Aplicación sin esa confirmación.

**Ejemplo** (misma conversación, sin argumentos adicionales — ya tiene el contexto de 4.1):
```
/sdd-propuesta
```
Como el stack no se indicó en Exploración, la skill lo pregunta en este paso. Supóngase que la
persona usuaria responde: "Node.js + Express, guardado en un archivo JSON local, sin base de
datos todavía". El plan que debería quedar en `docs/plan-gestor-notas-2026-09-14.md`:

```markdown
# Plan: Gestor de notas — sistema base

**Fecha:** 2026-09-14
**Estado:** en desarrollo

## Contexto
No existe nada todavía: ni código, ni docs/specs/, ni documento de arquitectura. Se construye
desde cero un gestor de notas personal.

## Delta
100% del sistema (Caso 1). Nace la capacidad "notas": crear, listar y eliminar.

## Decisiones tomadas y enfoque técnico
- Stack: Node.js + Express.
- Persistencia: archivo JSON local (`notas.json`), sin base de datos — simplicidad para
  validar la metodología.
- Una sola capacidad: "notas" (crear/listar/eliminar comparten el mismo modelo de datos).

## Tareas
- [ ] Modelo de datos de nota (id, título, cuerpo, fecha de creación).
- [ ] POST /notas — crear.
- [ ] GET /notas — listar.
- [ ] DELETE /notas/:id — eliminar.
- [ ] Persistencia en notas.json.

## Criterios de aceptación
1. POST /notas con título y cuerpo crea una nota y devuelve su id.
2. GET /notas devuelve la nota recién creada en el listado.
3. DELETE /notas/:id elimina la nota; GET /notas ya no la incluye.
4. El listado sobrevive a reiniciar el servidor (persistencia real, no solo en memoria).

## Pendientes de decisión
(vacío — todo se resolvió en esta fase)
```
La skill muestra este contenido (o un resumen fiel) y pregunta si el plan queda aprobado. La
persona usuaria confirma antes de continuar.

---

### 4.3 `/sdd-aplicacion` — Fase 3: Aplicación del cambio

**Cuándo se usa:** solo después de aprobar el plan. Esta fase construye el código y actualiza
el spec en el mismo cambio — es la regla de anclaje central de la metodología.

**Qué hace, en orden:**
1. Ubica el plan aprobado (`docs/plan-*.md` con `Estado: en desarrollo`).
2. Carga la rama del Caso correspondiente.
3. Construye siguiendo las tareas del plan, reutilizando patrones ya existentes en el
   repositorio.
4. Actualiza o crea el spec en el mismo cambio — nunca en un paso posterior. En Caso 1,
   también crea el documento de arquitectura.
5. Ejecuta build/lint/tests y muestra el resultado — no da la fase por cerrada si algo falla.

**Qué solicita:** nada, salvo que el plan tenga ambigüedades reales al momento de construir;
en ese caso, ajusta el plan y deja constancia del ajuste en lugar de improvisar en silencio.

**Qué deja como resultado:** el código, `docs/specs/spec-notas.md` (nuevo, en este ejemplo),
`docs/specs/README.md`, el documento de arquitectura, y el resultado de build/lint/tests.

**Ejemplo:**
```
/sdd-aplicacion
```
`docs/specs/spec-notas.md` resultante:

```markdown
# Spec: Notas

**Estado:** desplegado · **Última revisión:** 2026-09-14

## Propósito
Permitir crear, listar y eliminar notas personales con persistencia simple.

## Comportamiento
- **Crear nota (`POST /notas`):** recibe `titulo` y `cuerpo`. Crea la nota y devuelve su `id`.
- **Listar notas (`GET /notas`):** devuelve todas las notas existentes.
- **Eliminar nota (`DELETE /notas/:id`):** borra la nota; deja de aparecer en el listado.

## Invariantes (no negociables)
- **Título y cuerpo no vacíos:** una nota no se crea si falta alguno de los dos. *(Porqué:
  evita notas sin contenido útil en el listado.)*

## Decisiones
- 2026-09-14: Persistencia en archivo JSON local (`notas.json`), sin base de datos — *Porqué:
  simplicidad para validar la metodología sin infraestructura extra.*

## Fuera de alcance
- Edición de notas existentes.
- Recordatorios / fechas límite.
- Autenticación o multiusuario.

## Referencias
- Código: `src/index.js`
- Tests: `test/notas.test.js`
```

---

### 4.4 `/sdd-verificacion` — Fase 4: Verificación y fusión

**Cuándo se usa:** después de que Aplicación terminó y build/lint/tests quedaron en verde.
Cierra el cambio.

**Qué hace, en orden:**
1. Ubica el plan aplicado y el o los spec(s) que se modificaron.
2. Carga la rama del Caso correspondiente.
3. Contrasta, criterio por criterio, lo construido contra los criterios de aceptación del
   plan, sin inventar criterios nuevos.
4. Produce un reporte breve: cumple / no cumple / parcial, y cualquier elemento fuera del plan
   que se haya visto afectado.
5. Muestra el diff del spec.
6. **Gate obligatorio:** solicita explícitamente la revisión humana del diff del spec — nunca
   se autoaprueba, aunque el reporte no encuentre discrepancias.
7. Una vez aprobado, marca el plan como `Estado: destilado`.

**Qué solicita:** la revisión humana del diff del spec — el único gate que esta metodología
exige siempre, sin excepción (sección 5 de la metodología: "por qué la verificación necesita
un humano mínimo").

**Qué deja como resultado:** el reporte de verificación y el plan marcado como `destilado`.

**Ejemplo:**
```
/sdd-verificacion
```
Reporte esperado:
```
1. POST /notas crea y devuelve id — cumple.
2. GET /notas incluye la nota creada — cumple.
3. DELETE /notas/:id elimina y desaparece del listado — cumple.
4. Persistencia sobrevive a reinicio — cumple (notas.json se lee al levantar el servidor).

Diff del spec: nace docs/specs/spec-notas.md completo (Caso 1, no hay versión previa que
comparar).

¿Se confirma la revisión del diff para cerrar el cambio?
```
Con la confirmación de la persona usuaria, el plan pasa a `Estado: destilado` y el ciclo
vuelve a `/sdd-exploracion` para el próximo cambio (por ejemplo, el Caso 2 de recordatorios
descrito en `ejemplos-prueba-skills.md`).

---

## 5. Seguir practicando

- Cuando está disponible el repositorio completo de la metodología (no solo la carpeta de
  skills), `ejemplos-prueba-skills.md` trae 3 sistemas completos (Caso 1→4 con un gestor de
  notas, Caso 1→3 con un acortador de URLs, y Caso 5 aislado con código heredado ya escrito),
  con prompts listos para copiar y una checklist de verificación por fase.
- `proyectos/caso1` … `proyectos/caso5`, cuando están disponibles, son implementaciones reales
  ya corridas con el dominio "gestión de pedidos" — sirven como referencia de cómo se ve el
  resultado en código real, aunque algunos de esos planes no siguen `plantilla-plan.md` al pie
  de la letra (corresponden a una iteración anterior). Para el formato exacto que las skills
  deberían producir hoy, se recomienda guiarse por la sección 4 de esta guía y por
  `skills/_shared/plantilla-plan.md`.

## 6. Errores comunes a evitar

- **Asumir el Caso en silencio.** `/sdd-exploracion` siempre debe anunciarlo de forma
  explícita, junto con la razón — si no lo hace, algo se saltó en el proceso.
- **Confundir "agregado" con "modificado" cuando el spec ya existe.** Que el spec exista o no
  para la capacidad no decide por sí solo el Caso. Lo que lo decide es si lo que el spec ya
  describe hoy sigue siendo cierto, sin matices, después del cambio (Caso 2) o si deja de
  serlo (Caso 3). Ver `sdd-exploracion/references/caso2-funcionalidad-nueva.md` y
  `caso3-modificacion-existente.md`.
- **Dejar decisiones sin resolver en el plan.** `/sdd-propuesta` debe preguntar las decisiones
  abiertas en esa misma fase, no diferirlas a Aplicación.
- **Aplicar código sin actualizar el spec en el mismo cambio.** Aunque el cambio no altere
  comportamiento observable, como mínimo debe agregar una Decisión fechada y actualizar
  Referencias.
- **Autoaprobar el gate de Verificación.** El diff del spec siempre necesita revisión humana
  explícita, incluso cuando el reporte no encuentra discrepancias.
