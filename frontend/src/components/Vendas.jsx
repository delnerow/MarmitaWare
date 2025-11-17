import { Plus, TrendingUp, Calendar, DollarSign, Package, Edit2, Trash2 } from 'lucide-react';
import { formatDateBR } from '../utils';

function Vendas({ vendas, onAdd, onEdit, onDelete }) {
  // Calcula estatísticas
  const totalVendido = vendas?.reduce((sum, v) => sum + (Number(v.valor_total) || 0), 0) || 0;
  const quantidadeTotal = vendas?.reduce((sum, v) => sum + (Number(v.quantidade_vendida) || 0), 0) || 0;
  const ticketMedio = vendas?.length > 0 ? totalVendido / vendas.length : 0;

  // Ordena vendas: mais recentes primeiro
  const vendasOrdenadas = vendas ? [...vendas].sort((a, b) => {
    const dateA = new Date(a.data || '1900-01-01');
    const dateB = new Date(b.data || '1900-01-01');
    return dateB - dateA;
  }) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Histórico de Vendas</h2>
            <p className="text-gray-500">Gerencie e acompanhe todas as suas vendas</p>
          </div>
          <button
            onClick={onAdd}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>Nova Venda</span>
          </button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                Receita
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Vendido</p>
            <p className="text-3xl font-bold text-green-600">R$ {totalVendido.toFixed(2)}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-100 rounded-xl">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                Unidades
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Quantidade Total</p>
            <p className="text-3xl font-bold text-blue-600">{quantidadeTotal}</p>
            <p className="text-xs text-gray-500 mt-1">marmitas vendidas</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                Média
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Ticket Médio</p>
            <p className="text-3xl font-bold text-purple-600">R$ {ticketMedio.toFixed(2)}</p>
          </div>
        </div>

        {/* Tabela de Vendas */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          {vendasOrdenadas && vendasOrdenadas.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Marmita
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Quantidade
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Valor Total
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {vendasOrdenadas.map((venda, idx) => (
                    <tr 
                      key={idx} 
                      className="hover:bg-gradient-to-r hover:from-green-50/50 hover:to-emerald-50/50 transition-all duration-200"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <span className="text-lg">🍱</span>
                          </div>
                          <span className="font-semibold text-gray-800">
                            {venda.nome_marmita || 'Sem nome'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
                          {venda.quantidade_vendida || 0}x
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="inline-flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-sm">{formatDateBR(venda.data)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span className="text-lg font-bold text-green-600">
                          R$ {(Number(venda.valor_total) || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onEdit(venda)}
                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDelete(venda.id)}
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
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 mb-6">
                <DollarSign className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Nenhuma venda registrada</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Comece registrando sua primeira venda e acompanhe o crescimento do seu negócio!
              </p>
              <button
                onClick={onAdd}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg inline-flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Registrar Primeira Venda</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Vendas;