import streamlit as st
import sys
import os
from datetime import date

# Adiciona a raiz do projeto (MarmitaWare) ao path do Python
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Garante que o gerenciador foi inicializado na página principal
if 'gerenciador' not in st.session_state or st.session_state.gerenciador is None:
    st.error("Gerenciador não inicializado. Por favor, acesse a página principal primeiro.")
    st.stop()

from classes.gerenciadorApp import GerenciadorApp

gerenciador: GerenciadorApp = st.session_state.gerenciador
st.set_page_config(page_title="Compras", layout="wide")
st.title("🛒 Registro de Compras")
st.markdown("---")

# --- Formulário para Adicionar Compra ---
with st.expander("➕ Adicionar Nova Compra", expanded=False):
    with st.form("nova_compra_form"):
        data_compra = st.date_input("Data da Compra", date.today())
        valor_total = st.number_input("Valor Total Gasto (R$)", min_value=0.01, step=0.01)
        
        # Seleção de ingredientes
        ingredientes_disponiveis = list(gerenciador.ingredientes.values())
        ingredientes_comprados = st.multiselect(
            "Itens Comprados",
            options=ingredientes_disponiveis,
            format_func=lambda ing: f"ID {ing.ID}: {ing.nome}"
        )
        
        # Detalhamento de preços
        precos_ingredientes = {}
        if ingredientes_comprados:
            st.write("Detalhe o custo de cada item (para atualizar o preço):")
            cols = st.columns(len(ingredientes_comprados))
            for i, ing in enumerate(ingredientes_comprados):
                precos_ingredientes[ing.ID] = cols[i].number_input(
                    f"Custo - {ing.nome} (R$)", 
                    min_value=0.01, 
                    key=f"preco_{ing.ID}"
                )
        
        submitted = st.form_submit_button("Salvar Compra")
        if submitted:
            try:
                ids_ingredientes = [ing.ID for ing in ingredientes_comprados]
                gerenciador.CreateCompra(
                    data=data_compra,
                    valor_total=valor_total,
                    ingredientes_precos=precos_ingredientes
                )
                st.success(f"Compra de R$ {valor_total:.2f} registrada com sucesso!")
                # Força o recarregamento do gerenciador e da página
                st.session_state.gerenciador = GerenciadorApp() 
                st.rerun()
            except Exception as e:
                st.error(f"Erro ao salvar compra: {e}")

st.markdown("---")

# --- Tabela de Compras Existentes ---
st.header("Histórico de Compras")
try:
    df_compras = gerenciador.GetComprasTable()
    if df_compras.empty:
        st.info("Nenhuma compra registrada ainda.")
    else:
        st.dataframe(df_compras, use_container_width=True)
except Exception as e:
    st.error(f"Erro ao carregar tabela de compras: {e}")