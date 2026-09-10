"""Capacidad "historial". Reescrita desde Node.js guiada por
docs/specs/spec-historial.md. El filtro por estado se resuelve acá
(servidor), igual que en la version Node que reemplaza.
"""

from . import store


def listar_historial(estado=None):
    todos_ = store.todos()
    if not estado:
        return todos_
    return [p for p in todos_ if p["estado"] == estado]
