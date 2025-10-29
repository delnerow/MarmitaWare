import sys
import os

# Adiciona o diretório raiz (MARMITAWARE) ao path do Python
# O comando 'os.path.dirname(__file__)' pega o diretório do arquivo atual (pages)
# '..' sobe um nível (para a raiz MARMITAWARE)
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# --- Agora o resto dos seus imports vem aqui ---
from classes.gerenciadorAppMock import GerenciadorAppMock as GerenciadorApp
import streamlit as st

st.title("Aba de Relatório")

# Inicializa o gerenciador (com dados falsos)
gerenciador = GerenciadorApp()

# Botão para gerar o relatório [cite: 209]
if st.button("Gerar Relatório"):
    # Pega os dados MOCK do gerenciador
    relatorio = gerenciador.GetRelatorio()

    st.header("Visão Geral Financeira")

    # O Dashboard com métricas [cite: 206]
    col1, col2, col3 = st.columns(3)
    col1.metric("Vendas Brutas", f"R$ {relatorio['total_vendas_bruto']:.2f}")
    col2.metric("Custos Totais", f"R$ {relatorio['total_custos']:.2f}")
    col3.metric("Lucro Líquido", f"R$ {relatorio['lucro_liquido']:.2f}")

    st.metric("Marmita mais vendida", relatorio['marmita_mais_vendida'])

    # Exemplo de gráfico de barras [cite: 206]
    st.subheader("Custos vs Vendas")
    chart_data = {'Tipo': ['Vendas', 'Custos'], 'Valor': [relatorio['total_vendas_bruto'], relatorio['total_custos']]}
    st.bar_chart(chart_data, x='Tipo', y='Valor')