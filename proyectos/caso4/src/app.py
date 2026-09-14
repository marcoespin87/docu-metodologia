import sqlite3
from flask import Flask, request, jsonify

app = Flask(__name__)

def get_db_connection():
    conn = sqlite3.connect('pedidos.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    try:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS pedidos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cliente TEXT NOT NULL,
                producto TEXT NOT NULL,
                cantidad INTEGER NOT NULL,
                estado TEXT NOT NULL
            )
        ''')
        conn.commit()
    finally:
        conn.close()

# Inicializamos la DB al arrancar
init_db()

@app.route('/pedidos', methods=['POST'])
def crear_pedido():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Faltan campos obligatorios"}), 400
        
    cliente = data.get('cliente')
    producto = data.get('producto')
    cantidad = data.get('cantidad')
    
    if not cliente or not producto or not cantidad:
        return jsonify({"error": "Faltan campos obligatorios: cliente, producto, cantidad."}), 400
        
    estado_inicial = 'Pendiente'
    
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO pedidos (cliente, producto, cantidad, estado) VALUES (?, ?, ?, ?)',
            (cliente, producto, cantidad, estado_inicial)
        )
        conn.commit()
        last_id = cursor.lastrowid
        
        return jsonify({
            "id": last_id,
            "mensaje": "Pedido creado exitosamente",
            "estado": estado_inicial
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@app.route('/pedidos', methods=['GET'])
def ver_historial():
    # En Flask, getlist maneja múltiples parámetros con la misma clave (ej: ?estado=P&estado=E)
    estados = request.args.getlist('estado')
    
    estados_validos = ['Pendiente', 'Enviado', 'Entregado', 'Cancelado']
    
    # Validamos que todos los estados pasados sean válidos
    estados_invalidos = [e for e in estados if e not in estados_validos]
    if estados_invalidos:
        return jsonify({
            "error": "Estado(s) inválido(s). Los estados permitidos son: " + ", ".join(estados_validos)
        }), 400

    sql = 'SELECT * FROM pedidos'
    params = []
    
    if estados:
        placeholders = ', '.join(['?'] * len(estados))
        sql += f' WHERE estado IN ({placeholders})'
        params = estados
        
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(sql, params)
        rows = cursor.fetchall()
        # Convertimos las filas (sqlite3.Row) a diccionarios
        pedidos = [dict(row) for row in rows]
        return jsonify(pedidos), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@app.route('/pedidos/<int:id>/estado', methods=['PUT'])
def cambiar_estado(id):
    data = request.get_json()
    if not data or 'estado' not in data:
        return jsonify({"error": "Falta el campo estado"}), 400
        
    nuevo_estado = data['estado']
    estados_validos = ['Pendiente', 'Enviado', 'Entregado', 'Cancelado']
    
    if nuevo_estado not in estados_validos:
        return jsonify({
            "error": "Estado inválido. Los estados permitidos son: " + ", ".join(estados_validos)
        }), 400

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('SELECT estado FROM pedidos WHERE id = ?', (id,))
        row = cursor.fetchone()
        
        if not row:
            return jsonify({"error": "Pedido no encontrado."}), 404
            
        estado_actual = row['estado']
        
        transiciones_permitidas = {
            'Pendiente': ['Enviado', 'Cancelado'],
            'Enviado': ['Entregado', 'Cancelado'],
            'Entregado': [],
            'Cancelado': []
        }
        
        if nuevo_estado not in transiciones_permitidas[estado_actual]:
            return jsonify({
                "error": f"Transición de estado inválida. No se puede pasar de '{estado_actual}' a '{nuevo_estado}'."
            }), 400
            
        cursor.execute('UPDATE pedidos SET estado = ? WHERE id = ?', (nuevo_estado, id))
        conn.commit()
        
        return jsonify({
            "mensaje": "Estado del pedido actualizado",
            "nuevo_estado": nuevo_estado
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

if __name__ == '__main__':
    app.run(port=3000, debug=True, use_reloader=False)
