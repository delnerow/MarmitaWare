# Dentro de pages/2_Marmitas.py
import streamlit as st
import pandas as pd
from gerenciadorAppMock import GerenciadorAppMock as GerenciadorApp

st.title("Aba de Marmitas")
gerenciador = GerenciadorApp()

# --- 1. Formulário para Adicionar Marmita [cite: 379] ---
with st.expander("Adicionar Nova Marmita"):
    with st.form("nova_marmita_form", clear_on_submit=True):
        nome = st.text_input("Nome da Marmita")
        preco = st.number_input("Preço de Venda (R$)", min_value=0.0, step=0.50)
        # Você pode adicionar um st.multiselect para os ingredientes
        ingredientes_mock = ["Frango (100g)", "Arroz (150g)", "Brócolis (50g)"]
        ingredientes = st.multiselect("Ingredientes", ingredientes_mock)

        submitted = st.form_submit_button("Salvar Marmita")
        if submitted:
            if gerenciador.CreateMarmita(nome, preco, ingredientes):
                st.success(f"Marmita '{nome}' salva com sucesso!")
            else:
                st.error("Erro ao salvar marmita.")

# --- 2. Lista de Marmitas Cadastradas [cite: 377] ---
st.header("Marmitas Cadastradas")
marmitas_data = gerenciador.GetMarmitasTable()

if not marmitas_data:
    st.warning("Nenhuma marmita cadastrada.")
else:
    # Usar Pandas para exibir uma tabela bonita
    df = pd.DataFrame(marmitas_data)
    st.dataframe(df, use_container_width=True)