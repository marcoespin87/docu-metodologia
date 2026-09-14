# Arquitectura y Convenciones

**Proyecto:** Gestión de Pedidos (Caso 5 — código heredado)
**Patrón Arquitectónico:** Monolito simple (todo en `app.js`, sin capas separadas — así se encontró el código).
**Stack:** Node.js, Express, SQLite.

## Invariantes Transversales
- **Persistencia local:** Se usa SQLite en un archivo local (`pedidos.db`). No hay base de datos distribuida ni réplicas.
- **Formato de Comunicación:** Todos los endpoints consumen y retornan JSON (`application/json`).

## Estado de la documentación (Caso 5)
Este proyecto arrancó sin specs ni documento de arquitectura. Está pasando por la **Fase 0** de la metodología (ingeniería inversa de especificación), capacidad por capacidad — ver `docs/specs/README.md` para saber qué ya está documentado y qué todavía no. Hasta que una capacidad tenga su spec en `Estado: desplegado`, no asumas que su comportamiento actual es el correcto: puede ser un bug heredado todavía sin revisar.

## Reglas de Metodología (Spec-Anchored)
- **Specs primero:** Antes de proponer o aplicar cualquier cambio, el asistente DEBE leer el spec de la capacidad afectada en `docs/specs/` (si ya existe) o completar su Fase 0 primero (si no existe).
- **Fusión anclada:** Cualquier cambio en el comportamiento se actualiza en el código Y en el spec correspondiente (`docs/specs/spec-*.md`) en el mismo commit.

## Comandos Útiles
- Iniciar servidor: `node app.js`
- Correr tests: `npm test`
