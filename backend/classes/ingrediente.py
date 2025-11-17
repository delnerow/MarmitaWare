import datetime


class FactoryIngrediente:
    def __init__(self, next_ID: int):
        # implementar o carregamento do último ID usado a partir do banco de dados
        self.next_ID = next_ID
        self.hoje = datetime.date.today()

    def CreateIngrediente(self, nome: str, preco_compra: float, id_unidade: int):
        # Cria um novo ingrediente com um ID único
        # implementa a regra de negócio para criação de ingredientes

        # validações básicas
        if nome is None or (isinstance(nome, str) and nome.strip() == ""):
            raise ValueError("Nome do ingrediente não pode ser vazio.")

        if preco_compra is None or (isinstance(preco_compra, str) and preco_compra.strip() == ""):
            raise ValueError("Preço de compra não pode ser vazio.")

        try:
            preco_compra = float(preco_compra)
        except (TypeError, ValueError):
            raise ValueError("Preço de compra deve ser um número válido.")

        if preco_compra < 0:
            raise ValueError("Preço de compra não pode ser negativo.")

        # normalização
        nome = nome.strip() if isinstance(nome, str) else nome 

        ingrediente = Ingrediente(self.next_ID, nome, preco_compra, self.hoje, id_unidade)
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