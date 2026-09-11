'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const os = require('os');

test.before(() => {
  process.env.DB_PATH = path.join(os.tmpdir(), `caso1-pedidos-service-${Date.now()}-${Math.random().toString(16).slice(2)}.json`);
});

test.after(() => {
  delete process.env.DB_PATH;
});

const { crearPedido, obtenerPedido, cambiarEstado } = require('../src/pedidos/pedidos.service');
const inventarioService = require('../src/inventario/inventario.service');
const { CATALOGO_SEED, buscarProducto } = inventarioService;

test.beforeEach(() => {
  inventarioService.reset();
});

const CLIENTE = { id: 1, rol: 'cliente' };

test('crea un pedido con una línea y calcula subtotal, impuestos (15%) y total', () => {
  const libro = CATALOGO_SEED[0];

  const pedido = crearPedido(CLIENTE, { lineas: [{ productoId: libro.id, cantidad: 2 }] });

  assert.equal(pedido.subtotal, libro.precioUnitario * 2);
  assert.equal(pedido.impuestos, Math.round(libro.precioUnitario * 2 * 0.15));
  assert.equal(pedido.total, pedido.subtotal + pedido.impuestos);
  assert.equal(pedido.estado, 'Pendiente');
  assert.equal(pedido.clienteId, CLIENTE.id);
});

test('crea un pedido con múltiples líneas sumando subtotal de cada una', () => {
  const libro = CATALOGO_SEED[0];
  const taza = CATALOGO_SEED[1];

  const pedido = crearPedido(CLIENTE, {
    lineas: [
      { productoId: libro.id, cantidad: 1 },
      { productoId: taza.id, cantidad: 3 },
    ],
  });

  const subtotalEsperado = libro.precioUnitario * 1 + taza.precioUnitario * 3;
  assert.equal(pedido.subtotal, subtotalEsperado);
  assert.equal(pedido.lineas.length, 2);
});

test('el precioUnitario de cada línea se toma del catálogo, no del body', () => {
  const libro = CATALOGO_SEED[0];

  const pedido = crearPedido(CLIENTE, { lineas: [{ productoId: libro.id, cantidad: 1, precioUnitario: 1 }] });

  assert.equal(pedido.lineas[0].precioUnitario, libro.precioUnitario);
});

test('crear un pedido descuenta exactamente el stock reservado por línea', () => {
  const libro = CATALOGO_SEED[0];

  crearPedido(CLIENTE, { lineas: [{ productoId: libro.id, cantidad: 2 }] });

  assert.equal(buscarProducto(libro.id).stock, libro.stock - 2);
});

test('crear un pedido con cantidad mayor al stock disponible falla y no reserva nada', () => {
  const mochila = CATALOGO_SEED[2];

  assert.throws(() => crearPedido(CLIENTE, { lineas: [{ productoId: mochila.id, cantidad: mochila.stock + 1 }] }));

  assert.equal(buscarProducto(mochila.id).stock, mochila.stock);
});

test('si una línea falla, ninguna otra línea del pedido reserva stock (todo o nada)', () => {
  const libro = CATALOGO_SEED[0];
  const mochila = CATALOGO_SEED[2];

  assert.throws(() =>
    crearPedido(CLIENTE, {
      lineas: [
        { productoId: libro.id, cantidad: 1 },
        { productoId: mochila.id, cantidad: mochila.stock + 1 },
      ],
    })
  );

  assert.equal(buscarProducto(libro.id).stock, libro.stock);
  assert.equal(buscarProducto(mochila.id).stock, mochila.stock);
});

test('cambiarEstado aplica una transición válida y la agrega a historialEstados', () => {
  const libro = CATALOGO_SEED[0];
  const pedido = crearPedido(CLIENTE, { lineas: [{ productoId: libro.id, cantidad: 1 }] });

  const actualizado = cambiarEstado(pedido.id, 'Cancelado');

  assert.equal(actualizado.estado, 'Cancelado');
  assert.equal(actualizado.historialEstados.length, 2);
  assert.equal(actualizado.historialEstados[1].estado, 'Cancelado');
});

test('cambiarEstado rechaza una transición no contemplada y no modifica el pedido', () => {
  const libro = CATALOGO_SEED[0];
  const pedido = crearPedido(CLIENTE, { lineas: [{ productoId: libro.id, cantidad: 1 }] });

  assert.throws(() => cambiarEstado(pedido.id, 'Entregado'));

  assert.equal(obtenerPedido(pedido.id).estado, 'Pendiente');
});
