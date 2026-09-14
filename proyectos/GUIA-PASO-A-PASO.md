# Guía paso a paso — 5 casos, fase a fase

Cada caso se recorre con **varios prompts, uno por fase** del ciclo de la
metodología (Exploración → Propuesta de cambio → Aplicación del cambio →
Verificación y fusión), en vez de un único prompt que pida todo el caso
de una sola vez. Así puedes revisar y aprobar cada fase antes de que el
agente pase a la siguiente, que es justo el propósito de los "gates" que
define `metodologia-sdd-spec-anchored_v3.md`.

**Cómo usarla:**

1. Adjunta `metodologia-sdd-spec-anchored_v3.md` junto con el **primer**
   prompt de cada caso (el de Exploración, o el de Fase 0 en el Caso 5) y
   envíaselo al agente ubicado en la ruta indicada. No es necesario
   volver a adjuntarlo en los prompts siguientes del mismo caso: es la
   misma conversación y el agente ya lo tiene.
2. Espera a que el agente termine esa fase y te muestre su resultado.
   Revísalo, responde lo que te pregunte, y solo entonces envíale el
   prompt de la fase siguiente.
3. No envíes dos prompts de fase seguidos sin revisar el resultado del
   anterior — cada prompt de abajo le pide explícitamente al agente que
   se detenga a esperar tu confirmación antes de avanzar.

No es necesario que sepas ni menciones nada de cómo está construido el
documento de metodología por dentro.

**Orden entre casos:** `caso2` parte de `caso1`, `caso3` de `caso2`,
`caso4` de `caso3`. `caso5` es independiente y puede hacerse en
cualquier momento. No te saltes el orden: cada prompt de abajo asume que
la carpeta anterior ya está terminada.

**Cómo seguir la conversación dentro de cada fase** (sin necesidad de
saber nada de metodología):

- Si el agente te muestra algo y te pregunta si continúa, revisa lo que
  te mostró antes de decirle que sí.
- Si te pregunta una decisión de negocio (nombres, prioridades, cómo
  llamar algo, qué stack usar), respóndela tú — no le pidas que decida
  por ti.
- Si te dice que terminó la fase y te muestra un resumen de qué cambió,
  léelo antes de enviarle el prompt de la fase siguiente.
- Si en algún momento no tienes claro qué te está pidiendo, pregúntale
  directamente "¿qué necesitas de mí ahora?" — el agente lo sabe porque
  lo tiene en el documento adjunto.

---

## Caso 1 — `proyectos/caso1` (desde cero)

Hoy la carpeta está completamente vacía. Las cuatro fases aplican; la
Exploración es liviana porque no hay nada previo que leer.

### Fase 1 — Exploración

```
Estamos en proyectos/caso1, un proyecto vacío. Es un Caso 1 (desde cero)
según la metodología que te adjunto — síguela estrictamente de aquí en
adelante.

Idea inicial: queremos un sistema simple de gestión de pedidos. Es solo
para hacer pruebas con esta forma de trabajo, así que quiero mantenerlo
lo más chico y simple posible — nada de funcionalidades de más. Todavía
no te doy el detalle completo.

Como es un Caso 1, no hay spec ni documento de arquitectura previos que
leer. Realiza la fase de Exploración: deja constancia de que no hay nada
previo, y devuélveme un resumen del problema + un camino sugerido a alto
nivel (qué capacidades tendría sentido separar). No definas todavía
stack, tareas ni criterios de aceptación — eso corresponde a la fase
siguiente. Cuando termines, espera mi confirmación antes de continuar.
```

### Fase 2 — Propuesta de cambio

