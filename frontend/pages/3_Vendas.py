import streamlit as st
import sys
import os
from datetime import date

# Adiciona a raiz do projeto (MarmitaWare) ao path do Python
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Garante que o gerenciador foi inicializado
if 'gerenciador' not in st.session_state or st.session_state.gerenciador is None:
    st.error("Gerenciador não inicializado. Por favor, acesse a página principal primeiro.")
    st.stop()

from classes.gerenciadorApp import GerenciadorApp

gerenciador: GerenciadorApp = st.session_state.gerenciador
st.set_page_config(page_title="Vendas", layout="wide")
st.title("💸 Registro de Vendas")
st.markdown("---")

# --- Formulário para Adicionar Venda ---
with st.expander("➕ Registrar Nova Venda", expanded=True):
    # Puxa as marmitas cadastradas
    marmitas_disponiveis = list(gerenciador.marmitas.values())
    
    if not marmitas_disponiveis:
        st.warning("Nenhuma marmita cadastrada. Vá para a aba 'Marmitas' para criar uma.")
    else:
        with st.form("nova_venda_form"):
            col1, col2, col3 = st.columns(3)
            
            marmita_selecionada = col1.selectbox(
                "Marmita Vendida",
                options=marmitas_disponiveis,
                format_func=lambda m: f"ID {m.ID}: {m.nome} (R$ {m.preco_venda:.2f})"
            )
            
            quantidade = col2.number_input("Quantidade", min_value=1, step=1, value=1)
            data_venda = col3.date_input("Data da Venda", date.today())
            
            submitted = st.form_submit_button("Registrar Venda")
            if submitted:
                try:
                    gerenciador.CreateVendas(
                        marmita_id=marmita_selecionada.ID,
                        quantidade=quantidade,
                        data=data_venda
                    )
                    total = marmita_selecionada.preco_venda * quantidade
                    st.success(f"Venda de {quantidade}x '{marmita_selecionada.nome}' (Total: R$ {total:.2f}) registrada!")
                    st.session_state.gerenciador = GerenciadorApp() # Recarrega
                    st.rerun()
                except Exception as e:
                    st.error(f"Erro ao registrar venda: {e}")

st.markdown("---")

# --- Tabela de Vendas Existentes ---
st.header("Histórico de Vendas")
try:
    df_vendas = gerenciador.GetVendasTable()
    if df_vendas.empty:
        st.info("Nenhuma venda registrada ainda.")
    else:
        st.dataframe(df_vendas, use_container_width=True)
except Exception as e:
    st.error(f"Erro ao carregar tabela de vendas: {e}")