"""Unico modulo que lee/escribe backend/data/notas.db (SQLite).

Reusa el mismo archivo y el mismo esquema que backend/src/notasStore.js
(Node/better-sqlite3) -- no crea un archivo ni un esquema nuevos. No
reproduce el bootstrap de migracion notas.json -> notas.db: ese paso ya
ocurrio una vez del lado Node y notas.db ya existe con los datos reales
(ver Decisiones en docs/specs/spec-gestion-notas.md).
"""

import sqlite3
from pathlib import Path

DB_FILE = Path(__file__).resolve().parent.parent.parent / "backend" / "data" / "notas.db"

_CREATE_TABLE_SQL = """
    CREATE TABLE IF NOT EXISTS notas (
        id TEXT PRIMARY KEY,
        titulo TEXT NOT NULL,
        cuerpo TEXT NOT NULL,
        fecha_creacion TEXT NOT NULL,
        fecha_limite TEXT
    )
"""


def _conectar():
    DB_FILE.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    conn.execute(_CREATE_TABLE_SQL)
    return conn


def _fila_a_nota(fila):
    return {
        "id": fila["id"],
        "titulo": fila["titulo"],
        "cuerpo": fila["cuerpo"],
        "fechaCreacion": fila["fecha_creacion"],
        "fechaLimite": fila["fecha_limite"],
    }


def listar_notas():
    with _conectar() as conn:
        filas = conn.execute("SELECT * FROM notas").fetchall()
        return [_fila_a_nota(fila) for fila in filas]


def crear_nota(nota):
    with _conectar() as conn:
        conn.execute(
            """
            INSERT INTO notas (id, titulo, cuerpo, fecha_creacion, fecha_limite)
            VALUES (:id, :titulo, :cuerpo, :fechaCreacion, :fechaLimite)
            """,
            {
                "id": nota["id"],
                "titulo": nota["titulo"],
                "cuerpo": nota["cuerpo"],
                "fechaCreacion": nota["fechaCreacion"],
                "fechaLimite": nota.get("fechaLimite"),
            },
        )
    return nota


def eliminar_nota(id_nota):
    with _conectar() as conn:
        cursor = conn.execute("DELETE FROM notas WHERE id = ?", (id_nota,))
        return cursor.rowcount > 0
