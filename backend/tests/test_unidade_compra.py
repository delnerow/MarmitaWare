import sys
import os
import pytest
from datetime import date, datetime

# Adiciona a raiz do projeto ao path para encontrar a pasta 'classes'
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Importa as classes que vamos testar
from classes.compra import Compra, FactoryCompra

# --- Testes de Unidade para a classe Compra ---

def test_compra_criacao():
    """
    Testa se o construtor (__init__) da classe Compra
    atribui corretamente todos os valores.
    (Nível de Teste: Unidade)
    """
    hoje = date.today()
    ingredientes_lista = [1, 2] # IDs dos ingredientes
    precos_dict = {1: 50.0, 2: 75.50} # {ID_ingrediente: preco}
    
    c = Compra(
        ID=101,
        data=hoje,
        valor_total=125.50,
        ingredientes=ingredientes_lista,
        preco_ingredientes=precos_dict
    )
    
    assert c.ID == 101
    assert c.data == hoje
    assert c.valor_total == 125.50
    assert c.ingredientes == ingredientes_lista
    assert c.preco_ingredientes == precos_dict
    assert c.preco_ingredientes[1] == 50.0

def test_compra_editar():
    """
    Testa se o método editar() atualiza apenas os campos fornecidos.
    (Nível de Teste: Unidade)
    """
    data_original = date(2025, 10, 1)
    precos_originais = {1: 10.0}
    
    c = Compra(ID=102, data=data_original, valor_total=10.0, ingredientes=[1], preco_ingredientes=precos_originais)
    
    # Ação: Editar apenas o valor_total e os ingredientes
    nova_lista_ing = [1, 2]
    c.editar(valor_total=25.0, ingredientes=nova_lista_ing)
    
    # Verificação
    assert c.ID == 102 # Não deve mudar
    assert c.data == data_original # Não deve mudar
    assert c.valor_total == 25.0 # DEVE mudar
    assert c.ingredientes == nova_lista_ing # DEVE mudar
    assert c.preco_ingredientes == precos_originais # Não deve mudar

# --- Testes de Unidade para a classe FactoryCompra ---

@pytest.fixture
def factory():
    """Cria uma fixture de factory para ser usada em vários testes."""
    return FactoryCompra(next_ID=401)

def test_factory_compra_create_sucesso(factory):
    """
    Testa o caminho feliz (happy path) da criação de compra.
    (Nível de Teste: Unidade)
    """
    hoje = date.today()
    precos_dict = {5: 50.0, 6: 100.0}
    
    compra_criada = factory.CreateCompra(
        data=hoje,
        valor_total=150.0,
        preco_ingredientes=precos_dict
    )
    
    assert isinstance(compra_criada, Compra)
    assert compra_criada.ID == 401 # Primeiro ID
    assert compra_criada.valor_total == 150.0
    assert compra_criada.ingredientes == [5, 6]
    assert factory.next_ID == 402 # Deve ter incrementado

def test_factory_compra_from_db(factory):
    """
    Testa a recriação de uma Compra a partir de um dicionário (mock do DB).
    Verifica a conversão da string de data e da string de valor_total.
    (Nível de Teste: Unidade)
    """
    # Mock de um registro que viria do banco de dados
    compra_dict_db = {
        'id_compra': 77,
        'data_de_compra': '2025-01-15', # Testar strptime
        'valor_total': '250.75', # Testar conversão para float
        'ingredientes': [10, 11],
        'preco_ingredientes': {10: 100.0, 11: 150.75}
    }
    
    compra_recriada = factory.FromDB(compra_dict_db)
    
    assert isinstance(compra_recriada, Compra)
    assert compra_recriada.ID == 77
    # Verifica se a conversão de string para float funcionou
    assert compra_recriada.valor_total == 250.75 
    # Verifica se a conversão de string para objeto date funcionou
    assert compra_recriada.data == date(2025, 1, 15)
    assert compra_recriada.ingredientes == [10, 11]