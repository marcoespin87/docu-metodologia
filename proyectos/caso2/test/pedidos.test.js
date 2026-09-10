'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const store = require('../src/store');
const { crearPedido, cambiarEstado } = require('../src/pedidos');

test.beforeEach(() => store.reset());

test('crearPedido devuelve un pedido pendiente con los datos dados', () => {
  const pedido = crearPedido({ cliente: 'Ana', items: ['libro'] });
  assert.equal(pedido.cliente, 'Ana');
  assert.deepEqual(pedido.items, ['libro']);
  assert.equal(pedido.estado, 'pendiente');
  assert.ok(pedido.id);
  assert.ok(pedido.creadoEn);
});

test('crearPedido rechaza sin cliente', () => {
  assert.throws(() => crearPedido({ items: ['libro'] }));
});

test('crearPedido rechaza con items vacío', () => {
  assert.throws(() => crearPedido({ cliente: 'Ana', items: [] }));
});

test('cambiarEstado actualiza el estado de un pedido existente', () => {
  const pedido = crearPedido({ cliente: 'Ana', items: ['libro'] });
  const actualizado = cambiarEstado(pedido.id, 'enviado');
  assert.equal(actualizado.estado, 'enviado');
});

test('cambiarEstado rechaza un estado inválido', () => {
  const pedido = crearPedido({ cliente: 'Ana', items: ['libro'] });
  assert.throws(() => cambiarEstado(pedido.id, 'inexistente'));
});

test('cambiarEstado rechaza un id inexistente', () => {
  assert.throws(() => cambiarEstado(9999, 'enviado'));
});
