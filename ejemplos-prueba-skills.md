# Ejemplos para probar la metodología SDD Spec-Anchored y sus skills

Este documento complementa a `proyectos/caso1` … `proyectos/caso5`, que ya prueban los 5 casos
con el mismo dominio (gestión de pedidos, usado como hilo conductor en la sección 7 de
`metodologia-sdd-spec-anchored_v3.md`). Acá se proponen **3 sistemas chicos en dominios
nuevos**, para verificar que las skills generalizan y no quedaron ajustadas a ese único
ejemplo.

Cada sistema se corre en un repo/carpeta nueva y vacía (sin relación con `proyectos/`).
Los prompts están listos para copiar y pegar tal cual en el chat, en el orden dado.

## Cómo usar este documento

Cada fase del ciclo es una skill de invocación manual — nunca se dispara sola:

| Fase | Skill | `argument-hint` | Gate que cierra la fase |
|---|---|---|---|
| 1. Exploración | `/sdd-exploracion` | descripción de la idea o necesidad del cambio | — (solo anuncia el Caso) |
| 2. Propuesta de cambio | `/sdd-propuesta` | instrucción completa del cambio (opcional si ya se dio en Exploración) | Aprobación humana explícita del plan |
| 3. Aplicación del cambio | `/sdd-aplicacion` | opcional: ruta al plan, si hay más de uno sin aplicar | Build/lint/tests en verde |
| 4. Verificación y fusión | `/sdd-verificacion` | opcional: ruta al plan, si hay más de uno aplicado sin verificar | Revisión humana del diff del spec |

En los ejemplos de abajo, cuando un paso no da un prompt nuevo con instrucción completa, se
asume que se corre en la **misma conversación** que el paso anterior (las skills recuperan el
Caso/delta ya derivados). Si vas a probar cada fase en una sesión nueva, usá la variante
"instrucción completa" que se da entre paréntesis.

---

## Sistema 1 — Gestor de notas con recordatorios

Recorre **Caso 1 → Caso 2 → Caso 3 → Caso 4** en secuencia sobre el mismo sistema, igual que
hace `pedidos` en la metodología, pero en un dominio distinto.

### Caso 1 — Desde cero

**1. Exploración**
```
/sdd-exploracion Quiero construir un gestor de notas personal: crear una nota con título y
cuerpo, listar todas las notas, y eliminar una nota. No existe nada todavía, ni código ni
specs, en este repo.
```
Se espera que la skill anuncie **Caso 1** ("no hay `docs/specs/` ni código relevante") y deje
como delta tentativo **100% del sistema**.

**2. Propuesta de cambio**
```
/sdd-propuesta
```
(si es sesión nueva: `/sdd-propuesta Construir un CRUD simple de notas: crear, listar y
eliminar. Stack: Node.js + Express, almacenamiento en un archivo JSON local, sin base de
datos. Criterios: se puede crear una nota con título+cuerpo y aparece en el listado; se puede
eliminar una nota y desaparece del listado; el listado sobrevive a reiniciar el servidor.`)

Debe preguntar cualquier decisión abierta que falte (p. ej. si no diste el stack) antes de
cerrar el plan, y pedir tu aprobación explícita antes de terminar.

**3. Aplicación del cambio**
```
/sdd-aplicacion
```
Debe construir el CRUD **y** crear `docs/specs/spec-notas.md` + el documento de arquitectura
(`AGENTS.md`/`CLAUDE.md`/`docs/arquitectura.md`, según la herramienta) en el mismo cambio —
es el único momento del ciclo normal en que ese documento nace.

**4. Verificación y fusión**
```
/sdd-verificacion
```
Debe contrastar los 3 criterios uno por uno, mostrar el diff de `spec-notas.md` y pedir
explícitamente tu revisión antes de dar el cambio por cerrado.

### Caso 2 — Funcionalidad nueva: recordatorios con fecha límite

```
/sdd-exploracion Quiero agregar recordatorios a las notas: cada nota puede tener una fecha
límite opcional, y en el listado las notas vencidas (fecha límite ya pasada) se muestran
marcadas como vencidas.
```
Se espera **Caso 2** (ya existe `spec-notas.md`, esto es delta **AGREGADO**). Seguir con
`/sdd-propuesta` → `/sdd-aplicacion` → `/sdd-verificacion` igual que arriba. El spec resultante
debe agregar una sección nueva a `spec-notas.md`, no crear un spec separado (crear/listar/
eliminar/recordar comparten el mismo modelo de datos — mismo criterio de tamaño de capacidad
de `convenciones.md`).

### Caso 3 — Modificación: guardado en archivo JSON → SQLite (sin cambiar comportamiento)

