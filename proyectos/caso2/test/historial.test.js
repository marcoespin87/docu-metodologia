'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const store = require('../src/store');
const { crearPedido, cambiarEstado } = require('../src/pedidos');
const { listarHistorial } = require('../src/historial');

test.beforeEach(() => store.reset());

test('listarHistorial devuelve todos los pedidos en orden de creación', () => {
  const p1 = crearPedido({ cliente: 'Ana', items: ['libro'] });
  const p2 = crearPedido({ cliente: 'Beto', items: ['taza'] });
  const historial = listarHistorial();
  assert.deepEqual(historial.map((p) => p.id), [p1.id, p2.id]);
});

test('listarHistorial refleja cambios de estado', () => {
  const pedido = crearPedido({ cliente: 'Ana', items: ['libro'] });
  cambiarEstado(pedido.id, 'entregado');
  const [actualizado] = listarHistorial();
  assert.equal(actualizado.estado, 'entregado');
});

test('listarHistorial devuelve vacío si no hay pedidos', () => {
  assert.deepEqual(listarHistorial(), []);
});