```
De acuerdo, continuamos con la Propuesta de cambio. Esta es la
instrucción completa del sistema a construir — úsala para armar el plan
(delta = 100% del sistema: stack, arquitectura, tareas/fases y criterios
de aceptación por capacidad). Que quede claro en el plan: el objetivo es
un sistema mínimo para probar la metodología, no un sistema de
producción — evita cualquier funcionalidad que no esté en esta lista.

1. Crear pedido: un pedido tiene un cliente, un producto y una cantidad.
2. Ver historial: listar los pedidos creados.
3. Cambiar estado del pedido: Pendiente, Enviado, Entregado, Cancelado.

Sin autenticación, sin control de inventario, sin pagos, sin
notificaciones y sin logística — eso queda fuera de alcance a propósito.

Pregúntame cualquier decisión abierta (stack, nombres) antes de cerrar
el plan. No empieces a construir todavía — quiero ver y aprobar el plan
primero.
```

### Fase 3 — Aplicación del cambio

```
Plan aprobado. Continúa con la Aplicación del cambio: construye el
sistema completo y, en el mismo paso, redacta los specs por capacidad y
el documento de arquitectura y convenciones (el archivo de contexto que
tu herramienta cargue automáticamente al iniciar sesión). Cuando
termines, muéstrame qué se construyó y qué documentos nacieron —
todavía no pases a verificación.
```

### Fase 4 — Verificación y fusión

```
Cierra el ciclo con la Verificación y fusión: contrasta lo construido
contra los criterios de aceptación del plan, arma el índice de specs
(docs/specs/README.md) y muéstrame un reporte de coincidencias/
discrepancias. Quiero revisar el diff de los specs antes de dar el
cambio por cerrado.
```

---

## Caso 2 — `proyectos/caso2` (funcionalidad nueva)

Parte de `caso1` ya terminado. Las cuatro fases aplican con delta
"agregado".

### Fase 1 — Exploración

```
Estamos en proyectos\caso2. Antes que nada, copia todo el contenido de
proyectos/caso1 a esta carpeta (ya tiene el sistema de pedidos armado).
Es un Caso 2 (funcionalidad nueva sobre un sistema existente) según la
metodología que te adjunto — síguela estrictamente de aquí en adelante.

Quiero agregar la posibilidad de filtrar el historial de pedidos por
estado (pendiente, enviado, entregado, cancelado).

Realiza la fase de Exploración: lee el/los spec(s) de la capacidad que
se va a tocar y confírmame si agregar este filtro entra en conflicto con
algún invariante existente. No propongas el plan todavía — espera mi
confirmación antes de continuar.
```

### Fase 2 — Propuesta de cambio

```
Continuamos con la Propuesta de cambio: arma el plan para este cambio —
delta "agregado" (filtro por estado), enfoque técnico, tareas y
criterios de aceptación (por ejemplo: los 4 estados filtran
correctamente; sin filtro la lista se ve igual que ahora). Pregúntame
las decisiones abiertas que tengas (por ejemplo si el filtro va en
cliente o servidor, cómo se ve en la interfaz) antes de cerrar el plan.
```

### Fase 3 — Aplicación del cambio

```
Plan aprobado. Continúa con la Aplicación del cambio: construye el
filtro y, en el mismo paso, actualiza el spec correspondiente (sección
nueva) — no lo dejes para después.
```

### Fase 4 — Verificación y fusión

```
Cierra con la Verificación y fusión: contrasta contra los criterios de
aceptación y confírmame que nada de lo existente se rompió (sin
regresiones). Muéstrame el diff del spec para que lo revise antes de
considerar el cambio terminado.
```

---

## Caso 3 — `proyectos/caso3` (modificación de un requerimiento existente)

Parte de `caso2` ya terminado. Las cuatro fases aplican. A diferencia del
ejemplo de la sección 7 de la metodología (que cambia solo la
implementación), aquí el comportamiento observable **sí** cambia: es un
delta "modificado" pleno, así que el spec se actualiza también en
*Comportamiento*, no solo en Decisiones/Referencias (ver la nota al pie
de la sección 7 del documento de metodología sobre esta distinción).

### Fase 1 — Exploración

