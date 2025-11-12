import sqlite3
import os
from .venda import Venda
from .marmita import Marmita
from .ingrediente import Ingrediente
from .compra import Compra

class GerenciadorBD():
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(GerenciadorBD, cls).__new__(cls)
            cls._instance.current_path = os.path.dirname(os.path.abspath(__file__))
            cls._instance.data_root = os.path.join(cls._instance.current_path, '..', 'data')
            cls._instance.DATA_FILE = os.path.join(cls._instance.data_root, 'dados_marmitas.db')
            cls._instance._initialize_db()
        return cls._instance
    
    def _initialize_db(self):
        """Inicializa o banco de dados e cria as tabelas se não existirem"""
        os.makedirs(self.data_root, exist_ok=True)
        conn = sqlite3.connect(self.DATA_FILE)
        cursor = conn.cursor()
        # Garantir integridade referencial no SQLite
        cursor.execute('PRAGMA foreign_keys = ON;')
        
        # Criar tabelas
        schema = """
        -- Tabela de Unidades de Medida (Referência)
        CREATE TABLE IF NOT EXISTS Unidades (
            id_unidade INTEGER PRIMARY KEY AUTOINCREMENT,
            nome_unidade TEXT NOT NULL,
            sigla_unidade TEXT NOT NULL UNIQUE
        );
        
        -- Tabela de Ingredientes (agora com chave estrangeira para Unidades)
        CREATE TABLE IF NOT EXISTS Ingredientes (
            id_ingrediente INTEGER PRIMARY KEY AUTOINCREMENT,
            nome_ingrediente TEXT NOT NULL UNIQUE,
            preco_compra NUMERIC(10, 2) NOT NULL,
            data_ultima_compra DATE,
            id_unidade INTEGER,
            FOREIGN KEY (id_unidade) REFERENCES Unidades (id_unidade)
        );

        -- Tabela de Marmitas (Produtos)
        CREATE TABLE IF NOT EXISTS Marmitas (
            id_marmita INTEGER PRIMARY KEY AUTOINCREMENT,
            nome_marmita TEXT NOT NULL UNIQUE,
            preco_venda NUMERIC(10, 2) NOT NULL,
            custo_estimado NUMERIC(10, 2)
        );

        -- Tabela de Compras (Registro de Compras de Insumos)
        CREATE TABLE IF NOT EXISTS Compras (
            id_compra INTEGER PRIMARY KEY AUTOINCREMENT,
            data_de_compra DATE NOT NULL,
            valor_total NUMERIC(10, 2) NOT NULL
        );

        -- Tabela de Ligação Compra-Ingredientes
        CREATE TABLE IF NOT EXISTS compra_ingredientes (
            id_compra_ingrediente INTEGER PRIMARY KEY AUTOINCREMENT,
            id_compra INTEGER NOT NULL,
            id_ingrediente INTEGER NOT NULL,
            preco_compra NUMERIC(10, 2) NOT NULL,
            FOREIGN KEY (id_compra) REFERENCES Compras (id_compra),
            FOREIGN KEY (id_ingrediente) REFERENCES Ingredientes (id_ingrediente),
            UNIQUE (id_compra, id_ingrediente)
        );

        -- Tabela de Ligação Ingredientes-Marmita (Receita)
        CREATE TABLE IF NOT EXISTS ingredientes_marmita (
            id_ingredientes_marmita INTEGER PRIMARY KEY AUTOINCREMENT,
            id_marmita INTEGER NOT NULL,
            id_ingrediente INTEGER NOT NULL,
            quantidade NUMERIC(5, 4) NOT NULL,
            FOREIGN KEY (id_marmita) REFERENCES Marmitas (id_marmita),
            FOREIGN KEY (id_ingrediente) REFERENCES Ingredientes (id_ingrediente),
            UNIQUE (id_marmita, id_ingrediente)
        );

        -- Tabela de Vendas (Registro de Vendas de Marmitas)
        CREATE TABLE IF NOT EXISTS Vendas (
            id_venda INTEGER PRIMARY KEY AUTOINCREMENT,
            id_marmita INTEGER NOT NULL,
            data_de_venda DATE NOT NULL,
            quantidade_vendida INTEGER NOT NULL,
            FOREIGN KEY (id_marmita) REFERENCES Marmitas (id_marmita)
        );
        """
        cursor.executescript(schema)
        conn.commit()
        conn.close()
    
    def teste(self):
        #método para testes internos
        print('Teste de conexão com o banco de dados bem-sucedido!')

    #---------
    def loadData(self):
        print('Loading data from database...')
        """Carrega todos os dados do banco"""
        return {
            'vendas': self.getVendas(),
            'marmitas': self.getMarmitas(),
            'ingredientes': self.getIngredientes(),
            'compras': self.getCompras()
        }
    
    def saveData(self):
        """Salva alterações no banco de dados"""
        pass  # SQLite salva automaticamente com commit
    
    def getVendas(self):
        """Retorna todas as vendas"""
        conn = sqlite3.connect(self.DATA_FILE)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM Vendas')
        vendas = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return vendas
    
    def getMarmitas(self):
        """Retorna todas as marmitas com seus ingredientes"""
        conn = sqlite3.connect(self.DATA_FILE)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Captura todas as marmitas
        cursor.execute('SELECT * FROM Marmitas')
        marmitas = [dict(row) for row in cursor.fetchall()]
        
        # Para cada marmita, captura os ingredientes associados
        for marmita in marmitas:
            cursor.execute('''
                SELECT im.id_ingrediente, im.quantidade, i.nome_ingrediente, i.preco_compra
                FROM ingredientes_marmita im
                INNER JOIN Ingredientes i ON im.id_ingrediente = i.id_ingrediente
                WHERE im.id_marmita = ?
            ''', (marmita['id_marmita'],))
            
            # Armazena os resultados para evitar consumir o cursor
            resultados = cursor.fetchall()
            
            # Cria lista de IDs dos ingredientes
            marmita['ingredientes'] = [row['id_ingrediente'] for row in resultados]
            
            # Cria dicionário com quantidade de cada ingrediente
            marmita['quantidade_ingredientes'] = {
                row['id_ingrediente']: row['quantidade'] 
                for row in resultados
            }        
        conn.close()
        return marmitas
    
    
    def getIngredientes(self):
        """Retorna todos os ingredientes"""
        conn = sqlite3.connect(self.DATA_FILE)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM Ingredientes')
        ingredientes = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return ingredientes
    
    def getCompras(self):
        """Retorna todas as compras"""
        conn = sqlite3.connect(self.DATA_FILE)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        #captura do ID, data e valor total de cada compra
        cursor.execute('SELECT * FROM Compras')
        compras = [dict(row) for row in cursor.fetchall()]

        #para cada um dos registros de compra, captura os ingredientes associados
        for compra in compras:
            cursor.execute('''
                SELECT ci.id_ingrediente, ci.preco_compra
                FROM compra_ingredientes ci
                WHERE ci.id_compra = ?
            ''', (compra['id_compra'],))
            ingredientes = [row['id_ingrediente'] for row in cursor.fetchall()]

            cursor.execute('''
                SELECT ci.id_ingrediente, ci.preco_compra
                FROM compra_ingredientes ci
                WHERE ci.id_compra = ?
            ''', (compra['id_compra'],))

            preco_ingredientes = {row['id_ingrediente']: row['preco_compra'] for row in cursor.fetchall()}

            compra['ingredientes'] = ingredientes
            compra['preco_ingredientes'] = preco_ingredientes

        conn.close()
        return compras
    
    def saveVendas(self, venda: Venda):
        """Salva uma nova venda"""
        conn = sqlite3.connect(self.DATA_FILE)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO Vendas (id_marmita, data_de_venda, quantidade_vendida)
            VALUES (?, ?, ?)
        ''', (venda.id_marmita, venda.data_de_venda, venda.quantidade_vendida))
        conn.commit()
        conn.close()
    
    def saveMarmitas(self, marmita: Marmita):
        """Salva uma nova marmita com seus ingredientes"""
        conn = sqlite3.connect(self.DATA_FILE)
        cursor = conn.cursor()
        
        try:
            # Insere a marmita
            cursor.execute('''
                INSERT INTO Marmitas (nome_marmita, preco_venda, custo_estimado)
                VALUES (?, ?, ?)
            ''', (marmita.nome, marmita.preco_venda, marmita.custo_estimado))
            
            id_marmita = cursor.lastrowid
            
            # Insere os ingredientes da marmita na tabela de ligação
            if hasattr(marmita, 'ingredientes') and marmita.ingredientes:
                for id_ingrediente in marmita.ingredientes:
                    cursor.execute('''
                        INSERT INTO ingredientes_marmita (id_marmita, id_ingrediente, quantidade)
                        VALUES (?, ?, ?)
                    ''', (id_marmita, id_ingrediente, marmita.quantidade_ingredientes[id_ingrediente]))
            
            conn.commit()
        except sqlite3.IntegrityError as e:
            conn.rollback()
            raise e
        finally:
            conn.close()
    
    def saveIngredientes(self, ingrediente):
        """Salva um novo ingrediente"""
        conn = sqlite3.connect(self.DATA_FILE)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO Ingredientes (nome_ingrediente, preco_compra, data_ultima_compra, id_unidade)
                VALUES (?, ?, ?, ?)
            ''', (ingrediente.nome, ingrediente.preco_compra, ingrediente.data_ultima_compra, ingrediente.id_unidade))
            conn.commit()
        except sqlite3.IntegrityError as e:
            conn.rollback()
            raise e
        finally:
            conn.close()
    
    def saveCompra(self, compra: Compra):
        """Salva uma nova compra, os itens na tabela de ligação e atualiza preço/data dos ingredientes."""
        def _get(obj, *names):
            for n in names:
                if hasattr(obj, n):
                    return getattr(obj, n)
                if isinstance(obj, dict) and n in obj:
                    return obj[n]
            return None

        data_de_compra = _get(compra, 'data_de_compra', 'data', 'data_compra')
        valor_total = _get(compra, 'valor_total', 'valor', 'total')
        ingredientes_list = _get(compra, 'ingredientes', 'itens', 'ids')
        preco_map = _get(compra, 'preco_ingredientes', 'preco_por_ingrediente', 'precos') or {}
        quantidade_map = _get(compra, 'quantidade_ingredientes', 'quantidades', 'quantidade_por_ingrediente') or {}

        if ingredientes_list is None:
            raise ValueError("Compra deve conter a lista de 'ingredientes' (ids)")

        conn = sqlite3.connect(self.DATA_FILE)
        cursor = conn.cursor()
        cursor.execute('PRAGMA foreign_keys = ON;')

        try:
            # Insere a compra
            cursor.execute('''
                INSERT INTO Compras (data_de_compra, valor_total)
                VALUES (?, ?)
            ''', (data_de_compra, valor_total))
            id_compra = cursor.lastrowid

            # Insere itens na tabela de ligação e atualiza ingredientes
            for id_ingrediente in ingredientes_list:
                preco = preco_map.get(id_ingrediente, preco_map.get(str(id_ingrediente), 0.0))

                cursor.execute('''
                    INSERT INTO compra_ingredientes (id_compra, id_ingrediente, preco_compra)
                    VALUES (?, ?, ?)
                ''', (id_compra, id_ingrediente, preco))

                # Atualiza preço e data da última compra no ingrediente
                # somente se a data_de_compra for posterior à data_ultima_compra (ou se data_ultima_compra for NULL)
                cursor.execute('''
                    UPDATE Ingredientes
                    SET preco_compra = ?, data_ultima_compra = ?
                    WHERE id_ingrediente = ? AND (data_ultima_compra IS NULL OR date(?) > date(data_ultima_compra))
                ''', (preco, data_de_compra, id_ingrediente, data_de_compra))

            conn.commit()
            return id_compra
        except sqlite3.IntegrityError as e:
            conn.rollback()
            raise e
        finally:
            conn.close()

    def getProximoID(self):
        """Retorna o próximo ID para as tabelas principais em dicionário.
        Usa sqlite_sequence quando disponível (AUTOINCREMENT) e faz fallback para MAX(id)+1.
        """
        conn = sqlite3.connect(self.DATA_FILE)
        cursor = conn.cursor()

        # Mapear nomes reais das tabelas e suas chaves
        tabelas = {
            'Vendas': 'id_venda',
            'Marmitas': 'id_marmita',
            'Ingredientes': 'id_ingrediente',
            'Compras': 'id_compra',
        }

        ids = {}
        try:
            # Verificar se sqlite_sequence existe
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='sqlite_sequence'")
            has_seq = cursor.fetchone() is not None

            for tabela, pk in tabelas.items():
                proximo = None
                if has_seq:
                    cursor.execute("SELECT seq FROM sqlite_sequence WHERE name = ?", (tabela,))
                    row = cursor.fetchone()
                    if row:
                        proximo = row[0] + 1

                if proximo is None:
                    cursor.execute(f"SELECT MAX({pk}) FROM {tabela}")
                    max_id = cursor.fetchone()[0]
                    proximo = 1 if max_id is None else max_id + 1

                ids[tabela.lower()] = proximo

            return ids
        finally:
            conn.close()