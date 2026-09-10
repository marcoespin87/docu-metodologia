'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const store = require('../src/store');
const { crearPedido, cambiarEstado } = require('../src/pedidos');
const { listarHistorial } = require('../src/historial');
const { filtrarPorEstado } = require('../src/filtroCliente');

test.beforeEach(() => store.reset());

function poblar() {
  const a = crearPedido({ cliente: 'Ana', items: ['libro'] });
  const b = crearPedido({ cliente: 'Beto', items: ['taza'] });
  const c = crearPedido({ cliente: 'Cami', items: ['plato'] });
  cambiarEstado(a.id, 'enviado');
  cambiarEstado(b.id, 'cancelado');
  // c queda 'pendiente'
  return { a, b, c };
}

test('filtrarPorEstado devuelve solo los pedidos del estado exacto', () => {
  poblar();
  const historial = listarHistorial();
  const enviados = filtrarPorEstado(historial, 'enviado');
  assert.equal(enviados.length, 1);
  assert.equal(enviados[0].estado, 'enviado');
});

test('sin estado, devuelve el historial completo', () => {
  poblar();
  const historial = listarHistorial();
  assert.deepEqual(filtrarPorEstado(historial, undefined), historial);
});

test('filtrar por un estado sin pedidos devuelve lista vacía', () => {
  poblar();
  const historial = listarHistorial();
  assert.deepEqual(filtrarPorEstado(historial, 'entregado'), []);
});

test('los 4 estados filtran correctamente', () => {
  poblar();
  const historial = listarHistorial();
  for (const estado of ['pendiente', 'enviado', 'entregado', 'cancelado']) {
    const resultado = filtrarPorEstado(historial, estado);
    assert.ok(resultado.every((p) => p.estado === estado));
  }
});
