'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');

function archivoTemporal() {
  return path.join(os.tmpdir(), `caso1-store-${Date.now()}-${Math.random().toString(16).slice(2)}.json`);
}

test('cargar() sobre un archivo inexistente devuelve el estado inicial vacío', () => {
  process.env.DB_PATH = archivoTemporal();
  delete require.cache[require.resolve('../src/store')];
  const store = require('../src/store');

  const db = store.cargar();

  assert.deepEqual(db, { productos: [], pedidos: [] });
});

test('guardar() y luego cargar() devuelve exactamente lo guardado', () => {
  process.env.DB_PATH = archivoTemporal();
  delete require.cache[require.resolve('../src/store')];
  const store = require('../src/store');

  store.guardar({ productos: [{ id: 1, nombre: 'Libro', precioUnitario: 100, stock: 5 }], pedidos: [] });
  const db = store.cargar();

  assert.deepEqual(db, { productos: [{ id: 1, nombre: 'Libro', precioUnitario: 100, stock: 5 }], pedidos: [] });
});

test('reset() deja el archivo en el estado inicial vacío', () => {
  process.env.DB_PATH = archivoTemporal();
  delete require.cache[require.resolve('../src/store')];
  const store = require('../src/store');

  store.guardar({ productos: [{ id: 1, nombre: 'Libro', precioUnitario: 100, stock: 5 }], pedidos: [] });
  store.reset();
  const db = store.cargar();

  assert.deepEqual(db, { productos: [], pedidos: [] });
});

test.after(() => {
  delete process.env.DB_PATH;
});
