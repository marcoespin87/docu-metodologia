# Plan: Sistema avanzado de gestión de pedidos (Caso 1 — desde cero)

**Fecha:** 2026-09-11 · **Estado:** en desarrollo · **Tipo:** plan padre con fases

## Contexto

`proyectos/caso1` está vacío. No hay sistema ni specs previos (Caso 1 de la
metodología). Se construye desde cero un sistema de gestión de pedidos con
siete capacidades: ciclo de vida del pedido, autenticación/RBAC, inventario,
búsqueda y filtrado del historial, pagos simulados, notificaciones orientadas
a eventos, y logística/post-venta.

Por el tamaño del requerimiento (siete capacidades interdependientes), se
divide en fases (F0–F6) dentro de este plan padre, tal como indica la regla
3.3 de la metodología. Cada fase deja el sistema funcionando y testeado, y
nutre su propio spec al completarse (F0 nutre `spec-auth.md`, F1
`spec-inventario.md`, etc.), sin esperar a que termine todo el plan.

## Delta

100% del sistema (no hay nada previo que romper). Todo el comportamiento
descrito abajo es nuevo.

## Decisiones tomadas

- **2026-09-11: Stack — Node.js + Express**, sin ORM ni base de datos real.
  Elegido para exponer una API HTTP real (login, RBAC por token, endpoints
  REST) en vez de solo una capa de librería, ya que el pedido incluye
  autenticación y autorización como capacidad de primer nivel.
- **2026-09-11: Persistencia — archivo JSON en disco** (`data/db.json`),
  cargado a memoria al arrancar y reescrito en cada mutación. Suficiente
  para el alcance del ejercicio; evita la complejidad de una base de datos
  real. En tests, cada suite usa un archivo temporal propio (vía variable de
  entorno `DB_PATH`) para no compartir estado entre tests ni con `data/db.json`.
- **2026-09-11: Auth simulada** — usuarios seed fijos (sin registro), login
  contra una lista en memoria, token opaco simulado (no JWT real) que el
  middleware resuelve a un usuario. Es intencionalmente simple: el foco del
  ejercicio es la metodología, no un sistema de auth de producción.
- **2026-09-11: RBAC no es opcional en el filtro de historial** — un
  `cliente` nunca puede ver pedidos de otro cliente, incluso si fuerza el
  query param `clienteId`. Es invariante de seguridad, no una opción de UX.
- **2026-09-11: Pagos y notificaciones se simulan en memoria**, sin latencia
  artificial ni resultados aleatorios por defecto — el resultado del pago es
  forzable vía body (`resultado: 'exito' | 'fallo'`) para que los tests sean
  determinísticos. Las notificaciones se registran en un log en memoria
  (no se envía nada real).
- **2026-09-11: Testing con `node --test` + `supertest`** — única
  dependencia de test agregada, necesaria porque la interfaz es HTTP (no
  llamadas directas a funciones como en versiones anteriores del ejercicio).
- **2026-09-11: Reserva de stock es todo-o-nada** — si alguna línea del
  pedido no tiene stock suficiente, no se crea el pedido ni se reserva nada
  de las demás líneas.
- **2026-09-11: Tasa de impuesto fija del 15%** sobre el subtotal, aplicada
  de forma plana a todo pedido (sin categorías de producto exentas). Valor
  arbitrario elegido para el ejercicio; vive como constante en
  `pedidos.service`.

## Enfoque técnico

### Estructura de carpetas

```
proyectos/caso1/
  AGENTS.md                 # arquitectura y convenciones (contexto de sesión)
  README.md
  package.json
  data/                      # persistencia JSON (gitignored salvo .gitkeep)
  docs/
    plan-sistema-pedidos-2026-09-11.md   # este documento
    specs/
      README.md              # índice capacidad -> spec
      spec-auth.md
      spec-inventario.md
      spec-pedidos.md
      spec-historial.md
      spec-pagos.md
      spec-notificaciones.md
      spec-logistica.md
  src/
    store.js                 # infraestructura interna (JSON en disco)
    app.js                   # construye la app Express (para tests)
    server.js                # arranca el servidor HTTP
    auth/
      auth.service.js
      auth.middleware.js
      auth.routes.js
    inventario/
      inventario.service.js
      inventario.routes.js
    pedidos/
      pedidos.service.js
      pedidos.routes.js
      estados.js              # máquina de estados
    historial/
      historial.service.js     # reutiliza store de pedidos, agrega paginación/filtros
    pagos/
      pagos.service.js
      pagos.routes.js
    notificaciones/
      notificaciones.service.js # EventEmitter + listeners simulados
    logistica/
      logistica.service.js
      logistica.routes.js
  test/
    auth.test.js
    inventario.test.js
    pedidos.test.js
    historial.test.js
    pagos.test.js
    notificaciones.test.js
    logistica.test.js
  cli-demo.js                 # smoke test: levanta el server y hace requests reales
```

### Modelo de datos

- **Usuario**: `{id, nombre, usuario, password, rol: 'cliente'|'administrador', token}`.
- **Producto**: `{id, nombre, precioUnitario, stock}`.
- **Pedido**: `{id, clienteId, lineas:[{productoId, cantidad, precioUnitario}], subtotal, impuestos, total, estado, guiaEnvio, transaccionPagoId, historialEstados:[{estado, fecha}], creadoEn}`.
- **Notificación**: `{id, pedidoId, tipo, canal: 'email'|'sms', mensaje, fecha}` (log en memoria, expuesto solo para inspección en tests).

### Máquina de estados del pedido

```
Pendiente -> Procesando -> Pagado -> Enviado -> Entregado
Pendiente | Procesando -> Cancelado
Entregado -> Devuelto
```