```
/sdd-exploracion El gestor de notas guarda todo en un archivo JSON local. Con más notas esto
ya no escala bien (se reescribe el archivo entero en cada cambio). Queremos pasar a SQLite,
sin cambiar nada de lo que el usuario ve o hace.
```
Se espera **Caso 3**, delta **MODIFICADO** — pero es un cambio de implementación con el mismo
comportamiento observable. Según la regla 3.2 de la metodología, el spec resultante solo debe
tocar **Decisiones** (fechada, con el porqué) y **Referencias** — si la skill toca la sección
*Comportamiento* de `spec-notas.md` acá, es una señal de que algo está mal aplicado.

> Esto es intencionalmente el mismo tipo de caso que `proyectos/caso3` (filtro de cliente a
> servidor) — sirve para confirmar que la skill reconoce el patrón en un dominio distinto.

### Caso 4 — Migración de lenguaje: Node.js → Python

```
/sdd-exploracion Vamos a reescribir todo el gestor de notas de Node.js/Express a Python con
FastAPI, sin cambiar ningún comportamiento. Empezamos por el módulo de notas base y después
seguimos con recordatorios.
```
Se espera **Caso 4**, delta **NULO**. La propuesta debe incluir tests de caracterización
derivados de `spec-notas.md` que corran contra ambas implementaciones, y la verificación debe
exigir paridad medida con esos tests (no solo lectura de código) antes de aceptar el cambio.

---

## Sistema 2 — Acortador de URLs

Recorre **Caso 1 → Caso 2 → Caso 3**, con invariantes de otro tipo (unicidad, longitud) para
variar el sabor de los criterios de aceptación frente al Sistema 1.

### Caso 1 — Desde cero

```
/sdd-exploracion Quiero un acortador de URLs: dada una URL larga, genera un código corto
único de 6 caracteres alfanuméricos y, al visitar ese código, redirige a la URL original. No
existe nada todavía en este repo.
```
`/sdd-propuesta` → `/sdd-aplicacion` → `/sdd-verificacion`. Un buen criterio de aceptación a
pedir explícitamente en la propuesta: "dos URLs largas iguales generan códigos distintos" o
"si el código no existe, responde 404" — para forzar que la skill piense en invariantes de
unicidad, no solo en el camino feliz.

### Caso 2 — Funcionalidad nueva: alias personalizado

```
/sdd-exploracion Quiero agregar la opción de elegir un alias corto propio (en vez del
generado automáticamente) al crear el link, si ese alias todavía no está en uso.
```
**Caso 2**, delta AGREGADO. Buen invariante nuevo a verificar en el spec resultante: "un
alias ya usado no se puede reutilizar" — con su porqué.

### Caso 3 — Modificación: código corto de 6 a 8 caracteres (sí cambia comportamiento)

```
/sdd-exploracion Estamos teniendo colisiones de códigos más seguido de lo esperado con 6
caracteres. Queremos pasar a 8 caracteres alfanuméricos para los códigos generados
automáticamente (los alias elegidos a mano no cambian).
```
**Caso 3**, delta MODIFICADO — a diferencia del Caso 3 del Sistema 1, acá el comportamiento
observable **sí cambia** (las URLs cortas se ven distintas). El spec debe actualizar la
sección *Comportamiento*, no solo *Decisiones*. Comparar los dos ejemplos de Caso 3 (Sistema 1
vs Sistema 2) es la forma más directa de confirmar que la skill distingue correctamente la
regla 3.2 en vez de aplicar la misma plantilla de respuesta a los dos casos.

---

## Sistema 3 — Caso 5: código heredado sin spec

Este caso necesita código real ya escrito y sin documentar — no nace de un prompt de
Exploración como los anteriores. Los pasos:

**1.** Crear un repo/carpeta nueva y vacía (sin `docs/specs/`, sin `AGENTS.md`/`CLAUDE.md`).

**2.** Pegar estos dos archivos tal cual (a propósito incluyen un test parcial, un comentario
de negocio que contradice al código, y un bug sutil en un límite — para poder probar la
distinción `[Confirmado por test]` / `[Confirmado por docs]` / `[Inferido del código]`):

`descuentos.js`
```js
// Reglas de negocio: envío gratis a partir de $50 de compra.
function calcularDescuento(precio, porcentaje) {
  if (porcentaje < 0) return precio;
  const descuento = precio * (porcentaje / 100);
  return precio - descuento;
}

function aplicarCupon(precio, codigo) {
  const cupones = { VERANO10: 10, BLACKFRIDAY: 30, VIP50: 50 };
  const porcentaje = cupones[codigo];
  if (!porcentaje) return precio;
  return calcularDescuento(precio, porcentaje);
}

function envioGratis(subtotal) {
  return subtotal > 50;
}

module.exports = { calcularDescuento, aplicarCupon, envioGratis };
```

