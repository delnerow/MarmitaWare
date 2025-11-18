import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { DollarSign, TrendingDown, TrendingUp, ShoppingCart } from "lucide-react";
import StatCard from './StatCard';
// import { formatDateBR } from '../utils'; // opcional: não usado (usamos função local)

// ---------- Helpers de data ----------
function parseDataISO(dateStr) {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return dateStr;

  // DD/MM/YYYY
  if (dateStr.includes("/")) {
    const [d, m, y] = dateStr.split("/");
    const dd = parseInt(d, 10), mm = parseInt(m, 10) - 1, yy = parseInt(y, 10);
    return new Date(yy, mm, dd);
  }

  // ISO com hora -> pegar só a parte da data para evitar offset UTC
  if (dateStr.includes("T")) {
    const [datePart] = dateStr.split("T");
    const [y, m, d] = datePart.split("-");
    return new Date(Number(y), Number(m) - 1, Number(d));
  }

  // YYYY-MM-DD -> criar local (evita problema UTC)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split("-");
    return new Date(Number(y), Number(m) - 1, Number(d));
  }

  // fallback
  const tryDate = new Date(dateStr);
  return isNaN(tryDate) ? null : tryDate;
}

function formatDateBRLocal(dateOrStr) {
  const d = dateOrStr instanceof Date ? dateOrStr : parseDataISO(dateOrStr);
  if (!d) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

// ---------- Filtro por período (usa data_de_venda) ----------
function filtrarPorPeriodo(vendas = [], filtro = "mes") {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  return (vendas || []).filter((v) => {
    const raw = v.data_de_venda || v.data || v.date;
    const data = parseDataISO(raw);
    if (!data || isNaN(data)) return false;
    data.setHours(0, 0, 0, 0);

    if (filtro === "semana") {
      const inicioSemana = new Date(hoje);
      inicioSemana.setDate(hoje.getDate() - hoje.getDay()); // domingo
      inicioSemana.setHours(0, 0, 0, 0);
      return data >= inicioSemana && data <= hoje;
    }

    if (filtro === "mes") {
      return data.getMonth() === hoje.getMonth() && data.getFullYear() === hoje.getFullYear();
    }

    if (filtro === "ano") {
      return data.getFullYear() === hoje.getFullYear();
    }

    return true;
  });
}

// ---------- Cores e label interno do pie ----------
const COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#ec4899", "#14b8a6", "#a855f7", "#f97316", "#06b6d4"
];

const renderLabelInside = ({ percent }) => `${(percent * 100).toFixed(1)}%`;

