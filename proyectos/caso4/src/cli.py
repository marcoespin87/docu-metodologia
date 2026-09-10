#!/usr/bin/env python3
"""CLI de humo manual, no forma parte de ninguna capacidad con spec propia."""

import json

from src import crear_pedido, cambiar_estado, listar_historial

if __name__ == "__main__":
    p1 = crear_pedido(cliente="Ana", items=["libro"])
    p2 = crear_pedido(cliente="Beto", items=["taza", "plato"])
    cambiar_estado(p1["id"], "enviado")
    print(json.dumps(listar_historial(), indent=2, ensure_ascii=False))
