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

// Paridad con el filtro anterior (caso2, filtrado en cliente): mismos
// criterios de aceptación, ahora resueltos en el servidor.
function poblar() {
  const a = crearPedido({ cliente: 'Ana', items: ['libro'] });
  const b = crearPedido({ cliente: 'Beto', items: ['taza'] });
  const c = crearPedido({ cliente: 'Cami', items: ['plato'] });
  cambiarEstado(a.id, 'enviado');
  cambiarEstado(b.id, 'cancelado');
  // c queda 'pendiente'
  return { a, b, c };
}

test('filtrar por estado devuelve solo los pedidos de ese estado', () => {
  poblar();
  const enviados = listarHistorial({ estado: 'enviado' });
  assert.equal(enviados.length, 1);
  assert.equal(enviados[0].estado, 'enviado');
});

test('sin filtro, devuelve el historial completo', () => {
  poblar();
  assert.deepEqual(listarHistorial({}), listarHistorial());
});

test('filtrar por un estado sin pedidos devuelve lista vacía', () => {
  poblar();
  assert.deepEqual(listarHistorial({ estado: 'entregado' }), []);
});

test('los 4 estados filtran correctamente', () => {
  poblar();
  for (const estado of ['pendiente', 'enviado', 'entregado', 'cancelado']) {
    const resultado = listarHistorial({ estado });
    assert.ok(resultado.every((p) => p.estado === estado));
  }
});
