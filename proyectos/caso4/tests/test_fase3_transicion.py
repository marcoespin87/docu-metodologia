import requests
import pytest

BASE_URL = "http://localhost:3000"

@pytest.fixture(scope="module", autouse=True)
def setup_pedidos():
    # Creamos un pedido para usar en las pruebas de transición
    res = requests.post(f"{BASE_URL}/pedidos", json={"cliente": "Test", "producto": "Test", "cantidad": 1})
    pedido_id = res.json()["id"]
    return pedido_id

def test_transicion_estado_invalido(setup_pedidos):
    pedido_id = setup_pedidos
    response = requests.put(f"{BASE_URL}/pedidos/{pedido_id}/estado", json={"estado": "Fugado"})
    assert response.status_code == 400
    assert "Estado inválido" in response.json()["error"]

def test_transicion_ciclo_vida_invalida(setup_pedidos):
    pedido_id = setup_pedidos
    # El pedido está en Pendiente, intentar pasarlo a Entregado es inválido
    response = requests.put(f"{BASE_URL}/pedidos/{pedido_id}/estado", json={"estado": "Entregado"})
    assert response.status_code == 400
    assert "Transición de estado inválida" in response.json()["error"]

def test_transicion_valida(setup_pedidos):
    pedido_id = setup_pedidos
    # Pendiente -> Enviado
    response = requests.put(f"{BASE_URL}/pedidos/{pedido_id}/estado", json={"estado": "Enviado"})
    assert response.status_code == 200
    assert response.json()["nuevo_estado"] == "Enviado"

    # Enviado -> Entregado
    response = requests.put(f"{BASE_URL}/pedidos/{pedido_id}/estado", json={"estado": "Entregado"})
    assert response.status_code == 200
    assert response.json()["nuevo_estado"] == "Entregado"

def test_pedido_no_encontrado():
    response = requests.put(f"{BASE_URL}/pedidos/999999/estado", json={"estado": "Enviado"})
    assert response.status_code == 404
    assert "no encontrado" in response.json()["error"].lower()
