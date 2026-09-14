const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

app.use(express.json());

// Inicialización de Base de Datos
const db = new sqlite3.Database('./pedidos.db', (err) => {
    if (err) {
        console.error('Error al conectar a SQLite', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite.');
        db.run(`CREATE TABLE IF NOT EXISTS pedidos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cliente TEXT NOT NULL,
            producto TEXT NOT NULL,
            cantidad INTEGER NOT NULL,
            estado TEXT NOT NULL
        )`);
    }
});

// GET /pedidos - Ver historial
app.get('/pedidos', (req, res) => {
    console.log('[INFO] Solicitud recibida: GET /pedidos - Query:', req.query);
    
    let sql = 'SELECT * FROM pedidos';
    let params = [];

    if (req.query.estado) {
        // Normalizar a arreglo (Express parsea como string si es uno solo, como array si son varios)
        const estados = Array.isArray(req.query.estado) ? req.query.estado : [req.query.estado];
        
        // Invariante: Estados válidos estrictos
        const estadosValidos = ['Pendiente', 'Enviado', 'Entregado', 'Cancelado'];
        const estadosInvalidos = estados.filter(e => !estadosValidos.includes(e));
        
        if (estadosInvalidos.length > 0) {
            return res.status(400).json({ 
                error: 'Estado(s) inválido(s). Los estados permitidos son: ' + estadosValidos.join(', ') 
            });
        }

        const placeholders = estados.map(() => '?').join(', ');
        sql += ` WHERE estado IN (${placeholders})`;
        params = estados;
    }

    db.all(sql, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(rows);
    });
});

// POST /pedidos - Crear pedido
app.post('/pedidos', (req, res) => {
    console.log(`[INFO] Solicitud recibida: POST /pedidos - Body:`, req.body);
    const { cliente, producto, cantidad } = req.body;
    if (!cliente || !producto || !cantidad) {
        return res.status(400).json({ error: 'Faltan campos obligatorios: cliente, producto, cantidad.' });
    }
    
    // Invariante: El estado inicial siempre es Pendiente
    const estadoInicial = 'Pendiente';

    const sql = `INSERT INTO pedidos (cliente, producto, cantidad, estado) VALUES (?, ?, ?, ?)`;
    db.run(sql, [cliente, producto, cantidad, estadoInicial], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ 
            id: this.lastID,
            mensaje: 'Pedido creado exitosamente',
            estado: estadoInicial
        });
    });
});

// PUT /pedidos/:id/estado - Cambiar estado
app.put('/pedidos/:id/estado', (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    console.log(`[INFO] Solicitud recibida: PUT /pedidos/${id}/estado - Nuevo estado:`, estado);

    // Invariante: Estados válidos estrictos
    const estadosValidos = ['Pendiente', 'Enviado', 'Entregado', 'Cancelado'];
    
    if (!estadosValidos.includes(estado)) {
        return res.status(400).json({ 
            error: 'Estado inválido. Los estados permitidos son: ' + estadosValidos.join(', ') 
        });
    }

    // Consultar estado actual para validar invariante de ciclo de vida
    const sqlSelect = `SELECT estado FROM pedidos WHERE id = ?`;
    db.get(sqlSelect, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Pedido no encontrado.' });
        }

        const estadoActual = row.estado;
        
        // Invariante: Ciclo de vida del pedido
        const transicionesPermitidas = {
            'Pendiente': ['Enviado', 'Cancelado'],
            'Enviado': ['Entregado', 'Cancelado'],
            'Entregado': [],
            'Cancelado': []
        };

        if (!transicionesPermitidas[estadoActual].includes(estado)) {
            return res.status(400).json({
                error: `Transición de estado inválida. No se puede pasar de '${estadoActual}' a '${estado}'.`
            });
        }

        const sqlUpdate = `UPDATE pedidos SET estado = ? WHERE id = ?`;
        db.run(sqlUpdate, [estado, id], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(200).json({ 
                mensaje: 'Estado del pedido actualizado',
                nuevo_estado: estado 
            });
        });
    });
});

if (require.main === module) {
    app.listen(port, () => {
        console.log(`Sistema de pedidos ejecutándose en http://localhost:${port}`);
    });
}

module.exports = app;
