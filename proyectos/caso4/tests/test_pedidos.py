"""Tests de caracterizacion derivados de docs/specs/spec-pedidos.md.
Debian dar el mismo resultado que la version Node en legacy-node/test/pedidos.test.js.
"""

import unittest

from src import store
from src.pedidos import crear_pedido, cambiar_estado


class TestPedidos(unittest.TestCase):
    def setUp(self):
        store.reset()

    def test_crear_pedido_nace_pendiente(self):
        pedido = crear_pedido(cliente="Ana", items=["libro"])
        self.assertEqual(pedido["cliente"], "Ana")
        self.assertEqual(pedido["items"], ["libro"])
        self.assertEqual(pedido["estado"], "pendiente")
        self.assertTrue(pedido["id"])
        self.assertTrue(pedido["creadoEn"])

    def test_crear_pedido_rechaza_sin_cliente(self):
        with self.assertRaises(ValueError):
            crear_pedido(items=["libro"])

    def test_crear_pedido_rechaza_items_vacio(self):
        with self.assertRaises(ValueError):
            crear_pedido(cliente="Ana", items=[])

    def test_cambiar_estado_actualiza_pedido_existente(self):
        pedido = crear_pedido(cliente="Ana", items=["libro"])
        actualizado = cambiar_estado(pedido["id"], "enviado")
        self.assertEqual(actualizado["estado"], "enviado")

    def test_cambiar_estado_rechaza_estado_invalido(self):
        pedido = crear_pedido(cliente="Ana", items=["libro"])
        with self.assertRaises(ValueError):
            cambiar_estado(pedido["id"], "inexistente")

    def test_cambiar_estado_rechaza_id_inexistente(self):
        with self.assertRaises(ValueError):
            cambiar_estado(9999, "enviado")


if __name__ == "__main__":
    unittest.main()
