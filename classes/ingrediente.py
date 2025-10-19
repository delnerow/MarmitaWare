
class FactoryIngrediente:
    def __init__(self, next_ID: int):
        # implementar o carregamento do último ID usado a partir do banco de dados
        self.next_ID = next_ID

    def CreateIngrediente(self, nome: str, preco_compra: float, data_ultima_compra):
        ingrediente = Ingrediente(self.next_ID, nome, preco_compra, data_ultima_compra)
        self.next_ID += 1
        return ingrediente

    def FromDB(self, ingredienteDict: dict):
        # Carrega um ingrediente a partir de um dicionário vindo do banco de dados
        ID = ingredienteDict.get('id_ingrediente')
        nome = ingredienteDict.get('nome_ingrediente')
        preco_compra = ingredienteDict.get('preco_compra')
        data_ultima_compra = ingredienteDict.get('data_ultima_compra')
        id_unidade = ingredienteDict.get('id_unidade')

        if preco_compra is not None:
            try:
                preco_compra = float(preco_compra)
            except (TypeError, ValueError):
                pass

        return Ingrediente(ID, nome, preco_compra, data_ultima_compra, id_unidade)

class Ingrediente:
    def __init__(self, ID: int, nome: str, preco_compra: float, data_ultima_compra, id_unidade=None):
        self.ID = ID
        self.nome = nome
        self.preco_compra = preco_compra
        self.data_ultima_compra = data_ultima_compra
        self.id_unidade = id_unidade

    def Editar(self, nome: str = None, preco_compra: float = None, data_ultima_compra=None, id_unidade=None):
        if nome is not None:
            self.nome = nome
        if preco_compra is not None:
            self.preco_compra = preco_compra
        if data_ultima_compra is not None:
            self.data_ultima_compra = data_ultima_compra
        if id_unidade is not None:
            self.id_unidade = id_unidade

    def print_ingrediente(self):
        #para testes, apenas
        print(f"ID: {self.ID}, Nome: {self.nome}, Preço de Compra: {self.preco_compra}, Data da Última Compra: {self.data_ultima_compra}, ID Unidade: {self.id_unidade}")