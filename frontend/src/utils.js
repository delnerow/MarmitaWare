// src/utils.js - Funções utilitárias

/**
 * Formata data para padrão brasileiro DD/MM/YYYY
 * @param {string|Date} dateStr - Data em formato ISO ou objeto Date
 * @returns {string} Data formatada ou string vazia
 */
export function formatDateBR(dateStr) {
  if (!dateStr) return '';
  
  try {
    // Se já está no formato DD/MM/YYYY, retorna como está
    if (typeof dateStr === 'string' && dateStr.includes('/')) {
      return dateStr;
    }
    
    // Converte para Date
    const date = new Date(dateStr + 'T00:00:00');
    
    // Verifica se é uma data válida
    if (isNaN(date.getTime())) return '';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return '';
  }
}

/**
 * Formata valor monetário para padrão brasileiro
 * @param {number} value - Valor numérico
 * @returns {string} Valor formatado
 */
export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0);
}

/**
 * Ordena array por data (mais recente primeiro)
 * @param {Array} array - Array com objetos contendo campo 'data'
 * @returns {Array} Array ordenado
 */
export function sortByDateDesc(array) {
  return [...array].sort((a, b) => {
    const dateA = new Date(a.data || a.data_de_venda || a.data_ultima_compra || 0);
    const dateB = new Date(b.data || b.data_de_venda || b.data_ultima_compra || 0);
    return dateB - dateA; // Ordem decrescente (mais recente primeiro)
  });
}