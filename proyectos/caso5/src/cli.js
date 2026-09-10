#!/usr/bin/env node
'use strict';

const { crearPedido, cambiarEstado, listarHistorial } = require('./index');

const p1 = crearPedido({ cliente: 'Ana', items: ['libro'] });
const p2 = crearPedido({ cliente: 'Beto', items: ['taza', 'plato'] });
cambiarEstado(p1.id, 'enviado');
cambiarEstado(p2.id, 'cancelado');

console.log(JSON.stringify(listarHistorial({ estado: 'enviado' }), null, 2));
