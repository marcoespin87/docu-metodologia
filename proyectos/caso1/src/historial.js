'use strict';

const store = require('./store');

function listarHistorial() {
  return store.todos();
}

module.exports = { listarHistorial };
