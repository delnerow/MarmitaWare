import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDateBR } from '../utils';

function Ingredientes({ ingredientes, onAdd, onEdit, onDelete }) {
  const totalIngredientes = ingredientes?.length || 0;
  const precoMedio = ingredientes?.length > 0 
    ? ingredientes.reduce((sum, ing) => sum + (Number(ing.preco_compra) || 0), 0) / ingredientes.length 
    : 0;

  const ingredientesOrdenados = ingredientes ? [...ingredientes].sort((a, b) => {
    const dateA = new Date(a.data_ultima_compra || '1900-01-01');
    const dateB = new Date(b.data_ultima_compra || '1900-01-01');
    return dateB - dateA;
  }) : [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Ingredientes</Text>
          <Text style={styles.subtitle}>Gerencie os ingredientes das suas marmitas</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={onAdd}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Novo Ingrediente</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: '#f0fdf4' }]}>
            <Ionicons name="leaf" size={24} color="#10b981" />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statLabel}>Total de Ingredientes</Text>
            <Text style={[styles.statValue, { color: '#10b981' }]}>{totalIngredientes}</Text>
            <Text style={styles.statSubtext}>itens cadastrados</Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: '#eff6ff' }]}>
            <Ionicons name="cash" size={24} color="#3b82f6" />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statLabel}>Preço Médio</Text>
            <Text style={[styles.statValue, { color: '#3b82f6' }]}>
              R$ {precoMedio.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {ingredientesOrdenados && ingredientesOrdenados.length > 0 ? (
        <View style={styles.tableContainer}>
          {ingredientesOrdenados.map((ingrediente, idx) => (
            <View key={idx} style={styles.tableRow}>
              <View style={styles.ingredienteIcon}>
                <Ionicons name="leaf" size={24} color="#10b981" />
              </View>
              <View style={styles.ingredienteContent}>
                <View style={styles.ingredienteHeader}>
                  <Text style={styles.ingredienteNome}>
                    {ingrediente.nome || 'Sem nome'}
                  </Text>
                  <View style={styles.dateContainer}>
                    <Ionicons name="calendar" size={14} color="#9ca3af" />
                    <Text style={styles.dateText}>
                      {formatDateBR(ingrediente.data_ultima_compra) || 'Não informado'}
                    </Text>
                  </View>
                </View>
                <View style={styles.ingredienteDetails}>
                  <View style={styles.precoBadge}>
                    <Text style={styles.precoText}>
                      R$ {(Number(ingrediente.preco_compra) || 0).toFixed(2)}
                    </Text>
                  </View>
                </View>
                <View style={styles.actionsContainer}>
                  <TouchableOpacity
                    style={styles.actionIcon}
                    onPress={() => onEdit(ingrediente)}
                  >
                    <Ionicons name="pencil" size={16} color="#3b82f6" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionIcon}
                    onPress={() => onDelete(ingrediente.id)}
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
            <Ionicons name="leaf-outline" size={48} color="#10b981" />
          </View>
          <Text style={styles.emptyTitle}>Nenhum ingrediente cadastrado</Text>
          <Text style={styles.emptyText}>
            Comece adicionando os ingredientes que você usa nas suas marmitas!
          </Text>
          <TouchableOpacity style={styles.emptyButton} onPress={onAdd}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.emptyButtonText}>Adicionar Primeiro Ingrediente</Text>
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
    fontSize: 24,
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
  ingredienteIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ingredienteContent: {
    flex: 1,
    gap: 8,
  },
  ingredienteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  ingredienteNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  ingredienteDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  precoBadge: {
    backgroundColor: '#f0fdf4',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  precoText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
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

export default Ingredientes;

