from .compra import Compra, FactoryCompra
from .venda import Venda, FactoryVenda
from .marmita import Marmita, FactoryMarmita
from .ingrediente import Ingrediente, FactoryIngrediente
from .gerenciadorBD import GerenciadorBD
from datetime import date, datetime
import pandas as pd


class GerenciadorApp():
        
    def __init__(self):
        self.gerenciadorBD = GerenciadorBD()
        ids = self.gerenciadorBD.getProximoID()

        self.FactoryIngrediente = FactoryIngrediente(ids['ingredientes'])
        self.FactoryCompra = FactoryCompra(ids['compras'])
        self.FactoryMarmita = FactoryMarmita(ids['marmitas'])
        self.FactoryVenda = FactoryVenda(ids['vendas'])

        self.ingredientes = {}
        self.vendas = {}
        self.marmitas = {}
        self.compras = {}

        # Carregar dados do banco de dados na memória
        self.LoadIngredientes()    
        self.loadCompras()
        self.loadMarmitas()
        self.loadVendas()

    def LoadIngredientes(self):
        """Carrega ingredientes do banco de dados para a memória"""
        ingredientesData = self.gerenciadorBD.getIngredientes()
        for ingredienteDict in ingredientesData:
            ingrediente = self.FactoryIngrediente.FromDB(ingredienteDict)
            self.ingredientes[ingrediente.ID] = ingrediente

    def loadCompras(self):
        """Carrega compras do banco de dados para a memória"""
        comprasData = self.gerenciadorBD.getCompras()
        for compraDict in comprasData:
            compra = self.FactoryCompra.FromDB(compraDict)
            self.compras[compra.ID] = compra

    def loadMarmitas(self):
        """Carrega marmitas do banco de dados para a memória"""
        marmitasData = self.gerenciadorBD.getMarmitas()
        for marmitaDict in marmitasData:
            marmita = self.FactoryMarmita.FromDB(marmitaDict)
            self.marmitas[marmita.ID] = marmita

    def loadVendas(self):
        """Carrega vendas do banco de dados para a memória"""
        vendasData = self.gerenciadorBD.getVendas()
        for vendaDict in vendasData:
            venda = self.FactoryVenda.FromDB(vendaDict)
            self.vendas[venda.ID] = venda

     # ============= MÉTODOS CREATE =============

    def CreateIngrediente(self, nome: str, preco_compra: float, id_unidade: int):
        """Cria um novo ingrediente"""
        ingrediente = self.FactoryIngrediente.CreateIngrediente(nome, preco_compra, id_unidade)
        self.gerenciadorBD.saveIngredientes(ingrediente)
        self.ingredientes[ingrediente.ID] = ingrediente
        return ingrediente

    def CreateVenda(self, ID_marmita: int, data_venda, quantidade: int):
        """Cria uma nova venda"""
        if ID_marmita not in self.marmitas:
            raise ValueError("Marmita não encontrada")

        if quantidade <= 0:
            raise ValueError("Quantidade deve ser maior que zero")

        venda = self.FactoryVenda.CreateVenda(ID_marmita, quantidade, data_venda)
        self.gerenciadorBD.saveVendas(venda)
        self.vendas[venda.ID] = venda
        return venda

    def CreateMarmita(self, nome: str, ingredientes_quantidades: dict, preco_venda: float):
        """Cria uma nova marmita"""
        if not nome or not isinstance(nome, str):
            raise ValueError("Nome inválido para a marmita")
        if not isinstance(ingredientes_quantidades, dict) or len(ingredientes_quantidades) == 0:
            raise ValueError("ingredientes_quantidades deve ser um dicionário não vazio {id: quantidade}")
        if preco_venda is None or not isinstance(preco_venda, (int, float)) or preco_venda < 0:
            raise ValueError("preco_venda inválido")

        # Valida existência dos ingredientes e calcula custo estimado
        custo_estimado = 0.0
        for ing_id, qty in ingredientes_quantidades.items():
            if ing_id not in self.ingredientes:
                raise ValueError(f"Ingrediente com ID {ing_id} não encontrado")
            if not isinstance(qty, (int, float)) or qty <= 0:
                raise ValueError(f"Quantidade inválida para ingrediente {ing_id}")
            ingrediente = self.ingredientes[ing_id]
            preco_compra = getattr(ingrediente, "preco_compra", getattr(ingrediente, "preco", 0.0))
            custo_estimado += preco_compra * qty

        marmita = self.FactoryMarmita.CreateMarmita(preco_venda, ingredientes_quantidades, custo_estimado, nome)
        self.gerenciadorBD.saveMarmitas(marmita)
        self.marmitas[marmita.ID] = marmita
        return marmita


    def CreateCompra(self, valor_total: float, data, ingredientes_precos: dict):
        """Cria uma nova compra"""
        if not isinstance(valor_total, (int, float)) or valor_total < 0:
            raise ValueError("valor_total inválido")
        if data is None:
            raise ValueError("data inválida")
        if not isinstance(ingredientes_precos, dict) or len(ingredientes_precos) == 0:
            raise ValueError("ingredientes_precos deve ser um dicionário não vazio {id: preco}")

        # Valida existência dos ingredientes e os preços
        for ing_id, preco in ingredientes_precos.items():
            if ing_id not in self.ingredientes:
                raise ValueError(f"Ingrediente com ID {ing_id} não encontrado")
            if not isinstance(preco, (int, float)) or preco < 0:
                raise ValueError(f"Preço inválido para ingrediente {ing_id}")

        compra = self.FactoryCompra.CreateCompra(data, valor_total, ingredientes_precos)

        # Atualiza os preços dos ingredientes envolvidos na compra
        for ing_id, preco in ingredientes_precos.items():
            ingrediente = self.ingredientes[ing_id]
            ingrediente.preco_compra = preco
            ingrediente.data_ultima_compra = data

        self.gerenciadorBD.saveCompra(compra)
        self.compras[compra.ID] = compra
        return compra
    
    # ============= MÉTODOS EDIT =============
    
    def EditIngrediente(self, id_ingrediente: int, nome: str = None, preco_compra: float = None, 
                       data_ultima_compra = None, id_unidade: int = None):
        """Edita um ingrediente existente"""
        if id_ingrediente not in self.ingredientes:
            raise ValueError(f"Ingrediente com ID {id_ingrediente} não encontrado")
        
        ingrediente = self.ingredientes[id_ingrediente]
        
        # Validações
        if nome is not None and (not isinstance(nome, str) or nome.strip() == ""):
            raise ValueError("Nome inválido")
        if preco_compra is not None and (not isinstance(preco_compra, (int, float)) or preco_compra < 0):
            raise ValueError("Preço de compra inválido")
        
        # Aplica as edições
        ingrediente.Editar(nome=nome, preco_compra=preco_compra, 
                          data_ultima_compra=data_ultima_compra, id_unidade=id_unidade)
        
        # Atualiza no banco
        self.gerenciadorBD.updateIngrediente(ingrediente)
        return ingrediente
    
    def EditMarmita(self, id_marmita: int, nome: str = None, preco_venda: float = None, 
                   ingredientes_quantidades: dict = None):
        """Edita uma marmita existente"""
        if id_marmita not in self.marmitas:
            raise ValueError(f"Marmita com ID {id_marmita} não encontrada")
        
        marmita = self.marmitas[id_marmita]
        
        # Validações
        if nome is not None and (not isinstance(nome, str) or nome.strip() == ""):
            raise ValueError("Nome inválido")
        if preco_venda is not None and (not isinstance(preco_venda, (int, float)) or preco_venda < 0):
            raise ValueError("Preço de venda inválido")
        
        # Se ingredientes foram alterados, recalcula o custo
        custo_estimado = None
        if ingredientes_quantidades is not None:
            custo_estimado = 0.0
            for ing_id, qty in ingredientes_quantidades.items():
                if ing_id not in self.ingredientes:
                    raise ValueError(f"Ingrediente com ID {ing_id} não encontrado")
                if not isinstance(qty, (int, float)) or qty <= 0:
                    raise ValueError(f"Quantidade inválida para ingrediente {ing_id}")
                ingrediente = self.ingredientes[ing_id]
                preco_compra = getattr(ingrediente, "preco_compra", 0.0)
                custo_estimado += preco_compra * qty
        
        # Aplica as edições
        marmita.Editar(
            preco_venda=preco_venda,
            quantidade_ingredientes=ingredientes_quantidades,
            custo_estimado=custo_estimado
        )
        
        if nome is not None:
            marmita.nome = nome
        
        # Atualiza no banco
        self.gerenciadorBD.updateMarmita(marmita)
        return marmita
    
    def EditVenda(self, id_venda: int, id_marmita: int = None, quantidade: int = None, 
                 data_venda = None):
        """Edita uma venda existente"""
        if id_venda not in self.vendas:
            raise ValueError(f"Venda com ID {id_venda} não encontrada")
        
        venda = self.vendas[id_venda]
        
        # Validações
        if id_marmita is not None and id_marmita not in self.marmitas:
            raise ValueError(f"Marmita com ID {id_marmita} não encontrada")
        if quantidade is not None and (not isinstance(quantidade, int) or quantidade <= 0):
            raise ValueError("Quantidade inválida")
        
        # Aplica as edições
        venda.editar(marmita=id_marmita, quantidade=quantidade, data=data_venda)
        
        # Atualiza no banco
        self.gerenciadorBD.updateVenda(venda)
        return venda
    
    def EditCompra(self, id_compra: int, valor_total: float = None, data = None, 
                  ingredientes_precos: dict = None):
        """Edita uma compra existente"""
        if id_compra not in self.compras:
            raise ValueError(f"Compra com ID {id_compra} não encontrada")
        
        compra = self.compras[id_compra]
        
        # Validações
        if valor_total is not None and (not isinstance(valor_total, (int, float)) or valor_total < 0):
            raise ValueError("Valor total inválido")
        
        if ingredientes_precos is not None:
            for ing_id, preco in ingredientes_precos.items():
                if ing_id not in self.ingredientes:
                    raise ValueError(f"Ingrediente com ID {ing_id} não encontrado")
                if not isinstance(preco, (int, float)) or preco < 0:
                    raise ValueError(f"Preço inválido para ingrediente {ing_id}")
        
        # Aplica as edições
        compra.editar(
            valor_total=valor_total,
            data=data,
            preco_ingredientes=ingredientes_precos
        )
        
        # Atualiza preços dos ingredientes se necessário
        if ingredientes_precos is not None:
            for ing_id, preco in ingredientes_precos.items():
                ingrediente = self.ingredientes[ing_id]
                ingrediente.preco_compra = preco
                if data is not None:
                    ingrediente.data_ultima_compra = data
        
        # Atualiza no banco
        self.gerenciadorBD.updateCompra(compra)
        return compra

    # ============= MÉTODOS DELETE =============

    def DeleteIngrediente(self, id_ingrediente: int):
        """Remove um ingrediente (com validações de integridade)"""
        if id_ingrediente not in self.ingredientes:
            raise ValueError(f"Ingrediente com ID {id_ingrediente} não encontrado")
        
        # Verifica se está sendo usado em alguma marmita
        for marmita in self.marmitas.values():
            if id_ingrediente in marmita.ingredientes:
                raise ValueError(f"Não é possível remover: ingrediente usado na marmita '{marmita.nome}'")
        
        self.gerenciadorBD.deleteIngrediente(id_ingrediente)
        del self.ingredientes[id_ingrediente]

    def DeleteMarmita(self, id_marmita: int):
        """Remove uma marmita (com validações de integridade)"""
        if id_marmita not in self.marmitas:
            raise ValueError(f"Marmita com ID {id_marmita} não encontrada")
        
        # Verifica se há vendas registradas
        for venda in self.vendas.values():
            if venda.id_marmita == id_marmita:
                raise ValueError(f"Não é possível remover: existem vendas registradas desta marmita")
        
        self.gerenciadorBD.deleteMarmita(id_marmita)
        del self.marmitas[id_marmita]

    def DeleteVenda(self, id_venda: int):
        """Remove uma venda"""
        if id_venda not in self.vendas:
            raise ValueError(f"Venda com ID {id_venda} não encontrada")
        
        self.gerenciadorBD.deleteVenda(id_venda)
        del self.vendas[id_venda]

    def DeleteCompra(self, id_compra: int):
        """Remove uma compra"""
        if id_compra not in self.compras:
            raise ValueError(f"Compra com ID {id_compra} não encontrada")
        
        self.gerenciadorBD.deleteCompra(id_compra)
        del self.compras[id_compra]

