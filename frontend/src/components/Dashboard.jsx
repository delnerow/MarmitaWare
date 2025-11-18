import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { PieChart, Pie, Cell, Legend } from "recharts";
import { BarChart, Bar } from "recharts";
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
    // Prepara dados do gráfico de Receita vs Data
// Prepara dados do gráfico de Receita e Quantidade vs Data
const dadosGrafico = vendas
  ? vendas.map(v => ({
      data: formatDateBR(v.data),
      receita: v.valor_total || 0,
      quantidade: v.quantidade_vendida || 0,
    }))
    // ordena do mais antigo para o mais recente
    .sort((a, b) => {
      const [d1, m1, y1] = a.data.split('/');
      const [d2, m2, y2] = b.data.split('/');
      return new Date(y1, m1 - 1, d1) - new Date(y2, m2 - 1, d2);
    })
  : [];
// Prepara dados do PieChart (porcentagem de cada marmita)
const dadosPie = (() => {
  if (!vendas) return [];

  const mapa = {};

  vendas.forEach(v => {
    const nome = v.nome_marmita || "Sem nome";
    const qtd = v.quantidade_vendida || 0;

    if (!mapa[nome]) mapa[nome] = 0;
    mapa[nome] += qtd;
  });
  

  return Object.keys(mapa).map(nome => ({
    name: nome,
    value: mapa[nome],
  }));
})();
const renderLabelInside = ({ percent }) => {
  return `${(percent * 100).toFixed(1)}%`;
};

const COLORS = [
  "#3b82f6", // azul
  "#10b981", // verde
  "#f59e0b", // amarelo
  "#ef4444", // vermelho
  "#8b5cf6", // roxo
  "#ec4899", // rosa
  "#14b8a6", // teal
  "#a855f7", // lilás
];

// Função para pegar o dia da semana em PT-BR
const diasSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

function getDiaSemana(dateStr) {
  const d = new Date(dateStr);
  return diasSemana[d.getDay()];
}

// Organizar vendas por dia da semana e por tipo de marmita
const mapaDias = {};

if (vendas) {
  vendas.forEach(v => {
    const dia = getDiaSemana(v.data);
    const marmita = v.nome_marmita || "Sem nome";
    const qtd = v.quantidade_vendida || 0;

    if (!mapaDias[dia]) mapaDias[dia] = {};
    mapaDias[dia][marmita] = (mapaDias[dia][marmita] || 0) + qtd;
  });
}

// Lista de todas marmitas (para gerar automaticamente as barras)
const tiposMarmita = Array.from(
  new Set(vendas?.map(v => v.nome_marmita || "Sem nome"))
);

// Montar dados para o gráfico
const dadosBarra = diasSemana.slice(1, 7).map(dia => { // Segunda → Sábado
  return {
    dia,
    ...(mapaDias[dia] || {})
  };
});


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
        {/* Gráfico Receita vs Data + Quantidade com dois eixos */}
<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-8">
  <h3 className="text-xl font-bold mb-6 text-gray-800">
    Receita & Quantidade Vendida por Data
  </h3>

  <ResponsiveContainer width="100%" height={350}>
    <LineChart data={dadosGrafico}>

      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="data" />
      
      {/* Eixo Y da Receita (esquerda) */}
      <YAxis
        yAxisId="left"
        orientation="left"
        stroke="#3b82f6"
      />

      {/* Eixo Y da Quantidade (direita) */}
      <YAxis
        yAxisId="right"
        orientation="right"
        stroke="#10b981"
      />

      <Tooltip />

      {/* Linha da Receita */}
      <Line
        yAxisId="left"
        type="monotone"
        dataKey="receita"
        stroke="#3b82f6"
        strokeWidth={3}
        name="Receita (R$)"
      />

      {/* Linha da Quantidade */}
      <Line
        yAxisId="right"
        type="monotone"
        dataKey="quantidade"
        stroke="#10b981"
        strokeWidth={3}
        name="Qtd Vendida"
      />

    </LineChart>
  </ResponsiveContainer>
</div>

{/* Pie Chart de Marmitas */}
<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-8">
  <h3 className="text-xl font-bold mb-6 text-gray-800">
    Participação por Tipo de Marmita (% de Vendas)
  </h3>

  <div className="w-full flex justify-center">
    <ResponsiveContainer width="90%" height={350}>
      <PieChart>
        <Pie
          data={dadosPie}
          dataKey="value"
          nameKey="name"
          outerRadius={120}
          label={renderLabelInside}     // porcentagem dentro da fatia
          labelLine={false}             // remove linha desnecessária
        >
          {dadosPie.map((entry, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>

        {/* Nomes das marmitas na legenda */}
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>
</div>

{/* Gráfico de Barras Empilhadas por Dia da Semana */}
<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-8">
  <h3 className="text-xl font-bold mb-6 text-gray-800">
    Vendas por Dia da Semana
  </h3>

  <ResponsiveContainer width="100%" height={380}>
    <BarChart data={dadosBarra}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="dia" />
      <YAxis />
      <Tooltip />
      <Legend />

      {tiposMarmita.map((marmita, index) => (
        <Bar
          key={marmita}
          dataKey={marmita}
          stackId="a"
          fill={COLORS[index % COLORS.length]}
        />
      ))}
    </BarChart>
  </ResponsiveContainer>
</div>


      </div>
    </div>
  );
}

export default Dashboard;