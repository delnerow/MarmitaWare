from datetime import date, datetime

class FactoryVenda:
    def __init__(self, next_ID: int):
        # implementar o carregamento do último ID usado a partir do banco de dados
        self.next_ID = next_ID

    def CreateVendas(self, marmita, quantidade: int, data: date):
        venda = Venda(self.next_ID, marmita, quantidade, data)
        self.next_ID += 1
        return venda

    def FromDB(self, vendaDict: dict):
        # Carrega uma lista de vendas a partir de um dicionário vindo do banco de dados
        ID = vendaDict.get('id_venda')
        marmita = vendaDict.get('id_marmita')
        quantidade = vendaDict.get('quantidade_vendida')
        data_str = vendaDict.get('data_de_venda')
        data = datetime.strptime(data_str, '%Y-%m-%d').date()

        return Venda(ID, marmita, quantidade, data)

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

    def print_venda(self):
        # para testes, apenas
        print(f"ID: {self.ID}, Marmita: {self.marmita}, Quantidade: {self.quantidade}, Data: {self.data}")