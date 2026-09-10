# Plan: Sistema de pedidos — desde cero

**Fecha:** 2026-09-10 · **Caso:** 1 — Desde cero · **Estado:** destilado (construido)

## Contexto

No existe sistema ni specs. Se necesita gestionar pedidos: crearlos, verlos
en un historial y cambiarles el estado.

## Delta

100% del sistema (no hay nada previo).

## Stack elegido

Node.js sin framework ni dependencias externas, con `node:test` para las
pruebas. Justificación: el objetivo es probar la metodología SDD, no
construir un producto; un stack mínimo sin instalación reduce fricción.

## Enfoque técnico

Dos capacidades, dos módulos:

- **Pedidos** (`src/pedidos.js`): `crearPedido`, `cambiarEstado`.
- **Historial** (`src/historial.js`): `listarHistorial`.

Almacén compartido en memoria (`src/store.js`).

## Tareas

- [x] F0: modelo de pedido + `crearPedido`
- [x] F1: `listarHistorial`
- [x] F2: `cambiarEstado`

## Criterios de aceptación

1. `crearPedido({cliente, items})` devuelve un pedido con `id`, `cliente`,
   `items`, `estado: 'pendiente'` y `creadoEn` (timestamp).
2. `crearPedido` rechaza (lanza error) si falta `cliente` o `items` está
   vacío.
3. `listarHistorial()` devuelve todos los pedidos creados, en el orden en
   que fueron creados.
4. `cambiarEstado(id, nuevoEstado)` cambia el estado del pedido si
   `nuevoEstado` ∈ {pendiente, enviado, entregado, cancelado}, y el cambio
   se refleja en `listarHistorial()`.
5. `cambiarEstado` lanza error si el `id` no existe o si `nuevoEstado` no
   es uno de los 4 estados válidos.

## Pendientes de decisión

Ninguno — proyecto de alcance acotado para el ejercicio.
