from .compra import Compra, FactoryCompra
from .venda import Venda, FactoryVenda
from .marmita import Marmita, FactoryMarmita
from .ingrediente import Ingrediente, FactoryIngrediente
from .gerenciadorBD import GerenciadorBD

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
        # Carrega ingredientes do banco de dados para a memória
        ingredientesData = self.gerenciadorBD.getIngredientes()
        for ingredienteDict in ingredientesData:
            ingrediente = self.FactoryIngrediente.FromDB(ingredienteDict)
            self.ingredientes[ingrediente.ID] = ingrediente

    def loadCompras(self):
        # Carrega compras do banco de dados para a memória
        comprasData = self.gerenciadorBD.getCompras()
        for compraDict in comprasData:
            compra = self.FactoryCompra.FromDB(compraDict)
            self.compras[compra.ID] = compra

    def loadMarmitas(self):
        # Carrega marmitas do banco de dados para a memória
        marmitasData = self.gerenciadorBD.getMarmitas()
        for marmitaDict in marmitasData:
            marmita = self.FactoryMarmita.FromDB(marmitaDict)
            self.marmitas[marmita.ID] = marmita

    def loadVendas(self):
        # Carrega vendas do banco de dados para a memória
        vendasData = self.gerenciadorBD.getVendas()
        for vendaDict in vendasData:
            venda = self.FactoryVenda.FromDB(vendaDict)
            self.vendas[venda.ID] = venda

    def CreateIngrediente(self, nome: str, preco_compra: float, id_unidade: int):
        # Lógica para criar ingredientes usando FactoryIngrediente
        ingrediente = self.FactoryIngrediente.CreateIngrediente(nome, preco_compra, id_unidade)
        # insere no banco de dados, caso respeite as regras de negócio
        self.gerenciadorBD.saveIngredientes(ingrediente)
        pass

    def CreateVenda(self, ID_marmita: int, data_venda, quantidade: int):
        # Lógica para criar vendas usando FactoryVenda
        if ID_marmita not in self.marmitas:
            raise ValueError("Marmita não encontrada")

        if quantidade <= 0:
            raise ValueError("Quantidade deve ser maior que zero")

        # Cria a venda via fábrica (assume que CreateVenda aceita id da marmita e quantidade)
        venda = self.FactoryVenda.CreateVenda(ID_marmita, quantidade, data_venda)

        # Persiste no banco e atualiza cache em memória
        self.gerenciadorBD.saveVendas(venda)
        self.vendas[venda.ID] = venda

        return venda

    def CreateMarmita(self, nome: str, ingredientes_quantidades: dict, preco_venda: float):
        # Cria uma marmita a partir de um dicionário {ingrediente_id: quantidade}
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
            # assume-se que o ingrediente tem atributo preco_compra (fallback 0.0 se não existir)
            preco_compra = getattr(ingrediente, "preco_compra", getattr(ingrediente, "preco", 0.0))
            custo_estimado += preco_compra * qty

        # Cria a marmita via fábrica
        marmita = self.FactoryMarmita.CreateMarmita(preco_venda, ingredientes_quantidades, custo_estimado, nome)

        # Atribui custo estimado se o objeto suportar esse campo
        try:
            marmita.custo_estimado = custo_estimado
        except Exception:
            pass

        # Persiste no banco e atualiza cache em memória
        self.gerenciadorBD.saveMarmitas(marmita)
        self.marmitas[marmita.ID] = marmita

        return marmita


    def CreateCompra(self, valor_total: float, data, ingredientes_precos: dict):
        # Cria uma compra recebendo valor_total, data e dicionário {ingrediente_id: preco}
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

        # Cria a compra via fábrica (assume-se CreateCompra(valor_total, data, ingredientes_precos))
        compra = self.FactoryCompra.CreateCompra(data, valor_total, ingredientes_precos)

        # atualiza os preços dos ingredientes envolvidos na compra
        for ing_id, preco in ingredientes_precos.items():
            ingrediente = self.ingredientes[ing_id]
            ingrediente.preco_compra = preco  

        # Persiste no banco e atualiza cache em memória
        self.gerenciadorBD.saveCompra(compra)
        self.compras[compra.ID] = compra

        return compra

    def EditVendas(self):
        # Lógica para editar vendas
        pass

    def EditMarmita(self):
        # Lógica para editar marmitas
        pass

    def EditIngrediente(self):
        # Lógica para editar ingredientes
        pass

    def EditCompra(self):
        # Lógica para editar compras
        pass

    def GetComprasTable(self):
        # Lógica para retornar tabela de compras
        tab = self.gerenciadorBD.GetComprasTable()
        df = pd.DataFrame(tab)
        return df

    def GetMarmitasTable(self):
        # Lógica para retornar tabela de marmitas
        tab = self.gerenciadorBD.GetMarmitasTable()
        df = pd.DataFrame(tab)
        return df

    def GetVendasTable(self):
        # Lógica para retornar tabela de vendas
        tab = self.gerenciadorBD.getVendasTable()
        df = pd.DataFrame(tab)
        return df

    def GetRelatorio(self):
        # Lógica para gerar relatório
        pass