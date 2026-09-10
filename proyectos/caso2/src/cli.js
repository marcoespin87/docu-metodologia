#!/usr/bin/env node
'use strict';

// CLI de humo manual, no forma parte de ninguna capacidad con spec propia.
const { crearPedido, cambiarEstado, listarHistorial } = require('./index');

const p1 = crearPedido({ cliente: 'Ana', items: ['libro'] });
const p2 = crearPedido({ cliente: 'Beto', items: ['taza', 'plato'] });
cambiarEstado(p1.id, 'enviado');

console.log(JSON.stringify(listarHistorial(), null, 2));
