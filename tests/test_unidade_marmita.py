import sys
import os
import pytest

# Bloco "mágico" para garantir que o Python encontre a pasta 'classes'
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Agora podemos importar do pacote 'classes'
from classes.marmita import Marmita, FactoryMarmita

# --- Testes de Unidade para a classe Marmita ---

def test_marmita_criacao():
    """
    Testa se o construtor (__init__) da classe Marmita
    atribui corretamente todos os valores.
    (Nível de Teste: Unidade)
    """
    ingredientes_lista = [1, 2, 3] # IDs dos ingredientes
    qtd_ingredientes_dict = {1: 100, 2: 50, 3: 50} # {ID: gramas}
    
    m = Marmita(
        ID=1,
        preco_venda=18.50,
        quantidade_ingredientes=qtd_ingredientes_dict,
        custo_estimado=12.00,
        nome_marmita="Frango Grelhado"
    )
    
    # Afirmações (Asserts)
    assert m.ID == 1
    assert m.nome == "Frango Grelhado"
    assert m.preco_venda == 18.50
    assert m.custo_estimado == 12.00
    assert m.ingredientes == [1, 2, 3]
    assert m.quantidade_ingredientes[1] == 100

def test_marmita_editar():
    """
    Testa se o método Editar() atualiza apenas os campos fornecidos.
    (Nível de Teste: Unidade)
    """
    m = Marmita(ID=2, preco_venda=15.00, quantidade_ingredientes={}, custo_estimado=10.0, nome_marmita="Teste")
    
    # Ação: Editar apenas o preço e o custo
    m.Editar(preco_venda=16.00, custo_estimado=11.00)
    
    # Verificação
    assert m.ID == 2 # ID não deve mudar
    assert m.nome == "Teste" # Nome não deve mudar
    assert m.preco_venda == 16.00 # Preço DEVE mudar
    assert m.custo_estimado == 11.00 # Custo DEVE mudar

# --- Testes de Unidade para a classe FactoryMarmita ---

def test_factory_marmita_create():
    """
    Testa se a FactoryMarmita cria uma nova Marmita
    corretamente e incrementa seu próprio ID.
    (Nível de Teste: Unidade, focado na classe Factory) 
    """
    factory = FactoryMarmita(next_ID=101) # Começa no ID 101
    
    # Ação
    marmita_criada = factory.CreateMarmita(
        preco_venda=20.0,
        quantidade_ingredientes={5: 100, 6: 150},
        custo_estimado=14.0,
        nome_marmita="Marmita da Factory"
    )
    
    # Verificação
    assert isinstance(marmita_criada, Marmita)
    assert marmita_criada.ID == 101
    assert marmita_criada.nome == "Marmita da Factory"
    assert factory.next_ID == 102