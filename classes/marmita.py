from ingrediente import Ingrediente

class Marmita:
    def __init__(self, ID: int, ingredientes: list, preco_venda: float, quantidade_ingredientes: dict, custo_estimado: float):
        self.ID = ID
        self.ingredientes = ingredientes
        self.preco_venda = preco_venda
        self.quantidade_ingredientes = quantidade_ingredientes  # {ingrediente_ID: quantidade}
        self.custo_estimated = custo_estimado

    def Editar(self, ingredientes: list = None, preco_venda: float = None, quantidade_ingredientes: dict = None, custo_estimado: float = None):
        if ingredientes is not None:
            self.ingredientes = ingredientes
        if preco_venda is not None:
            self.preco_venda = preco_venda
        if quantidade_ingredientes is not None:
            self.quantidade_ingredientes = quantidade_ingredientes
        if custo_estimado is not None:
            self.custo_estimated = custo_estimado