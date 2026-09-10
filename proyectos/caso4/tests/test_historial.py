"""Tests de caracterizacion derivados de docs/specs/spec-historial.md.
Deben dar el mismo resultado que la version Node en
legacy-node/test/historial.test.js (paridad de comportamiento, regla del
Caso 4).
"""

import unittest

from src import store
from src.pedidos import crear_pedido, cambiar_estado
from src.historial import listar_historial


class TestHistorial(unittest.TestCase):
    def setUp(self):
        store.reset()

    def _poblar(self):
        a = crear_pedido(cliente="Ana", items=["libro"])
        b = crear_pedido(cliente="Beto", items=["taza"])
        c = crear_pedido(cliente="Cami", items=["plato"])
        cambiar_estado(a["id"], "enviado")
        cambiar_estado(b["id"], "cancelado")
        return a, b, c

    def test_orden_de_creacion(self):
        p1 = crear_pedido(cliente="Ana", items=["libro"])
        p2 = crear_pedido(cliente="Beto", items=["taza"])
        historial = listar_historial()
        self.assertEqual([p["id"] for p in historial], [p1["id"], p2["id"]])

    def test_refleja_cambios_de_estado(self):
        pedido = crear_pedido(cliente="Ana", items=["libro"])
        cambiar_estado(pedido["id"], "entregado")
        self.assertEqual(listar_historial()[0]["estado"], "entregado")

    def test_vacio_sin_pedidos(self):
        self.assertEqual(listar_historial(), [])

    def test_filtrar_por_estado(self):
        self._poblar()
        enviados = listar_historial(estado="enviado")
        self.assertEqual(len(enviados), 1)
        self.assertEqual(enviados[0]["estado"], "enviado")

    def test_sin_filtro_devuelve_historial_completo(self):
        self._poblar()
        self.assertEqual(listar_historial(estado=None), listar_historial())

    def test_filtrar_estado_sin_pedidos(self):
        self._poblar()
        self.assertEqual(listar_historial(estado="entregado"), [])

    def test_los_4_estados_filtran(self):
        self._poblar()
        for estado in ["pendiente", "enviado", "entregado", "cancelado"]:
            resultado = listar_historial(estado=estado)
            self.assertTrue(all(p["estado"] == estado for p in resultado))


if __name__ == "__main__":
    unittest.main()