# ============= MÉTODOS GET TABLES =============

    def GetComprasTable(self):
        """Retorna tabela de compras"""
        tab = self.gerenciadorBD.GetComprasTable()
        df = pd.DataFrame(tab)
        return df

    def GetMarmitasTable(self):
        """Retorna tabela de marmitas"""
        tab = self.gerenciadorBD.GetMarmitasTable()
        df = pd.DataFrame(tab)
        return df

    def GetVendasTable(self):
        """Retorna tabela de vendas"""
        tab = self.gerenciadorBD.getVendasTable()
        df = pd.DataFrame(tab)
        return df

# ============= MÉTODO DE RELATÓRIO =============

    def GetRelatorio(self, data_inicio: date = None, data_fim: date = None):
        """Gera relatório consolidado de vendas, compras e lucros"""
        
        # Se não informar datas, usa todos os registros
        vendas_filtradas = list(self.vendas.values())
        compras_filtradas = list(self.compras.values())
        
        # Filtra por data se fornecido
        if data_inicio or data_fim:
            if data_inicio:
                vendas_filtradas = [v for v in vendas_filtradas if v.data_de_venda >= data_inicio]
                compras_filtradas = [c for c in compras_filtradas if c.data >= data_inicio]
            if data_fim:
                vendas_filtradas = [v for v in vendas_filtradas if v.data_de_venda <= data_fim]
                compras_filtradas = [c for c in compras_filtradas if c.data <= data_fim]
        
        # Calcula totais de vendas
        receita_total = 0.0
        custo_produtos_vendidos = 0.0
        quantidade_vendas = 0
        
        for venda in vendas_filtradas:
            if venda.id_marmita in self.marmitas:
                marmita = self.marmitas[venda.id_marmita]
                receita_total += marmita.preco_venda * venda.quantidade_vendida
                custo_produtos_vendidos += (marmita.custo_estimado or 0.0) * venda.quantidade_vendida
                quantidade_vendas += venda.quantidade_vendida
        
        # Calcula total de compras
        total_compras = sum(compra.valor_total for compra in compras_filtradas)
        
        # Calcula lucro bruto e líquido
        lucro_bruto = receita_total - custo_produtos_vendidos
        lucro_liquido = receita_total - total_compras
        
        # Calcula margem de lucro
        margem_lucro_bruto = (lucro_bruto / receita_total * 100) if receita_total > 0 else 0
        margem_lucro_liquido = (lucro_liquido / receita_total * 100) if receita_total > 0 else 0
        
        # Marmita mais vendida
        vendas_por_marmita = {}
        for venda in vendas_filtradas:
            if venda.id_marmita not in vendas_por_marmita:
                vendas_por_marmita[venda.id_marmita] = 0
            vendas_por_marmita[venda.id_marmita] += venda.quantidade_vendida
        
        marmita_mais_vendida = None
        maior_quantidade = 0
        if vendas_por_marmita:
            id_mais_vendida = max(vendas_por_marmita, key=vendas_por_marmita.get)
            maior_quantidade = vendas_por_marmita[id_mais_vendida]
            if id_mais_vendida in self.marmitas:
                marmita_mais_vendida = self.marmitas[id_mais_vendida].nome
        
        relatorio = {
            'periodo': {
                'data_inicio': data_inicio.strftime('%Y-%m-%d') if data_inicio else 'Início',
                'data_fim': data_fim.strftime('%Y-%m-%d') if data_fim else 'Fim'
            },
            'vendas': {
                'receita_total': round(receita_total, 2),
                'quantidade_total': quantidade_vendas,
                'custo_produtos_vendidos': round(custo_produtos_vendidos, 2),
                'marmita_mais_vendida': marmita_mais_vendida,
                'quantidade_mais_vendida': maior_quantidade
            },
            'compras': {
                'total_compras': round(total_compras, 2),
                'numero_compras': len(compras_filtradas)
            },
            'lucro': {
                'lucro_bruto': round(lucro_bruto, 2),
                'lucro_liquido': round(lucro_liquido, 2),
                'margem_lucro_bruto': round(margem_lucro_bruto, 2),
                'margem_lucro_liquido': round(margem_lucro_liquido, 2)
            }
        }
        
        return relatorio