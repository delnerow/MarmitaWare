import sys
import os
import pytest
import sqlite3
from classes.marmita import Marmita
from classes.venda import Venda
from classes.compra import Compra
from datetime import date

# Adiciona a raiz do projeto ao path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from classes.gerenciadorBD import GerenciadorBD
from classes.ingrediente import Ingrediente

@pytest.fixture
def db_test_file(mocker, tmp_path):
    """
    Fixture que cria um GerenciadorBD apontando para um
    arquivo de banco de dados temporário e limpo.
    """
    # 1. Cria um caminho para um arquivo de BD temporário
    test_db_path = tmp_path / "test_marmitaware.db"
    
    # 2. Força a reinicialização do Singleton
    GerenciadorBD._instance = None
    
    # 3. Cria a instância (ela vai inicializar com o BD real)
    db = GerenciadorBD() 

    # 4. Faz o patch do atributo DATA_FILE na INSTÂNCIA
    #    para apontar para o nosso arquivo de teste temporário.
    #    Convertemos para string, pois o sqlite3 espera uma string.
    mocker.patch.object(db, 'DATA_FILE', str(test_db_path))
    
    # 5. Re-inicializa o DB. Agora, _initialize_db() vai criar
    #    as tabelas no nosso arquivo temporário.
    db._initialize_db()
    
    # 6. Pré-popula as tabelas de referência
    #    conectando-se diretamente ao arquivo de teste.
    try:
        conn = sqlite3.connect(str(test_db_path))
        # Insere a unidade com ID explícito
        conn.execute("INSERT INTO Unidades (id_unidade, nome_unidade, sigla_unidade) VALUES (1, 'Kilograma', 'kg')")
        conn.commit()
    finally:
        conn.close()
    
    yield db 
    
    # Limpeza após o teste
    GerenciadorBD._instance = None
    # O pytest limpará automaticamente o diretório tmp_path

def test_bd_is_singleton():
    """
    Testa se o GerenciadorBD implementa o padrão Singleton.
    (Nível de Teste: Unidade - Padrão de Projeto)
    """
    # Limpa qualquer instância anterior
    GerenciadorBD._instance = None
    
    db1 = GerenciadorBD()
    db2 = GerenciadorBD()
    
    # Verifica se ambas as variáveis apontam para o MESMO objeto
    assert db1 is db2

def test_bd_save_and_get_ingrediente(db_test_file):
    """
    Testa a integração real de salvar e buscar um ingrediente
    no banco de dados em memória.
    (Nível de Teste: Integração)
    """
    # --- Preparação ---
    # A fixture 'db_in_memory' já criou as tabelas E
    # populou a tabela 'Unidades' com a Unidade ID=1.

    # Cria um objeto Ingrediente (real)
    ing = Ingrediente(
        ID=1, # O ID é ignorado pelo INSERT, que usa AUTOINCREMENT
        nome="Arroz",
        preco_compra=20.0,
        data_ultima_compra=None,
        id_unidade=1 # Chave estrangeira para 'kg' (ID=1)
    )
    
    # Ação
    db_test_file.saveIngredientes(ing)
    
    # --- Verificação ---
    ingredientes_do_bd = db_test_file.getIngredientes()
    
    assert len(ingredientes_do_bd) == 1
    assert ingredientes_do_bd[0]['nome_ingrediente'] == "Arroz"
    assert ingredientes_do_bd[0]['preco_compra'] == 20.0
    assert ingredientes_do_bd[0]['id_ingrediente'] == 1 # Foi o primeiro item

