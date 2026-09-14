# Plan: Migración a Python

**Fecha:** 2026-09-13

## Contexto
El sistema actual "Gestión de Pedidos" (Caso 4) está implementado en Node.js, Express y SQLite. Se requiere migrar la aplicación completa a Python sin modificar su comportamiento, manteniendo la estricta paridad con las especificaciones actuales (`spec-pedidos.md`).

## Delta
**NULO.** El comportamiento, la API (endpoints, códigos HTTP, formatos JSON) y la base de datos (esquema y archivo local SQLite) permanecen idénticos.

## Enfoque Técnico
- **Stack Python:** Se utilizará `Flask` (análogo directo a Express para APIs simples) y `sqlite3` (librería estándar de Python).
- **Estrategia de Paridad:** Se escribirán tests de caracterización agnósticos (basados en HTTP) usando `pytest` y `requests`.
- **Ejecución:** Cada fase validará primero el test contra el servidor actual de Node.js (baseline). Luego, se implementará el código equivalente en Python y se validará que pase el mismo test.
- **Base de Datos:** Se seguirá utilizando el archivo `pedidos.db`.

## Decisiones Tomadas
- 2026-09-13: Uso de Flask para mantener un mapeo arquitectónico casi 1:1 con las rutas y manipulaciones manuales de Express.
- 2026-09-13: La migración será de un módulo a la vez (por endpoints lógicos).

## Fases y Tareas

### Fase 1: Setup y Creación de Pedidos (`POST /pedidos`)
- [ ] Escribir tests de caracterización (`tests/test_fase1_creacion.py`) para `POST /pedidos`.
- [ ] Validar test corriendo Node.js.
- [ ] Crear estructura básica en `src/app.py` en Python y migrar la lógica de base de datos.
- [ ] Implementar `POST /pedidos` en Python.
- [ ] Ejecutar test contra el servidor Python.

### Fase 2: Historial y Filtrado (`GET /pedidos`)
- [ ] Escribir tests de caracterización (`tests/test_fase2_historial.py`) para `GET /pedidos` (filtros simples, múltiples e inválidos).
- [ ] Validar test contra Node.js.
- [ ] Implementar `GET /pedidos` en Python.
- [ ] Ejecutar test contra el servidor Python.

### Fase 3: Transiciones de Estado (`PUT /pedidos/:id/estado`)
- [ ] Escribir tests de caracterización (`tests/test_fase3_transicion.py`) para el cambio de estados, validaciones de invariantes lógicos y casos `404`.
- [ ] Validar test contra Node.js.
- [ ] Implementar `PUT /pedidos/:id/estado` en Python.
- [ ] Ejecutar test contra el servidor Python.

### Fase 4: Destilado y Limpieza
- [ ] Actualizar *Referencias* y *Decisiones* en `docs/specs/spec-pedidos.md`.
- [ ] Actualizar el stack y los comandos de inicio en `AGENTS.md`.
- [ ] Eliminar los remanentes de Node.js (`package.json`, `index.js`, etc.).

## Criterios de Aceptación
1. **Paridad total:** Los tests de caracterización diseñados a partir del spec deben pasar idénticamente tanto en la versión Node como en la versión Python.
2. **Cero cambios observables:** Ningún consumidor de la API deberá ajustar sus llamadas ni notar que la tecnología cambió (incluyendo formatos de error y códigos HTTP).
