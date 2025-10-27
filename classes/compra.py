from datetime import date, datetime

class FactoryCompra:
    def __init__(self, next_ID: int):
        # implementar o carregamento do último ID usado a partir do banco de dados
        self.next_ID = next_ID

    def CreateCompra(self, data: date, valor_total: float, ingredientes: list, preco_ingredientes: dict):
        compra = Compra(self.next_ID, data, valor_total, ingredientes, preco_ingredientes)
        self.next_ID += 1
        return compra

    def FromDB(self, compraDict: dict):
        # Carrega uma compra a partir de um dicionário vindo do banco de dados
        ID = compraDict.get('id_compra')
        data_str = compraDict.get('data_de_compra')
        data = datetime.strptime(data_str, '%Y-%m-%d').date()
        valor_total = compraDict.get('valor_total')
        ingredientes = compraDict.get('ingredientes')
        preco_ingredientes = compraDict.get('preco_ingredientes')

        if valor_total is not None:
            try:
                valor_total = float(valor_total)
            except (TypeError, ValueError):
                pass

        return Compra(ID, data, valor_total, ingredientes, preco_ingredientes)



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
    
    def print_compra(self):
        #para testes, apenas
        print(f"ID: {self.ID}, Data: {self.data}, Valor Total: {self.valor_total}, Ingredientes: {self.ingredientes}, Preço Ingredientes: {self.preco_ingredientes}")
