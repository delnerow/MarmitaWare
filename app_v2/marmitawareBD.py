# Script para inicializar o banco de dados SQLite com a estrutura atualizada.
# Adiciona a tabela Unidades de Medida para garantir a integridade dos dados.
import sqlite3

def setup_database():
    """Cria o arquivo de banco de dados e todas as tabelas."""
    DB_NAME = 'dados_marmitas.db'
    conn = sqlite3.connect(DB_NAME)
    cur = conn.cursor()

    # Usamos executescript para executar múltiplos comandos CREATE TABLE
    # A ordem é importante para as chaves estrangeiras.
    schema = """
    -- Tabela de Unidades de Medida (Referência)
    CREATE TABLE IF NOT EXISTS Unidades (
        id_unidade INTEGER PRIMARY KEY,
        nome_unidade TEXT NOT NULL,
        sigla_unidade TEXT NOT NULL UNIQUE
    );

    -- Inserção inicial das unidades padrão
    INSERT INTO Unidades (nome_unidade, sigla_unidade) VALUES 
        ('Quilograma', 'kg'), 
        ('Unidade', 'un'), 
        ('Litro', 'L')
    ON CONFLICT(id_unidade) DO NOTHING;
    
    -- Tabela de Ingredientes (agora com chave estrangeira para Unidades)
    CREATE TABLE IF NOT EXISTS Ingredientes (
        id_ingrediente INTEGER PRIMARY KEY,
        nome_ingrediente TEXT NOT NULL UNIQUE,
        preco_compra NUMERIC(10, 2) NOT NULL,
        data_ultima_compra DATE,
        id_unidade INTEGER,
        FOREIGN KEY (id_unidade) REFERENCES Unidades (id_unidade)
    );

    -- Tabela de Marmitas (Produtos)
    CREATE TABLE IF NOT EXISTS Marmitas (
        id_marmita INTEGER PRIMARY KEY,
        nome_marmita TEXT NOT NULL UNIQUE,
        preco_venda NUMERIC(10, 2) NOT NULL,
        custo_estimado NUMERIC(10, 2)
    );

    -- Tabela de Compras (Registro de Compras de Insumos)
    CREATE TABLE IF NOT EXISTS Compras (
        id_compra INTEGER PRIMARY KEY,
        data_de_compra DATE NOT NULL,
        valor_total NUMERIC(10, 2) NOT NULL
    );

    -- Tabela de Ligação Compra-Ingredientes
    CREATE TABLE IF NOT EXISTS compra_ingredientes (
        id_compra_ingrediente INTEGER PRIMARY KEY,
        id_compra INTEGER NOT NULL,
        id_ingrediente INTEGER NOT NULL,
        preco_compra NUMERIC(10, 2) NOT NULL,
        quantidade_comprada NUMERIC(5, 4) NOT NULL,
        FOREIGN KEY (id_compra) REFERENCES Compras (id_compra),
        FOREIGN KEY (id_ingrediente) REFERENCES Ingredientes (id_ingrediente),
        UNIQUE (id_compra, id_ingrediente)
    );

    -- Tabela de Ligação Ingredientes-Marmita (Receita)
    CREATE TABLE IF NOT EXISTS ingredientes_marmita (
        id_ingredientes_marmita INTEGER PRIMARY KEY,
        id_marmita INTEGER NOT NULL,
        id_ingrediente INTEGER NOT NULL,
        quantidade NUMERIC(5, 4) NOT NULL,
        FOREIGN KEY (id_marmita) REFERENCES Marmitas (id_marmita),
        FOREIGN KEY (id_ingrediente) REFERENCES Ingredientes (id_ingrediente),
        UNIQUE (id_marmita, id_ingrediente)
    );

    -- Tabela de Vendas (Registro de Vendas de Marmitas)
    CREATE TABLE IF NOT EXISTS Vendas (
        id_venda INTEGER PRIMARY KEY,
        id_marmita INTEGER NOT NULL,
        data_de_venda DATE NOT NULL,
        quantidade_vendida INTEGER NOT NULL,
        FOREIGN KEY (id_marmita) REFERENCES Marmitas (id_marmita)
    );
    """

    try:
        cur.executescript(schema)
        conn.commit()
        print(f"Banco de dados '{DB_NAME}' criado/atualizado com sucesso.")
    except sqlite3.Error as e:
        print(f"Erro ao inicializar o banco de dados: {e}")
    finally:
        conn.close()

if __name__ == '__main__':
    setup_database()
