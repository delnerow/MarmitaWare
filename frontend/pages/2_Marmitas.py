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
st.set_page_config(page_title="Marmitas", layout="wide")
st.title("🍲 Cadastro de Marmitas")
st.markdown("---")

# --- Formulário para Adicionar Marmita ---
with st.expander("➕ Adicionar Nova Marmita", expanded=False):
    with st.form("nova_marmita_form"):
        nome_marmita = st.text_input("Nome da Marmita (Ex: Frango com Brócolis)")
        preco_venda = st.number_input("Preço de Venda (R$)", min_value=0.01, step=0.50)
        
        # Seleção de ingredientes
        ingredientes_disponiveis = list(gerenciador.ingredientes.values())
        ingredientes_selecionados = st.multiselect(
            "Selecione os Ingredientes",
            options=ingredientes_disponiveis,
            format_func=lambda ing: f"ID {ing.ID}: {ing.nome}"
        )
        
        # Detalhamento de quantidades
        quantidades = {}
        if ingredientes_selecionados:
            st.write("Defina as quantidades (em gramas ou ml):")
            # Cria colunas para melhor layout
            cols = st.columns(len(ingredientes_selecionados))
            for i, ing in enumerate(ingredientes_selecionados):
                quantidades[ing.ID] = cols[i].number_input(
                    f"{ing.nome} (g/ml)", 
                    min_value=1, 
                    key=f"qtd_{ing.ID}"
                )
        
        submitted = st.form_submit_button("Salvar Marmita")
        if submitted:
            if not nome_marmita or not ingredientes_selecionados:
                st.warning("Nome e Ingredientes são obrigatórios.")
            else:
                try:
                    ids_ingredientes = [ing.ID for ing in ingredientes_selecionados]
                    gerenciador.CreateMarmita(
                        nome=nome_marmita,
                        preco_venda=preco_venda,
                        ingredientes_ids=ids_ingredientes,
                        quantidade_ingredientes=quantidades
                    )
                    st.success(f"Marmita '{nome_marmita}' salva com sucesso!")
                    st.session_state.gerenciador = GerenciadorApp() # Recarrega
                    st.rerun()
                except Exception as e:
                    st.error(f"Erro ao salvar marmita: {e}")

st.markdown("---")

# --- Tabela de Marmitas Existentes ---
st.header("Marmitas Cadastradas")
try:
    df_marmitas = gerenciador.GetMarmitasTable()
    if df_marmitas.empty:
        st.info("Nenhuma marmita cadastrada ainda.")
    else:
        st.dataframe(df_marmitas, use_container_width=True)
except Exception as e:
    st.error(f"Erro ao carregar tabela de marmitas: {e}")