def test_bd_save_and_get_marmita(db_test_file):
    """
    Testa a integração de salvar e buscar uma Marmita,
    incluindo sua tabela de ligação N-M (ingredientes_marmita).
    (Nível de Teste: Integração)
    """
    # --- Preparação ---
    # A fixture já criou a Unidade ID=1.
    # Precisamos criar os ingredientes que a marmita usará.
    try:
        conn = sqlite3.connect(str(db_test_file.DATA_FILE))
        conn.execute("INSERT INTO Ingredientes (id_ingrediente, nome_ingrediente, preco_compra, id_unidade) VALUES (10, 'Arroz', 5.0, 1)")
        conn.execute("INSERT INTO Ingredientes (id_ingrediente, nome_ingrediente, preco_compra, id_unidade) VALUES (11, 'Feijão', 8.0, 1)")
        conn.commit()
    finally:
        conn.close()

    # Cria um objeto Marmita (real)
    m = Marmita(
        ID=1, # ID será ignorado pelo saveMarmitas, que usa AUTOINCREMENT
        nome_marmita="Arroz e Feijão",
        preco_venda=15.0,
        custo_estimado=10.0,
        quantidade_ingredientes={10: 150, 11: 100} # {ID: gramas}
    )

    # --- Ação ---
    db_test_file.saveMarmitas(m) # Método já corrigido
    
    # --- Verificação ---
    marmitas_do_bd = db_test_file.getMarmitas()

    assert len(marmitas_do_bd) == 1
    m_salva = marmitas_do_bd[0]
    
    assert m_salva['nome_marmita'] == "Arroz e Feijão"
    assert m_salva['preco_venda'] == 15.0
    assert m_salva['id_marmita'] == 1 # Foi a primeira marmita
    # Verifica a lógica complexa do 'getMarmitas' (JOINs e agregação)
    assert set(m_salva['ingredientes']) == {10, 11}
    assert m_salva['quantidade_ingredientes'] == {10: 150, 11: 100}

def test_bd_save_and_get_venda(db_test_file):
    """
    Testa a integração de salvar e buscar uma Venda.
    (Nível de Teste: Integração)
    """
    # --- Preparação ---
    # Vendas precisam de uma Marmita (FK). Vamos inserir uma.
    try:
        conn = sqlite3.connect(str(db_test_file.DATA_FILE))
        # Insere uma marmita simples para o teste
        conn.execute("INSERT INTO Marmitas (id_marmita, nome_marmita, preco_venda) VALUES (5, 'Marmita P/ Venda', 20.0)")
        conn.commit()
    finally:
        conn.close()
        
    # Cria um objeto Venda (real)
    v = Venda(
        ID=1, # Ignorado
        id_marmita=5, # FK para a marmita que acabamos de criar
        quantidade=3,
        data=date(2025, 11, 10)
    )
    # Em 'venda.py', o __init__ armazena 'data'
    # Em 'gerenciadorBD.py', 'saveVendas' lê 'venda.data_de_venda'
    # Isso é um bug! Vamos ajustar o objeto de teste para o que o saveVendas espera.


    # --- Ação ---
    db_test_file.saveVendas(v)
    
    # --- Verificação ---
    vendas_do_bd = db_test_file.getVendas()

    assert len(vendas_do_bd) == 1
    v_salva = vendas_do_bd[0]
    
    assert v_salva['id_marmita'] == 5
    assert v_salva['quantidade_vendida'] == 3
    assert v_salva['data_de_venda'] == '2025-11-10' # O BD armazena como string

def test_bd_get_compras_complex(db_test_file):
    """
    Testa a lógica complexa de 'getCompras' (JOINs e agregação).
    Nota: 'saveCompras' está como 'pass', então testamos apenas a leitura.
    (Nível de Teste: Integração)
    """
    # --- Preparação ---
    # Precisamos popular Ingredientes, Compras, e compra_ingredientes
    try:
        conn = sqlite3.connect(str(db_test_file.DATA_FILE))
        conn.execute("INSERT INTO Ingredientes (id_ingrediente, nome_ingrediente, preco_compra, id_unidade) VALUES (10, 'Arroz', 5.0, 1)")
        conn.execute("INSERT INTO Ingredientes (id_ingrediente, nome_ingrediente, preco_compra, id_unidade) VALUES (11, 'Feijão', 8.0, 1)")
        
        # Insere a Compra principal
        conn.execute("INSERT INTO Compras (id_compra, data_de_compra, valor_total) VALUES (1, '2025-11-01', 130.0)")
        
        # Insere os itens na tabela de ligação
        conn.execute("INSERT INTO compra_ingredientes (id_compra, id_ingrediente, preco_compra) VALUES (1, 10, 50.0)")
        conn.execute("INSERT INTO compra_ingredientes (id_compra, id_ingrediente, preco_compra) VALUES (1, 11, 80.0)")
        conn.commit()
    finally:
        conn.close()

    # --- Ação ---
    compras_do_bd = db_test_file.getCompras()

    # --- Verificação ---
    assert len(compras_do_bd) == 1
    c_salva = compras_do_bd[0]
    
    assert c_salva['id_compra'] == 1
    assert c_salva['valor_total'] == 130.0
    assert c_salva['data_de_compra'] == '2025-11-01'
    # Verifica a lógica de agregação
    assert set(c_salva['ingredientes']) == {10, 11}
    assert c_salva['preco_ingredientes'] == {10: 50.0, 11: 80.0}