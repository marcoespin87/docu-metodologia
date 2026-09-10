'use strict';

// Nace en la Fase 0 (docs/plan-fase0-historial-2026-09-10.md): la
// capacidad "historial" no tenía ningún test heredado.

const test = require('node:test');
const assert = require('node:assert/strict');
const store = require('../src/store');
const { crearPedido, cambiarEstado } = require('../src/pedidos');
const { listarHistorial } = require('../src/historial');

test.beforeEach(() => store.reset());

test('listarHistorial devuelve todos los pedidos en orden de creación', () => {
  const p1 = crearPedido({ cliente: 'Ana', items: ['libro'] });
  const p2 = crearPedido({ cliente: 'Beto', items: ['taza'] });
  assert.deepEqual(
    listarHistorial().map((p) => p.id),
    [p1.id, p2.id]
  );
});

test('filtrar por estado no incluye pedidos de otros estados (regresión del bug de Fase 0)', () => {
  const a = crearPedido({ cliente: 'Ana', items: ['libro'] });
  const b = crearPedido({ cliente: 'Beto', items: ['taza'] });
  cambiarEstado(a.id, 'enviado');
  cambiarEstado(b.id, 'cancelado');

  const enviados = listarHistorial({ estado: 'enviado' });
  assert.equal(enviados.length, 1);
  assert.equal(enviados[0].estado, 'enviado');
});

test('filtrar por cancelado devuelve solo los cancelados', () => {
  const a = crearPedido({ cliente: 'Ana', items: ['libro'] });
  cambiarEstado(a.id, 'cancelado');
  const cancelados = listarHistorial({ estado: 'cancelado' });
  assert.equal(cancelados.length, 1);
});

test('sin filtro, devuelve el historial completo', () => {
  crearPedido({ cliente: 'Ana', items: ['libro'] });
  assert.equal(listarHistorial({}).length, 1);
});
