import streamlit as st

st.set_page_config(
    page_title="MarmitaWare",
    layout="wide"
)

st.title("MarmitaWare - Gestão de Marmitas")
st.subheader("Bem-vindo ao seu sistema de gestão.")

st.info("Use o menu na lateral esquerda para navegar entre as seções de Compras, Marmitas, Vendas e Relatórios.")

# Aqui você pode até mostrar um resumo, se quiser
# from app_v2.classes.gerenciadorAppMock import GerenciadorAppMock as GerenciadorApp
# gerenciador = GerenciadorApp()
# relatorio = gerenciador.GetRelatorio()
# st.metric("Lucro Líquido (MOCK)", f"R$ {relatorio['lucro_liquido']}")