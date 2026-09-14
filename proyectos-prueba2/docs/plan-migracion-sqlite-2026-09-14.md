# Plan: Migración de persistencia de notas a SQLite

**Fecha:** 2026-09-14
**Estado:** destilado

## Destilado
Aprobado por el usuario tras la revisión humana del diff en `/sdd-verificacion` (2026-09-14). Todas las tareas del plan se implementaron tal cual estaban planteadas — nada quedó afuera. Se destiló a `docs/specs/spec-gestion-notas.md` (Decisiones: nueva decisión fechada 2026-09-14 sobre SQLite, reemplazando la de JSON plano; Referencias actualizada) y a `docs/arquitectura.md` (invariante transversal "Persistencia sin base de datos" reemplazado por "Persistencia en SQLite embebido"). La sección Comportamiento del spec y sus Invariantes quedaron intactos — el comportamiento observable de la API/UI no cambió (paridad verificada contra los 10 criterios de aceptación).

## Contexto
La capacidad `gestion-notas` (spec: `docs/specs/spec-gestion-notas.md`) persiste hoy las notas en `backend/data/notas.json`, un archivo JSON plano leído/escrito completo en cada operación (`notasStore.js` con `leerNotas()`/`guardarNotas(notas)`, usadas por `notasRouter.js`). Esto fue una decisión explícita del spec ("uso personal, sin necesidad de concurrencia real ni de queries complejas") y un invariante transversal documentado en `docs/arquitectura.md` ("Persistencia sin base de datos").

Con más notas, reescribir el archivo entero en cada cambio (crear o eliminar una nota) deja de escalar. Se pide migrar el almacenamiento a SQLite **sin cambiar nada de lo que el usuario ve o hace**: mismos endpoints, mismas validaciones, misma UI. Hay 3 notas reales hoy en `backend/data/notas.json` que deben preservarse.

Esto es un **Caso 3 — cambio de implementación únicamente** (confirmado en `/sdd-exploracion`): no toca la sección Comportamiento del spec, solo Decisiones/Referencias del spec y el invariante transversal de arquitectura que se revierte a propósito.

## Delta
**MODIFICADO.** Cambia el mecanismo de persistencia (JSON plano → SQLite) y, para resolver realmente el problema de escalabilidad planteado (no solo cambiar de motor de archivo), la interfaz de `notasStore.js` pasa de operar sobre el array completo (`leerNotas`/`guardarNotas`) a operaciones granulares por nota (`listarNotas`/`crearNota`/`eliminarNota`). El comportamiento observable de la API y la UI no cambia.

## Decisiones tomadas y enfoque técnico
- **Librería:** `better-sqlite3` (API síncrona) — encaja con el código actual, totalmente síncrono, sin convertir `notasRouter.js` a async/await. No cambia el requisito de Node documentado en `arquitectura.md` (18+, probado con 24).
- **Archivo de base de datos:** `backend/data/notas.db`, junto al `notas.json` existente.
- **Esquema:** tabla `notas` — `id TEXT PRIMARY KEY`, `titulo TEXT NOT NULL`, `cuerpo TEXT NOT NULL`, `fecha_creacion TEXT NOT NULL`, `fecha_limite TEXT NULL`. **Sin columna `vencida`** — invariante del spec ("`vencida` se calcula, nunca se persiste"): se sigue calculando en `notasRouter.js` igual que hoy, comparando `fechaLimite` contra la fecha actual en cada `GET`.
- **Migración de datos existentes:** al arrancar el backend, si `backend/data/notas.db` **no existe todavía** en disco, se crea, se crea el esquema, y si `backend/data/notas.json` existe se importan sus notas tal cual (mismos `id`, `titulo`, `cuerpo`, `fechaCreacion`, `fechaLimite`) una única vez. La condición de disparo es la ausencia del archivo `.db` (no "la tabla está vacía"), para no reimportar notas viejas si el usuario borra todas sus notas desde la UI en el futuro.
- **`notas.json` después de migrar:** se deja intacto en disco como backup; el backend deja de leerlo/escribirlo en cuanto `notas.db` existe. No se borra automáticamente.
- **Reescritura de `notasStore.js`:** expone `listarNotas()`, `crearNota(nota)`, `eliminarNota(id)` en vez de `leerNotas()`/`guardarNotas(notas)`. `notasRouter.js` se actualiza para llamar a las nuevas funciones — sin cambiar validaciones, códigos de estado ni forma de las respuestas.
- **`backend/data/notas.json` y `backend/data/notas.db`** siguen sin estar en `.gitignore`, igual que hoy (no se introduce un cambio de convención de versionado como efecto lateral de este cambio).

