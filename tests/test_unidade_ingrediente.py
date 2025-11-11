import sys
import os
import pytest
from datetime import date

# Adiciona a raiz do projeto ao path para encontrar a pasta 'classes'
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Importa as classes que vamos testar
from classes.ingrediente import Ingrediente, FactoryIngrediente

# --- Testes de Unidade para a classe Ingrediente ---

def test_ingrediente_criacao():
    """
    Testa se o construtor (__init__) da classe Ingrediente
    atribui corretamente todos os valores.
    (Nível de Teste: Unidade)
    """
    hoje = date.today()
    ing = Ingrediente(
        ID=10,
        nome="Arroz",
        preco_compra=5.50,
        data_ultima_compra=hoje,
        id_unidade=1 # 1 para 'kg'
    )
    
    assert ing.ID == 10
    assert ing.nome == "Arroz"
    assert ing.preco_compra == 5.50
    assert ing.data_ultima_compra == hoje
    assert ing.id_unidade == 1

def test_ingrediente_editar():
    """
    Testa se o método Editar() atualiza apenas os campos fornecidos.
    (Nível de Teste: Unidade)
    """
    ing = Ingrediente(ID=11, nome="Feijão", preco_compra=8.00, data_ultima_compra=None)
    
    # Ação: Editar apenas o preço e o nome
    novo_nome = "Feijão Preto"
    novo_preco = 9.25
    ing.Editar(nome=novo_nome, preco_compra=novo_preco)
    
    # Verificação
    assert ing.ID == 11 # ID não deve mudar
    assert ing.nome == novo_nome # Nome DEVE mudar
    assert ing.preco_compra == novo_preco # Preço DEVE mudar
    assert ing.data_ultima_compra is None # Data não deve mudar

# --- Testes de Unidade para a classe FactoryIngrediente ---

@pytest.fixture
def factory():
    """Cria uma fixture de factory para ser usada em vários testes."""
    return FactoryIngrediente(next_ID=51)

def test_factory_ingrediente_create_sucesso(factory):
    """
    Testa o caminho feliz (happy path) da criação de ingrediente.
    (Nível de Teste: Unidade)
    """
    ingrediente_criado = factory.CreateIngrediente(
        nome=" Frango ", # Testar normalização (strip)
        preco_compra=" 15.99 ", # Testar conversão de string
        data_ultima_compra=date.today(),
        id_unidade=1
    )
    
    assert isinstance(ingrediente_criado, Ingrediente)
    assert ingrediente_criado.ID == 51 # Primeiro ID
    assert ingrediente_criado.nome == "Frango" # Deve ter feito o strip
    assert ingrediente_criado.preco_compra == 15.99 # Deve ter convertido para float
    assert factory.next_ID == 52 # Deve ter incrementado

def test_factory_ingrediente_create_validacao_preco_negativo(factory):
    """
    Testa a Classe de Equivalência Inválida (preço negativo).
    O sistema deve levantar um ValueError.
    (Nível de Teste: Unidade - Caixa Preta)
    """
    with pytest.raises(ValueError, match="Preço de compra não pode ser negativo."):
        factory.CreateIngrediente(
            nome="Tomate",
            preco_compra=-10.0, # Valor de fronteira inválido
            data_ultima_compra=None,
            id_unidade=1
        )

def test_factory_ingrediente_create_validacao_nome_vazio(factory):
    """
    Testa a Classe de Equivalência Inválida (nome vazio).
    (Nível de Teste: Unidade - Caixa Preta)
    """
    with pytest.raises(ValueError, match="Nome do ingrediente não pode ser vazio."):
        factory.CreateIngrediente(nome=" ", data_ultima_compra=None, preco_compra=5.0, id_unidade=1)
        
    with pytest.raises(ValueError, match="Nome do ingrediente não pode ser vazio."):
        factory.CreateIngrediente(nome=None, data_ultima_compra=None, preco_compra=5.0, id_unidade=1)

def test_factory_ingrediente_create_validacao_preco_invalido(factory):
    """
    Testa a Classe de Equivalência Inválida (preço não-numérico).
    (Nível de Teste: Unidade - Caixa Preta)
    """
    with pytest.raises(ValueError, match="Preço de compra deve ser um número válido."):
        factory.CreateIngrediente(
            nome="Alface",
            preco_compra="abc", # Valor inválido
            data_ultima_compra=None,
            id_unidade=2
        )