Cualquier otra transición se rechaza con error 409 (invariante de la
capacidad `pedidos`). `POST /pedidos/:id/pago` solo se acepta con el
pedido en `Pendiente`; internamente lo mueve a `Procesando` durante el
intento y luego, según el resultado, a `Pagado` o de vuelta a `Pendiente`
(sin límite de reintentos automático — cancelar es una acción explícita
vía `POST /pedidos/:id/cancelar`).

### RBAC

- `authMiddleware`: valida el header `Authorization: Bearer <token>`,
  adjunta `req.usuario`. Sin token válido → 401.
- `requireRole(...roles)`: 403 si `req.usuario.rol` no está en la lista.
- En `GET /pedidos`, si `req.usuario.rol === 'cliente'`, el filtro
  `clienteId` se sobrescribe siempre con `req.usuario.id`.

### Endpoints

```
POST  /auth/login                 {usuario, password} -> {token, rol}
GET   /productos                  (requiere auth)
POST  /pedidos                    (cliente crea para sí mismo; admin puede indicar clienteId)
GET   /pedidos                    ?page&pageSize&estado&fechaDesde&fechaHasta&clienteId&transaccionId
GET   /pedidos/:id
PATCH /pedidos/:id/estado         {estado}              (admin; única transición permitida acá: Enviado -> Entregado)
POST  /pedidos/:id/pago           {resultado?}          (simula pasarela)
POST  /pedidos/:id/envio          {guia}                (admin)
POST  /pedidos/:id/cancelar
POST  /pedidos/:id/devolucion
```

### Notificaciones orientadas a eventos

`pedidos.service` emite un evento `pedido:estadoCambiado` (vía
`EventEmitter` de Node) cada vez que cambia `estado`. `notificaciones`
se suscribe una sola vez al arrancar la app y registra una notificación
simulada por canal (email + SMS) en su log interno. Ninguna otra
capacidad conoce a `notificaciones`: el acoplamiento es unidireccional
por evento, no por llamada directa.

## Fases / tareas

- **F0 — Infraestructura + Auth**: `store.js` (JSON en disco,
  `reset`/`cargar`/`guardar`), `app.js`/`server.js`, usuarios seed,
  `POST /auth/login`, middlewares de auth y rol, `AGENTS.md`. *Nace
  `spec-auth.md`.*
- **F1 — Inventario**: catálogo de productos seed, `validarDisponibilidad`,
  `reservarStock`, `reponerStock`, `GET /productos`. *Nace
  `spec-inventario.md`.*
- **F2 — Pedidos**: `POST /pedidos` (multi-línea, cálculo de subtotal +
  impuestos + total, reserva de stock todo-o-nada), máquina de estados,
  `PATCH /pedidos/:id/estado`, `GET /pedidos/:id`. *Nace
  `spec-pedidos.md`.*
- **F3 — Historial**: `GET /pedidos` con paginación y filtros (estado,
  rango de fechas, clienteId, transaccionId) + invariante RBAC del filtro.
  *Nace `spec-historial.md`.*
- **F4 — Pagos**: `POST /pedidos/:id/pago`, transición automática de
  estado según resultado (forzable en el body para tests). *Nace
  `spec-pagos.md`.*
- **F5 — Notificaciones**: `EventEmitter` en `pedidos`, listener en
  `notificaciones`, log de notificaciones simuladas verificable en tests.
  *Nace `spec-notificaciones.md`.*
- **F6 — Logística y post-venta**: `POST /pedidos/:id/envio` (asigna
  guía, pasa a `Enviado`), `POST /pedidos/:id/cancelar` (repone stock),
  `POST /pedidos/:id/devolucion` (repone stock desde `Entregado`). *Nace
  `spec-logistica.md`.*

Cada fase se implementa con TDD (test antes que código) y deja
`npm test` en verde antes de pasar a la siguiente.

## Criterios de aceptación

- **F0**: login con credenciales válidas devuelve token y rol; login
  inválido devuelve 401; endpoint protegido sin token devuelve 401; con
  token de rol incorrecto devuelve 403.
- **F1**: crear un pedido con cantidad mayor al stock disponible falla sin
  reservar nada; con stock suficiente, el stock se descuenta exactamente
  en la cantidad pedida.
- **F2**: un pedido con N líneas calcula `subtotal` = suma de
  `cantidad * precioUnitario`, `impuestos` con la tasa fija definida, y
  `total = subtotal + impuestos`; una transición de estado no contemplada
  en la máquina de estados devuelve 409 y no modifica el pedido.
- **F3**: filtrar por cada uno de los 4 criterios (estado, rango de
  fechas, clienteId, transaccionId) devuelve exactamente los pedidos que
  cumplen; la paginación no repite ni omite pedidos entre páginas
  consecutivas; un cliente que pide `clienteId` de otro usuario recibe solo
  sus propios pedidos.
- **F4**: forzar `resultado: 'exito'` mueve el pedido a `Pagado`; forzar
  `resultado: 'fallo'` lo devuelve a un estado reintentable y no lo deja en
  `Pagado`.
- **F5**: cada cambio de estado genera al menos una notificación registrada
  con el `pedidoId` y el estado nuevo correctos; no se generan
  notificaciones si la transición fue rechazada.
- **F6**: asignar guía de envío exige que el pedido esté `Pagado`;
  cancelar un pedido `Pendiente`/`Procesando` repone exactamente el stock
  reservado; una devolución sobre un pedido `Entregado` repone stock y dej
  deja el pedido en `Devuelto`; cancelar un pedido ya `Enviado` se rechaza.

## Pendientes de decisión

Ninguno — todas las decisiones de alcance se cerraron en la fase de
brainstorming (stack, interfaz, persistencia, nivel de simulación) antes
de escribir este plan.
