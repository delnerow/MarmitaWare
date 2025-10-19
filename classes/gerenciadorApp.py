from compra import Compra
from venda import Venda
from marmita import Marmita
from ingrediente import Ingrediente, FactoryIngrediente
from gerenciadorBD import GerenciadorBD


class GerenciadorApp():
        
    def __init__(self):
        self.gerenciadorBD = GerenciadorBD()
        ids = self.gerenciadorBD.getProximoID()

        self.FactoryIngrediente = FactoryIngrediente(ids['ingredientes'])
        # self.FactoryVenda = FactoryVenda(ids['vendas'])
        # self.FactoryMarmita = FactoryMarmita(ids['marmitas'])
        # self.FactoryCompra = FactoryCompra(ids['compras'])

        self.vendas = {}
        self.marmitas = {}
        self.ingredientes = {}
        self.compras = {}

        # Carregar dados do banco de dados na memória
        self.LoadIngredientes()    
        self.loadVendas()
        self.loadMarmitas()
        self.loadCompras()

    def LoadIngredientes(self):
        # Carrega ingredientes do banco de dados para a memória
        ingredientesData = self.gerenciadorBD.getIngredientes()
        for ingredienteDict in ingredientesData:
            ingrediente = self.FactoryIngrediente.FromDB(ingredienteDict)
            self.ingredientes[ingrediente.ID] = ingrediente

    def loadVendas(self):
        # Carrega vendas do banco de dados para a memória
        pass

    def loadMarmitas(self):
        # Carrega marmitas do banco de dados para a memória
        pass

    def loadCompras(self):
        # Carrega compras do banco de dados para a memória
        pass


    def CreateVendas(self):
        # Lógica para criar vendas usando FactoryVenda
        pass

    def CreateMarmita(self):
        # Lógica para criar marmitas usando FactoryMarmita
        pass

    def CreateIngrediente(self):
        # Lógica para criar ingredientes usando FactoryIngrediente
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