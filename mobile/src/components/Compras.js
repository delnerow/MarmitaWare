import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDateBR } from '../utils';

function Compras({ compras, onAdd, onEdit, onDelete }) {
  const totalGasto = compras?.reduce((sum, c) => {
    const valor = Number(c.valor_total) || Number(c['valor total']) || 0;
    return sum + valor;
  }, 0) || 0;
  
  const numeroCompras = compras?.length || 0;
  const ticketMedio = numeroCompras > 0 ? totalGasto / numeroCompras : 0;

  const comprasOrdenadas = compras ? [...compras].sort((a, b) => {
    const dateA = new Date(a.data || '1900-01-01');
    const dateB = new Date(b.data || '1900-01-01');
    return dateB - dateA;
  }) : [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Histórico de Compras</Text>
          <Text style={styles.subtitle}>Controle de aquisição de ingredientes e insumos</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={onAdd}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Nova Compra</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: '#fff7ed' }]}>
            <Ionicons name="cart" size={24} color="#f97316" />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statLabel}>Total Investido</Text>
            <Text style={[styles.statValue, { color: '#f97316' }]}>
              R$ {totalGasto.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: '#faf5ff' }]}>
            <Ionicons name="cube" size={24} color="#a855f7" />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statLabel}>Número de Compras</Text>
            <Text style={[styles.statValue, { color: '#a855f7' }]}>{numeroCompras}</Text>
            <Text style={styles.statSubtext}>compras registradas</Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: '#fdf2f8' }]}>
            <Ionicons name="trending-up" size={24} color="#ec4899" />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statLabel}>Ticket Médio</Text>
            <Text style={[styles.statValue, { color: '#ec4899' }]}>
              R$ {ticketMedio.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {comprasOrdenadas && comprasOrdenadas.length > 0 ? (
        <View style={styles.tableContainer}>
          {comprasOrdenadas.map((compra, idx) => {
            const valorTotal = Number(compra.valor_total) || Number(compra['valor total']) || 0;
            const ingredientes = compra.ingredientes_comprados || compra['ingredientes comprados'] || 'Sem descrição';
            
            return (
              <View key={idx} style={styles.tableRow}>
                <View style={styles.compraIcon}>
                  <Ionicons name="cart" size={24} color="#f97316" />
                </View>
                <View style={styles.compraContent}>
                  <View style={styles.compraHeader}>
                    <Text style={styles.compraData}>
                      {formatDateBR(compra.data)}
                    </Text>
                    <Text style={styles.valorText}>
                      R$ {valorTotal.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.compraDetails}>
                    <View style={styles.ingredientesContainer}>
                      <Ionicons name="cube" size={14} color="#9ca3af" />
                      <Text style={styles.ingredientesText} numberOfLines={2}>
                        {ingredientes}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.actionsContainer}>
                    <TouchableOpacity
                      style={styles.actionIcon}
                      onPress={() => onEdit(compra)}
                    >
                      <Ionicons name="pencil" size={16} color="#3b82f6" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionIcon}
                      onPress={() => onDelete(compra.id)}
                    >
                      <Ionicons name="trash" size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="cart-outline" size={48} color="#f97316" />
          </View>
          <Text style={styles.emptyTitle}>Nenhuma compra registrada</Text>
          <Text style={styles.emptyText}>
            Comece registrando sua primeira compra de insumos e mantenha o controle do seu estoque!
          </Text>
          <TouchableOpacity style={styles.emptyButton} onPress={onAdd}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.emptyButtonText}>Registrar Primeira Compra</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f97316',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statSubtext: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 2,
  },
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    alignItems: 'flex-start',
    gap: 12,
  },
  compraIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#fff7ed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compraContent: {
    flex: 1,
    gap: 8,
  },
  compraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  compraData: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  compraDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ingredientesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    minWidth: 120,
  },
  ingredientesText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  valorText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f97316',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  actionIcon: {
    padding: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#fff7ed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f97316',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Compras;

