import streamlit as st
import sys
import os

# Adiciona a raiz do projeto (MarmitaWare) ao path do Python
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

try:
    from classes.gerenciadorApp import GerenciadorApp
except ImportError:
    st.error("Erro ao importar o GerenciadorApp. Verifique se as classes e o `__init__.py` estão corretos.")
    st.stop()

# Configuração da Página
st.set_page_config(
    page_title="MarmitaWare",
    page_icon="🍲",
    layout="wide"
)

# --- Inicialização do Gerenciador no Estado da Sessão ---
# Isso é CRUCIAL. Garante que o GerenciadorApp seja criado
# apenas uma vez e persista entre as trocas de página.
if 'gerenciador' not in st.session_state:
    try:
        st.session_state.gerenciador = GerenciadorApp()
        st.toast("Gerenciador carregado com sucesso!")
    except Exception as e:
        st.session_state.gerenciador = None
        st.error(f"Falha ao carregar o GerenciadorApp: {e}")
        st.stop()

st.title("🍲 MarmitaWare")
st.subheader("Seu sistema de gestão de marmitas simples e eficiente.")
st.markdown("---")

st.info("Use o menu na barra lateral à esquerda para navegar entre as seções.")

st.markdown(
    """
    ### 📋 Funcionalidades:
    * **Relatório:** Visualize um dashboard financeiro.
    * **Marmitas:** Cadastre suas receitas e preços de venda.
    * **Vendas:** Registre as vendas diárias.
    * **Compras:** Registre suas compras de ingredientes.
    """
)