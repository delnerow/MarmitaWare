from datetime import date

class Compra:
    def __init__(
        self,
        ID: int,
        data: date,
        valor_total: float,
        ingredientes: list,
        preco_ingredientes: dict
    ):
        self.ID = ID
        self.data = data
        self.valor_total = valor_total
        self.ingredientes = ingredientes
        self.preco_ingredientes = preco_ingredientes  # {ingrediente_ID: quantidade}

    def editar(
        self,
        data: date = None,
        valor_total: float = None,
        ingredientes: list = None,
        preco_ingredientes: dict = None
    ):
        if data is not None:
            self.data = data
        if valor_total is not None:
            self.valor_total = valor_total
        if ingredientes is not None:
            self.ingredientes = ingredientes
        if preco_ingredientes is not None:
            self.preco_ingredientes = preco_ingredientes
