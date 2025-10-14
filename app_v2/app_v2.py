# Aplicativo de visualização de dados SQLite usando Tkinter
import tkinter as tk
from tkinter import ttk, simpledialog, messagebox
import sqlite3
from datetime import datetime

# Configuração do Banco de Dados SQLite
DB_NAME = 'dados_marmitas.db'

class DBApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Gerenciamento de Marmitas (SQLite)")
        self.geometry("900x600")
        self.conn = None
        self.connect_db()

        self.notebook = ttk.Notebook(self)
        self.notebook.pack(expand=True, fill='both', padx=10, pady=10)

        # Configura as abas
        self.create_tab("Ingredientes", self.get_tabela_ingredientes, self.open_add_ingrediente_window)
        self.create_tab("Marmitas", self.get_tabela_marmitas, self.open_add_marmita_window)
        self.create_tab("Compras", self.get_tabela_compras, self.open_add_compra_window)
        self.create_tab("Vendas", self.get_tabela_vendas, self.open_add_venda_window)

    def connect_db(self):
        """Tenta conectar ao banco de dados SQLite."""
        try:
            self.conn = sqlite3.connect(DB_NAME)
            self.conn.row_factory = sqlite3.Row # Permite acessar colunas por nome
            # Ativa suporte a Foreign Keys no SQLite
            self.conn.execute("PRAGMA foreign_keys = ON")
        except sqlite3.Error as e:
            messagebox.showerror("Erro de Conexão", f"Não foi possível conectar ao banco de dados: {e}")
            self.destroy()

    def create_tab(self, name, fetch_func, add_func):
        """Cria e configura uma aba no Notebook."""
        frame = ttk.Frame(self.notebook)
        self.notebook.add(frame, text=name)

        # Frame para botões
        button_frame = ttk.Frame(frame)
        button_frame.pack(pady=10)
        
        # Botão Atualizar
        ttk.Button(button_frame, text="Atualizar Dados", command=lambda: self.display_data(frame, fetch_func)).pack(side=tk.LEFT, padx=5)

        # Botão Adicionar
        ttk.Button(button_frame, text=f"Adicionar {name[:-1] if name.endswith('s') else name}", command=add_func).pack(side=tk.LEFT, padx=5)
        
        # Árvore para exibir dados
        tree_frame = ttk.Frame(frame)
        tree_frame.pack(expand=True, fill='both')
        
        tree = ttk.Treeview(tree_frame)
        tree.pack(side=tk.LEFT, expand=True, fill='both')

        # Scrollbar vertical
        vsb = ttk.Scrollbar(tree_frame, orient="vertical", command=tree.yview)
        vsb.pack(side='right', fill='y')
        tree.configure(yscrollcommand=vsb.set)
        
        frame.tree = tree # Armazena a referência
        
        # Exibe os dados iniciais
        self.display_data(frame, fetch_func)

    def display_data(self, parent_frame, fetch_func):
        """Limpa e exibe os dados na Treeview da aba."""
        tree = parent_frame.tree
        
        # Limpa dados antigos
        for item in tree.get_children():
            tree.delete(item)

        try:
            cur = self.conn.cursor()
            headers, rows = fetch_func(cur)
            
            # Configura as colunas
            tree["columns"] = headers
            tree["show"] = "headings"
            
            for col in headers:
                tree.heading(col, text=col.replace('_', ' ').title(), anchor=tk.W)
                tree.column(col, width=150, anchor=tk.W)
            
            # Insere os novos dados
            for row in rows:
                tree.insert("", tk.END, values=list(row))
            
            self.conn.commit()
            
        except sqlite3.Error as e:
            messagebox.showerror("Erro SQL", f"Erro ao buscar dados: {e}")


    # --- Funções de Fetch de Dados (Simulam as Funções de Tabela do PostgreSQL) ---

    def get_tabela_vendas(self, cur):
        """Retorna dados de vendas."""
        query = """
        SELECT
            V.id_venda,
            M.nome_marmita,
            V.quantidade_vendida,
            M.preco_venda AS preco_unidade,
            V.data_de_venda
        FROM Vendas V
        JOIN Marmitas M ON V.id_marmita = M.id_marmita
        ORDER BY V.data_de_venda DESC;
        """
        cur.execute(query)
        rows = cur.fetchall()
        headers = [description[0] for description in cur.description]
        return headers, rows

    def get_tabela_marmitas(self, cur):
        """Retorna dados detalhados da marmita (receita, preço, custo)."""
        query = """
        SELECT
            M.nome_marmita,
            M.preco_venda,
            M.custo_estimado,
            I.nome_ingrediente,
            IM.quantidade,
            U.sigla_unidade AS unidade
        FROM Marmitas M
        JOIN ingredientes_marmita IM ON M.id_marmita = IM.id_marmita
        JOIN Ingredientes I ON IM.id_ingrediente = I.id_ingrediente
        JOIN Unidades U ON I.id_unidade = U.id_unidade
        ORDER BY M.nome_marmita, I.nome_ingrediente;
        """
        cur.execute(query)
        rows = cur.fetchall()
        headers = [description[0] for description in cur.description]
        return headers, rows

    def get_tabela_compras(self, cur):
        """Retorna dados detalhados das compras (itens comprados)."""
        query = """
        SELECT
            C.id_compra,
            I.nome_ingrediente,
            CI.preco_compra,
            CI.quantidade_comprada,
            C.data_de_compra,
            C.valor_total AS valor_total_compra
        FROM Compras C
        JOIN compra_ingredientes CI ON C.id_compra = CI.id_compra
        JOIN Ingredientes I ON CI.id_ingrediente = I.id_ingrediente
        ORDER BY C.data_de_compra DESC;
        """
        cur.execute(query)
        rows = cur.fetchall()
        headers = [description[0] for description in cur.description]
        return headers, rows
    
    def get_tabela_ingredientes(self, cur):
        """Retorna a lista de todos os ingredientes com a unidade correta.
           Usa JOIN com a tabela Unidades para exibir a sigla."""
        query = """
        SELECT
            I.id_ingrediente,
            I.nome_ingrediente,
            I.preco_compra,
            U.sigla_unidade AS unidade,
            I.data_ultima_compra
        FROM Ingredientes I
        JOIN Unidades U ON I.id_unidade = U.id_unidade
        ORDER BY I.nome_ingrediente;
        """
        cur.execute(query)
        rows = cur.fetchall()
        headers = [description[0] for description in cur.description]
        return headers, rows

    # --- Funções de Adição de Dados ---
    
    # --- 1. Adicionar Ingredientes ---

    def open_add_ingrediente_window(self):
        """Abre a janela para adicionar um novo ingrediente com dropdown de unidades."""
        win = tk.Toplevel(self)
        win.title("Adicionar Ingrediente")
        win.transient(self) 
        
        # Obter unidades disponíveis para o dropdown
        cur = self.conn.cursor()
        cur.execute("SELECT id_unidade, sigla_unidade FROM Unidades")
        # Cria um mapa {sigla: id} para facilitar a conversão na submissão
        self.unidades = {sigla: id for id, sigla in cur.fetchall()}
        unidade_opcoes = list(self.unidades.keys())
        
        campos = ["Nome do Ingrediente:", "Preço de Compra:"]
        entradas = {}

        for i, campo in enumerate(campos):
            ttk.Label(win, text=campo).grid(row=i, column=0, padx=5, pady=5, sticky='w')
            entry = ttk.Entry(win)
            entry.grid(row=i, column=1, padx=5, pady=5, sticky='ew')
            entradas[campo] = entry

        # Campo de Unidade (Dropdown)
        ttk.Label(win, text="Unidade:").grid(row=len(campos), column=0, padx=5, pady=5, sticky='w')
        self.selected_unidade = tk.StringVar(win)
        self.selected_unidade.set(unidade_opcoes[0] if unidade_opcoes else "") # Valor padrão
        
        unidade_menu = ttk.OptionMenu(win, self.selected_unidade, self.selected_unidade.get(), *unidade_opcoes)
        unidade_menu.grid(row=len(campos), column=1, padx=5, pady=5, sticky='ew')

        # Botão de submissão
        ttk.Button(win, text="Registrar Ingrediente", command=lambda: self.submit_ingrediente(win, entradas)).grid(row=len(campos) + 1, columnspan=2, pady=10)
        
        win.grid_columnconfigure(1, weight=1)

    def submit_ingrediente(self, win, entradas):
        """Coleta e registra um novo ingrediente no BD usando o ID da unidade."""
        nome = entradas["Nome do Ingrediente:"].get().strip()
        preco_str = entradas["Preço de Compra:"].get().strip()
        sigla_unidade = self.selected_unidade.get()

        try:
            preco = float(preco_str)
            # Converte a sigla da unidade (ex: 'kg') para o ID (ex: 1)
            id_unidade = self.unidades[sigla_unidade] 
            
            if not nome:
                raise ValueError("O nome do ingrediente não pode ser vazio.")

            cur = self.conn.cursor()
            # Insere o id_unidade (inteiro) na tabela Ingredientes
            cur.execute("""
                INSERT INTO Ingredientes (nome_ingrediente, preco_compra, data_ultima_compra, id_unidade)
                VALUES (?, ?, ?, ?)
            """, (nome, preco, datetime.now().strftime('%Y-%m-%d'), id_unidade))
            
            self.conn.commit()
            messagebox.showinfo("Sucesso", "Ingrediente registrado com sucesso!")
            win.destroy()
            # O índice 0 corresponde à primeira aba ("Ingredientes")
            self.display_data(self.notebook.winfo_children()[0], self.get_tabela_ingredientes) 

        except ValueError as e:
            messagebox.showerror("Erro de Entrada", f"Erro de validação: {e}")
        except sqlite3.IntegrityError:
            messagebox.showerror("Erro SQL", "Ingrediente já existe ou ID de unidade inválida.")
        except Exception as e:
            messagebox.showerror("Erro", f"Ocorreu um erro: {e}")
    
    # --- 2. Adicionar Marmitas ---

    def open_add_marmita_window(self):
        """Abre a janela para adicionar uma nova marmita e seus ingredientes."""
        win = tk.Toplevel(self)
        win.title("Adicionar Nova Marmita")
        win.transient(self)

        # Buscar ingredientes para dropdown
        cur = self.conn.cursor()
        cur.execute("SELECT id_ingrediente, nome_ingrediente FROM Ingredientes")
        self.ingredientes_map = {row['nome_ingrediente']: row['id_ingrediente'] for row in cur.fetchall()}
        ingredientes_opcoes = list(self.ingredientes_map.keys())

        # Campos fixos
        ttk.Label(win, text="Nome da Marmita:").grid(row=0, column=0, padx=5, pady=5, sticky='w')
        nome_entry = ttk.Entry(win)
        nome_entry.grid(row=0, column=1, padx=5, pady=5, sticky='ew')

        ttk.Label(win, text="Preço de Venda (R$):").grid(row=1, column=0, padx=5, pady=5, sticky='w')
        preco_entry = ttk.Entry(win)
        preco_entry.grid(row=1, column=1, padx=5, pady=5, sticky='ew')

        # Frame para ingredientes dinâmicos
        self.ingredientes_entries = []
        ingredientes_frame = ttk.Frame(win)
        ingredientes_frame.grid(row=2, column=0, columnspan=2, padx=5, pady=10, sticky='ew')

        def add_ingrediente_entry():
            """Adiciona uma nova linha para um ingrediente e quantidade."""
            row_num = len(self.ingredientes_entries)
            
            # Dropdown de Ingrediente
            ingrediente_var = tk.StringVar(ingredientes_frame)
            ingrediente_var.set(ingredientes_opcoes[0] if ingredientes_opcoes else "")
            ing_menu = ttk.OptionMenu(ingredientes_frame, ingrediente_var, ingrediente_var.get(), *ingredientes_opcoes)
            ing_menu.grid(row=row_num, column=0, padx=5, pady=2, sticky='ew')

            # Campo de Quantidade
            ttk.Label(ingredientes_frame, text="Quantidade (kg/un/L):").grid(row=row_num, column=1, padx=5, pady=2, sticky='w')
            quantidade_entry = ttk.Entry(ingredientes_frame)
            quantidade_entry.grid(row=row_num, column=2, padx=5, pady=2, sticky='ew')
            
            self.ingredientes_entries.append({'id_var': ingrediente_var, 'qty_entry': quantidade_entry})

        ttk.Button(ingredientes_frame, text="+ Adicionar Ingrediente", command=add_ingrediente_entry).grid(row=100, columnspan=3, pady=5)
        
        add_ingrediente_entry() # Adiciona a primeira linha por padrão

        # Botão de submissão
        ttk.Button(win, text="Registrar Marmita", 
                   command=lambda: self.submit_marmita(win, nome_entry, preco_entry)).grid(row=3, columnspan=2, pady=10)
        
        win.grid_columnconfigure(1, weight=1)
        ingredientes_frame.grid_columnconfigure(0, weight=1)
        ingredientes_frame.grid_columnconfigure(2, weight=1)

    def calculate_marmita_cost(self, cur, ids, quantities):
        """Calcula o custo estimado da marmita no Python."""
        total_cost = 0.0
        
        # Assumindo que os arrays são pareados: ids[i] corresponde a quantities[i]
        for id_ingrediente, quantidade in zip(ids, quantities):
            cur.execute("SELECT preco_compra FROM Ingredientes WHERE id_ingrediente = ?", (id_ingrediente,))
            row = cur.fetchone()
            if row:
                preco_compra = row[0]
                total_cost += preco_compra * quantidade
            else:
                raise ValueError(f"Ingrediente ID {id_ingrediente} não encontrado.")

        return total_cost

    def submit_marmita(self, win, nome_entry, preco_entry):
        """Coleta dados, calcula custo e registra a marmita no BD."""
        nome = nome_entry.get().strip()
        preco_str = preco_entry.get().strip()
        
        ids_ingredientes = []
        quantidades = []

        try:
            preco_venda = float(preco_str)
            if not nome:
                raise ValueError("O nome da marmita não pode ser vazio.")
            if preco_venda <= 0:
                raise ValueError("O preço de venda deve ser positivo.")

            # Coleta ingredientes dinâmicos
            for entry in self.ingredientes_entries:
                nome_ingrediente = entry['id_var'].get()
                quantidade_str = entry['qty_entry'].get().strip()
                
                if nome_ingrediente and quantidade_str:
                    ids_ingredientes.append(self.ingredientes_map[nome_ingrediente])
                    quantidades.append(float(quantidade_str))
            
            if not ids_ingredientes:
                raise ValueError("A marmita deve ter pelo menos um ingrediente.")

            cur = self.conn.cursor()
            
            # 1. Calcula Custo (Lógica da Procedure)
            custo_estimado = self.calculate_marmita_cost(cur, ids_ingredientes, quantidades)

            # 2. Insere Marmita
            cur.execute("""
                INSERT INTO Marmitas (nome_marmita, preco_venda, custo_estimado)
                VALUES (?, ?, ?)
            """, (nome, preco_venda, custo_estimado))
            
            novo_id_marmita = cur.lastrowid # ID da marmita recém-inserida

            # 3. Insere Relações Ingredientes-Marmita
            for id_ingrediente, quantidade in zip(ids_ingredientes, quantidades):
                cur.execute("""
                    INSERT INTO ingredientes_marmita (id_marmita, id_ingrediente, quantidade)
                    VALUES (?, ?, ?)
                """, (novo_id_marmita, id_ingrediente, quantidade))

            self.conn.commit()
            messagebox.showinfo("Sucesso", f"Marmita '{nome}' (Custo: R$ {custo_estimado:.2f}) registrada com sucesso!")
            win.destroy()
            self.display_data(self.notebook.winfo_children()[1], self.get_tabela_marmitas) # Atualiza a aba Marmitas

        except ValueError as e:
            messagebox.showerror("Erro de Entrada", f"Erro de validação: {e}")
        except sqlite3.IntegrityError:
            messagebox.showerror("Erro SQL", "Nome da marmita já existe ou ingrediente inválido.")
        except Exception as e:
            messagebox.showerror("Erro", f"Ocorreu um erro: {e}")

    # --- 3. Adicionar Compras ---
    
    def open_add_compra_window(self):
        """Abre a janela para adicionar uma nova compra."""
        win = tk.Toplevel(self)
        win.title("Adicionar Compra de Insumos")
        win.transient(self)

        # Buscar ingredientes para dropdown
        cur = self.conn.cursor()
        cur.execute("SELECT id_ingrediente, nome_ingrediente FROM Ingredientes")
        self.ingredientes_compra_map = {row['nome_ingrediente']: row['id_ingrediente'] for row in cur.fetchall()}
        ingredientes_opcoes = list(self.ingredientes_compra_map.keys())

        # Campo Total
        ttk.Label(win, text="Valor Total da Compra (R$):").grid(row=0, column=0, padx=5, pady=5, sticky='w')
        self.valor_total_entry = ttk.Entry(win)
        self.valor_total_entry.grid(row=0, column=1, padx=5, pady=5, sticky='ew')

        # Frame para ingredientes dinâmicos
        self.itens_compra_entries = []
        compra_frame = ttk.Frame(win)
        compra_frame.grid(row=1, column=0, columnspan=2, padx=5, pady=10, sticky='ew')

        def add_item_compra_entry():
            """Adiciona uma nova linha para um item de compra (ingrediente, preço, quantidade)."""
            row_num = len(self.itens_compra_entries)
            
            # Dropdown de Ingrediente
            ingrediente_var = tk.StringVar(compra_frame)
            ingrediente_var.set(ingredientes_opcoes[0] if ingredientes_opcoes else "")
            ing_menu = ttk.OptionMenu(compra_frame, ingrediente_var, ingrediente_var.get(), *ingredientes_opcoes)
            ing_menu.grid(row=row_num, column=0, padx=5, pady=2, sticky='ew')

            # Campo de Preço Unitário
            ttk.Label(compra_frame, text="Preço/Unid:").grid(row=row_num, column=1, padx=5, pady=2, sticky='w')
            preco_unitario_entry = ttk.Entry(compra_frame)
            preco_unitario_entry.grid(row=row_num, column=2, padx=5, pady=2, sticky='ew')
            
            # Campo de Quantidade Comprada
            ttk.Label(compra_frame, text="Quantidade:").grid(row=row_num, column=3, padx=5, pady=2, sticky='w')
            quantidade_comprada_entry = ttk.Entry(compra_frame)
            quantidade_comprada_entry.grid(row=row_num, column=4, padx=5, pady=2, sticky='ew')
            
            self.itens_compra_entries.append({
                'id_var': ingrediente_var, 
                'preco_entry': preco_unitario_entry, 
                'qty_entry': quantidade_comprada_entry
            })

        ttk.Button(compra_frame, text="+ Adicionar Item", command=add_item_compra_entry).grid(row=100, columnspan=5, pady=5)
        
        add_item_compra_entry() # Adiciona a primeira linha por padrão

        # Botão de submissão
        ttk.Button(win, text="Registrar Compra", 
                   command=lambda: self.submit_compra(win)).grid(row=2, columnspan=2, pady=10)
        
        win.grid_columnconfigure(1, weight=1)
        compra_frame.grid_columnconfigure(0, weight=1)
        compra_frame.grid_columnconfigure(2, weight=1)
        compra_frame.grid_columnconfigure(4, weight=1)

    def submit_compra(self, win):
        """Coleta dados e registra a compra no BD."""
        valor_total_str = self.valor_total_entry.get().strip()
        ids = []
        precos = []
        quantidades = []

        try:
            valor_total = float(valor_total_str)
            if valor_total <= 0:
                raise ValueError("O valor total deve ser positivo.")

            # Coleta itens dinâmicos
            for entry in self.itens_compra_entries:
                nome_ingrediente = entry['id_var'].get()
                preco_unitario_str = entry['preco_entry'].get().strip()
                quantidade_str = entry['qty_entry'].get().strip()
                
                if nome_ingrediente and preco_unitario_str and quantidade_str:
                    ids.append(self.ingredientes_compra_map[nome_ingrediente])
                    precos.append(float(preco_unitario_str))
                    quantidades.append(float(quantidade_str))

            if not ids:
                raise ValueError("A compra deve ter pelo menos um item.")
            
            cur = self.conn.cursor()

            # 1. Insere na tabela Compras
            cur.execute("""
                INSERT INTO Compras (data_de_compra, valor_total)
                VALUES (?, ?)
            """, (datetime.now().strftime('%Y-%m-%d'), valor_total))
            
            novo_id_compra = cur.lastrowid # ID da compra recém-inserida

            # 2. Insere na tabela compra_ingredientes e atualiza o Ingrediente
            for id_ingrediente, preco, quantidade in zip(ids, precos, quantidades):
                cur.execute("""
                    INSERT INTO compra_ingredientes (id_compra, id_ingrediente, preco_compra, quantidade_comprada)
                    VALUES (?, ?, ?, ?)
                """, (novo_id_compra, id_ingrediente, preco, quantidade))
                
                # 3. Atualiza o preco_compra e data_ultima_compra na tabela Ingredientes
                cur.execute("""
                    UPDATE Ingredientes
                    SET preco_compra = ?, data_ultima_compra = ?
                    WHERE id_ingrediente = ?
                """, (preco, datetime.now().strftime('%Y-%m-%d'), id_ingrediente))

            self.conn.commit()
            messagebox.showinfo("Sucesso", "Compra registrada e preço de ingrediente atualizado!")
            win.destroy()
            self.display_data(self.notebook.winfo_children()[2], self.get_tabela_compras) # Atualiza a aba Compras

        except ValueError as e:
            messagebox.showerror("Erro de Entrada", f"Erro de validação: {e}")
        except sqlite3.Error as e:
            messagebox.showerror("Erro SQL", f"Erro ao registrar compra: {e}")
        except Exception as e:
            messagebox.showerror("Erro", f"Ocorreu um erro: {e}")

    # --- 4. Adicionar Vendas ---

    def open_add_venda_window(self):
        """Abre a janela para adicionar uma nova venda."""
        win = tk.Toplevel(self)
        win.title("Adicionar Venda")
        win.transient(self)

        # Buscar marmitas para dropdown
        cur = self.conn.cursor()
        cur.execute("SELECT id_marmita, nome_marmita FROM Marmitas")
        self.marmitas_map = {row['nome_marmita']: row['id_marmita'] for row in cur.fetchall()}
        marmitas_opcoes = list(self.marmitas_map.keys())

        campos = ["Marmita:", "Quantidade Vendida:"]
        
        # Campo Marmita (Dropdown)
        ttk.Label(win, text="Marmita:").grid(row=0, column=0, padx=5, pady=5, sticky='w')
        self.selected_marmita = tk.StringVar(win)
        self.selected_marmita.set(marmitas_opcoes[0] if marmitas_opcoes else "")
        marmita_menu = ttk.OptionMenu(win, self.selected_marmita, self.selected_marmita.get(), *marmitas_opcoes)
        marmita_menu.grid(row=0, column=1, padx=5, pady=5, sticky='ew')
        
        # Campo Quantidade
        ttk.Label(win, text="Quantidade Vendida:").grid(row=1, column=0, padx=5, pady=5, sticky='w')
        quantidade_entry = ttk.Entry(win)
        quantidade_entry.grid(row=1, column=1, padx=5, pady=5, sticky='ew')

        # Botão de submissão
        ttk.Button(win, text="Registrar Venda", 
                   command=lambda: self.submit_venda(win, quantidade_entry)).grid(row=2, columnspan=2, pady=10)
        
        win.grid_columnconfigure(1, weight=1)

    def submit_venda(self, win, quantidade_entry):
        """Coleta dados e registra a venda no BD."""
        quantidade_str = quantidade_entry.get().strip()
        nome_marmita = self.selected_marmita.get()

        try:
            quantidade = int(quantidade_str)
            id_marmita = self.marmitas_map[nome_marmita]
            
            if quantidade <= 0:
                raise ValueError("A quantidade deve ser um número inteiro positivo.")

            cur = self.conn.cursor()
            
            # Insere a venda
            cur.execute("""
                INSERT INTO Vendas (id_marmita, data_de_venda, quantidade_vendida)
                VALUES (?, ?, ?)
            """, (id_marmita, datetime.now().strftime('%Y-%m-%d %H:%M:%S'), quantidade))
            
            self.conn.commit()
            messagebox.showinfo("Sucesso", "Venda registrada com sucesso!")
            win.destroy()
            self.display_data(self.notebook.winfo_children()[3], self.get_tabela_vendas) # Atualiza a aba Vendas

        except ValueError as e:
            messagebox.showerror("Erro de Entrada", f"Erro de validação: {e}")
        except sqlite3.Error as e:
            messagebox.showerror("Erro SQL", f"Erro ao registrar venda: {e}")
        except Exception as e:
            messagebox.showerror("Erro", f"Ocorreu um erro: {e}")

if __name__ == '__main__':
    app = DBApp()
    app.mainloop()
