'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const os = require('os');

test.before(() => {
  process.env.DB_PATH = path.join(os.tmpdir(), `caso1-inventario-${Date.now()}-${Math.random().toString(16).slice(2)}.json`);
});

test.after(() => {
  delete process.env.DB_PATH;
});

const {
  listarProductos,
  buscarProducto,
  validarDisponibilidad,
  reservarStock,
  reponerStock,
  reset,
  CATALOGO_SEED,
} = require('../src/inventario/inventario.service');

test.beforeEach(() => {
  reset();
});

test('listarProductos devuelve el catálogo seed completo', () => {
  const productos = listarProductos();

  assert.equal(productos.length, CATALOGO_SEED.length);
  assert.deepEqual(productos, CATALOGO_SEED);
});

test('validarDisponibilidad devuelve true si hay stock suficiente', () => {
  const producto = CATALOGO_SEED[0];

  assert.equal(validarDisponibilidad(producto.id, producto.stock), true);
});

test('validarDisponibilidad devuelve false si la cantidad excede el stock', () => {
  const producto = CATALOGO_SEED[0];

  assert.equal(validarDisponibilidad(producto.id, producto.stock + 1), false);
});

test('validarDisponibilidad devuelve false para un producto inexistente', () => {
  assert.equal(validarDisponibilidad(9999, 1), false);
});

test('reservarStock descuenta exactamente la cantidad pedida', () => {
  const producto = CATALOGO_SEED[0];

  reservarStock(producto.id, 2);

  assert.equal(buscarProducto(producto.id).stock, producto.stock - 2);
});

test('reservarStock lanza error y no modifica el stock si la cantidad excede lo disponible', () => {
  const producto = CATALOGO_SEED[0];

  assert.throws(() => reservarStock(producto.id, producto.stock + 1));
  assert.equal(buscarProducto(producto.id).stock, producto.stock);
});

test('reponerStock incrementa el stock en la cantidad indicada', () => {
  const producto = CATALOGO_SEED[0];
  reservarStock(producto.id, 2);

  reponerStock(producto.id, 2);

  assert.equal(buscarProducto(producto.id).stock, producto.stock);
});
