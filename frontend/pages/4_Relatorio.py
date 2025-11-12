import streamlit as st
import sys
import os

# Adiciona a raiz do projeto (MarmitaWare) ao path do Python
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Garante que o gerenciador foi inicializado
if 'gerenciador' not in st.session_state or st.session_state.gerenciador is None:
    st.error("Gerenciador não inicializado. Por favor, acesse a página principal primeiro.")
    st.stop()

from classes.gerenciadorApp import GerenciadorApp

gerenciador: GerenciadorApp = st.session_state.gerenciador
st.set_page_config(page_title="Relatório", layout="wide")
st.title("📊 Relatório e Dashboard")
st.markdown("---")

# --- Carregamento dos Dados ---
try:
    relatorio = gerenciador.GetRelatorio()
    vendas_bruto = relatorio.get('total_vendas_bruto', 0)
    custo_estimado = relatorio.get('total_custo_estimado', 0)
    lucro_estimado = relatorio.get('lucro_liquido_estimado', 0)
    total_compras = relatorio.get('total_compras', 0)

    st.header("Visão Geral Financeira (Estimada)")
    
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Total Vendas (Bruto)", f"R$ {vendas_bruto:.2f}")
    col2.metric("Total Custo (Estimado)", f"R$ {custo_estimado:.2f}", 
                 delta_color="inverse", help="Custo estimado das marmitas vendidas.")
    col3.metric("Lucro (Estimado)", f"R$ {lucro_estimado:.2f}",
                 help="Vendas Brutas - Custo Estimado")
    col4.metric("Total Gasto (Compras)", f"R$ {total_compras:.2f}", 
                 delta_color="inverse", help="Valor total gasto em compras de ingredientes.")
    
    st.markdown("---")
    
    # --- Gráficos ---
    st.header("Visualizações")
    
    col_a, col_b = st.columns(2)
    
    with col_a:
        st.subheader("Vendas vs Custos")
        if vendas_bruto > 0 or custo_estimado > 0:
            chart_data = {'Tipo': ['Vendas Brutas', 'Custo Estimado'], 
                          'Valor': [vendas_bruto, custo_estimado]}
            st.bar_chart(chart_data, x='Tipo', y='Valor', color=["#00B084", "#FF4B4B"])
        else:
            st.info("Sem dados de vendas ou custos para exibir.")
            
    with col_b:
        st.subheader("Análise de Despesas")
        if total_compras > 0 or custo_estimado > 0:
            pie_data = {'Tipo': ['Compras Registradas', 'Custo Estimado (Vendido)'], 
                        'Valor': [total_compras, custo_estimado]}
            st.bar_chart(pie_data, x='Tipo', y='Valor')
        else:
            st.info("Sem dados de compras ou custos para exibir.")

except Exception as e:
    st.error(f"Erro ao gerar relatório: {e}")