## Tareas
- [x] Agregar `better-sqlite3` a `backend/package.json`.
- [x] Crear el módulo de conexión/esquema SQLite (dentro de `notasStore.js` o en un `backend/src/db.js` nuevo) que abre/crea `backend/data/notas.db` y crea la tabla `notas` si no existe.
- [x] Implementar la migración one-shot desde `notas.json` cuando `notas.db` no existe todavía.
- [x] Reescribir `notasStore.js`: `listarNotas()`, `crearNota(nota)`, `eliminarNota(id)` sobre SQLite, sin columna `vencida`.
- [x] Actualizar `notasRouter.js` para usar las nuevas funciones del store, preservando validaciones, status codes y forma de las respuestas.
- [x] Verificar manualmente los criterios de aceptación (no hay tests automatizados en el proyecto todavía).
- [x] Actualizar `docs/specs/spec-gestion-notas.md`: sección Decisiones (nueva decisión fechada reemplazando/complementando la de JSON plano) y Referencias (`notasStore.js` ahora es SQLite).
- [x] Actualizar `docs/arquitectura.md`: invariante transversal "Persistencia sin base de datos" → reemplazar por el invariante nuevo (SQLite vía `better-sqlite3`, archivo único `notas.db`, sin servidor de base de datos separado).

## Criterios de aceptación
1. Tras arrancar el backend por primera vez con el código nuevo, `GET /api/notas` devuelve las mismas 3 notas que había en `notas.json` (mismos `id`, `titulo`, `cuerpo`, `fechaCreacion`, `fechaLimite`), con `vencida` calculado igual que antes.
2. `POST /api/notas` con `titulo`/`cuerpo` válidos (y `fechaLimite` opcional válida) devuelve `201` con la nota creada, y la nota sigue apareciendo en `GET /api/notas` después de reiniciar el proceso del backend.
3. `POST /api/notas` sin `titulo` o `cuerpo`, o con alguno vacío, devuelve `400` y no cambia el total de notas en `GET /api/notas`.
4. `POST /api/notas` con `fechaLimite` en formato inválido o con fecha anterior a hoy devuelve `400` y no crea la nota.
5. `DELETE /api/notas/:id` con un id existente devuelve `204`, la nota deja de aparecer en `GET /api/notas`, y sigue sin aparecer después de reiniciar el backend.
6. `DELETE /api/notas/:id` con un id inexistente devuelve `404` y no modifica las notas existentes.
7. Inspeccionando el esquema de `notas.db`, la tabla `notas` no tiene columna `vencida`.
8. `backend/data/notas.json` no cambia de contenido antes/después de arrancar el backend migrado (se preserva como backup, no se reescribe).
9. El frontend (`frontend/app/page.js`) crea, lista y elimina notas correctamente desde la UI sin haber cambiado una línea de su código.
10. `npm install && npm run dev` en `backend/` sigue funcionando en Windows con Node 18+ sin pasos manuales adicionales más allá de lo que ya documenta `arquitectura.md`.

## Pendientes de decisión
Ninguno — las decisiones abiertas identificadas en Exploración (librería SQLite, manejo de `notas.json` tras migrar) quedaron resueltas arriba.
