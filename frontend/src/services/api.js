// src/services/api.js - Serviço completo para comunicação com o backend

import axios from 'axios';

const API_BASE_URL = '/api';

// Cria instância do axios com configuração base
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============= INGREDIENTES =============

export const ingredientesAPI = {
  // Listar todos os ingredientes
  getAll: async () => {
    const response = await api.get('/ingredientes');
    return response.data;
  },
  
  // Buscar ingrediente específico
  getById: async (id) => {
    const response = await api.get(`/ingredientes/${id}`);
    return response.data;
  },
  
  // Criar novo ingrediente
  create: async (data) => {
    // Formato: { nome: string, preco_compra: number, id_unidade?: number }
    const response = await api.post('/ingredientes', data);
    return response.data;
  },
  
  // Atualizar ingrediente
  update: async (id, data) => {
    // Formato: { nome?: string, preco_compra?: number, data_ultima_compra?: string, id_unidade?: number }
    const response = await api.put(`/ingredientes/${id}`, data);
    return response.data;
  },
  
  // Deletar ingrediente
  delete: async (id) => {
    const response = await api.delete(`/ingredientes/${id}`);
    return response.data;
  }
};

// ============= MARMITAS =============

export const marmitasAPI = {
  // Listar todas as marmitas
  getAll: async () => {
    const response = await api.get('/marmitas');
    return response.data;
  },
  
  // Buscar marmita específica
  getById: async (id) => {
    const response = await api.get(`/marmitas/${id}`);
    return response.data;
  },
  
  // Criar nova marmita
  create: async (data) => {
    // Formato esperado pela API:
    // {
    //   nome: "Frango com Brócolis",
    //   preco_venda: 15.00,
    //   ingredientes_quantidades: {
    //     1: 0.15,  // id_ingrediente: quantidade
    //     2: 0.10
    //   }
    // }
    const response = await api.post('/marmitas', data);
    return response.data;
  },
  
  // Atualizar marmita
  update: async (id, data) => {
    // Formato: { nome?: string, preco_venda?: number, ingredientes_quantidades?: object }
    const response = await api.put(`/marmitas/${id}`, data);
    return response.data;
  },
  
  // Deletar marmita
  delete: async (id) => {
    const response = await api.delete(`/marmitas/${id}`);
    return response.data;
  }
};

// ============= VENDAS =============

export const vendasAPI = {
  // Listar todas as vendas
  getAll: async () => {
    const response = await api.get('/vendas');
    return response.data;
  },
  
  // Buscar venda específica
  getById: async (id) => {
    const response = await api.get(`/vendas/${id}`);
    return response.data;
  },
  
  // Criar nova venda
  create: async (data) => {
    // Formato esperado:
    // {
    //   marmita_id: 1,
    //   quantidade: 2,
    //   data: "2025-11-16"
    // }
    const response = await api.post('/vendas', data);
    return response.data;
  },
  
  // Atualizar venda
  update: async (id, data) => {
    // Formato: { marmita_id?: number, quantidade?: number, data?: string }
    const response = await api.put(`/vendas/${id}`, data);
    return response.data;
  },
  
  // Deletar venda
  delete: async (id) => {
    const response = await api.delete(`/vendas/${id}`);
    return response.data;
  }
};

// ============= COMPRAS =============

export const comprasAPI = {
  // Listar todas as compras
  getAll: async () => {
    const response = await api.get('/compras');
    return response.data;
  },
  
  // Buscar compra específica
  getById: async (id) => {
    const response = await api.get(`/compras/${id}`);
    return response.data;
  },
  
  // Criar nova compra
  create: async (data) => {
    // Formato esperado:
    // {
    //   valor_total: 150.00,
    //   data: "2025-11-16",
    //   ingredientes_precos: {
    //     1: 25.00,  // id_ingrediente: preco
    //     2: 8.00
    //   }
    // }
    const response = await api.post('/compras', data);
    return response.data;
  },
  
  // Atualizar compra
  update: async (id, data) => {
    // Formato: { valor_total?: number, data?: string, ingredientes_precos?: object }
    const response = await api.put(`/compras/${id}`, data);
    return response.data;
  },
  
  // Deletar compra
  delete: async (id) => {
    const response = await api.delete(`/compras/${id}`);
    return response.data;
  }
};

// ============= RELATÓRIO =============

export const relatorioAPI = {
  // Buscar relatório (com filtros opcionais)
  get: async (dataInicio = null, dataFim = null) => {
    let url = '/relatorio';
    const params = [];
    
    if (dataInicio) {
      params.push(`data_inicio=${dataInicio}`);
    }
    if (dataFim) {
      params.push(`data_fim=${dataFim}`);
    }
    
    if (params.length > 0) {
      url += '?' + params.join('&');
    }
    
    const response = await api.get(url);
    return response.data;
  }
};

// ============= HEALTH CHECK =============

export const healthAPI = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  }
};

// ============= TRATAMENTO DE ERROS =============

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Servidor respondeu com erro
      console.error('Erro na API:', error.response.data);
      throw new Error(error.response.data.error || 'Erro ao processar requisição');
    } else if (error.request) {
      // Requisição foi feita mas sem resposta
      console.error('Sem resposta do servidor:', error.request);
      throw new Error('Servidor não está respondendo. Verifique se a API está rodando em http://localhost:5000');
    } else {
      // Erro na configuração da requisição
      console.error('Erro:', error.message);
      throw error;
    }
  }
);

// ============= HELPER FUNCTIONS =============

// Função auxiliar para formatar data no padrão brasileiro
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

// Função auxiliar para formatar moeda
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Função auxiliar para converter data do input para formato da API
export const dateToAPI = (dateString) => {
  // Converte de YYYY-MM-DD para o formato esperado pela API
  return dateString;
};

// Função auxiliar para converter data da API para input
export const dateFromAPI = (dateString) => {
  if (!dateString) return '';
  return dateString.split('T')[0]; // Pega só a parte da data
};

export default api;