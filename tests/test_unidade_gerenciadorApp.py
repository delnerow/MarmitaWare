import sys
import os
import pytest
from datetime import date

# Adiciona a raiz do projeto ao path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Importa a classe que vamos testar
from classes.gerenciadorApp import GerenciadorApp

# --- Testes de Unidade para a classe GerenciadorApp ---

# Fixture para simular (mockar) as dependências do GerenciadorApp
@pytest.fixture
def mock_dependencies(mocker):
    """Mocks all classes that GerenciadorApp depends on."""
    
    # Mock do GerenciadorBD
    mock_bd = mocker.MagicMock()
    mock_bd.getProximoID.return_value = {
        'ingredientes': 1, 'compras': 1, 'marmitas': 1, 'vendas': 1
    }
    # Mock dos métodos 'get' para retornar listas vazias (para o __init__)
    mock_bd.getIngredientes.return_value = []
    mock_bd.getCompras.return_value = []
    mock_bd.getMarmitas.return_value = []
    mock_bd.getVendas.return_value = []
    
    # Mock das Factories
    mock_factory_ingrediente = mocker.MagicMock()
    mock_factory_compra = mocker.MagicMock()
    mock_factory_marmita = mocker.MagicMock()
    mock_factory_venda = mocker.MagicMock()
    
    # "Engana" o Python para que, quando o GerenciadorApp tentar
    # importar e usar essas classes, ele use nossos mocks.
    mocker.patch('classes.gerenciadorApp.GerenciadorBD', return_value=mock_bd)
    mocker.patch('classes.gerenciadorApp.FactoryIngrediente', return_value=mock_factory_ingrediente)
    mocker.patch('classes.gerenciadorApp.FactoryCompra', return_value=mock_factory_compra)
    mocker.patch('classes.gerenciadorApp.FactoryMarmita', return_value=mock_factory_marmita)
    mocker.patch('classes.gerenciadorApp.FactoryVenda', return_value=mock_factory_venda)
    
    # Retorna os mocks para que possamos usá-los nos testes
    return {
        'bd': mock_bd,
        'factory_ing': mock_factory_ingrediente,
        'factory_com': mock_factory_compra,
        'factory_mar': mock_factory_marmita,
        'factory_ven': mock_factory_venda
    }

def test_app_init_loads_data(mocker, mock_dependencies):
    """
    Testa se o __init__ do GerenciadorApp chama os métodos
    de 'load' e popula os dicionários internos.
    (Nível de Teste: Unidade)
    """
    # Prepara o mock do BD para retornar um ingrediente
    mock_ingrediente_dict = {'id_ingrediente': 1, 'nome_ingrediente': 'Arroz'}
    mock_dependencies['bd'].getIngredientes.return_value = [mock_ingrediente_dict]
    
    # Prepara o mock da Factory para "transformar" o dicionário em objeto
    mock_ingrediente_obj = mocker.MagicMock(ID=1)
    mock_dependencies['factory_ing'].FromDB.return_value = mock_ingrediente_obj

    # --- Ação ---
    app = GerenciadorApp() # O __init__ é chamado aqui

    # --- Verificação ---
    # Verifica se o BD foi chamado
    mock_dependencies['bd'].getIngredientes.assert_called_once()
    # Verifica se a Factory foi chamada para processar o item
    mock_dependencies['factory_ing'].FromDB.assert_called_with(mock_ingrediente_dict)
    # Verifica se a lógica de carregar funcionou
    assert len(app.ingredientes) == 1
    assert app.ingredientes[1] == mock_ingrediente_obj

def test_app_create_ingrediente_delegates_correctly(mocker, mock_dependencies):
    """
    Testa se o método CreateIngrediente chama a Factory
    e o GerenciadorBD corretamente (lógica de delegação).
    (Nível de Teste: Unidade)
    """
    # --- Preparação ---
    app = GerenciadorApp() # Inicializa o app com dependências mockadas
    
    # Prepara um mock de objeto "Ingrediente" que a factory deve retornar
    mock_ingrediente_criado = mocker.MagicMock()
    mock_dependencies['factory_ing'].CreateIngrediente.return_value = mock_ingrediente_criado
    
    # --- Ação ---
    app.CreateIngrediente(
        nome="Tomate", 
        preco_compra=10.0, 
        id_unidade=1, 
        data_ultima_compra=None
    )
    
    # --- Verificação ---
    # 1. A Factory foi chamada para criar o objeto?
    mock_dependencies['factory_ing'].CreateIngrediente.assert_called_once_with(
        "Tomate", 10.0, None, 1
    )
    
    # 2. O objeto criado foi salvo no BD?
    mock_dependencies['bd'].saveIngredientes.assert_called_once_with(
        mock_ingrediente_criado
    )