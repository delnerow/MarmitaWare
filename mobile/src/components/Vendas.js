import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDateBR } from '../utils';

function Vendas({ vendas, onAdd, onEdit, onDelete }) {
  const totalVendido = vendas?.reduce((sum, v) => sum + (Number(v.valor_total) || 0), 0) || 0;
  const quantidadeTotal = vendas?.reduce((sum, v) => sum + (Number(v.quantidade_vendida) || 0), 0) || 0;
  const ticketMedio = vendas?.length > 0 ? totalVendido / vendas.length : 0;

  const vendasOrdenadas = vendas ? [...vendas].sort((a, b) => {
    const dateA = new Date(a.data || '1900-01-01');
    const dateB = new Date(b.data || '1900-01-01');
    return dateB - dateA;
  }) : [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Histórico de Vendas</Text>
          <Text style={styles.subtitle}>Gerencie e acompanhe todas as suas vendas</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={onAdd}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Nova Venda</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: '#f0fdf4' }]}>
            <Ionicons name="cash" size={24} color="#10b981" />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statLabel}>Total Vendido</Text>
            <Text style={[styles.statValue, { color: '#10b981' }]}>
              R$ {totalVendido.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: '#eff6ff' }]}>
            <Ionicons name="cube" size={24} color="#3b82f6" />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statLabel}>Quantidade Total</Text>
            <Text style={[styles.statValue, { color: '#3b82f6' }]}>{quantidadeTotal}</Text>
            <Text style={styles.statSubtext}>marmitas vendidas</Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: '#faf5ff' }]}>
            <Ionicons name="trending-up" size={24} color="#a855f7" />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statLabel}>Ticket Médio</Text>
            <Text style={[styles.statValue, { color: '#a855f7' }]}>
              R$ {ticketMedio.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {vendasOrdenadas && vendasOrdenadas.length > 0 ? (
        <View style={styles.tableContainer}>
          {vendasOrdenadas.map((venda, idx) => (
            <View key={idx} style={styles.tableRow}>
              <View style={styles.vendaIcon}>
                <Text style={styles.vendaEmoji}>🍱</Text>
              </View>
              <View style={styles.vendaContent}>
                <View style={styles.vendaHeader}>
                  <Text style={styles.vendaNome}>
                    {venda.nome_marmita || 'Sem nome'}
                  </Text>
                  <View style={styles.dateContainer}>
                    <Ionicons name="calendar" size={14} color="#9ca3af" />
                    <Text style={styles.dateText}>{formatDateBR(venda.data)}</Text>
                  </View>
                </View>
                <View style={styles.vendaDetails}>
                  <View style={styles.quantidadeBadge}>
                    <Text style={styles.quantidadeText}>
                      {venda.quantidade_vendida || 0}x
                    </Text>
                  </View>
                  <Text style={styles.valorText}>
                    R$ {(Number(venda.valor_total) || 0).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.actionsContainer}>
                  <TouchableOpacity
                    style={styles.actionIcon}
                    onPress={() => onEdit(venda)}
                  >
                    <Ionicons name="pencil" size={16} color="#3b82f6" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionIcon}
                    onPress={() => onDelete(venda.id)}
                  >
                    <Ionicons name="trash" size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="cash-outline" size={48} color="#10b981" />
          </View>
          <Text style={styles.emptyTitle}>Nenhuma venda registrada</Text>
          <Text style={styles.emptyText}>
            Comece registrando sua primeira venda e acompanhe o crescimento do seu negócio!
          </Text>
          <TouchableOpacity style={styles.emptyButton} onPress={onAdd}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.emptyButtonText}>Registrar Primeira Venda</Text>
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
    backgroundColor: '#10b981',
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
  vendaIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vendaEmoji: {
    fontSize: 24,
  },
  vendaContent: {
    flex: 1,
    gap: 8,
  },
  vendaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  vendaNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  vendaDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  quantidadeBadge: {
    backgroundColor: '#eff6ff',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  quantidadeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  valorText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10b981',
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
    backgroundColor: '#f0fdf4',
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
    backgroundColor: '#10b981',
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

export default Vendas;

