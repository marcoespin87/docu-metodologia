# Documento de arquitectura y convenciones — Sistema de Pedidos (caso1)

## Regla obligatoria para cualquier asistente de IA

**3.1 Specs primero.** Antes de proponer o construir cualquier cambio, leer
el spec de la capacidad afectada en `docs/specs/` (ver
`docs/specs/README.md` para el índice). El spec manda sobre este
documento, y este documento manda sobre memoria de sesión o apuntes
sueltos.

## Patrón arquitectónico

API HTTP con Express, monolito modular por **capacidad**: cada carpeta bajo
`src/` es una capacidad con su propio spec y no conoce los detalles internos
de las demás.

- `src/auth/` — capacidad "auth": login simulado y RBAC (autenticación por
  token + autorización por rol).
- `src/inventario/` — capacidad "inventario": catálogo de productos,
  validación de disponibilidad y reserva/reposición de stock.
- `src/pedidos/` — capacidad "pedidos": creación multi-línea, cálculo de
  subtotal/impuestos/total, máquina de estados (`estados.js`).
- `src/historial/`, `src/pagos/`, `src/notificaciones/`, `src/logistica/`
  — se agregan en fases posteriores (ver
  `docs/plan-sistema-pedidos-2026-09-11.md`).

Todas las capacidades de negocio comparten el mismo almacén persistido
(`src/store.js`), que no es una capacidad en sí misma: es infraestructura
interna.

Las capacidades se comunican por **eventos**, no por llamada directa, para
efectos secundarios como las notificaciones (ver
`docs/specs/spec-notificaciones.md` cuando exista): quien emite un evento no
conoce a quién lo escucha.

## Stack

- Node.js (>= 18) + Express.
- Test runner nativo `node:test` + `node:assert/strict`, más `supertest`
  para tests de integración HTTP.

## Comandos

```bash
npm install
npm test         # corre toda la suite (node --test)
npm start        # levanta el servidor HTTP en PORT (default 3000)
```

## Invariantes transversales

- **Persistencia en archivo JSON, no en memoria.** Por qué: a diferencia de
  versiones anteriores de este ejercicio, acá el sistema se expone como API
  HTTP real y debe sobrevivir a reinicios del proceso durante una demo
  manual. La ruta es `data/db.json`, configurable vía la variable de entorno
  `DB_PATH` — los tests usan siempre un archivo temporal propio para no
  compartir estado entre sí ni con los datos reales.
- **Las sesiones de auth (tokens) NO se persisten a disco.** Por qué: son
  estado efímero de proceso, no datos de negocio; persistirlas agregaría
  complejidad (expiración, limpieza) sin necesidad para el alcance del
  ejercicio.
- **RBAC no es una opción de UX, es un invariante de seguridad.** Ninguna
  capacidad debe confiar en que el cliente HTTP mande el rol o el id
  correctos: siempre se deriva del token vía `authMiddleware`.
- **Sin base de datos real ni ORM.** Por qué: el objetivo de este proyecto
  es demostrar la metodología SDD spec-anchored, no construir un producto
  de producción (YAGNI).

## Documentos vivos

- Specs por capacidad: `docs/specs/` (índice en `docs/specs/README.md`).
- Plan de origen del sistema completo: `docs/plan-sistema-pedidos-2026-09-11.md`.
