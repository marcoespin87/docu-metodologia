'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { esTransicionValida } = require('../src/pedidos/estados');

test('Pendiente -> Procesando es válida', () => {
  assert.equal(esTransicionValida('Pendiente', 'Procesando'), true);
});

test('Pendiente -> Cancelado es válida', () => {
  assert.equal(esTransicionValida('Pendiente', 'Cancelado'), true);
});

test('Procesando -> Pagado es válida', () => {
  assert.equal(esTransicionValida('Procesando', 'Pagado'), true);
});

test('Procesando -> Pendiente es válida (pago fallido, reintentable)', () => {
  assert.equal(esTransicionValida('Procesando', 'Pendiente'), true);
});

test('Pagado -> Enviado es válida', () => {
  assert.equal(esTransicionValida('Pagado', 'Enviado'), true);
});

test('Enviado -> Entregado es válida', () => {
  assert.equal(esTransicionValida('Enviado', 'Entregado'), true);
});

test('Entregado -> Devuelto es válida', () => {
  assert.equal(esTransicionValida('Entregado', 'Devuelto'), true);
});

test('Pendiente -> Entregado NO es válida (salta pasos)', () => {
  assert.equal(esTransicionValida('Pendiente', 'Entregado'), false);
});

test('Cancelado -> cualquier estado NO es válida (estado terminal)', () => {
  assert.equal(esTransicionValida('Cancelado', 'Pendiente'), false);
  assert.equal(esTransicionValida('Cancelado', 'Procesando'), false);
});

test('Devuelto -> cualquier estado NO es válida (estado terminal)', () => {
  assert.equal(esTransicionValida('Devuelto', 'Pendiente'), false);
});

test('Enviado -> Cancelado NO es válida (ya no se puede cancelar enviado)', () => {
  assert.equal(esTransicionValida('Enviado', 'Cancelado'), false);
});
