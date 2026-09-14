# Plan: Migración del backend de notas a Python/FastAPI

**Fecha:** 2026-09-14
**Estado:** en desarrollo

## Contexto

`docs/specs/spec-gestion-notas.md` describe hoy el comportamiento completo (ya desplegado) de la única capacidad del sistema — crear, listar y eliminar notas, más `fechaLimite`/`vencida` — implementada en:

- `backend/src/index.js` — entrypoint Express, CORS, monta el router.
- `backend/src/notasRouter.js` — endpoints `GET/POST /api/notas`, `DELETE /api/notas/:id`, validación de `titulo`/`cuerpo`/`fechaLimite`, cálculo de `vencida`.
- `backend/src/notasStore.js` — persistencia en `backend/data/notas.db` (SQLite vía `better-sqlite3`, síncrono, WAL).

Se pide reescribir ese backend en Python con FastAPI, **sin cambiar ningún comportamiento observable** (API, códigos de estado, mensajes de error, CORS, persistencia). El frontend (`frontend/`, Next.js) no se toca — sigue consumiendo la API vía `NEXT_PUBLIC_API_URL` sin saber qué stack hay detrás.

Como el sistema tiene una sola capacidad y esa capacidad ya tiene todo el comportamiento (base + recordatorios) unificado en un mismo spec y en los mismos archivos, la migración se hace **fase por fase dentro de este mismo plan** (no módulo por módulo, no son módulos separados en el código actual):

- **Fase 1:** notas base — crear, listar, eliminar (sin `fechaLimite`/`vencida`).
- **Fase 2:** recordatorios — `fechaLimite` al crear, `vencida` al listar.
- **Fase 3:** corte — `backend_py` reemplaza a `backend` como único backend en uso.

`backend_py` no se considera terminado, ni reemplaza al backend Node, hasta tener paridad completa (Fase 1 + Fase 2) confirmada por los tests de caracterización.

## Delta

**NULO.** Ningún comportamiento observable cambia: mismos endpoints, mismos códigos de estado, mismos mensajes de error, mismas reglas de validación, mismos datos (se reusa el mismo archivo `notas.db`, no se migran datos a un esquema nuevo). Lo único que cambia es el lenguaje/stack de implementación del backend.

## Decisiones tomadas y enfoque técnico

- **Ubicación:** proyecto nuevo `backend_py/`, convive junto a `backend/` mientras dura la migración. `backend/` no se toca ni se apaga hasta el corte (Fase 3).
- **Framework:** FastAPI + `uvicorn` como servidor ASGI.
- **Gestión de entorno/paquetes:** `uv` (`uv init`, `pyproject.toml`, `uv add`, `uv run`).
- **Acceso a SQLite:** módulo estándar `sqlite3` (síncrono, SQL crudo), **no** SQLAlchemy — para minimizar diferencias de comportamiento frente al SQL crudo que ya usa `better-sqlite3`. `backend_py` apunta al mismo archivo `backend/data/notas.db` (ruta relativa desde `backend_py/`), mismo esquema de tabla (`notas`: `id TEXT PRIMARY KEY, titulo TEXT NOT NULL, cuerpo TEXT NOT NULL, fecha_creacion TEXT NOT NULL, fecha_limite TEXT`) — no se crea un archivo ni un esquema nuevo. Solo crea la tabla con `CREATE TABLE IF NOT EXISTS` por si el archivo no existiera (no debería pasar: ya existe con datos reales).
- **Bootstrap de migración `notas.json` → `notas.db`:** **no se reproduce** en `backend_py`. La migración de `notas.json` a SQLite (`migrarDesdeJson` en `notasStore.js`) ya ocurrió una vez y quedó destilada como decisión histórica en el spec; `notas.db` ya existe con los datos reales. `backend_py` asume que `notas.db` siempre existe.
- **Puertos:** `backend_py` corre en `4001` durante las Fases 1 y 2 (mientras `backend` sigue en `4000` y es el que usa el frontend). En la Fase 3 (corte), `backend` se apaga y `backend_py` pasa a escuchar en `4000` — el frontend no necesita tocar `NEXT_PUBLIC_API_URL` nunca. Variable de entorno `PORT` en `backend_py`, igual convención que hoy en `backend`.
- **CORS:** `CORSMiddleware` de FastAPI restringido a `FRONTEND_ORIGIN` (default `http://localhost:3000`), igual que hoy — nunca `*`.
- **Equivalencias de librerías:**
  | Node/Express | Python/FastAPI |
  |---|---|
  | `express` | `fastapi` |
  | `cors` (npm) | `fastapi.middleware.cors.CORSMiddleware` |
  | `better-sqlite3` | `sqlite3` (stdlib) |
  | `uuid` (v4, npm) | `uuid.uuid4()` (stdlib) |
  | `node --watch` (dev) | `uvicorn --reload` |
