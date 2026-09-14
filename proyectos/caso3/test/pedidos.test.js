const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

// arrancamos con una base limpia para que el test no dependa de corridas anteriores
const dbPath = path.join(__dirname, '..', 'pedidos.db');
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

const app = require('../src/index');

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      baseUrl = 'http://localhost:' + server.address().port;
      resolve();
    });
  });
  // La tabla se crea en el callback async de apertura de SQLite; esperamos
  // a que exista antes de correr los tests para no pisar esa carrera.
  for (let intentos = 0; intentos < 30; intentos++) {
    const res = await get('/pedidos');
    if (res.status !== 500) return;
    await new Promise((r) => setTimeout(r, 50));
  }
});

test.after(() => {
  server.close();
});

function request(method, rutaPath, body) {
  return new Promise((resolve, reject) => {
    const data = body === undefined ? null : JSON.stringify(body);
    const headers = {};
    if (data !== null) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(data);
    }
    const req = http.request(baseUrl + rutaPath, { method, headers }, (res) => {
      let raw = '';
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => resolve({ status: res.statusCode, body: raw ? JSON.parse(raw) : null }));
    });
    req.on('error', reject);
    if (data !== null) req.write(data);
    req.end();
  });
}

const post = (rutaPath, body) => request('POST', rutaPath, body);
const get = (rutaPath) => request('GET', rutaPath);
const put = (rutaPath, body) => request('PUT', rutaPath, body);

async function crearPedido() {
  const res = await post('/pedidos', { cliente: 'Ana', producto: 'Teclado', cantidad: 1 });
  return res.body.id;
}

test('POST /pedidos crea un pedido con estado Pendiente', async () => {
  const res = await post('/pedidos', { cliente: 'Ana', producto: 'Teclado', cantidad: 2 });
  assert.equal(res.status, 201);
  assert.equal(res.body.estado, 'Pendiente');
});

test('GET /pedidos?estado=X sigue filtrando igual que en el caso anterior', async () => {
  const id = await crearPedido();
  await put(`/pedidos/${id}/estado`, { estado: 'Enviado' });
  const res = await get('/pedidos?estado=Enviado');
  assert.equal(res.status, 200);
  assert.ok(res.body.some((p) => p.id === id));
});

test('Transición Pendiente -> Enviado es válida', async () => {
  const id = await crearPedido();
  const res = await put(`/pedidos/${id}/estado`, { estado: 'Enviado' });
  assert.equal(res.status, 200);
});

test('Transición Pendiente -> Cancelado es válida', async () => {
  const id = await crearPedido();
  const res = await put(`/pedidos/${id}/estado`, { estado: 'Cancelado' });
  assert.equal(res.status, 200);
});

test('Transición Enviado -> Entregado es válida', async () => {
  const id = await crearPedido();
  await put(`/pedidos/${id}/estado`, { estado: 'Enviado' });
  const res = await put(`/pedidos/${id}/estado`, { estado: 'Entregado' });
  assert.equal(res.status, 200);
});

test('Transición Enviado -> Cancelado es válida', async () => {
  const id = await crearPedido();
  await put(`/pedidos/${id}/estado`, { estado: 'Enviado' });
  const res = await put(`/pedidos/${id}/estado`, { estado: 'Cancelado' });
  assert.equal(res.status, 200);
});

test('Transición Pendiente -> Entregado (saltando pasos) es inválida', async () => {
  const id = await crearPedido();
  const res = await put(`/pedidos/${id}/estado`, { estado: 'Entregado' });
  assert.equal(res.status, 400);
});

test('Transición Entregado -> Pendiente (retroceso) es inválida', async () => {
  const id = await crearPedido();
  await put(`/pedidos/${id}/estado`, { estado: 'Enviado' });
  await put(`/pedidos/${id}/estado`, { estado: 'Entregado' });
  const res = await put(`/pedidos/${id}/estado`, { estado: 'Pendiente' });
  assert.equal(res.status, 400);
});

test('Un estado inexistente sigue devolviendo 400 (validación original)', async () => {
  const id = await crearPedido();
  const res = await put(`/pedidos/${id}/estado`, { estado: 'EnCamino' });
  assert.equal(res.status, 400);
});
