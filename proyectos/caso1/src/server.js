'use strict';

const { crearApp } = require('./app');

const PUERTO = process.env.PORT || 3000;
const app = crearApp();

app.listen(PUERTO, () => {
  console.log(`Servidor escuchando en puerto ${PUERTO}`);
});
