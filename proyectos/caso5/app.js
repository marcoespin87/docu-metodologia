var express = require('express');
var sqlite3 = require('sqlite3').verbose();

var app = express();
var port = 3000;

app.use(express.json());

var db = new sqlite3.Database('./pedidos.db', function (err) {
  if (err) {
    console.error('No se pudo conectar a la base de datos', err.message);
  } else {
    db.run(
      'CREATE TABLE IF NOT EXISTS pedidos (' +
        'id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
        'cliente TEXT NOT NULL, ' +
        'producto TEXT NOT NULL, ' +
        'cantidad INTEGER NOT NULL, ' +
        'estado TEXT NOT NULL)'
    );
  }
});

// crear pedido
app.post('/pedidos', function (req, res) {
  var cliente = req.body.cliente;
  var producto = req.body.producto;
  var cantidad = req.body.cantidad;

  if (!cliente || !producto || !cantidad) {
    return res.status(400).json({ error: 'faltan datos: cliente, producto, cantidad' });
  }

  db.run(
    'INSERT INTO pedidos (cliente, producto, cantidad, estado) VALUES (?, ?, ?, ?)',
    [cliente, producto, cantidad, 'Pendiente'],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID, estado: 'Pendiente' });
    }
  );
});

// ver historial
app.get('/pedidos', function (req, res) {
  db.all('SELECT * FROM pedidos', [], function (err, rows) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// cambiar estado
// TODO: revisar si hace falta validar el estado, por ahora confiamos en el cliente
app.put('/pedidos/:id/estado', function (req, res) {
  var id = req.params.id;
  var estado = req.body.estado;

  if (!estado) {
    return res.status(400).json({ error: 'falta el estado' });
  }

  db.run('UPDATE pedidos SET estado = ? WHERE id = ?', [estado, id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'pedido no encontrado' });
    }
    res.json({ id: id, estado: estado });
  });
});

// validación vieja de cuando los pedidos vivían en un array en memoria,
// desde que se pasó todo a SQLite ya no la llama nadie
function pedidoEsValido(pedido) {
  return !!(pedido && pedido.cliente && pedido.producto && pedido.cantidad > 0);
}

if (require.main === module) {
  app.listen(port, function () {
    console.log('Sistema de pedidos escuchando en el puerto ' + port);
  });
}

module.exports = app;
