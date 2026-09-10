'use strict';

// Test heredado ya existente (única evidencia formal previa a la Fase 0).
// Cubre la capacidad "pedidos"; no hay ningún test de "historial".

const test = require('node:test');
const assert = require('node:assert/strict');
const store = require('../src/store');
const { crearPedido, cambiarEstado } = require('../src/pedidos');

test.beforeEach(() => store.reset());

test('crearPedido devuelve un pedido pendiente con los datos dados', () => {
  const pedido = crearPedido({ cliente: 'Ana', items: ['libro'] });
  assert.equal(pedido.cliente, 'Ana');
  assert.equal(pedido.estado, 'pendiente');
});

test('cambiarEstado actualiza el estado de un pedido existente', () => {
  const pedido = crearPedido({ cliente: 'Ana', items: ['libro'] });
  const actualizado = cambiarEstado(pedido.id, 'enviado');
  assert.equal(actualizado.estado, 'enviado');
});
