# Plan: Recordatorios (fecha límite) en notas

**Fecha:** 2026-09-14
**Estado:** destilado

## Contexto

`spec-gestion-notas.md` describe hoy crear, listar y eliminar notas con `titulo`, `cuerpo` y `fechaCreacion`. No existe ningún campo de fecha límite ni de estado de vencimiento.

Se pide agregar una fecha límite opcional por nota (`fechaLimite`, solo día, sin hora) y que el listado marque como **vencidas** las notas cuya fecha límite ya pasó. Ambas cosas se suman sobre lo que ya existe: una nota sin `fechaLimite` debe seguir comportándose exactamente igual que hoy.

Decisiones ya confirmadas con el usuario (Fase 1 y Fase 2):
- El cálculo de "vencida" vive en el **backend** — la respuesta de `GET /api/notas` ya trae el estado calculado.
- `fechaLimite` es solo fecha (día), sin hora.
- Crear una nota con `fechaLimite` en el pasado se **rechaza** (400), no se permite dejar una nota "nace vencida".
- Una nota vencida se marca en la UI con una etiqueta de texto ("Vencida") + color distintivo (no solo color, para no depender únicamente de eso).

## Delta

**AGREGADO.** Nada de lo que el spec ya describe cambia de comportamiento cuando `fechaLimite` no se usa. Se suma: un campo nuevo opcional en la creación, un campo `vencida` nuevo en el listado, y su reflejo visual en la UI.

## Decisiones tomadas y enfoque técnico

- **Dónde nace:** sección nueva dentro de `docs/specs/spec-gestion-notas.md` (misma capacidad, `gestion-notas`) — no nace un spec separado. El criterio de tamaño de la convención aplica: recordatorios cambia junto con crear/listar notas y comparte los mismos invariantes de persistencia.
- **Formato de `fechaLimite`:** string `"YYYY-MM-DD"`, opcional. Se valida con regex `^\d{4}-\d{2}-\d{2}$` + que sea una fecha calendario válida.
- **Validación al crear (`POST /api/notas`):**
  - Si `fechaLimite` no viene, se comporta exactamente igual que hoy (no se agrega el campo a la nota, o se guarda como `null` — ver tarea de implementación).
  - Si viene pero no cumple el formato, o es una fecha inválida → `400`, no crea la nota (mismo patrón que la validación de `titulo`/`cuerpo` ya existente).
  - Si viene con formato válido pero es **anterior a hoy** (fecha del servidor) → `400`, no crea la nota. "Hoy" se calcula como `new Date().toISOString().slice(0, 10)` (fecha UTC del servidor) — mismo criterio que se usa para calcular vencidas, así ambos lados son consistentes entre sí.
- **Cálculo de `vencida` (`GET /api/notas`):** por cada nota, `vencida = fechaLimite existe && fechaLimite < hoy` (comparación de strings `YYYY-MM-DD`, válida porque el formato es lexicográficamente ordenable). Una nota sin `fechaLimite` siempre tiene `vencida: false`. Una nota cuya `fechaLimite` es exactamente hoy tiene `vencida: false` (vence hoy, no está vencida todavía).
- **Dónde vive la lógica:** en `backend/src/notasRouter.js` (ya es donde vive la validación de `titulo`/`cuerpo` y el shape de la respuesta). No se toca `notasStore.js` — ya persiste cualquier campo del objeto nota tal cual, sin cambios.
- **Persistencia:** sin cambios de infraestructura — `fechaLimite` se guarda como un campo más en `backend/data/notas.json`, igual que `titulo`/`cuerpo`/`fechaCreacion`. `vencida` **no se persiste** — se calcula en cada `GET`, para que quede siempre correcta sin importar cuándo se lea (si se persistiera, quedaría desactualizada con el paso de los días).
- **Frontend (`frontend/app/page.js`):**
  - Se agrega un `<input type="date">` opcional al formulario de creación, junto a título y cuerpo.
  - Al crear, si el campo tiene valor se manda `fechaLimite` en el body del POST; si no, se omite (igual que hoy para los campos que no existían).
  - El error 400 por fecha pasada o inválida se muestra con el mismo mecanismo de error ya existente (`setError` con el mensaje que devuelve el backend) — no se agrega un manejo de error nuevo.
  - En cada `<li>` del listado, si la nota tiene `fechaLimite` se muestra junto a `fechaCreacion`. Si `nota.vencida` es `true`, se agrega una etiqueta de texto "Vencida" y una clase CSS que le da un estilo distintivo (texto/borde rojo) en `page.module.css`.

