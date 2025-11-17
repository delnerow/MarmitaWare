import { Plus, Carrot, DollarSign, Calendar, Edit2, Trash2 } from 'lucide-react';
import { formatDateBR } from '../utils';

function Ingredientes({ ingredientes, onAdd, onEdit, onDelete }) {
  // Calcula estatísticas
  const totalIngredientes = ingredientes?.length || 0;
  const precoMedio = ingredientes?.length > 0 
    ? ingredientes.reduce((sum, ing) => sum + (Number(ing.preco_compra) || 0), 0) / ingredientes.length 
    : 0;

  // Ordena ingredientes: mais recentes primeiro
  const ingredientesOrdenados = ingredientes ? [...ingredientes].sort((a, b) => {
    const dateA = new Date(a.data_ultima_compra || '1900-01-01');
    const dateB = new Date(b.data_ultima_compra || '1900-01-01');
    return dateB - dateA;
  }) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Ingredientes</h2>
            <p className="text-gray-500">Gerencie os ingredientes das suas marmitas</p>
          </div>
          <button
            onClick={onAdd}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>Novo Ingrediente</span>
          </button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-100 to-green-100 rounded-xl">
                <Carrot className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                Cadastrados
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total de Ingredientes</p>
            <p className="text-3xl font-bold text-green-600">{totalIngredientes}</p>
            <p className="text-xs text-gray-500 mt-1">itens cadastrados</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-100 rounded-xl">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                Média
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Preço Médio</p>
            <p className="text-3xl font-bold text-blue-600">R$ {precoMedio.toFixed(2)}</p>
          </div>
        </div>

        {/* Tabela de Ingredientes */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          {ingredientesOrdenados && ingredientesOrdenados.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Preço de Compra
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Última Compra
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ingredientesOrdenados.map((ingrediente, idx) => (
                    <tr 
                      key={idx} 
                      className="hover:bg-gradient-to-r hover:from-green-50/50 hover:to-green-50/50 transition-all duration-200"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Carrot className="w-5 h-5 text-green-600" />
                          </div>
                          <span className="font-semibold text-gray-800">
                            {ingrediente.nome || 'Sem nome'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                          R$ {(Number(ingrediente.preco_compra) || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="inline-flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-sm">
                            {formatDateBR(ingrediente.data_ultima_compra) || 'Não informado'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onEdit(ingrediente)}
                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDelete(ingrediente.id)}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Estado Vazio */
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-green-100 mb-6">
                <Carrot className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Nenhum ingrediente cadastrado</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Comece adicionando os ingredientes que você usa nas suas marmitas!
              </p>
              <button
                onClick={onAdd}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg inline-flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Adicionar Primeiro Ingrediente</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Ingredientes;