# Plantilla del spec — formato fijo (sección 2 de la metodología)

Copiar esta estructura literal para cada `docs/specs/spec-<capacidad>.md`. No agregar ni quitar secciones, no reordenarlas.

```markdown
# Spec: <Nombre de la capacidad>

**Estado:** desplegado | parcial | en desarrollo · **Última revisión:** YYYY-MM-DD

## Propósito
<Una o dos frases: qué le permite hacer esta capacidad al sistema/usuario.>

## Comportamiento
<Descripción en prosa o lista de lo que la capacidad hace, AS-BUILT — lo que
realmente corre, no lo que se planeó. Un ítem por operación/endpoint/flujo
observable. No pegar firmas de código ni tipos completos: eso lo expresa
mejor el código, referenciarlo en su lugar.>

## Invariantes (no negociables)
- **<Nombre del invariante>:** <qué no puede pasar>. *(Porqué: <la razón —
  esto es lo que evita que una sesión futura "optimice" algo que fue una
  decisión deliberada>.)*

## Decisiones
- YYYY-MM-DD: <decisión tomada> — *Porqué: <motivo>.*

## Fuera de alcance
- <Qué NO hace esta capacidad todavía, a propósito.>

## Referencias
- Código: `<ruta al archivo o módulo principal>`
- Tests: `<ruta a los tests que cubren esta capacidad, si existen>`
- <Otras referencias: migraciones, endpoints, docs relacionadas>
```

## Reglas de formato que se violan seguido — prestar atención especial

- La línea de **Estado** usa el separador `·` (punto medio) entre el valor de Estado y "Última revisión" — **no** `|`. El `|` solo aparece, si aparece, separando los *valores posibles* de Estado (`desplegado | parcial | en desarrollo`), nunca reemplazando al `·`.
- **Estado** va avanzando así: nace en `en desarrollo` en el MR de la primera fase de un plan con fases; pasa a `parcial` cuando hay fases implementadas pero no todas; pasa a `desplegado` cuando el comportamiento descrito ya corre completo en producción/main.
- Cada invariante lleva su "porqué" — un invariante sin porqué es una regla que el siguiente agente va a cuestionar y probablemente romper.
- Cada decisión lleva fecha — sin fecha no se puede saber si sigue vigente o si una decisión posterior la reemplazó.
- Qué NO va en un spec: checklists paso a paso (van en scripts/CI), estados transitorios tipo "pendiente de deploy", o cualquier detalle que el código exprese mejor (firmas, tipos) — eso se referencia, no se duplica.

## Reglas para decidir qué sección tocar en una modificación (regla 3.2)

| El cambio... | Toca spec en |
|---|---|
| Agrega una capacidad o subcapacidad nueva | Todo el spec (nace) |
| Cambia lo que el usuario/sistema observa (API, UI, mensajes, tiempos) | Comportamiento (+ Invariantes/Decisiones si aplica) |
| Agrega un invariante o decisión que restringe cambios futuros | Invariantes o Decisiones |
| Elimina una capacidad | Comportamiento (se quita) + Fuera de alcance |
| Cambia la implementación pero el comportamiento observable es idéntico | Solo Decisiones + Referencias |
| Es un refactor interno sin efecto observable, o una actualización de dependencias sin cambio de comportamiento | No toca el spec |