## Tareas

- [ ] Backend: validar `fechaLimite` opcional en `POST /api/notas` (formato + no puede ser pasada), devolviendo `400` sin crear la nota si falla.
- [ ] Backend: persistir `fechaLimite` en la nota creada (o `null` si no se envía).
- [ ] Backend: calcular `vencida` por nota en `GET /api/notas` sin persistirlo.
- [ ] Frontend: agregar input de fecha límite opcional al formulario de creación, enviarlo en el POST solo si tiene valor.
- [ ] Frontend: mostrar `fechaLimite` en cada nota del listado cuando exista.
- [ ] Frontend: marcar notas con `vencida: true` con etiqueta "Vencida" + estilo visual distinto en `page.module.css`.
- [ ] Frontend: verificar que el mensaje de error del backend (fecha pasada/inválida) se muestra igual que los demás errores de validación.
- [ ] Verificación manual end-to-end (crear con/sin fecha, fecha pasada, fecha futura, eliminar) documentada como parte del cierre del cambio.

## Criterios de aceptación

1. `POST /api/notas` con `{ titulo, cuerpo }` (sin `fechaLimite`) se comporta exactamente igual que hoy: `201`, misma forma de respuesta que antes más el campo nuevo en `null`/ausente — no-regresión.
2. `POST /api/notas` con `fechaLimite` = fecha futura (ej. mañana) → `201`, la nota creada incluye `fechaLimite` con ese valor.
3. `POST /api/notas` con `fechaLimite` = fecha pasada (ej. ayer) → `400`, no se crea la nota, `notas.json` no cambia.
4. `POST /api/notas` con `fechaLimite` en formato inválido (ej. `"31-13-2026"`, o algo que no sea string) → `400`, no se crea la nota.
5. `GET /api/notas`: una nota con `fechaLimite` anterior a hoy tiene `vencida: true`; una con `fechaLimite` de hoy o futura tiene `vencida: false`; una sin `fechaLimite` tiene `vencida: false`.
6. `DELETE /api/notas/:id` sigue comportándose exactamente igual que hoy (no-regresión).
7. UI: se puede crear una nota sin tocar el campo de fecha límite y se comporta igual que antes (no-regresión).
8. UI: al intentar crear una nota con fecha límite pasada o inválida, se muestra el mensaje de error y no se agrega la nota al listado.
9. UI: una nota vencida se muestra con la etiqueta "Vencida" y un estilo visual distinto; una nota no vencida (o sin fecha límite) se ve igual que antes de este cambio.
10. UI: crear y eliminar notas sin usar fecha límite sigue funcionando exactamente igual que antes del cambio (no-regresión general de la capacidad).

## Pendientes de decisión

Ninguno — las decisiones abiertas (fecha pasada al crear, estilo visual de "vencida") ya se resolvieron con el usuario antes de cerrar este plan.

## Nota de destilación (2026-09-14)

Todas las tareas del plan se implementaron tal como estaban descritas; los 10 criterios de aceptación se verificaron en verde (backend por API, frontend en navegador real). Todo lo construido quedó reflejado en `docs/specs/spec-gestion-notas.md` (Comportamiento, Invariantes, Decisiones, Fuera de alcance). No queda nada del plan sin implementar.

Único ajuste hecho durante `/sdd-verificacion`, no anticipado en el plan original: `GET /api/notas` normaliza `fechaLimite` a `null` explícito también para notas creadas antes de este cambio (que no tenían esa clave en `notas.json`), para que el comportamiento coincida exactamente con lo que el spec ya describía ("`fechaLimite` (o `null`)"). No afecta ningún criterio de aceptación ni cambia la persistencia en disco — solo la respuesta del `GET`. No requirió cambios de redacción en el spec.
