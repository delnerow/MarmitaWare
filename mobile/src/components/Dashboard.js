import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LineChart, PieChart, BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import StatCard from './StatCard';

const screenWidth = Dimensions.get('window').width;

// Helpers de data
function parseDataISO(dateStr) {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return dateStr;

  if (dateStr.includes("/")) {
    const [d, m, y] = dateStr.split("/");
    const dd = parseInt(d, 10), mm = parseInt(m, 10) - 1, yy = parseInt(y, 10);
    return new Date(yy, mm, dd);
  }

  if (dateStr.includes("T")) {
    const [datePart] = dateStr.split("T");
    const [y, m, d] = datePart.split("-");
    return new Date(Number(y), Number(m) - 1, Number(d));
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split("-");
    return new Date(Number(y), Number(m) - 1, Number(d));
  }

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
      inicioSemana.setDate(hoje.getDate() - hoje.getDay());
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

const COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#ec4899", "#14b8a6", "#a855f7", "#f97316", "#06b6d4"
];

export default function Dashboard({ relatorio = {}, vendas = [] }) {
  const totalVendas = relatorio?.vendas?.receita_total || 0;
  const custoEstimado = relatorio?.vendas?.custo_produtos_vendidos || 0;
  const lucro = relatorio?.lucro?.lucro_bruto || 0;
  const totalCompras = relatorio?.compras?.total_compras || 0;

  const [filtro, setFiltro] = useState("mes");

  const vendasRecentes = useMemo(() => {
    return (vendas || [])
      .map(v => ({ ...v, _parsedDate: parseDataISO(v.data_de_venda || v.data) }))
      .filter(v => v._parsedDate && !isNaN(v._parsedDate))
      .sort((a, b) => b._parsedDate - a._parsedDate)
      .slice(0, 5);
  }, [vendas]);

  const vendasFiltradas = useMemo(() => filtrarPorPeriodo(vendas || [], filtro), [vendas, filtro]);

  const dadosGrafico = useMemo(() => {
    const mapa = {};

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

  // Coletar todos os tipos únicos de marmita de todos os gráficos
  const todasMarmitas = useMemo(() => {
    const set = new Set();
    dadosPie.forEach(item => set.add(item.name));
    tiposMarmita.forEach(marmita => set.add(marmita));
    return Array.from(set).sort();
  }, [dadosPie, tiposMarmita]);

  // Função para obter cor consistente para cada tipo de marmita
  const getColorForMarmita = (marmitaNome) => {
    const index = todasMarmitas.indexOf(marmitaNome);
    return index >= 0 ? COLORS[index % COLORS.length] : COLORS[0];
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#3b82f6"
    }
  };

  // Calcular porcentagens para exibir no gráfico
  const totalPie = dadosPie.reduce((sum, item) => sum + item.value, 0);
  const pieData = dadosPie.map((item) => {
    const porcentagem = totalPie > 0 ? ((item.value / totalPie) * 100).toFixed(1) : 0;
    return {
      name: item.name,
      value: item.value,
      porcentagem: porcentagem,
      color: getColorForMarmita(item.name),
      legendFontColor: '#7F7F7F',
      legendFontSize: 12
    };
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard Financeiro</Text>
        <Text style={styles.subtitle}>Visão geral do seu negócio</Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          title="Total em Vendas"
          value={`R$ ${Number(totalVendas || 0).toFixed(2)}`}
          iconName="cash"
          trend={12}
          color="#10b981"
        />
        <StatCard
          title="Custo Estimado"
          value={`R$ ${Number(custoEstimado || 0).toFixed(2)}`}
          iconName="trending-down"
          color="#f59e0b"
        />
        <StatCard
          title="Lucro Líquido"
          value={`R$ ${Number(lucro || 0).toFixed(2)}`}
          iconName="trending-up"
          trend={8}
          color="#3b82f6"
        />
        <StatCard
          title="Total Compras"
          value={`R$ ${Number(totalCompras || 0).toFixed(2)}`}
          iconName="cart"
          color="#ef4444"
        />
      </View>

      <View style={styles.resumoContainer}>
        <View style={styles.resumoCard}>
          <Text style={styles.resumoTitle}>Resumo Financeiro</Text>
          <View style={styles.resumoContent}>
            <View style={styles.resumoItemBoxGreen}>
              <Text style={styles.resumoLabelBox}>Receita Bruta</Text>
              <Text style={styles.resumoValueBoxGreen}>
                R$ {Number(totalVendas || 0).toFixed(2)}
              </Text>
            </View>
            <View style={styles.resumoItemBoxOrange}>
              <Text style={styles.resumoLabelBox}>Custos</Text>
              <Text style={styles.resumoValueBoxOrange}>
                R$ {Number(custoEstimado || 0).toFixed(2)}
              </Text>
            </View>
            <View style={styles.resumoItemBoxBlue}>
              <Text style={styles.resumoLabelBoxFinal}>Lucro Final</Text>
              <Text style={styles.resumoValueBoxBlue}>
                R$ {Number(lucro || 0).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.vendasRecentesCard}>
          <Text style={styles.resumoTitle}>Vendas Recentes</Text>
          {vendasRecentes && vendasRecentes.length > 0 ? (
            vendasRecentes.map((venda, idx) => (
              <View key={idx} style={styles.vendaItem}>
                <View style={styles.vendaInfo}>
                  <Text style={styles.vendaNome}>{venda.nome_marmita || 'Sem nome'}</Text>
                  <Text style={styles.vendaDetalhes}>
                    {venda.quantidade_vendida || 0}x • {formatDateBRLocal(venda.data_de_venda || venda.data)}
                  </Text>
                </View>
                <Text style={styles.vendaValor}>
                  R$ {(Number(venda.valor_total) || 0).toFixed(2)}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Nenhuma venda registrada ainda</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.filtrosContainer}>
        <TouchableOpacity
          style={[styles.filtroButton, filtro === "semana" && styles.filtroButtonActive]}
          onPress={() => setFiltro("semana")}
        >
          <Text style={[styles.filtroText, filtro === "semana" && styles.filtroTextActive]}>
            Essa Semana
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filtroButton, filtro === "mes" && styles.filtroButtonActive]}
          onPress={() => setFiltro("mes")}
        >
          <Text style={[styles.filtroText, filtro === "mes" && styles.filtroTextActive]}>
            Esse Mês
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filtroButton, filtro === "ano" && styles.filtroButtonActive]}
          onPress={() => setFiltro("ano")}
        >
          <Text style={[styles.filtroText, filtro === "ano" && styles.filtroTextActive]}>
            Esse Ano
          </Text>
        </TouchableOpacity>
      </View>

      {dadosGrafico.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Receita por Data</Text>
          <LineChart
            data={{
              labels: dadosGrafico.map(d => d.data.split('/')[0] + '/' + d.data.split('/')[1]),
              datasets: [{
                data: dadosGrafico.map(d => d.receita)
              }]
            }}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>
      )}

      {pieData.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Participação por Tipo de Marmita (% de Vendas)</Text>
          <View style={styles.pieChartWrapper}>
            <View style={styles.pieChartInner}>
              <PieChart
                data={pieData}
                width={screenWidth - 40}
                height={280}
                chartConfig={chartConfig}
                accessor="value"
                backgroundColor="transparent"
                paddingLeft={Math.max(0, (screenWidth - 40 - 280) / 2 + 40)}
                hasLegend={false}
              />
            </View>
            {/* Legenda customizada abaixo do gráfico */}
            <View style={styles.pieLegendContainer}>
              {pieData.map((item, index) => {
                return (
                  <View key={index} style={styles.pieLegendItem}>
                    <View style={[styles.pieLegendColor, { backgroundColor: item.color }]} />
                    <Text style={styles.pieLegendText} numberOfLines={1}>
                      {item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name}
                    </Text>
                    <Text style={styles.pieLegendPercent}>{item.porcentagem}%</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      )}

      {/* Gráfico de Barras Empilhadas por Dia da Semana */}
      {dadosBarra.length > 0 && tiposMarmita.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Vendas por Dia da Semana</Text>
          <View style={styles.barChartWrapper}>
            {dadosBarra.map((diaData, diaIndex) => {
              const totalDia = tiposMarmita.reduce((sum, marmita) => sum + (diaData[marmita] || 0), 0);
              if (totalDia === 0) return null;
              
              return (
                <View key={diaIndex} style={styles.barRow}>
                  <Text style={styles.barLabel}>{diaData.dia}</Text>
                  <View style={styles.barContainer}>
                    {tiposMarmita.map((marmita, marmitaIndex) => {
                      const valor = diaData[marmita] || 0;
                      const porcentagem = totalDia > 0 ? (valor / totalDia) * 100 : 0;
                      if (valor === 0) return null;
                      
                      return (
                        <View
                          key={marmitaIndex}
                          style={[
                            styles.barSegment,
                            {
                              width: `${porcentagem}%`,
                              backgroundColor: getColorForMarmita(marmita),
                            }
                          ]}
                        />
                      );
                    })}
                  </View>
                  <Text style={styles.barValue}>{totalDia}</Text>
                </View>
              );
            })}
          </View>
          {/* Legenda */}
          <View style={styles.pieLegendContainer}>
            {tiposMarmita.map((marmita, index) => {
              // Calcular total de vendas dessa marmita em todos os dias
              const totalMarmita = dadosBarra.reduce((sum, dia) => sum + (dia[marmita] || 0), 0);
              
              return (
                <View key={index} style={styles.pieLegendItem}>
                  <View style={[styles.pieLegendColor, { backgroundColor: getColorForMarmita(marmita) }]} />
                  <Text style={styles.pieLegendText} numberOfLines={1}>
                    {marmita.length > 20 ? marmita.substring(0, 20) + '...' : marmita}
                  </Text>
                  <Text style={styles.pieLegendPercent}>{totalMarmita}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  statsGrid: {
    marginBottom: 24,
  },
  resumoContainer: {
    marginBottom: 24,
    gap: 16,
  },
  resumoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  resumoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  resumoContent: {
    gap: 12,
  },
  resumoItemBoxGreen: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(240, 253, 244, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  resumoItemBoxOrange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 247, 237, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  resumoItemBoxBlue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(239, 246, 255, 0.9)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#bfdbfe',
    marginTop: 8,
  },
  resumoLabelBox: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  resumoLabelBoxFinal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  resumoValueBoxGreen: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
  },
  resumoValueBoxOrange: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  resumoValueBoxBlue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  vendasRecentesCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  vendaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  vendaInfo: {
    flex: 1,
  },
  vendaNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  vendaDetalhes: {
    fontSize: 14,
    color: '#6b7280',
  },
  vendaValor: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
  filtrosContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  filtroButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  filtroButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filtroText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  filtroTextActive: {
    color: '#fff',
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
  },
  barChartWrapper: {
    marginTop: 16,
    gap: 12,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barLabel: {
    width: 40,
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  barContainer: {
    flex: 1,
    height: 32,
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
  },
  barSegment: {
    height: '100%',
  },
  barValue: {
    width: 40,
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'right',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#6b7280',
    maxWidth: 100,
  },
  pieChartWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieChartInner: {
    alignItems: 'center',
    justifyContent: 'center',
    width: screenWidth - 40,
    overflow: 'hidden',
  },
  pieLegendContainer: {
    width: '100%',
    marginTop: 16,
    gap: 8,
  },
  pieLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 12,
  },
  pieLegendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  pieLegendText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  pieLegendPercent: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
    minWidth: 50,
    textAlign: 'right',
  },
});

