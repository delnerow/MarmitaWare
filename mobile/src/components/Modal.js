import React, { useState, useEffect } from 'react';
import { 
  Modal as RNModal, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

const screenHeight = Dimensions.get('window').height;

function Modal({ type, data, editingItem, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    nome: '',
    preco_venda: '',
    preco_compra: '',
    quantidade: '1',
    data: new Date().toISOString().split('T')[0],
    valor_total: '',
    marmita_id: data?.marmitas?.[0]?.id?.toString() || '',
    ingredientes_quantidades: {}
  });

  const [loading, setLoading] = useState(false);
  const [selectedIngrediente, setSelectedIngrediente] = useState('');
  const [quantidadeInput, setQuantidadeInput] = useState('');
  const [precoInput, setPrecoInput] = useState('');
  const [showIngredientePicker, setShowIngredientePicker] = useState(false);
  const [showMarmitaPicker, setShowMarmitaPicker] = useState(false);
  const [showIngredientePickerCompra, setShowIngredientePickerCompra] = useState(false);

  useEffect(() => {
    if (editingItem) {
      if (type === 'marmita') {
        setFormData({
          ...formData,
          nome: editingItem.nome || '',
          preco_venda: editingItem.preco_venda?.toString() || '',
          ingredientes_quantidades: editingItem.quantidade_ingredientes || {}
        });
      } else if (type === 'venda') {
        const vendaId = editingItem.id_venda || editingItem.id;
        const marmitaId = editingItem.id_marmita || '';
        const quantidade = editingItem.quantidade_vendida || 1;
        const dataVenda = editingItem.data_de_venda || editingItem.data || new Date().toISOString().split('T')[0];
        
        setFormData({
          ...formData,
          id: vendaId,
          marmita_id: marmitaId.toString(),
          quantidade: quantidade.toString(),
          data: dataVenda
        });
      } else if (type === 'compra') {
        const compraId = editingItem.id_compra || editingItem.id;
        const valorTotal = editingItem.valor_total || editingItem['valor total'] || '';
        const dataCompra = editingItem.data_de_compra || editingItem.data || new Date().toISOString().split('T')[0];
        const precoIngredientes = editingItem.preco_ingredientes || {};
        
        setFormData({
          ...formData,
          id: compraId,
          valor_total: valorTotal.toString(),
          data: dataCompra,
          ingredientes_quantidades: precoIngredientes
        });
      } else if (type === 'ingrediente') {
        setFormData({
          ...formData,
          nome: editingItem.nome || '',
          preco_compra: editingItem.preco_compra?.toString() || ''
        });
      }
    }
  }, [editingItem, type]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let submitData = {};

      if (type === 'ingrediente') {
        if (!formData.nome || !formData.preco_compra) {
          Alert.alert('Erro', 'Nome e preço são obrigatórios');
          setLoading(false);
          return;
        }
        submitData = {
          nome: formData.nome,
          preco_compra: parseFloat(formData.preco_compra),
          id_unidade: 1
        };
      } else if (type === 'marmita') {
        if (!formData.nome || !formData.preco_venda) {
          Alert.alert('Erro', 'Nome e preço são obrigatórios');
          setLoading(false);
          return;
        }
        
        const ingredientesQuantidades = {};
        Object.entries(formData.ingredientes_quantidades).forEach(([key, value]) => {
          ingredientesQuantidades[parseInt(key)] = parseFloat(value);
        });
        
        submitData = {
          nome: formData.nome,
          preco_venda: parseFloat(formData.preco_venda),
          ingredientes_quantidades: ingredientesQuantidades
        };
      } else if (type === 'venda') {
        if (!formData.marmita_id) {
          Alert.alert('Erro', 'Selecione uma marmita');
          setLoading(false);
          return;
        }
        submitData = {
          marmita_id: parseInt(formData.marmita_id),
          quantidade: parseInt(formData.quantidade),
          data: formData.data
        };
      } else if (type === 'compra') {
        if (!formData.valor_total) {
          Alert.alert('Erro', 'Valor total é obrigatório');
          setLoading(false);
          return;
        }
        
        const ingredientesPrecos = {};
        Object.entries(formData.ingredientes_quantidades).forEach(([key, value]) => {
          ingredientesPrecos[parseInt(key)] = parseFloat(value);
        });
        
        if (Object.keys(ingredientesPrecos).length === 0) {
          Alert.alert('Erro', 'Adicione pelo menos um ingrediente à compra');
          setLoading(false);
          return;
        }
        
        submitData = {
          valor_total: parseFloat(formData.valor_total),
          data: formData.data,
          ingredientes_precos: ingredientesPrecos
        };
      }

      await onSubmit(submitData);
    } catch (error) {
      console.error('Erro no submit:', error);
      Alert.alert('Erro', 'Erro ao salvar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const addIngrediente = () => {
    if (type === 'marmita' && selectedIngrediente && quantidadeInput) {
      setFormData({
        ...formData,
        ingredientes_quantidades: {
          ...formData.ingredientes_quantidades,
          [selectedIngrediente]: parseFloat(quantidadeInput)
        }
      });
      setSelectedIngrediente('');
      setQuantidadeInput('');
    } else if (type === 'compra' && selectedIngrediente && precoInput) {
      setFormData({
        ...formData,
        ingredientes_quantidades: {
          ...formData.ingredientes_quantidades,
          [selectedIngrediente]: parseFloat(precoInput)
        }
      });
      setSelectedIngrediente('');
      setPrecoInput('');
    } else {
      Alert.alert('Atenção', 'Selecione um ingrediente e informe o valor');
    }
  };

  const removeIngrediente = (ingredienteId) => {
    const newIngredientes = { ...formData.ingredientes_quantidades };
    delete newIngredientes[ingredienteId];
    setFormData({
      ...formData,
      ingredientes_quantidades: newIngredientes
    });
  };

  const modalTitles = {
    ingrediente: { emoji: '🥕', text: editingItem ? 'Editar Ingrediente' : 'Novo Ingrediente', color: '#10b981' },
    marmita: { emoji: '🍲', text: editingItem ? 'Editar Marmita' : 'Nova Marmita', color: '#3b82f6' },
    venda: { emoji: '💸', text: editingItem ? 'Editar Venda' : 'Registrar Venda', color: '#10b981' },
    compra: { emoji: '🛒', text: editingItem ? 'Editar Compra' : 'Nova Compra', color: '#f97316' }
  };

  const currentModal = modalTitles[type];

  const custoEstimado = Object.entries(formData.ingredientes_quantidades).reduce(
    (total, [ingId, qtd]) => {
      const ingrediente = data?.ingredientes?.find(i => i.id === parseInt(ingId));
      if (!ingrediente) return total;
      return total + (Number(qtd) * Number(ingrediente.preco_compra));
    },
    0
  );
  const precoVenda = Number(formData.preco_venda || 0);
  const margemLucro = precoVenda > 0 ? ((precoVenda - custoEstimado) / precoVenda) * 100 : 0;

  // Componente de seleção customizado para ingredientes (com preço)
  const renderIngredienteSelector = () => {
    const ingredienteSelecionado = data?.ingredientes?.find(i => i.id.toString() === selectedIngrediente);
    return (
      <>
        <TouchableOpacity 
          style={styles.selectorButton}
          onPress={() => setShowIngredientePicker(true)}
        >
          <Text style={[styles.selectorText, !selectedIngrediente && styles.selectorPlaceholder]}>
            {ingredienteSelecionado 
              ? `${ingredienteSelecionado.nome} - R$ ${Number(ingredienteSelecionado.preco_compra || 0).toFixed(2)}/kg`
              : 'Selecione um ingrediente...'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#6b7280" />
        </TouchableOpacity>
        
        <RNModal
          visible={showIngredientePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowIngredientePicker(false)}
        >
          <View style={styles.pickerModalOverlay}>
            <View style={styles.pickerModalContainer}>
              <View style={styles.pickerModalHeader}>
                <Text style={styles.pickerModalTitle}>Selecione um Ingrediente</Text>
                <TouchableOpacity onPress={() => setShowIngredientePicker(false)}>
                  <Ionicons name="close" size={24} color="#1f2937" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.pickerModalList}>
                {data?.ingredientes && data.ingredientes.length > 0 ? (
                  data.ingredientes.map((ing) => (
                    <TouchableOpacity
                      key={ing.id}
                      style={[
                        styles.pickerModalItem,
                        selectedIngrediente === ing.id.toString() && styles.pickerModalItemSelected
                      ]}
                      onPress={() => {
                        setSelectedIngrediente(ing.id.toString());
                        setShowIngredientePicker(false);
                      }}
                    >
                      <Text style={styles.pickerModalItemText}>
                        {ing.nome} - R$ {Number(ing.preco_compra || 0).toFixed(2)}/kg
                      </Text>
                      {selectedIngrediente === ing.id.toString() && (
                        <Ionicons name="checkmark" size={20} color="#3b82f6" />
                      )}
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.pickerModalItem}>
                    <Text style={styles.pickerModalItemTextDisabled}>
                      Nenhum ingrediente cadastrado
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </RNModal>
      </>
    );
  };

  // Componente de seleção customizado para ingredientes em compra (sem preço)
  const renderIngredienteSelectorCompra = () => {
    const ingredienteSelecionado = data?.ingredientes?.find(i => i.id.toString() === selectedIngrediente);
    return (
      <>
        <TouchableOpacity 
          style={styles.selectorButton}
          onPress={() => setShowIngredientePickerCompra(true)}
        >
          <Text style={[styles.selectorText, !selectedIngrediente && styles.selectorPlaceholder]}>
            {ingredienteSelecionado 
              ? ingredienteSelecionado.nome
              : 'Selecione um ingrediente...'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#6b7280" />
        </TouchableOpacity>
        
        <RNModal
          visible={showIngredientePickerCompra}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowIngredientePickerCompra(false)}
        >
          <View style={styles.pickerModalOverlay}>
            <View style={styles.pickerModalContainer}>
              <View style={styles.pickerModalHeader}>
                <Text style={styles.pickerModalTitle}>Selecione um Ingrediente</Text>
                <TouchableOpacity onPress={() => setShowIngredientePickerCompra(false)}>
                  <Ionicons name="close" size={24} color="#1f2937" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.pickerModalList}>
                {data?.ingredientes && data.ingredientes.length > 0 ? (
                  data.ingredientes.map((ing) => (
                    <TouchableOpacity
                      key={ing.id}
                      style={[
                        styles.pickerModalItem,
                        selectedIngrediente === ing.id.toString() && styles.pickerModalItemSelected
                      ]}
                      onPress={() => {
                        setSelectedIngrediente(ing.id.toString());
                        setShowIngredientePickerCompra(false);
                      }}
                    >
                      <Text style={styles.pickerModalItemText}>
                        {ing.nome}
                      </Text>
                      {selectedIngrediente === ing.id.toString() && (
                        <Ionicons name="checkmark" size={20} color="#3b82f6" />
                      )}
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.pickerModalItem}>
                    <Text style={styles.pickerModalItemTextDisabled}>
                      Nenhum ingrediente cadastrado
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </RNModal>
      </>
    );
  };

  // Componente de seleção customizado para marmitas
  const renderMarmitaSelector = () => {
    const marmitaSelecionada = data?.marmitas?.find(m => m.id.toString() === formData.marmita_id);
    return (
      <>
        <TouchableOpacity 
          style={styles.selectorButton}
          onPress={() => setShowMarmitaPicker(true)}
        >
          <Text style={[styles.selectorText, !formData.marmita_id && styles.selectorPlaceholder]}>
            {marmitaSelecionada 
              ? `${marmitaSelecionada.nome} - R$ ${Number(marmitaSelecionada.preco_venda || 0).toFixed(2)}`
              : 'Selecione uma marmita...'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#6b7280" />
        </TouchableOpacity>
        
        <RNModal
          visible={showMarmitaPicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowMarmitaPicker(false)}
        >
          <View style={styles.pickerModalOverlay}>
            <View style={styles.pickerModalContainer}>
              <View style={styles.pickerModalHeader}>
                <Text style={styles.pickerModalTitle}>Selecione uma Marmita</Text>
                <TouchableOpacity onPress={() => setShowMarmitaPicker(false)}>
                  <Ionicons name="close" size={24} color="#1f2937" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.pickerModalList}>
                {data?.marmitas && data.marmitas.length > 0 ? (
                  data.marmitas.map((m) => (
                    <TouchableOpacity
                      key={m.id}
                      style={[
                        styles.pickerModalItem,
                        formData.marmita_id === m.id.toString() && styles.pickerModalItemSelected
                      ]}
                      onPress={() => {
                        setFormData({ ...formData, marmita_id: m.id.toString() });
                        setShowMarmitaPicker(false);
                      }}
                    >
                      <Text style={styles.pickerModalItemText}>
                        {m.nome} - R$ {Number(m.preco_venda || 0).toFixed(2)}
                      </Text>
                      {formData.marmita_id === m.id.toString() && (
                        <Ionicons name="checkmark" size={20} color="#3b82f6" />
                      )}
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.pickerModalItem}>
                    <Text style={styles.pickerModalItemTextDisabled}>
                      Nenhuma marmita cadastrada
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </RNModal>
      </>
    );
  };

  return (
    <RNModal
      visible={true}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={[styles.header, { backgroundColor: currentModal.color }]}>
            <View style={styles.headerContent}>
              <Text style={styles.headerEmoji}>{currentModal.emoji}</Text>
              <Text style={styles.headerTitle}>{currentModal.text}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.content} 
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
          >
            {type === 'ingrediente' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nome do Ingrediente</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.nome}
                    onChangeText={(text) => setFormData({ ...formData, nome: text })}
                    placeholder="Ex: Arroz, Feijão, Frango"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Preço de Compra (R$/kg ou unidade)</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.preco_compra}
                    onChangeText={(text) => setFormData({ ...formData, preco_compra: text })}
                    placeholder="8.50"
                    keyboardType="decimal-pad"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </>
            )}

            {type === 'marmita' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nome da Marmita</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.nome}
                    onChangeText={(text) => setFormData({ ...formData, nome: text })}
                    placeholder="Ex: Frango com Legumes"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Preço de Venda (R$)</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.preco_venda}
                    onChangeText={(text) => setFormData({ ...formData, preco_venda: text })}
                    placeholder="15.00"
                    keyboardType="decimal-pad"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                
                {!editingItem && (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Ingredientes e Quantidades</Text>
                      
                      {Object.keys(formData.ingredientes_quantidades).length > 0 && (
                        <View style={styles.ingredientesList}>
                          {Object.entries(formData.ingredientes_quantidades).map(([ingId, qtd]) => {
                            const ingrediente = data?.ingredientes?.find(i => i.id === parseInt(ingId));
                            return (
                              <View key={ingId} style={styles.ingredienteItem}>
                                <Text style={styles.ingredienteText}>
                                  {ingrediente?.nome || `ID: ${ingId}`} - {qtd} kg
                                </Text>
                                <TouchableOpacity onPress={() => removeIngrediente(ingId)}>
                                  <Ionicons name="trash" size={20} color="#ef4444" />
                                </TouchableOpacity>
                              </View>
                            );
                          })}
                        </View>
                      )}

                      <View style={styles.addIngredienteContainer}>
                        <View style={styles.pickerContainer}>
                          <Text style={styles.pickerLabel}>Ingrediente:</Text>
                          {renderIngredienteSelector()}
                        </View>
                        <TextInput
                          style={[styles.input, styles.quantidadeInput]}
                          value={quantidadeInput}
                          onChangeText={setQuantidadeInput}
                          placeholder="Qtd (kg)"
                          keyboardType="decimal-pad"
                          placeholderTextColor="#9ca3af"
                        />
                        <TouchableOpacity style={styles.addButton} onPress={addIngrediente}>
                          <Ionicons name="add" size={20} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.resumoContainer}>
                      <Text style={styles.resumoTitle}>Resumo da Marmita</Text>
                      <View style={styles.resumoRow}>
                        <Text style={styles.resumoLabel}>Custo Estimado:</Text>
                        <Text style={styles.resumoValueRed}>R$ {custoEstimado.toFixed(2)}</Text>
                      </View>
                      <View style={styles.resumoRow}>
                        <Text style={styles.resumoLabel}>Preço de Venda:</Text>
                        <Text style={styles.resumoValueBlue}>R$ {precoVenda.toFixed(2)}</Text>
                      </View>
                      <View style={styles.resumoRow}>
                        <Text style={styles.resumoLabel}>Margem de Lucro:</Text>
                        <Text style={[
                          styles.resumoValue,
                          { color: margemLucro >= 0 ? '#10b981' : '#ef4444' }
                        ]}>
                          {margemLucro.toFixed(1)}%
                        </Text>
                      </View>
                    </View>
                  </>
                )}
              </>
            )}

            {type === 'venda' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Marmita</Text>
                  {renderMarmitaSelector()}
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Quantidade</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.quantidade}
                    onChangeText={(text) => setFormData({ ...formData, quantidade: text })}
                    keyboardType="number-pad"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Data</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.data}
                    onChangeText={(text) => setFormData({ ...formData, data: text })}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </>
            )}

            {type === 'compra' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Valor Total (R$)</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.valor_total}
                    onChangeText={(text) => setFormData({ ...formData, valor_total: text })}
                    placeholder="150.00"
                    keyboardType="decimal-pad"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Data da Compra</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.data}
                    onChangeText={(text) => setFormData({ ...formData, data: text })}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Ingredientes e Preços</Text>
                  
                  {Object.keys(formData.ingredientes_quantidades).length > 0 && (
                    <View style={styles.ingredientesList}>
                      {Object.entries(formData.ingredientes_quantidades).map(([ingId, preco]) => {
                        const ingrediente = data?.ingredientes?.find(i => i.id === parseInt(ingId));
                        return (
                          <View key={ingId} style={styles.ingredienteItem}>
                            <Text style={styles.ingredienteText}>
                              {ingrediente?.nome || `ID: ${ingId}`} - R$ {preco}
                            </Text>
                            <TouchableOpacity onPress={() => removeIngrediente(ingId)}>
                              <Ionicons name="trash" size={20} color="#ef4444" />
                            </TouchableOpacity>
                          </View>
                        );
                      })}
                    </View>
                  )}

                      <View style={styles.addIngredienteContainer}>
                        <View style={styles.pickerContainer}>
                          <Text style={styles.pickerLabel}>Ingrediente:</Text>
                          {renderIngredienteSelectorCompra()}
                        </View>
                    <TextInput
                      style={[styles.input, styles.quantidadeInput]}
                      value={precoInput}
                      onChangeText={setPrecoInput}
                      placeholder="Preço (R$)"
                      keyboardType="decimal-pad"
                      placeholderTextColor="#9ca3af"
                    />
                    <TouchableOpacity style={styles.addButton} onPress={addIngrediente}>
                      <Ionicons name="add" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.submitButton, { backgroundColor: currentModal.color }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {editingItem ? 'Atualizar' : 'Salvar'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxHeight: screenHeight * 0.85,
    minHeight: 400,
    overflow: 'hidden',
    flexDirection: 'column',
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerEmoji: {
    fontSize: 32,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flexGrow: 1,
    flexShrink: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 20,
    flexGrow: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  pickerWrapper: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 50,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  pickerContainer: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  addIngredienteContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
  },
  quantidadeInput: {
    width: 100,
  },
  addButton: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ingredientesList: {
    marginBottom: 12,
    gap: 8,
  },
  ingredienteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  ingredienteText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e40af',
    flex: 1,
  },
  resumoContainer: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: 8,
  },
  resumoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  resumoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  resumoLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  resumoValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  resumoValueRed: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  resumoValueBlue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    minHeight: 50,
  },
  selectorText: {
    fontSize: 16,
    color: '#1f2937',
    flex: 1,
  },
  selectorPlaceholder: {
    color: '#9ca3af',
  },
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerModalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: screenHeight * 0.7,
    paddingBottom: 20,
  },
  pickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  pickerModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  pickerModalList: {
    maxHeight: screenHeight * 0.5,
  },
  pickerModalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  pickerModalItemSelected: {
    backgroundColor: '#eff6ff',
  },
  pickerModalItemText: {
    fontSize: 16,
    color: '#1f2937',
    flex: 1,
  },
  pickerModalItemTextDisabled: {
    fontSize: 16,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
});

export default Modal;

