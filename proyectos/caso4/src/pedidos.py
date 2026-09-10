"""Capacidad "pedidos". Reescrita desde Node.js guiada por
docs/specs/spec-pedidos.md (no por src/pedidos.js del legacy-node).
"""

import time

from . import store

ESTADOS_VALIDOS = ["pendiente", "enviado", "entregado", "cancelado"]


def crear_pedido(cliente=None, items=None):
    if not cliente:
        raise ValueError("cliente es obligatorio")
    if not items:
        raise ValueError("items no puede estar vacio")
    return store.agregar(
        {
            "cliente": cliente,
            "items": items,
            "estado": "pendiente",
            "creadoEn": int(time.time() * 1000),
        }
    )


def cambiar_estado(pedido_id, nuevo_estado):
    if nuevo_estado not in ESTADOS_VALIDOS:
        raise ValueError(f"estado invalido: {nuevo_estado}")
    pedido = store.buscar_por_id(pedido_id)
    if pedido is None:
        raise ValueError(f"pedido {pedido_id} no existe")
    pedido["estado"] = nuevo_estado
    return pedido
