import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

function Marmitas({ marmitas, onAdd, onEdit, onDelete }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Cardápio de Marmitas</Text>
          <Text style={styles.subtitle}>Gerencie seus produtos e margens de lucro</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={onAdd}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Nova Marmita</Text>
        </TouchableOpacity>
      </View>

      {marmitas.length > 0 ? (
        <View style={styles.grid}>
          {marmitas.map(marmita => {
            const margem = marmita.preco_venda > 0
              ? ((1 - marmita.custo_estimado / marmita.preco_venda) * 100)
              : 0;
            
            return (
              <View key={marmita.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{marmita.nome}</Text>
                  <View style={styles.iconContainer}>
                    <Ionicons name="restaurant" size={20} color="#fff" />
                  </View>
                </View>

                <View style={styles.cardContent}>
                  <View style={styles.precoContainer}>
                    <Text style={styles.precoLabel}>Preço de Venda</Text>
                    <View style={styles.precoValueContainer}>
                      <Ionicons name="cash" size={20} color="#10b981" />
                      <Text style={styles.precoValue}>
                        R$ {marmita.preco_venda.toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Custo Estimado</Text>
                    <Text style={styles.custoValue}>
                      R$ {marmita.custo_estimado.toFixed(2)}
                    </Text>
                  </View>
                  
                  <View style={[styles.infoRow, styles.margemRow]}>
                    <Text style={styles.infoLabel}>Margem de Lucro</Text>
                    <View style={styles.margemContainer}>
                      <Ionicons 
                        name="trending-up" 
                        size={16} 
                        color={margem > 50 ? '#10b981' : margem > 30 ? '#3b82f6' : '#f59e0b'} 
                      />
                      <Text style={[
                        styles.margemValue,
                        { color: margem > 50 ? '#10b981' : margem > 30 ? '#3b82f6' : '#f59e0b' }
                      ]}>
                        {margem.toFixed(1)}%
                      </Text>
                    </View>
                  </View>

                  <View style={styles.ingredientesContainer}>
                    <Text style={styles.ingredientesLabel}>Ingredientes</Text>
                    <Text style={styles.ingredientesText}>
                      {marmita.ingredientes || 'Sem ingredientes cadastrados'}
                    </Text>
                  </View>

                  <View style={styles.actionsContainer}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.editButton]}
                      onPress={() => onEdit(marmita)}
                    >
                      <Ionicons name="pencil" size={16} color="#3b82f6" />
                      <Text style={styles.editButtonText}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => onDelete(marmita.id)}
                    >
                      <Ionicons name="trash" size={16} color="#ef4444" />
                      <Text style={styles.deleteButtonText}>Excluir</Text>
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
            <Ionicons name="restaurant-outline" size={48} color="#3b82f6" />
          </View>
          <Text style={styles.emptyTitle}>Nenhuma marmita cadastrada</Text>
          <Text style={styles.emptyText}>
            Comece adicionando sua primeira marmita ao cardápio e gerencie seu negócio de forma profissional!
          </Text>
          <TouchableOpacity style={styles.emptyButton} onPress={onAdd}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.emptyButtonText}>Adicionar Primeira Marmita</Text>
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
    backgroundColor: '#3b82f6',
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
  grid: {
    gap: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    backgroundColor: '#3b82f6',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  iconContainer: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  cardContent: {
    padding: 20,
    gap: 16,
  },
  precoContainer: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  precoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 8,
  },
  precoValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  precoValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  margemRow: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  custoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  margemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  margemValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  ingredientesContainer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  ingredientesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  ingredientesText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  editButton: {
    backgroundColor: '#eff6ff',
  },
  editButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
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
    backgroundColor: '#eff6ff',
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
    backgroundColor: '#3b82f6',
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

export default Marmitas;