```
Estamos en proyectos/caso3. Copia todo el contenido de proyectos/caso2 a
esta carpeta como punto de partida (ya tiene el sistema de pedidos con
el filtro por estado). Es un Caso 3 (modificación de un requerimiento
existente) según la metodología adjunta — síguela estrictamente.

Hoy el cambio de estado (endpoint de actualizar estado de un pedido)
acepta cualquiera de los estados válidos sin importar en qué estado está
el pedido — por ejemplo, se puede pasar de "Entregado" de vuelta a
"Pendiente". Quiero restringir eso: que solo se permitan las
transiciones que tienen sentido en el ciclo de vida real de un pedido.
No toques el filtro por estado ni ningún otro endpoint — este cambio es
solo sobre la validación de transiciones al cambiar de estado.

Realiza la fase de Exploración: ubica en el spec correspondiente cómo
está descrito hoy el cambio de estado y qué invariantes toca. No
propongas el plan todavía.
```

### Fase 2 — Propuesta de cambio

```
Continuamos con la Propuesta de cambio. Este es un cambio de
comportamiento real: algunas transiciones que hoy se aceptan van a
empezar a rechazarse. Arma el plan: delta "modificado", las transiciones
válidas que vamos a permitir (propónme una secuencia razonable, por
ejemplo Pendiente → Enviado → Entregado, con Cancelado permitido solo
desde Pendiente o Enviado), qué responde la API ante una transición
inválida (código y mensaje), tareas y criterios de aceptación.
Pregúntame lo que necesites decidir antes de cerrarlo.
```

### Fase 3 — Aplicación del cambio

```
Plan aprobado. Continúa con la Aplicación del cambio: agrega la
validación de transiciones al endpoint de cambio de estado, y actualiza
el spec correspondiente (Comportamiento, y el invariante o decisión que
corresponda) en el mismo paso.
```

### Fase 4 — Verificación y fusión

```
Cierra con la Verificación y fusión: confirma que las transiciones
válidas siguen funcionando, que las inválidas se rechazan con el código
acordado, y que nada más —incluido el filtro por estado— se rompió.
Muéstrame el diff del spec para que lo revise antes de cerrar.
```

---

## Caso 4 — `proyectos/caso4` (migración de lenguaje)

Parte de `caso3` ya terminado. Las cuatro fases aplican, pero con delta
**nulo** — se repiten (Propuesta → Aplicación → Verificación) módulo por
módulo, no todas juntas.

### Fase 1 — Exploración

```
Estamos en proyectos/caso4. Copia todo el contenido de proyectos/caso3 a
esta carpeta como punto de partida. Es un Caso 4 (migración de lenguaje)
según la metodología adjunta — síguela estrictamente.

Necesito migrar este sistema de Node.js a Python (o el lenguaje que
prefieras si Python no está disponible), sin cambiar ningún
comportamiento.

Realiza la fase de Exploración: lee TODOS los specs existentes como
inventario de lo que el sistema tiene que seguir haciendo. No propongas
la estrategia de migración todavía — espera mi confirmación.
```

### Fase 2 — Propuesta de cambio

```
Continuamos con la Propuesta de cambio. Aquí el delta es NULO (no cambia
el comportamiento) — el foco está en el enfoque técnico: define la
estrategia módulo por módulo (indícame en qué orden vas a ir, por
ejemplo empezando por una capacidad puntual), las equivalencias de
librerías, y los tests de caracterización que vas a derivar de cada spec
para correr contra ambas implementaciones. Hazlo de a un módulo por vez
como trabajos separados — no me propongas migrar todo junto.
```

### Fase 3 — Aplicación del cambio

```
Plan aprobado. Continúa con la Aplicación del cambio para el primer
módulo que definiste: reescríbelo guiado por su spec, no por la sintaxis
original de Node. Cuando termines ese módulo, detente ahí — no continúes
con el próximo todavía.
```

