import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

function Modal({ type, data, editingItem, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    nome: '',
    preco_venda: '',
    preco_compra: '',
    quantidade: 1,
    data: new Date().toISOString().split('T')[0],
    valor_total: '',
    marmita_id: data.marmitas[0]?.id || '',
    ingredientes_quantidades: {}
  });

  const [loading, setLoading] = useState(false);

  // Preenche formulário quando estiver editando
  useEffect(() => {
    if (editingItem) {
      if (type === 'marmita') {
        setFormData({
          ...formData,
          nome: editingItem.nome || '',
          preco_venda: editingItem.preco_venda || '',
          ingredientes_quantidades: editingItem.quantidade_ingredientes || {}
        });
      } else if (type === 'venda') {
        // CORRIGIDO: pega o ID correto da venda
        const vendaId = editingItem.id_venda || editingItem.id;
        const marmitaId = editingItem.id_marmita || '';
        const quantidade = editingItem.quantidade_vendida || 1;
        const dataVenda = editingItem.data_de_venda || editingItem.data || new Date().toISOString().split('T')[0];
        
        setFormData({
          ...formData,
          id: vendaId,
          marmita_id: marmitaId,
          quantidade: quantidade,
          data: dataVenda
        });
      } else if (type === 'compra') {
        // CORRIGIDO: pega o ID correto da compra
        const compraId = editingItem.id_compra || editingItem.id;
        const valorTotal = editingItem.valor_total || editingItem['valor total'] || '';
        const dataCompra = editingItem.data_de_compra || editingItem.data || new Date().toISOString().split('T')[0];
        const precoIngredientes = editingItem.preco_ingredientes || {};
        
        setFormData({
          ...formData,
          id: compraId,
          valor_total: valorTotal,
          data: dataCompra,
          ingredientes_quantidades: precoIngredientes
        });
      } else if (type === 'ingrediente') {
        setFormData({
          ...formData,
          nome: editingItem.nome || '',
          preco_compra: editingItem.preco_compra || ''
        });
      }
    }
  }, [editingItem, type]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let submitData = {};

      if (type === 'ingrediente') {
        if (!formData.nome || !formData.preco_compra) {
          alert('Nome e preço são obrigatórios');
          return;
        }
        submitData = {
          nome: formData.nome,
          preco_compra: parseFloat(formData.preco_compra),
          id_unidade: 1
        };
      } else if (type === 'marmita') {
        if (!formData.nome || !formData.preco_venda) {
          alert('Nome e preço são obrigatórios');
          return;
        }
        
        // CORRIGIDO: Converte ingredientes_quantidades para o formato correto
        const ingredientesQuantidades = {};
        Object.entries(formData.ingredientes_quantidades).forEach(([key, value]) => {
          ingredientesQuantidades[parseInt(key)] = parseFloat(value);
        });
        
        submitData = {
          nome: formData.nome,
          preco_venda: parseFloat(formData.preco_venda),
          ingredientes_quantidades: ingredientesQuantidades
        };
      } else if (type === 'venda') {
        if (!formData.marmita_id) {
          alert('Selecione uma marmita');
          return;
        }
        submitData = {
          marmita_id: parseInt(formData.marmita_id),
          quantidade: parseInt(formData.quantidade),
          data: formData.data
        };
      } else if (type === 'compra') {
        if (!formData.valor_total) {
          alert('Valor total é obrigatório');
          return;
        }
        
        // CORRIGIDO: Converte ingredientes_precos para o formato correto
        const ingredientesPrecos = {};
        Object.entries(formData.ingredientes_quantidades).forEach(([key, value]) => {
          ingredientesPrecos[parseInt(key)] = parseFloat(value);
        });
        
        // Valida se há pelo menos um ingrediente
        if (Object.keys(ingredientesPrecos).length === 0) {
          alert('Adicione pelo menos um ingrediente à compra');
          return;
        }
        
        submitData = {
          valor_total: parseFloat(formData.valor_total),
          data: formData.data,
          ingredientes_precos: ingredientesPrecos
        };
      }

      await onSubmit(submitData);
    } catch (error) {
      console.error('Erro no submit:', error);
    } finally {
      setLoading(false);
    }
  };

  const addIngrediente = (ingredienteId, quantidade) => {
    setFormData({
      ...formData,
      ingredientes_quantidades: {
        ...formData.ingredientes_quantidades,
        [ingredienteId]: parseFloat(quantidade)
      }
    });
  };

  const removeIngrediente = (ingredienteId) => {
    const newIngredientes = { ...formData.ingredientes_quantidades };
    delete newIngredientes[ingredienteId];
    setFormData({
      ...formData,
      ingredientes_quantidades: newIngredientes
    });
  };

  const modalTitles = {
    ingrediente: { emoji: '🥕', text: editingItem ? 'Editar Ingrediente' : 'Novo Ingrediente', color: 'green' },
    marmita: { emoji: '🍲', text: editingItem ? 'Editar Marmita' : 'Nova Marmita', color: 'blue' },
    venda: { emoji: '💸', text: editingItem ? 'Editar Venda' : 'Registrar Venda', color: 'green' },
    compra: { emoji: '🛒', text: editingItem ? 'Editar Compra' : 'Nova Compra', color: 'orange' }
  };

  const currentModal = modalTitles[type];
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:ring-blue-500',
    green: 'from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:ring-green-500',
    orange: 'from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 focus:ring-orange-500'
  };

