import { Plus, UtensilsCrossed, TrendingUp, DollarSign, Edit2, Trash2 } from 'lucide-react';

function Marmitas({ marmitas, onAdd, onEdit, onDelete }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Cardápio de Marmitas</h2>
            <p className="text-gray-500">Gerencie seus produtos e margens de lucro</p>
          </div>
          <button
            onClick={onAdd}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>Nova Marmita</span>
          </button>
        </div>

        {/* Grid de Marmitas */}
        {marmitas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {marmitas.map(marmita => {
              const margem = marmita.preco_venda > 0
                ? ((1 - marmita.custo_estimado / marmita.preco_venda) * 100)
                : 0;
              
              return (
                <div 
                  key={marmita.id} 
                  className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
                >
                  {/* Header do Card */}
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-white">{marmita.nome}</h3>
                      <div className="p-2 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                        <UtensilsCrossed className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Conteúdo do Card */}
                  <div className="p-6 space-y-4">
                    {/* Preço de Venda - Destaque */}
                    <div className="bg-gradient-to-r from-green-50 to-green-50/50 rounded-xl p-4 border border-green-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Preço de Venda</span>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-5 h-5 text-green-600" />
                          <span className="text-2xl font-bold text-green-600">
                            {marmita.preco_venda.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Custo e Margem */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-gray-600">Custo Estimado</span>
                        <span className="text-lg font-bold text-orange-600">
                          R$ {marmita.custo_estimado.toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center py-2 border-t border-gray-100">
                        <span className="text-sm font-medium text-gray-600">Margem de Lucro</span>
                        <div className="flex items-center gap-2">
                          <TrendingUp className={`w-4 h-4 ${margem > 50 ? 'text-green-600' : margem > 30 ? 'text-blue-600' : 'text-orange-600'}`} />
                          <span className={`text-lg font-bold ${margem > 50 ? 'text-green-600' : margem > 30 ? 'text-blue-600' : 'text-orange-600'}`}>
                            {margem.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Ingredientes */}
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Ingredientes</p>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {marmita.ingredientes || 'Sem ingredientes cadastrados'}
                      </p>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex gap-2 pt-4">
                      <button
                        onClick={() => onEdit(marmita)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                      >
                        <Edit2 className="w-4 h-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => onDelete(marmita.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                      >
                        <Trash2 className="w-4 h-4" />
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Estado Vazio */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 mb-6">
              <UtensilsCrossed className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Nenhuma marmita cadastrada</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Comece adicionando sua primeira marmita ao cardápio e gerencie seu negócio de forma profissional!
            </p>
            <button
              onClick={onAdd}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg inline-flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Adicionar Primeira Marmita</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Marmitas;