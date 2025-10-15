from datetime import date

class Venda:
    def __init__(self, ID: int, marmita, quantidade: int, data: date):
        self.ID = ID
        self.marmita = marmita
        self.quantidade = quantidade
        self.data = data

    def editar(self, marmita = None, quantidade: int = None, data: date = None):
        if marmita is not None:
            self.marmita = marmita
        if quantidade is not None:
            self.quantidade = quantidade
        if data is not None:
            self.data = data