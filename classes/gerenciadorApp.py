from compra import Compra
from venda import Venda
from marmita import Marmita
from ingrediente import Ingrediente
from gerenciadorBD import GerenciadorBD


class GerenciadorApp:
    def __init__(self):
        self.FactoryVenda = FactoryVenda()
        self.FactoryMarmita = FactoryMarmita()
        self.FactoryIngrediente = FactoryIngrediente()
        self.FactoryCompra = FactoryCompra()
        self.GerenciadorBD = GerenciadorBD()

        self.vendas = {}
        self.marmitas = {}
        self.ingredientes = {}
        self.compras = {}

        #inicializar o banco de dados e carregar os dados existentes
        


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