// ---------- Componente Dashboard ----------
export default function Dashboard({ relatorio = {}, vendas = [] }) {
  // estatísticas do relatório
  const totalVendas = relatorio?.vendas?.receita_total || 0;
  const custoEstimado = relatorio?.vendas?.custo_produtos_vendidos || 0;
  const lucro = relatorio?.lucro?.lucro_bruto || 0;
  const totalCompras = relatorio?.compras?.total_compras || 0;

  const [filtro, setFiltro] = useState("mes"); // 'semana' | 'mes' | 'ano'

  // vendas recentes (ordenadas por data_de_venda desc) — usa parseDataISO
  const vendasRecentes = useMemo(() => {
    return (vendas || [])
      .map(v => ({ ...v, _parsedDate: parseDataISO(v.data_de_venda || v.data) }))
      .filter(v => v._parsedDate && !isNaN(v._parsedDate))
      .sort((a, b) => b._parsedDate - a._parsedDate)
      .slice(0, 5);
  }, [vendas]);

  // vendas filtradas pelo período
  const vendasFiltradas = useMemo(() => filtrarPorPeriodo(vendas || [], filtro), [vendas, filtro]);

  // === dados para LineChart (receita e quantidade por data) ===
  const dadosGrafico = useMemo(() => {
    const mapa = {}; // agrupa por data (DD/MM/YYYY) para somar receitas/quantidades no mesmo dia

    (vendasFiltradas || []).forEach(v => {
      const dStr = formatDateBRLocal(parseDataISO(v.data_de_venda || v.data));
      if (!dStr) return;
      mapa[dStr] = mapa[dStr] || { data: dStr, receita: 0, quantidade: 0 };
      mapa[dStr].receita += Number(v.valor_total || 0);
      mapa[dStr].quantidade += Number(v.quantidade_vendida || 0);
    });

    return Object.values(mapa)
      .sort((a, b) => {
        const [dA, mA, yA] = a.data.split("/");
        const [dB, mB, yB] = b.data.split("/");
        return new Date(yA, mA - 1, dA) - new Date(yB, mB - 1, dB);
      });
  }, [vendasFiltradas]);

  // === dados para PieChart (participação por marmita) ===
  const dadosPie = useMemo(() => {
    const mapa = {};
    (vendasFiltradas || []).forEach(v => {
      const nome = v.nome_marmita || "Sem nome";
      const qtd = Number(v.quantidade_vendida || 0);
      mapa[nome] = (mapa[nome] || 0) + qtd;
    });
    return Object.keys(mapa).map((name) => ({ name, value: mapa[name] }));
  }, [vendasFiltradas]);

  // === dados para BarChart empilhado por dia da semana ===
  const { dadosBarra, tiposMarmita } = useMemo(() => {
    const dias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const mapa = {}; // mapa[dia][marmita] = qtd
    const tiposSet = new Set();

    (vendasFiltradas || []).forEach(v => {
      const date = parseDataISO(v.data_de_venda || v.data);
      if (!date) return;
      const dia = dias[date.getDay()];
      const tipo = v.nome_marmita || "Sem nome";
      const qtd = Number(v.quantidade_vendida || 0);
      tiposSet.add(tipo);
      if (!mapa[dia]) mapa[dia] = {};
      mapa[dia][tipo] = (mapa[dia][tipo] || 0) + qtd;
    });

    const tipos = Array.from(tiposSet);
    const data = dias.map(dia => ({ dia, ...(mapa[dia] || {}) }));
    return { dadosBarra: data, tiposMarmita: tipos };
  }, [vendasFiltradas]);

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
            value={`R$ ${Number(totalVendas || 0).toFixed(2)}`}
            icon={DollarSign}
            trend={12}
            color="#10b981"
          />
          <StatCard
            title="Custo Estimado"
            value={`R$ ${Number(custoEstimado || 0).toFixed(2)}`}
            icon={TrendingDown}
            color="#f59e0b"
          />
          <StatCard
            title="Lucro Líquido"
            value={`R$ ${Number(lucro || 0).toFixed(2)}`}
            icon={TrendingUp}
            trend={8}
            color="#3b82f6"
          />
          <StatCard
            title="Total Compras"
            value={`R$ ${Number(totalCompras || 0).toFixed(2)}`}
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
                <span className="font-bold text-green-600 text-lg">R$ {Number(totalVendas || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-orange-50 to-orange-50/50 rounded-xl border border-orange-100">
                <span className="font-semibold text-gray-700">Custos</span>
                <span className="font-bold text-orange-600 text-lg">R$ {Number(custoEstimado || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-5 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl border-2 border-blue-200 mt-4">
                <span className="font-bold text-gray-800 text-lg">Lucro Final</span>
                <span className="font-bold text-blue-600 text-2xl">R$ {Number(lucro || 0).toFixed(2)}</span>
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
                        <span>{formatDateBRLocal(venda.data_de_venda || venda.data)}</span>
                      </p>
                    </div>
                    <span className="font-bold text-green-600 text-lg ml-4">
                      R$ {(Number(venda.valor_total) || 0).toFixed(2)}
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

        {/* Filtros */}
        <div className="flex gap-3">
          <button
            onClick={() => setFiltro("semana")}
            className={`px-4 py-2 rounded-xl border ${filtro === "semana" ? "bg-blue-500 text-white" : "bg-white"}`}
          >
            Essa Semana
          </button>

          <button
            onClick={() => setFiltro("mes")}
            className={`px-4 py-2 rounded-xl border ${filtro === "mes" ? "bg-blue-500 text-white" : "bg-white"}`}
          >
            Esse Mês
          </button>

          <button
            onClick={() => setFiltro("ano")}
            className={`px-4 py-2 rounded-xl border ${filtro === "ano" ? "bg-blue-500 text-white" : "bg-white"}`}
          >
            Esse Ano
          </button>
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
              <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
              <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="receita" stroke="#3b82f6" strokeWidth={3} name="Receita (R$)" />
              <Line yAxisId="right" type="monotone" dataKey="quantidade" stroke="#10b981" strokeWidth={3} name="Qtd Vendida" />
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
                  innerRadius={50}
                  label={renderLabelInside}
                  labelLine={false}
                  minAngle={6}
                >
                  {dadosPie.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>

                <Tooltip formatter={(value) => [`${value}`, 'Qtd']} />
                <Legend verticalAlign="bottom" height={36} />
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
