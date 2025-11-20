# api.py - API REST corrigida
from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import date, datetime
import sys
import os

# Importa suas classes existentes
sys.path.insert(0, os.path.dirname(__file__))
from classes.gerenciadorApp import GerenciadorApp

app = Flask(__name__)
CORS(app)

# Inicializa o gerenciador
gerenciador = GerenciadorApp()

# ============= ROTAS DE INGREDIENTES =============

@app.route('/api/ingredientes', methods=['GET'])
def get_ingredientes():
    """Lista todos os ingredientes"""
    try:
        ingredientes = []
        for ing in gerenciador.ingredientes.values():
            ingredientes.append({
                'id': ing.ID,
                'nome': ing.nome,
                'preco_compra': float(ing.preco_compra),
                'data_ultima_compra': str(ing.data_ultima_compra) if ing.data_ultima_compra else None,
                'id_unidade': ing.id_unidade
            })
        return jsonify(ingredientes)
    except Exception as e:
        print(f"Erro em get_ingredientes: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/ingredientes/<int:id>', methods=['GET'])
def get_ingrediente(id):
    """Busca um ingrediente específico"""
    try:
        if id not in gerenciador.ingredientes:
            return jsonify({'error': 'Ingrediente não encontrado'}), 404
        
        ing = gerenciador.ingredientes[id]
        return jsonify({
            'id': ing.ID,
            'nome': ing.nome,
            'preco_compra': float(ing.preco_compra),
            'data_ultima_compra': str(ing.data_ultima_compra) if ing.data_ultima_compra else None,
            'id_unidade': ing.id_unidade
        })
    except Exception as e:
        print(f"Erro em get_ingrediente: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/ingredientes', methods=['POST'])
def create_ingrediente():
    """Cria um novo ingrediente"""
    try:
        data = request.json
        print(f"Criando ingrediente: {data}")
        gerenciador.CreateIngrediente(
            nome=data['nome'],
            preco_compra=float(data['preco_compra']),
            id_unidade=data.get('id_unidade', 1)
        )
        return jsonify({'message': 'Ingrediente criado com sucesso'}), 201
    except Exception as e:
        print(f"Erro em create_ingrediente: {e}")
        return jsonify({'error': str(e)}), 400

@app.route('/api/ingredientes/<int:id>', methods=['PUT'])
def update_ingrediente(id):
    """Atualiza um ingrediente existente"""
    try:
        data = request.json
        print(f"Atualizando ingrediente {id}: {data}")
        
        data_ultima_compra = None
        if 'data_ultima_compra' in data and data['data_ultima_compra']:
            data_ultima_compra = datetime.strptime(data['data_ultima_compra'], '%Y-%m-%d').date()
        
        gerenciador.EditIngrediente(
            id_ingrediente=id,
            nome=data.get('nome'),
            preco_compra=float(data['preco_compra']) if 'preco_compra' in data else None,
            data_ultima_compra=data_ultima_compra,
            id_unidade=data.get('id_unidade')
        )
        return jsonify({'message': 'Ingrediente atualizado com sucesso'})
    except Exception as e:
        print(f"Erro em update_ingrediente: {e}")
        return jsonify({'error': str(e)}), 400

@app.route('/api/ingredientes/<int:id>', methods=['DELETE'])
def delete_ingrediente(id):
    """Remove um ingrediente"""
    try:
        print(f"Deletando ingrediente {id}")
        gerenciador.DeleteIngrediente(id)
        return jsonify({'message': 'Ingrediente removido com sucesso'})
    except Exception as e:
        print(f"Erro em delete_ingrediente: {e}")
        return jsonify({'error': str(e)}), 400

# ============= ROTAS DE MARMITAS =============

@app.route('/api/marmitas', methods=['GET'])
def get_marmitas():
    """Lista todas as marmitas"""
    try:
        marmitas = []
        for mar in gerenciador.marmitas.values():
            ingredientes_nomes = [
                gerenciador.ingredientes[ing_id].nome 
                for ing_id in mar.ingredientes 
                if ing_id in gerenciador.ingredientes
            ]
            
            marmitas.append({
                'id': mar.ID,
                'nome': mar.nome,
                'preco_venda': float(mar.preco_venda),
                'custo_estimado': float(mar.custo_estimado) if mar.custo_estimado else 0,
                'ingredientes': ', '.join(ingredientes_nomes),
                'quantidade_ingredientes': mar.quantidade_ingredientes
            })
        return jsonify(marmitas)
    except Exception as e:
        print(f"Erro em get_marmitas: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/marmitas', methods=['POST'])
def create_marmita():
    """Cria uma nova marmita"""
    try:
        data = request.json
        print(f"Criando marmita: {data}")
        
        # Converte ingredientes_quantidades garantindo tipos corretos
        ingredientes_quantidades = {}
        if 'ingredientes_quantidades' in data and data['ingredientes_quantidades']:
            for key, value in data['ingredientes_quantidades'].items():
                ingredientes_quantidades[int(key)] = float(value)
        
        gerenciador.CreateMarmita(
            nome=data['nome'],
            ingredientes_quantidades=ingredientes_quantidades,
            preco_venda=float(data['preco_venda'])
        )
        return jsonify({'message': 'Marmita criada com sucesso'}), 201
    except Exception as e:
        print(f"Erro em create_marmita: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 400

@app.route('/api/marmitas/<int:id>', methods=['PUT'])
def update_marmita(id):
    """Atualiza uma marmita existente"""
    try:
        data = request.json
        print(f"Atualizando marmita {id}: {data}")
        
        # Converte ingredientes_quantidades se fornecido
        ingredientes_quantidades = None
        if 'ingredientes_quantidades' in data and data['ingredientes_quantidades']:
            ingredientes_quantidades = {}
            for key, value in data['ingredientes_quantidades'].items():
                ingredientes_quantidades[int(key)] = float(value)
        
        gerenciador.EditMarmita(
            id_marmita=id,
            nome=data.get('nome'),
            preco_venda=float(data['preco_venda']) if 'preco_venda' in data else None,
            ingredientes_quantidades=ingredientes_quantidades
        )
        return jsonify({'message': 'Marmita atualizada com sucesso'})
    except Exception as e:
        print(f"Erro em update_marmita: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 400

@app.route('/api/marmitas/<int:id>', methods=['DELETE'])
def delete_marmita(id):
    """Remove uma marmita"""
    try:
        print(f"Deletando marmita {id}")
        gerenciador.DeleteMarmita(id)
        return jsonify({'message': 'Marmita removida com sucesso'})
    except Exception as e:
        print(f"Erro em delete_marmita: {e}")
        return jsonify({'error': str(e)}), 400

# ============= ROTAS DE VENDAS =============

@app.route('/api/vendas', methods=['GET'])
def get_vendas():
    """Lista todas as vendas"""
    try:
        df_vendas = gerenciador.GetVendasTable()
        vendas = df_vendas.to_dict('records')
        
        # Adiciona IDs das vendas e formata datas
        vendas_com_ids = []
        for venda_dict in vendas:
            # Encontra a venda correspondente pelo nome da marmita e data
            for venda_obj in gerenciador.vendas.values():
                marmita = gerenciador.marmitas.get(venda_obj.id_marmita)
                if (marmita and 
                    marmita.nome == venda_dict.get('nome_marmita') and
                    str(venda_obj.data_de_venda) == str(venda_dict.get('data'))[:10]):
                    venda_dict['id'] = venda_obj.ID
                    venda_dict['id_venda'] = venda_obj.ID
                    venda_dict['id_marmita'] = venda_obj.id_marmita
                    venda_dict['data_de_venda'] = str(venda_obj.data_de_venda)
                    break
            
            if 'data' in venda_dict and venda_dict['data']:
                venda_dict['data'] = str(venda_dict['data'])[:10]
            
            vendas_com_ids.append(venda_dict)
        
        return jsonify(vendas_com_ids)
    except Exception as e:
        print(f"Erro em get_vendas: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/vendas', methods=['POST'])
def create_venda():
    """Cria uma nova venda"""
    try:
        data = request.json
        print(f"Criando venda: {data}")
        data_venda = datetime.strptime(data['data'], '%Y-%m-%d').date() if 'data' in data else date.today()
        
        gerenciador.CreateVenda(
            ID_marmita=int(data['marmita_id']),
            data_venda=data_venda,
            quantidade=int(data['quantidade'])
        )
        return jsonify({'message': 'Venda registrada com sucesso'}), 201
    except Exception as e:
        print(f"Erro em create_venda: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 400

@app.route('/api/vendas/<int:id>', methods=['PUT'])
def update_venda(id):
    """Atualiza uma venda existente"""
    try:
        data = request.json
        print(f"Atualizando venda {id}: {data}")
        
        data_venda = None
        if 'data' in data and data['data']:
            data_venda = datetime.strptime(data['data'], '%Y-%m-%d').date()
        
        gerenciador.EditVenda(
            id_venda=id,
            id_marmita=int(data['marmita_id']) if 'marmita_id' in data else None,
            quantidade=int(data['quantidade']) if 'quantidade' in data else None,
            data_venda=data_venda
        )
        return jsonify({'message': 'Venda atualizada com sucesso'})
    except Exception as e:
        print(f"Erro em update_venda: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 400

@app.route('/api/vendas/<int:id>', methods=['DELETE'])
def delete_venda(id):
    """Remove uma venda"""
    try:
        print(f"Deletando venda {id}")
        gerenciador.DeleteVenda(id)
        return jsonify({'message': 'Venda removida com sucesso'})
    except Exception as e:
        print(f"Erro em delete_venda: {e}")
        return jsonify({'error': str(e)}), 400

# ============= ROTAS DE COMPRAS =============

@app.route('/api/compras', methods=['GET'])
def get_compras():
    """Lista todas as compras"""
    try:
        df_compras = gerenciador.GetComprasTable()
        compras = df_compras.to_dict('records')
        
        # Adiciona IDs das compras e formata datas
        compras_com_ids = []
        for compra_dict in compras:
            # Tenta encontrar a compra correspondente
            for compra_obj in gerenciador.compras.values():
                if (str(compra_obj.data) == str(compra_dict.get('data'))[:10] and
                    abs(float(compra_obj.valor_total) - float(compra_dict.get('valor total', 0))) < 0.01):
                    compra_dict['id'] = compra_obj.ID
                    compra_dict['id_compra'] = compra_obj.ID
                    compra_dict['valor_total'] = float(compra_obj.valor_total)
                    compra_dict['data_de_compra'] = str(compra_obj.data)
                    compra_dict['preco_ingredientes'] = compra_obj.preco_ingredientes
                    break
            
            if 'data' in compra_dict and compra_dict['data']:
                compra_dict['data'] = str(compra_dict['data'])[:10]
        
            compras_com_ids.append(compra_dict)
        
        return jsonify(compras_com_ids)
    except Exception as e:
        print(f"Erro em get_compras: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/compras', methods=['POST'])
def create_compra():
    """Cria uma nova compra"""
    try:
        data = request.json
        print(f"Criando compra: {data}")
        data_compra = datetime.strptime(data['data'], '%Y-%m-%d').date() if 'data' in data else date.today()
        
        # Converte ingredientes_precos garantindo tipos corretos
        ingredientes_precos = {}
        if 'ingredientes_precos' in data and data['ingredientes_precos']:
            for key, value in data['ingredientes_precos'].items():
                ingredientes_precos[int(key)] = float(value)
        
        if not ingredientes_precos:
            return jsonify({'error': 'Adicione pelo menos um ingrediente à compra'}), 400
        
        gerenciador.CreateCompra(
            valor_total=float(data['valor_total']),
            data=data_compra,
            ingredientes_precos=ingredientes_precos
        )
        return jsonify({'message': 'Compra registrada com sucesso'}), 201
    except Exception as e:
        print(f"Erro em create_compra: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 400

@app.route('/api/compras/<int:id>', methods=['PUT'])
def update_compra(id):
    """Atualiza uma compra existente"""
    try:
        data = request.json
        print(f"Atualizando compra {id}: {data}")
        
        data_compra = None
        if 'data' in data and data['data']:
            data_compra = datetime.strptime(data['data'], '%Y-%m-%d').date()
        
        # Converte ingredientes_precos se fornecido
        ingredientes_precos = None
        if 'ingredientes_precos' in data and data['ingredientes_precos']:
            ingredientes_precos = {}
            for key, value in data['ingredientes_precos'].items():
                ingredientes_precos[int(key)] = float(value)
        
        gerenciador.EditCompra(
            id_compra=id,
            valor_total=float(data['valor_total']) if 'valor_total' in data else None,
            data=data_compra,
            ingredientes_precos=ingredientes_precos
        )
        return jsonify({'message': 'Compra atualizada com sucesso'})
    except Exception as e:
        print(f"Erro em update_compra: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 400

@app.route('/api/compras/<int:id>', methods=['DELETE'])
def delete_compra(id):
    """Remove uma compra"""
    try:
        print(f"Deletando compra {id}")
        gerenciador.DeleteCompra(id)
        return jsonify({'message': 'Compra removida com sucesso'})
    except Exception as e:
        print(f"Erro em delete_compra: {e}")
        return jsonify({'error': str(e)}), 400

# ============= ROTA DE RELATÓRIO =============

@app.route('/api/relatorio', methods=['GET'])
def get_relatorio():
    """Retorna dados consolidados para o dashboard"""
    try:
        data_inicio = request.args.get('data_inicio')
        data_fim = request.args.get('data_fim')
        
        if data_inicio:
            data_inicio = datetime.strptime(data_inicio, '%Y-%m-%d').date()
        if data_fim:
            data_fim = datetime.strptime(data_fim, '%Y-%m-%d').date()
        
        relatorio = gerenciador.GetRelatorio(data_inicio, data_fim)
        return jsonify(relatorio)
    except Exception as e:
        print(f"Erro em get_relatorio: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# ============= ROTA DE SAÚDE =============

@app.route('/api/health', methods=['GET'])
def health_check():
    """Verifica se a API está funcionando"""
    return jsonify({'status': 'ok', 'message': 'API funcionando'})

if __name__ == '__main__':
    print("🚀 Servidor iniciado em http://localhost:5000")
    print("📊 Endpoints disponíveis:")
    print("\n=== INGREDIENTES ===")
    print("  GET    /api/ingredientes")
    print("  POST   /api/ingredientes")
    print("  PUT    /api/ingredientes/<id>")
    print("  DELETE /api/ingredientes/<id>")
    print("\n=== MARMITAS ===")
    print("  GET    /api/marmitas")
    print("  POST   /api/marmitas")
    print("  PUT    /api/marmitas/<id>")
    print("  DELETE /api/marmitas/<id>")
    print("\n=== VENDAS ===")
    print("  GET    /api/vendas")
    print("  POST   /api/vendas")
    print("  PUT    /api/vendas/<id>")
    print("  DELETE /api/vendas/<id>")
    print("\n=== COMPRAS ===")
    print("  GET    /api/compras")
    print("  POST   /api/compras")
    print("  PUT    /api/compras/<id>")
    print("  DELETE /api/compras/<id>")
    print("\n=== RELATÓRIOS ===")
    print("  GET    /api/relatorio")
    app.run(host='0.0.0.0', port=5000)