`descuentos.test.js`
```js
const { calcularDescuento, aplicarCupon } = require('./descuentos');

test('calcula descuento simple', () => {
  expect(calcularDescuento(100, 10)).toBe(90);
});

test('aplica cupon de verano', () => {
  expect(aplicarCupon(100, 'VERANO10')).toBe(90);
});
```

Notar a propósito: `envioGratis` no tiene test, el comentario dice "a partir de $50" pero el
código usa `>` estricto (un subtotal de exactamente 50 no da envío gratis), `aplicarCupon` es
sensible a mayúsculas sin que nada lo documente, y `calcularDescuento` no limita el porcentaje
a 100 (un porcentaje de 150 da precio negativo).

**3. Exploración**
```
/sdd-exploracion Heredé este módulo de descuentos, nunca tuvo documentación formal. Quiero
aplicar la metodología desde ahora, empezando por esta capacidad.
```
Debe detectar **Caso 5** y entrar directo a la Fase 0 (no sigue el resto del flujo de
Exploración). Verificar en la respuesta:

- Redacta `docs/specs/spec-descuentos.md` con `Estado: en desarrollo`, marcando cada ítem
  como `[Confirmado por test]`, `[Confirmado por docs]` o `[Inferido del código]` — sin
  mezclar etiquetas dentro de un mismo ítem.
- Señala aparte (fuera del spec, sin corregirlo) al menos: el límite de envío gratis en $50
  exacto que contradice el comentario, la falta de tope en `calcularDescuento`, y la
  sensibilidad a mayúsculas de los cupones.
- Cierra pidiendo explícitamente tu confirmación ítem por ítem de lo inferido — este gate no
  es opcional, a diferencia de los gates de Exploración en los otros Casos.

**4.** Al confirmar (o corregir) cada ítem inferido, el spec debe pasar a `Estado: desplegado`
y cualquier bug real confirmado debe quedar anotado como pendiente de un cambio de corrección
**separado**, no arreglado en el mismo paso.

**5.** De ahí en adelante, cualquier cambio sobre `descuentos` se prueba igual que los
sistemas 1 y 2: corre como Caso 2 o Caso 3 normal.

---

## Checklist de QA rápida por fase

Usar esto para revisar si la skill se comportó según su propio `SKILL.md`, no solo si "el
resultado se ve bien":

**Exploración**
- ¿Leyó `docs/specs/` y el archivo de arquitectura antes de responder (paso 1 de la skill)?
- ¿Nombró la capacidad afectada en kebab-case?
- ¿Anunció el Caso explícitamente con su razón, en vez de asumirlo en silencio?
- ¿Dejó explícitos el delta tentativo y los invariantes existentes citados (con su porqué)?

**Propuesta de cambio**
- ¿Recuperó el Caso de la conversación, o lo re-derivó explícitamente si era sesión nueva
  (nunca lo adivinó)?
- ¿Preguntó las decisiones abiertas (stack, nombres, alcance) en vez de asumirlas o dejarlas
  como "TBD"?
- ¿El plan sigue `plantilla-plan.md` al pie de la letra (mismos encabezados, en español)?
- ¿Los criterios de aceptación son casos concretos y verificables, no "funciona bien"?
- ¿Pidió aprobación explícita del plan y esperó el OK antes de cerrar la fase?

**Aplicación del cambio**
- ¿Construyó siguiendo las tareas del plan (o dejó constancia si algo no encajaba)?
- ¿Actualizó el spec **en el mismo cambio**, nunca "después"?
- Si el cambio no altera comportamiento observable, ¿como mínimo agregó Decisión fechada +
  Referencias (en vez de dejar el spec sin tocar)?
- ¿Corrió build/lint/tests y mostró el resultado, sin dar la fase por cerrada si algo falla?

**Verificación y fusión**
- ¿Contrastó criterio por criterio los que quedaron en el plan, sin inventar criterios nuevos?
- ¿Mostró (o resumió fielmente) el diff del spec?
- ¿Pidió explícitamente la revisión humana del diff, sin autoaprobar en tu nombre aunque no
  haya discrepancias?
- ¿Marcó el plan como `destilado` recién después de tu OK, con nota de qué se destiló y qué
  quedó afuera?

**Caso 5 específico**
- ¿Cada ítem del spec candidato quedó marcado con una sola etiqueta (`Confirmado por test` /
  `Confirmado por docs` / `Inferido del código`), sin mezclar dentro del mismo ítem?
- ¿Separó bugs/código muerto del spec, sin corregirlos en el mismo paso?
- ¿El gate de revisión humana fue ítem por ítem sobre lo inferido, y no un simple "¿aprobás?"
  genérico?