- **Errores:** FastAPI/Pydantic devuelven por defecto `{"detail": [...]}`, distinto a la forma actual `{ "error": "mensaje" }`. `backend_py` valida a mano en el handler (no con un modelo Pydantic que dispare 422 automático) y arma la respuesta de error con la misma forma y los mismos mensajes literales que `notasRouter.js`, para no cambiar el contrato.
- **"Hoy" (fecha UTC):** se replica en Python como fecha UTC del servidor, equivalente a `new Date().toISOString().slice(0, 10)` en JS — `datetime.now(timezone.utc).date().isoformat()`.
- **Tests de caracterización:** `pytest` + `requests`, viven en `backend_py/tests_caracterizacion/`, derivados directamente de `spec-gestion-notas.md` (no del código de `notasRouter.js`). Apuntan a una URL base configurable por variable de entorno `API_BASE_URL` (default `http://localhost:4000`), para poder correr el mismo suite primero contra `backend` (Node) y confirmar que describen el comportamiento real, y después contra `backend_py` (`http://localhost:4001`) en cada fase.
- **Cada fase es su propio cambio acotado** (regla 3.3): se aplica y se verifica por separado en `/sdd-aplicacion`, no se junta todo en un solo commit/cambio.

## Tareas

### Fase 1 — Notas base (crear, listar, eliminar; sin `fechaLimite`/`vencida`) — ✅ completada 2026-09-14

- [x] Crear `backend_py/` con `uv init`, `pyproject.toml`, dependencias: `fastapi`, `uvicorn[standard]`, `pytest`, `requests`.
- [x] Escribir `backend_py/tests_caracterizacion/test_notas_base.py` (pytest + requests, `API_BASE_URL` configurable) con los casos base derivados del spec: `POST` válido (`201`, forma de la nota), `POST` sin `titulo`/`cuerpo` o vacíos (`400`, no crea), `GET` devuelve array, `DELETE` existente (`204`), `DELETE` inexistente (`404`, mensaje `no existe una nota con id <id>`), CORS solo acepta `FRONTEND_ORIGIN`.
- [x] Correr ese suite contra `backend` (Node, `http://localhost:4000`) y confirmar que pasa en verde — valida que los tests describen el comportamiento real antes de tener nada migrado.
- [x] Implementar `backend_py/app/main.py` (FastAPI app, `CORSMiddleware` con `FRONTEND_ORIGIN`, monta el router en `/api/notas`, lee `PORT` — default `4001` en esta fase).
- [x] Implementar `backend_py/app/notas_store.py` (`sqlite3` stdlib) apuntando a `backend/data/notas.db`: `listar_notas()`, `crear_nota()`, `eliminar_nota()` — mismas columnas, mismo `CREATE TABLE IF NOT EXISTS` de resguardo.
- [x] Implementar `backend_py/app/notas_router.py` — `GET/POST /api/notas`, `DELETE /api/notas/{id}` con la misma validación de `titulo`/`cuerpo` y los mismos mensajes de error que `notasRouter.js`. `fechaLimite` se acepta y persiste tal cual si viene (sin validar formato/fecha pasada todavía) y se devuelve en el `GET`; `vencida` **no se calcula todavía** en esta fase (queda para la Fase 2 — el `GET` de esta fase no tiene paridad completa con el spec hasta cerrar la Fase 2, es esperado).
- [x] Levantar `backend_py` en `4001` y correr `test_notas_base.py` contra él — debe pasar igual que contra Node.

### Fase 2 — Recordatorios (`fechaLimite` al crear, `vencida` al listar)

