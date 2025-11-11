from .compra import Compra, FactoryCompra
from .venda import Venda, FactoryVenda
from .marmita import Marmita, FactoryMarmita
from .ingrediente import Ingrediente, FactoryIngrediente
from .gerenciadorBD import GerenciadorBD


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

    def CreateIngrediente(self, nome: str, preco_compra: float, id_unidade: int, data_ultima_compra = None):
        # Lógica para criar ingredientes usando FactoryIngrediente
        ingrediente = self.FactoryIngrediente.CreateIngrediente(nome, preco_compra, data_ultima_compra, id_unidade)
        # insere no banco de dados, caso respeite as regras de negócio
        self.gerenciadorBD.saveIngredientes(ingrediente)
        pass

    def CreateVendas(self):
        # Lógica para criar vendas usando FactoryVenda
        pass

    def CreateMarmita(self):
        # Lógica para criar marmitas usando FactoryMarmita
        pass


    def CreateCompra(self):
        # Lógica para criar compras usando FactoryCompra
        pass

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
        pass

    def GetMarmitasTable(self):
        # Lógica para retornar tabela de marmitas
        pass

    def GetVendasTable(self):
        # Lógica para retornar tabela de vendas
        pass

    def GetRelatorio(self):
        # Lógica para gerar relatório
        pass