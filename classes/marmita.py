from .ingrediente import Ingrediente

class FactoryMarmita:
    def __init__(self, next_ID: int):
        # implementar o carregamento do último ID usado a partir do banco de dados
        self.next_ID = next_ID

    def CreateMarmita(self, preco_venda: float, quantidade_ingredientes: dict, custo_estimado: float, nome_marmita: str):
        marmita = Marmita(self.next_ID, preco_venda, quantidade_ingredientes, custo_estimado, nome_marmita)
        self.next_ID += 1
        return marmita

    def FromDB(self, marmitaDict: dict):
        # Carrega uma marmita a partir de um dicionário vindo do banco de dados
        ID = marmitaDict.get('id_marmita')
        ingredientes = marmitaDict.get('ingredientes')
        preco_venda = marmitaDict.get('preco_venda')
        quantidade_ingredientes = marmitaDict.get('quantidade_ingredientes')
        custo_estimado = marmitaDict.get('custo_estimado')
        nome_marmita = marmitaDict.get('nome_marmita')

        return Marmita(ID, preco_venda, quantidade_ingredientes, custo_estimado, nome_marmita)

class Marmita:
    def __init__(self, ID: int, preco_venda: float, quantidade_ingredientes: dict, custo_estimado: float, nome_marmita: str):
        self.ID = ID
        if quantidade_ingredientes is None:
            ingredientes = []
        else:
            ingredientes = list(quantidade_ingredientes.keys())
        self.nome = nome_marmita
        self.ingredientes = ingredientes
        self.preco_venda = preco_venda
        self.quantidade_ingredientes = quantidade_ingredientes  # {ingrediente_ID: quantidade}
        self.custo_estimado = custo_estimado

    def Editar(self, ingredientes: list = None, preco_venda: float = None, quantidade_ingredientes: dict = None, custo_estimado: float = None):
        if ingredientes is not None:
            self.ingredientes = ingredientes
        if preco_venda is not None:
            self.preco_venda = preco_venda
        if quantidade_ingredientes is not None:
            self.quantidade_ingredientes = quantidade_ingredientes
        if custo_estimado is not None:
            self.custo_estimado = custo_estimado
    
    def print_marmita(self):
        # para testes, apenas
        print(f"ID: {self.ID}, Nome: {self.nome}, Ingredientes: {self.ingredientes}, Preço de Venda: {self.preco_venda}, Quantidade de Ingredientes: {self.quantidade_ingredientes}, Custo Estimado: {self.custo_estimado}")