- [ ] Escribir `backend_py/tests_caracterizacion/test_recordatorios.py` con los casos de `fechaLimite`/`vencida` derivados del spec: fecha futura (`201`, incluida en la respuesta), fecha pasada (`400`, no crea), formato inválido (`400`, no crea), sin `fechaLimite` (no-regresión, igual que Fase 1), `vencida: true` para `fechaLimite` pasada, `vencida: false` para hoy/futura/ausente.
- [ ] Correr `test_notas_base.py` + `test_recordatorios.py` contra `backend` (Node) y confirmar que ambos pasan en verde (reconfirma baseline completo).
- [ ] Implementar en `notas_router.py`: validación de `fechaLimite` (regex `YYYY-MM-DD` + fecha calendario válida + no anterior a "hoy" UTC), mismos mensajes de error que hoy.
- [ ] Implementar cálculo de `vencida` en `GET /api/notas` (no persistido), misma regla: `vencida = fechaLimite existe y fechaLimite < hoy`.
- [ ] Correr el suite completo (`test_notas_base.py` + `test_recordatorios.py`) contra `backend_py` (`4001`) — debe pasar igual que contra Node.
- [ ] Verificación manual puntual contra `backend_py` en `4001` (crear con/sin fecha, fecha pasada, fecha futura, listar, eliminar) — sin conectar el frontend todavía.

### Fase 3 — Corte (backend_py reemplaza a backend)

- [ ] Con Fase 1 y Fase 2 en verde contra `backend_py`, apagar `backend` (Node) y correr `backend_py` con `PORT=4000`.
- [ ] Confirmar que el frontend (sin ningún cambio, mismo `NEXT_PUBLIC_API_URL`) sigue funcionando end-to-end contra `backend_py` en `4000` — crear, listar (con y sin vencidas), eliminar, desde la UI real.
- [ ] Actualizar `docs/arquitectura.md`: reemplazar las referencias a `backend/` (Express, `better-sqlite3`, comandos `npm`) por `backend_py/` (FastAPI, `sqlite3`, comandos `uv`).
- [ ] Retirar `backend/` del repo (ya reemplazado por `backend_py/`).

## Criterios de aceptación

1. **Fase 1:** `test_notas_base.py` pasa igual (mismos casos en verde) contra `backend` (Node, 4000) y contra `backend_py` (4001).
2. **Fase 2:** `test_notas_base.py` + `test_recordatorios.py` pasan igual contra `backend` (Node, 4000) y contra `backend_py` (4001) — paridad completa con `spec-gestion-notas.md`.
3. Los mensajes de error (`400`, `404`) de `backend_py` son idénticos, campo por campo y string por string, a los de `backend` para los mismos casos inválidos.
4. `backend_py` lee y escribe sobre el mismo `backend/data/notas.db` — ninguna nota existente se pierde ni se duplica al migrar.
5. CORS de `backend_py` rechaza requests desde un origen distinto de `FRONTEND_ORIGIN`, igual que `backend`.
6. **Fase 3:** con `backend` apagado y `backend_py` en el puerto `4000`, el frontend (sin cambios de código ni de `NEXT_PUBLIC_API_URL`) crea, lista y elimina notas correctamente desde la UI real, incluyendo el marcado visual de "Vencida".
7. Ningún consumidor de la interfaz pública (frontend, o cualquier cliente HTTP externo de la API) tiene que cambiar cómo la usa.

## Pendientes de decisión

Ninguno — las decisiones de stack, ubicación, puertos y alcance de cada fase ya se cerraron con el usuario antes de escribir este plan.

## Nota de destilación — Fase 1 (2026-09-14)

Fase 1 (notas base: crear/listar/eliminar) implementada en `backend_py/` tal como estaba descrita. Criterios de aceptación 1, 3, 4 y 5 verificados en verde (11/11 tests de caracterización contra `backend` Node y contra `backend_py`, mismos datos reales en `notas.db`, mismos mensajes de error, CORS acotado en ambos). Los criterios 2 y 6 son de Fase 2/3, no aplicaron a esta corrida. Revisión humana del diff del spec: aprobada.

Se destiló a `docs/specs/spec-gestion-notas.md` una **Decisión** fechada documentando el estado de la migración (Fase 1 lista, backend en uso real sigue siendo Node hasta el corte). No se tocó `Comportamiento` ni `Invariantes` (delta NULO, como estaba previsto) ni `Referencias` (prematuro: `backend/` sigue siendo el código real en producción).

**El plan sigue `en desarrollo`** — quedan las Fases 2 (recordatorios) y 3 (corte) sin implementar. Cuando el corte (Fase 3) cierre con su propio ciclo Aplicación → Verificación, recién ahí este plan pasa a `Estado: destilado`.
