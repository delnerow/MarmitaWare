class Ingrediente:
    def __init__(self, ID: int, nome: str, preco_compra: float, data_ultima_compra):
        self.ID = ID
        self.nome = nome
        self.preco_compra = preco_compra
        self.data_ultima_compra = data_ultima_compra

    def Editar(self, nome: str = None, preco_compra: float = None, data_ultima_compra = None):
        if nome is not None:
            self.nome = nome
        if preco_compra is not None:
            self.preco_compra = preco_compra
        if data_ultima_compra is not None:
            self.data_ultima_compra = data_ultima_compra