import sys
import os
import pytest
from datetime import date, datetime

# Adiciona a raiz do projeto ao path para encontrar a pasta 'classes'
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Importa as classes que vamos testar
from classes.venda import Venda, FactoryVenda

# --- Testes de Unidade para a classe Venda ---

def test_venda_criacao():
    """
    Testa se o construtor (__init__) da classe Venda
    atribui corretamente todos os valores.
    (Nível de Teste: Unidade)
    """
    hoje = date.today()
    
    v = Venda(
        ID=201,
        id_marmita=1,
        quantidade=2,
        data=hoje
    )
    
    assert v.ID == 201
    assert v.id_marmita == 1
    assert v.quantidade_vendida == 2
    assert v.data_de_venda == hoje

def test_venda_editar():
    """
    Testa se o método editar() atualiza apenas os campos fornecidos.
    CORRIGIDO: O método editar() atualiza v.data, não v.data_de_venda
    (Nível de Teste: Unidade)
    """
    data_original = date(2025, 10, 20)
    v = Venda(ID=202, id_marmita=1, quantidade=1, data=data_original)
    
    # Ação: Editar a quantidade e a data
    nova_data = date(2025, 10, 21)
    v.editar(quantidade=3, data=nova_data)
    
    # Verificação
    assert v.ID == 202       # ID não deve mudar
    assert v.id_marmita == 1   # Marmita ID não deve mudar
    assert v.quantidade_vendida == 3  # Quantidade DEVE mudar
    # CORRIGIDO: O método editar() atualiza o atributo 'data', não 'data_de_venda'
    assert v.data_de_venda == nova_data # Data DEVE mudar

# --- Testes de Unidade para a classe FactoryVenda ---

@pytest.fixture
def factory():
    """Cria uma fixture de factory para ser usada em vários testes."""
    return FactoryVenda(next_ID=301)

def test_factory_venda_create_sucesso(factory):
    """
    Testa o caminho feliz (happy path) da criação de venda.
    (Nível de Teste: Unidade)
    """
    data_venda = date(2025, 11, 10)
    venda_criada = factory.CreateVenda(
        marmita=5, # ID da marmita
        quantidade=2,
        data=data_venda
    )
    
    assert isinstance(venda_criada, Venda)
    assert venda_criada.ID == 301 # Primeiro ID
    assert venda_criada.id_marmita == 5
    assert venda_criada.quantidade_vendida == 2
    assert venda_criada.data_de_venda == data_venda
    assert factory.next_ID == 302 # Deve ter incrementado

def test_factory_venda_from_db(factory):
    """
    Testa a recriação de uma Venda a partir de um dicionário (mock do DB).
    Verifica especialmente a conversão da string de data.
    (Nível de Teste: Unidade)
    """
    # Mock de um registro que viria do banco de dados
    venda_dict_db = {
        'id_venda': 42,
        'id_marmita': 7,
        'quantidade_vendida': 3,
        'data_de_venda': '2025-11-05' # Formato YYYY-MM-DD
    }
    
    venda_recriada = factory.FromDB(venda_dict_db)
    
    assert isinstance(venda_recriada, Venda)
    assert venda_recriada.ID == 42
    assert venda_recriada.id_marmita == 7
    assert venda_recriada.quantidade_vendida == 3
    # Verifica se a conversão de string para objeto date funcionou
    assert venda_recriada.data_de_venda == date(2025, 11, 5)