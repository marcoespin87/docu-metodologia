"""Almacen en memoria compartido por las capacidades "pedidos" e "historial".
No es una capacidad en si: es infraestructura interna (ver AGENTS.md).
"""

_pedidos = []
_siguiente_id = 1


def reset():
    global _pedidos, _siguiente_id
    _pedidos = []
    _siguiente_id = 1


def agregar(pedido):
    global _siguiente_id
    nuevo = dict(pedido)
    nuevo["id"] = _siguiente_id
    _siguiente_id += 1
    _pedidos.append(nuevo)
    return nuevo


def todos():
    return _pedidos


def buscar_por_id(pedido_id):
    for p in _pedidos:
        if p["id"] == pedido_id:
            return p
    return None
