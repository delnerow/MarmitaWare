import { DollarSign, TrendingDown, TrendingUp, ShoppingCart } from 'lucide-react';
import StatCard from './StatCard';
import { formatDateBR } from '../utils';

function Dashboard({ relatorio, vendas }) {
  // Extrai valores do relatório estruturado
  const totalVendas = relatorio?.vendas?.receita_total || 0;
  const custoEstimado = relatorio?.vendas?.custo_produtos_vendidos || 0;
  const lucro = relatorio?.lucro?.lucro_bruto || 0;
  const totalCompras = relatorio?.compras?.total_compras || 0;

  // Ordena vendas: mais recentes primeiro
  const vendasRecentes = vendas ? [...vendas]
    .sort((a, b) => {
      const dateA = new Date(a.data || '1900-01-01');
      const dateB = new Date(b.data || '1900-01-01');
      return dateB - dateA;
    })
    .slice(0, 5) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Financeiro</h1>
          <p className="text-gray-500">Visão geral do seu negócio</p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total em Vendas"
            value={`R$ ${totalVendas.toFixed(2)}`}
            icon={DollarSign}
            trend={12}
            color="#10b981"
          />
          <StatCard
            title="Custo Estimado"
            value={`R$ ${custoEstimado.toFixed(2)}`}
            icon={TrendingDown}
            color="#f59e0b"
          />
          <StatCard
            title="Lucro Líquido"
            value={`R$ ${lucro.toFixed(2)}`}
            icon={TrendingUp}
            trend={8}
            color="#3b82f6"
          />
          <StatCard
            title="Total Compras"
            value={`R$ ${totalCompras.toFixed(2)}`}
            icon={ShoppingCart}
            color="#ef4444"
          />
        </div>

        {/* Cards Informativos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resumo Financeiro */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-xl font-bold mb-6 text-gray-800">Resumo Financeiro</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-green-50/50 rounded-xl border border-green-100">
                <span className="font-semibold text-gray-700">Receita Bruta</span>
                <span className="font-bold text-green-600 text-lg">R$ {totalVendas.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-orange-50 to-orange-50/50 rounded-xl border border-orange-100">
                <span className="font-semibold text-gray-700">Custos</span>
                <span className="font-bold text-orange-600 text-lg">R$ {custoEstimado.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-5 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl border-2 border-blue-200 mt-4">
                <span className="font-bold text-gray-800 text-lg">Lucro Final</span>
                <span className="font-bold text-blue-600 text-2xl">R$ {lucro.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Vendas Recentes */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-xl font-bold mb-6 text-gray-800">Vendas Recentes</h3>
            <div className="space-y-3">
              {vendasRecentes && vendasRecentes.length > 0 ? (
                vendasRecentes.map((venda, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 border border-gray-100 hover:border-gray-200">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{venda.nome_marmita || 'Sem nome'}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        <span className="font-medium">{venda.quantidade_vendida || 0}x</span>
                        <span className="mx-2">•</span>
                        <span>{formatDateBR(venda.data)}</span>
                      </p>
                    </div>
                    <span className="font-bold text-green-600 text-lg ml-4">
                      R$ {(venda.valor_total || 0).toFixed(2)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <ShoppingCart className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">Nenhuma venda registrada ainda</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;