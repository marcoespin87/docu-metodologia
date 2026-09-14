# Arquitectura y Convenciones

**Proyecto:** Gestión de Pedidos (Migrado a Python)
**Patrón Arquitectónico:** Monolito simple (Rutas -> Controladores -> DB).
**Stack:** Python, Flask, SQLite.

## Invariantes Transversales
- **Persistencia local:** Se usa SQLite en un archivo local (`pedidos.db`). No hay base de datos distribuida ni réplicas.
- **Formato de Comunicación:** Todos los endpoints consumen y retornan JSON (`application/json`).
- **Estados HTTP:** 200 OK para lecturas y actualizaciones, 201 Created para creaciones, 400 Bad Request para validaciones fallidas.

## Reglas de Metodología (Spec-Anchored)
- **Specs primero:** Antes de proponer o aplicar cualquier cambio, el asistente DEBE leer el spec de la capacidad afectada en `docs/specs/`.
- **Fusión anclada:** Cualquier cambio en el comportamiento (nuevo endpoint, nueva regla de estado) se actualiza en el código Y en el spec correspondiente (`docs/specs/spec-*.md`) en el mismo commit.

## Comandos Útiles
- Iniciar servidor: `python src/app.py`
- Ejecutar tests de caracterización: `pytest tests/`
