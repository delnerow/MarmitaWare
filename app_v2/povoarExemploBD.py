# Script para popular o banco de dados SQLite com dados de exemplo.
import sqlite3
from datetime import datetime

DB_NAME = 'dados_marmitas.db'

def get_unit_id(cur, sigla):
    """Busca o ID da unidade de medida (Foreign Key) pela sigla."""
    cur.execute("SELECT id_unidade FROM Unidades WHERE sigla_unidade = ?", (sigla,))
    result = cur.fetchone()
    if result:
        return result[0]
    raise ValueError(f"Unidade '{sigla}' não encontrada na tabela Unidades.")

def get_item_id(cur, table, name_column, name_value, id_column):
    """Busca um ID genérico (Marmita ou Ingrediente) pelo nome."""
    cur.execute(f"SELECT {id_column} FROM {table} WHERE {name_column} = ?", (name_value,))
    result = cur.fetchone()
    if result:
        return result[0]
    raise ValueError(f"'{name_value}' não encontrado na tabela '{table}'.")

def povoar_database():
    """Conecta e insere todos os dados de exemplo."""
    conn = sqlite3.connect(DB_NAME)
    cur = conn.cursor()

    try:
        # --- 1. POPULAR UNIDADES (Já feito no setup, mas garantindo) ---
        print("Garantindo Unidades de Medida...")
        cur.executescript("""
        INSERT OR IGNORE INTO Unidades (id_unidade, nome_unidade, sigla_unidade) VALUES (1, 'Quilograma', 'kg');
        INSERT OR IGNORE INTO Unidades (id_unidade, nome_unidade, sigla_unidade) VALUES (2, 'Unidade', 'un');
        INSERT OR IGNORE INTO Unidades (id_unidade, nome_unidade, sigla_unidade) VALUES (3, 'Litro', 'L');
        """)

        # --- 2. POPULAR INGREDIENTES ---
        print("Populando Ingredientes...")
        
        # Dados de exemplo: (nome, preco_compra_unitario, sigla_unidade)
        ingredientes_data = [
            ("Arroz Agulhinha", 5.50, 'kg'),
            ("Feijão Carioca", 8.00, 'kg'),
            ("Peito de Frango", 15.00, 'kg'),
            ("Carne Bovina (Patinho)", 35.00, 'kg'),
            ("Batata Inglesa", 3.00, 'kg'),
            ("Ovo de Galinha", 0.70, 'un'),
            ("Óleo de Soja", 9.00, 'L'),
            ("Cenoura", 2.50, 'kg'),
        ]

        for nome, preco, sigla in ingredientes_data:
            try:
                # Busca o ID da unidade
                id_unidade = get_unit_id(cur, sigla)
                
                cur.execute("""
                    INSERT OR IGNORE INTO Ingredientes (nome_ingrediente, preco_compra, data_ultima_compra, id_unidade)
                    VALUES (?, ?, ?, ?)
                """, (nome, preco, datetime.now().strftime('%Y-%m-%d'), id_unidade))
            except ValueError as e:
                print(f"ERRO ao inserir ingrediente {nome}: {e}")
        
        # --- 3. POPULAR MARMITAS ---
        print("Populando Marmitas (Produtos)...")
        marmitas_data = [
            ("Frango Grelhado c/ Arroz e Feijão", 25.00, 8.00), # Nome, Preco_Venda, Custo_Estimado_Inicial
            ("Carne Moída c/ Purê", 28.00, 10.50),
            ("Omelete Simples", 20.00, 5.00),
        ]
        
        for nome, preco_venda, custo_estimado in marmitas_data:
            cur.execute("""
                INSERT OR IGNORE INTO Marmitas (nome_marmita, preco_venda, custo_estimado)
                VALUES (?, ?, ?)
            """, (nome, preco_venda, custo_estimado))

        # --- 4. POPULAR RECEITAS (ingredientes_marmita) ---
        print("Populando Receitas...")
        
        # Mapeamento Ingrediente_Nome: Quantidade_Usada
        receitas_data = {
            "Frango Grelhado c/ Arroz e Feijão": [
                ("Arroz Agulhinha", 0.150),
                ("Feijão Carioca", 0.100),
                ("Peito de Frango", 0.150),
                ("Óleo de Soja", 0.005) # 5ml
            ],
            "Carne Moída c/ Purê": [
                ("Carne Bovina (Patinho)", 0.120),
                ("Batata Inglesa", 0.200),
                ("Cenoura", 0.050),
                ("Óleo de Soja", 0.005)
            ],
            "Omelete Simples": [
                ("Ovo de Galinha", 3.0), # 3 unidades
                ("Óleo de Soja", 0.003)
            ]
        }
        
        for nome_marmita, ingredientes_list in receitas_data.items():
            try:
                id_marmita = get_item_id(cur, 'Marmitas', 'nome_marmita', nome_marmita, 'id_marmita')
                for nome_ingrediente, quantidade in ingredientes_list:
                    id_ingrediente = get_item_id(cur, 'Ingredientes', 'nome_ingrediente', nome_ingrediente, 'id_ingrediente')
                    
                    cur.execute("""
                        INSERT OR IGNORE INTO ingredientes_marmita (id_marmita, id_ingrediente, quantidade)
                        VALUES (?, ?, ?)
                    """, (id_marmita, id_ingrediente, quantidade))
            except ValueError as e:
                print(f"ERRO ao popular receita de {nome_marmita}: {e}")

        # --- 5. POPULAR VENDAS (Exemplo de vendas) ---
        print("Populando Vendas...")
        
        # ID_Marmita (lookup pelo nome), Data, Quantidade
        vendas_data = [
            ("Frango Grelhado c/ Arroz e Feijão", "2025-10-10", 10),
            ("Carne Moída c/ Purê", "2025-10-10", 5),
            ("Omelete Simples", "2025-10-11", 8),
        ]
        
        for nome_marmita, data, quantidade in vendas_data:
            try:
                id_marmita = get_item_id(cur, 'Marmitas', 'nome_marmita', nome_marmita, 'id_marmita')
                cur.execute("""
                    INSERT INTO Vendas (id_marmita, data_de_venda, quantidade_vendida)
                    VALUES (?, ?, ?)
                """, (id_marmita, data, quantidade))
            except ValueError as e:
                print(f"ERRO ao popular venda de {nome_marmita}: {e}")
                
        # --- 6. POPULAR COMPRAS (Exemplo de registro de compras de insumos) ---
        print("Populando Compras...")
        
        # 6.1 Compra 1: Inserir a compra principal
        data_compra_1 = "2025-10-01"
        valor_total_1 = 250.00
        cur.execute("INSERT INTO Compras (data_de_compra, valor_total) VALUES (?, ?)", (data_compra_1, valor_total_1))
        id_compra_1 = cur.lastrowid
        
        # 6.2 Itens da Compra 1: (Ingrediente_Nome, Preço_Pago, Quantidade_Comprada)
        itens_compra_1 = [
            ("Arroz Agulhinha", 5.00, 20.0), # 20 kg
            ("Feijão Carioca", 7.50, 10.0),  # 10 kg
            ("Peito de Frango", 14.50, 15.0), # 15 kg
        ]
        
        for nome_ingrediente, preco_pago, quantidade_comprada in itens_compra_1:
            try:
                id_ingrediente = get_item_id(cur, 'Ingredientes', 'nome_ingrediente', nome_ingrediente, 'id_ingrediente')
                
                # Inserir no registro de compra
                cur.execute("""
                    INSERT INTO compra_ingredientes (id_compra, id_ingrediente, preco_compra, quantidade_comprada)
                    VALUES (?, ?, ?, ?)
                """, (id_compra_1, id_ingrediente, preco_pago, quantidade_comprada))
                
                # Atualizar o preço de custo no ingrediente (simulando a lógica da aplicação)
                cur.execute("""
                    UPDATE Ingredientes SET preco_compra = ?, data_ultima_compra = ? WHERE id_ingrediente = ?
                """, (preco_pago, data_compra_1, id_ingrediente))
            except ValueError as e:
                print(f"ERRO ao popular item de compra: {e}")


        conn.commit()
        print("\n--- Povoamento Concluído com Sucesso! ---")

    except sqlite3.Error as e:
        print(f"\nERRO FATAL no povoamento: {e}")
    finally:
        conn.close()

if __name__ == '__main__':
    povoar_database()
