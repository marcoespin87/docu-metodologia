# Spec: Gestión de notas

**Estado:** desplegado · **Última revisión:** 2026-09-14

## Propósito
Permite al usuario crear notas personales con título y cuerpo, opcionalmente con una fecha límite, ver el listado completo de sus notas (marcando las vencidas), y eliminar una nota puntual.

## Comportamiento
- **Crear nota:** `POST /api/notas` con `{ titulo, cuerpo, fechaLimite? }` (`titulo`/`cuerpo` strings no vacíos; `fechaLimite` opcional, string `"YYYY-MM-DD"`). Devuelve `201` con la nota creada (`id`, `titulo`, `cuerpo`, `fechaCreacion`, `fechaLimite`). Si falta `titulo` o `cuerpo`, o vienen vacíos, devuelve `400` sin crear nada. Si `fechaLimite` viene con formato inválido o es una fecha anterior a hoy, devuelve `400` sin crear nada.
- **Listar notas:** `GET /api/notas` devuelve un array con todas las notas existentes, cada una con `id`, `titulo`, `cuerpo`, `fechaCreacion`, `fechaLimite` (o `null`) y `vencida` (booleano, calculado en cada request).
- **Eliminar nota:** `DELETE /api/notas/:id` elimina la nota con ese id y devuelve `204`. Si el id no existe, devuelve `404` sin modificar las notas existentes.
- **UI (frontend):** una única página con un formulario (título + cuerpo + fecha límite opcional) para crear notas, un listado de las notas existentes debajo, y un botón "Eliminar" por cada nota. Cada nota muestra su `fechaLimite` si tiene una, y las notas vencidas se marcan con una etiqueta de texto "Vencida" y un estilo visual distinto. Los errores del backend (validación, backend no disponible) se muestran en la misma página.

## Invariantes (no negociables)
- **Título y cuerpo no vacíos:** ninguna nota puede crearse ni persistirse con `titulo` o `cuerpo` vacíos o ausentes. *(Porqué: una nota sin título o sin cuerpo no tiene sentido para el propósito de la capacidad; se valida en el backend, no solo en el cliente, para que no se pueda saltear.)*
- **El frontend nunca escribe el archivo de datos directamente:** toda creación/eliminación pasa por la API del backend. *(Porqué: mantiene un único punto de verdad y de validación sobre `notas.json`.)*
- **CORS acotado al origen del frontend:** el backend no acepta requests desde cualquier origen (`*`). *(Porqué: evitar que otros procesos en la misma red lean o borren notas sin querer.)*
- **`fechaLimite` no puede ser una fecha pasada al crear la nota:** el backend rechaza con `400` cualquier `fechaLimite` anterior a la fecha actual del servidor. *(Porqué: decisión explícita del usuario — no tiene sentido crear una nota que nace ya vencida.)*
- **`vencida` se calcula, nunca se persiste:** el campo `vencida` no vive en `notas.json`, se recalcula en cada `GET /api/notas` comparando `fechaLimite` contra la fecha actual. *(Porqué: si se persistiera quedaría desactualizado a medida que pasan los días sin que la nota se vuelva a guardar.)*

## Decisiones
- 2026-09-14: Persistencia en archivo JSON plano (`backend/data/notas.json`) en vez de una base de datos — *Porqué: uso personal, sin necesidad de concurrencia real ni de queries complejas.*
- 2026-09-14: Backend (Express) y frontend (Next.js) como dos proyectos/procesos separados en vez de usar las API routes de Next.js — *Porqué: decisión explícita del usuario al aprobar el plan.*
- 2026-09-14: No hay edición de notas, autenticación, búsqueda ni categorías — *Porqué: fuera del alcance pedido para esta primera versión.*
- 2026-09-14: `fechaLimite` es solo fecha (día), sin hora — *Porqué: decisión explícita del usuario; alcanza para el caso de uso de recordatorios personales.*
- 2026-09-14: "Hoy", tanto para validar `fechaLimite` al crear como para calcular `vencida` al listar, se calcula como la fecha UTC del servidor (`new Date().toISOString().slice(0, 10)`) — *Porqué: mantiene ambos cálculos consistentes entre sí sin depender de la zona horaria del cliente.*

## Fuera de alcance
- Editar una nota existente (incluida su `fechaLimite`).
- Autenticación o separación de notas por usuario.
- Búsqueda, filtros, etiquetas o categorías.
- Persistencia en base de datos.
- Notificaciones o recordatorios activos (email, push, etc.) — solo se marca visualmente en el listado.

## Referencias
- Código backend: `backend/src/notasRouter.js`, `backend/src/notasStore.js`, `backend/src/index.js`
- Código frontend: `frontend/app/page.js`
- Tests: no hay tests automatizados todavía; verificación manual documentada en `docs/plan-gestor-notas-2026-09-14.md`
- Arquitectura: `docs/arquitectura.md`
