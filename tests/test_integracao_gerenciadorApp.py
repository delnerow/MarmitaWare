import sys
import os
import pytest

# Adiciona a raiz do projeto ao path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from classes.gerenciadorApp import GerenciadorApp
# Precisamos importar o GerenciadorBD para acessar a fixture,
# mesmo que não a usemos diretamente.
from classes.gerenciadorBD import GerenciadorBD

# Importa a fixture do banco de dados de teste
# (Não é necessário reescrever, o pytest vai encontrá-la)
from tests.test_integracao_gerenciadorBD import db_test_file

def test_app_integracao_create_e_load_ingrediente(db_test_file):
    """
    Testa a integração ponta-a-ponta do GerenciadorApp:
    1. Chama CreateIngrediente (App -> Factory -> BD)
    2. Verifica se o item foi salvo
    3. Verifica se o LoadIngredientes (no __init__ de um novo App)
       consegue carregar o item salvo.
    (Nível de Teste: Integração de Camadas)
    """
    
    # --- Preparação ---
    # 1. Instancia o GerenciadorApp.
    #    Ele usará o 'db_test_file' automaticamente
    #    porque o GerenciadorBD é um Singleton e a fixture
    #    já o configurou.
    app = GerenciadorApp()
    
    # --- Ação ---
    # 2. Chama o método de criação (App -> Factory -> BD)
    app.CreateIngrediente(
        nome="Tomate",
        preco_compra=8.50,
        id_unidade=1 # FK para 'kg' (da fixture)
    )

    # --- Verificação 1: O item está no BD? ---
    # Podemos "roubar" e olhar direto no BD
    ingredientes_no_bd = app.gerenciadorBD.getIngredientes()
    assert len(ingredientes_no_bd) == 1
    assert ingredientes_no_bd[0]['nome_ingrediente'] == "Tomate"
    
    # --- Verificação 2: O item está na memória do App? ---
    # O método CreateIngrediente não salva na memória
    # (self.ingredientes), apenas no BD. Vamos verificar isso.
    # Se o seu app devesse salvar na memória, este assert falharia
    # e teríamos encontrado um bug.
    assert len(app.ingredientes) == 0 # O __init__ carregou 0

    # --- Verificação 3: O 'load' funciona? ---
    # 3. Cria uma *nova* instância do GerenciadorApp.
    #    O __init__ deve agora carregar o "Tomate" do BD.
    app_nova_instancia = GerenciadorApp()
    
    # 4. Verifica se o item foi carregado na memória
    assert len(app_nova_instancia.ingredientes) == 1
    ingrediente_carregado = app_nova_instancia.ingredientes[1] # ID é 1
    assert ingrediente_carregado.nome == "Tomate"
    assert ingrediente_carregado.preco_compra == 8.50