### Fase 4 — Verificación y fusión

```
Cierra este módulo con la Verificación y fusión: corre los tests de
caracterización contra ambas implementaciones y confírmame que dan
paridad. El spec de este módulo solo debería actualizar Referencias y
sumar una Decisión fechada de la migración — muéstrame ese diff para que
lo revise. Cuando yo lo confirme, continuamos con el próximo módulo
repitiendo Propuesta → Aplicación → Verificación para ese módulo.
```

> Repite las Fases 2 a 4 (con este mismo prompt de Fase 2 como plantilla,
> indicando qué módulo sigue) hasta migrar todos los módulos.

---

## Caso 5 — `proyectos/caso5` (código sin spec previo)

Este caso **no** empieza en Exploración: antes hay que pasar, de forma
obligatoria, por la **Fase 0** de la metodología (ingeniería inversa de
especificación) — no existe todavía porque nunca se documentó el sistema
heredado. Se hace por capacidad, de forma incremental, nunca todo el
sistema de una vez.

### Fase 0 — Ingeniería inversa de especificación (por capacidad)

```
Estamos en proyectos/caso5. Esta carpeta tiene un sistema de pedidos
heredado, escrito hace tiempo, sin ninguna documentación formal — no hay
specs ni documento de arquitectura. Puede tener algún test suelto, pero
no una cobertura completa. Es un Caso 5 según la metodología que te
adjunto — síguela estrictamente, empezando por lo que el documento
indique que hay que hacer antes de poder tratar este proyecto como
cualquier otro ya documentado.

Realiza la Fase 0 (ingeniería inversa de especificación) para UNA sola
capacidad — elige la que te parezca más pequeña o más aislada para
empezar. Redacta su spec candidato marcando con claridad qué confirmaste
con tests/documentación y qué inferiste solo del código. Si encuentras
algo que te parezca un bug o código muerto, señálamelo aparte — no lo
corrijas todavía, eso corresponde a un MR separado. Cuando termines esta
capacidad, espera mi revisión (dirigida especialmente a lo que marcaste
como inferido) antes de continuar con la próxima.
```

> Repite este mismo prompt de Fase 0, cambiando la capacidad, hasta
> cubrir las capacidades del sistema que te interese documentar. Avanza
> de a una por vez — no le pidas que documente todo junto en un solo
> paso.

### Corrección colateral (solo si en la Fase 0 apareció un bug o código muerto)

```
Corrige, en un MR/paso separado del baseline de documentación, el
[bug / código muerto] que identificaste en la capacidad <nombre> durante
la Fase 0. Esta corrección no debe mezclarse con el commit donde nace el
spec de esa capacidad.
```

### De ahí en adelante: ciclo normal por capacidad ya documentada

Una vez que una capacidad tiene su spec validado (`Estado: desplegado`),
cualquier cambio sobre ella deja de ser Fase 0 y pasa a ser un Caso 2 (si
agrega algo) o un Caso 3 (si modifica algo existente). Usa los prompts de
Fase 1 a Fase 4 de esos casos como plantilla, adaptando la ruta a
`proyectos/caso5` y la capacidad en cuestión — por ejemplo:

```
Sobre la capacidad <nombre>, que ya tiene su spec validado en
proyectos/caso5, quiero [agregar / modificar] lo siguiente: <descripción
del cambio>. Realiza la fase de Exploración: lee el spec de esa
capacidad (y specs vecinos si aplica) y confírmame cómo encaja / qué
invariantes toca. No propongas el plan todavía.
```

---

## Estado actual de cada carpeta

| Carpeta | Estado |
|---|---|
| `caso1/` | Vacía. |
| `caso2/` | No existe todavía. |
| `caso3/` | No existe todavía. |
| `caso4/` | No existe todavía. |
| `caso5/` | No existe todavía. |

Los cinco casos están pendientes de rehacerse con los prompts fase a
fase de esta guía.