// Cálculo do custo estimado da marmita
const custoEstimado = Object.entries(formData.ingredientes_quantidades).reduce(
  (total, [ingId, qtd]) => {
    const ingrediente = data.ingredientes.find(i => i.id === parseInt(ingId));
    if (!ingrediente) return total;
    return total + (Number(qtd) * Number(ingrediente.preco_compra));
  },
  0
);
const precoVenda = Number(formData.preco_venda || 0);

const margemLucro =
  precoVenda > 0
    ? ((precoVenda - custoEstimado) / precoVenda) * 100
    : 0;

  
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full mx-4 shadow-2xl transform transition-all animate-scaleIn max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header com gradiente */}
        <div className={`bg-gradient-to-r ${colorClasses[currentModal.color]} p-6 rounded-t-2xl sticky top-0 z-10`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{currentModal.emoji}</span>
              <h3 className="text-2xl font-bold text-white">{currentModal.text}</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
          {/* Formulário de Ingrediente */}
          {type === 'ingrediente' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome do Ingrediente
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                  placeholder="Ex: Arroz, Feijão, Frango"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Preço de Compra (R$/kg ou unidade)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.preco_compra}
                  onChange={(e) => setFormData({ ...formData, preco_compra: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                  placeholder="8.50"
                />
              </div>
            </>
          )}

          {/* Formulário de Marmita */}
          {type === 'marmita' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome da Marmita
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                  placeholder="Ex: Frango com Legumes"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Preço de Venda (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.preco_venda}
                  onChange={(e) => setFormData({ ...formData, preco_venda: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                  placeholder="15.00"
                />
              </div>
              
              {!editingItem && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ingredientes e Quantidades
                  </label>
                  
                  {/* Lista de ingredientes adicionados */}
                  {Object.keys(formData.ingredientes_quantidades).length > 0 && (
                    <div className="space-y-2 mb-3">
                      {Object.entries(formData.ingredientes_quantidades).map(([ingId, qtd]) => {
                        const ingrediente = data.ingredientes.find(i => i.id === parseInt(ingId));
                        return (
                          <div key={ingId} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <span className="text-sm font-medium text-blue-800">
                              {ingrediente?.nome || `ID: ${ingId}`} - {qtd} kg
                            </span>
                            <button
                              onClick={() => removeIngrediente(ingId)}
                              className="p-1 hover:bg-red-100 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Adicionar ingrediente */}
                  <div className="flex gap-2">
                    <select
                      id="ingrediente-select"
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                    >
                      <option value="">Selecione um ingrediente...</option>
                      {data.ingredientes.map((ing) => (
                        <option key={ing.id} value={ing.id}>
                          {ing.nome} - R$ {ing.preco_compra}/kg
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      step="0.01"
                      id="quantidade-input"
                      placeholder="Qtd (kg)"
                      className="w-32 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const select = document.getElementById('ingrediente-select');
                        const input = document.getElementById('quantidade-input');
                        if (select.value && input.value) {
                          addIngrediente(select.value, input.value);
                          select.value = '';
                          input.value = '';
                        } else {
                          alert('Selecione um ingrediente e informe a quantidade');
                        }
                      }}
                      className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-medium flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                  {/* Resumo Financeiro da Marmita */}
<div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
  <h4 className="font-semibold text-gray-800 mb-3">Resumo da Marmita</h4>

  <div className="flex justify-between items-center py-1">
    <span className="text-gray-600">Custo Estimado:</span>
    <span className="font-bold text-red-600">
      R$ {custoEstimado.toFixed(2)}
    </span>
  </div>

  <div className="flex justify-between items-center py-1">
    <span className="text-gray-600">Preço de Venda:</span>
    <span className="font-bold text-blue-600">
      R$ {precoVenda.toFixed(2)}
    </span>
  </div>

  <div className="flex justify-between items-center py-1">
    <span className="text-gray-600">Margem de Lucro:</span>
    <span className={`font-bold ${margemLucro >= 0 ? "text-green-600" : "text-red-600"}`}>
      {margemLucro.toFixed(1)}%
    </span>
  </div>
</div>

                </div>
              )}
            </>
            
          )}

          {/* Formulário de Venda */}
          {type === 'venda' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Marmita
                </label>
                <select
                  value={formData.marmita_id}
                  onChange={(e) => setFormData({ ...formData, marmita_id: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                >
                  <option value="">Selecione...</option>
                  {data.marmitas.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nome} - R$ {m.preco_venda.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantidade
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantidade}
                  onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Data
                </label>
                <input
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                />
              </div>
            </>
          )}

          {/* Formulário de Compra */}
          {type === 'compra' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Valor Total (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.valor_total}
                  onChange={(e) => setFormData({ ...formData, valor_total: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                  placeholder="150.00"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Data da Compra
                </label>
                <input
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                />
              </div>
              
              {/* NOVO: Interface para adicionar ingredientes na compra */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ingredientes e Preços
                </label>
                
                {/* Lista de ingredientes adicionados */}
                {Object.keys(formData.ingredientes_quantidades).length > 0 && (
                  <div className="space-y-2 mb-3">
                    {Object.entries(formData.ingredientes_quantidades).map(([ingId, preco]) => {
                      const ingrediente = data.ingredientes.find(i => i.id === parseInt(ingId));
                      return (
                        <div key={ingId} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                          <span className="text-sm font-medium text-orange-800">
                            {ingrediente?.nome || `ID: ${ingId}`} - R$ {preco}
                          </span>
                          <button
                            onClick={() => removeIngrediente(ingId)}
                            className="p-1 hover:bg-red-100 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Adicionar ingrediente */}
                <div className="flex gap-2">
                  <select
                    id="compra-ingrediente-select"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                  >
                    <option value="">Selecione um ingrediente...</option>
                    {data.ingredientes.map((ing) => (
                      <option key={ing.id} value={ing.id}>
                        {ing.nome}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    id="compra-preco-input"
                    placeholder="Preço (R$)"
                    className="w-32 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const select = document.getElementById('compra-ingrediente-select');
                      const input = document.getElementById('compra-preco-input');
                      if (select.value && input.value) {
                        addIngrediente(select.value, input.value);
                        select.value = '';
                        input.value = '';
                      } else {
                        alert('Selecione um ingrediente e informe o preço');
                      }
                    }}
                    className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all font-medium flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Botões */}
        <div className="flex gap-3 p-6 pt-0 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`flex-1 px-6 py-3 bg-gradient-to-r ${colorClasses[currentModal.color]} text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl`}
          >
            {loading ? 'Salvando...' : editingItem ? 'Atualizar' : 'Salvar'}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default Modal;