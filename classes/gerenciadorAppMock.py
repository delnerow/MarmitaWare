# Dentro de app_v2/classes/gerenciadorAppMock.py

# Esta classe FINGE ser o GerenciadorApp e retorna dados falsos.
# A equipe de Backend deve preenchê-la com dados realistas.

class GerenciadorAppMock:
    def __init__(self):
        print("INICIALIZANDO GERENCIADOR MOCK (DADOS FALSOS)")
        # Simula os dados que viriam das tabelas
        self._marmitas = [
            {'id': 1, 'nome': 'Frango com Brócolis', 'preco_venda': 15.00, 'custo_estimado': 10.50},
            {'id': 2, 'nome': 'Carne de Panela', 'preco_venda': 18.00, 'custo_estimado': 12.00}
        ]
        self._vendas = [
            {'id': 101, 'marmita_id': 1, 'data': '2025-10-27', 'quantidade': 2},
            {'id': 102, 'marmita_id': 2, 'data': '2025-10-27', 'quantidade': 1}
        ]
        self._compras = [
            {'id': 201, 'data': '2025-10-26', 'valor_total': 150.00, 'itens': 'Frango, Brócolis'}
        ]

    # --- Métodos para a Aba Marmitas ---
    def GetMarmitasTable(self):
        # Retorna uma lista de dicionários (ou DataFrames)
        return self._marmitas

    def CreateMarmita(self, nome, preco, ingredientes):
        print(f"MOCK: Criando marmita {nome}...")
        # Simula a criação
        novo_id = max(m['id'] for m in self._marmitas) + 1
        nova_marmita = {'id': novo_id, 'nome': nome, 'preco_venda': preco, 'custo_estimado': preco * 0.7}
        self._marmitas.append(nova_marmita)
        return True

    # --- Métodos para a Aba Vendas ---
    def GetVendasTable(self):
        return self._vendas

    def CreateVenda(self, marmita_id, quantidade):
        print(f"MOCK: Vendendo {quantidade}x da marmita ID {marmita_id}...")
        return True

    # --- Métodos para a Aba Compras ---
    def GetComprasTable(self):
        return self._compras

    def CreateCompra(self, valor_total, itens_comprados):
        print(f"MOCK: Registrando compra de R$ {valor_total}...")
        return True

    # --- Métodos para a Aba Relatório ---
    def GetRelatorio(self):
        # Retorna dados prontos para o dashboard
        return {
            'total_vendas_bruto': 500.00,
            'total_custos': 350.00,
            'lucro_liquido': 150.00,
            'marmita_mais_vendida': 'Frango com Brócolis'
        }