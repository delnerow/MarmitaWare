import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator, Alert, RefreshControl, ScrollView } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { marmitasAPI, vendasAPI, comprasAPI, relatorioAPI, ingredientesAPI } from './src/services/api';
import Dashboard from './src/components/Dashboard';
import Marmitas from './src/components/Marmitas';
import Ingredientes from './src/components/Ingredientes';
import Vendas from './src/components/Vendas';
import Compras from './src/components/Compras';
import Modal from './src/components/Modal';
import Header from './src/components/Header';

const Tab = createBottomTabNavigator();

export default function App() {
  const [data, setData] = useState({ marmitas: [], vendas: [], compras: [], ingredientes: [] });
  const [relatorio, setRelatorio] = useState({ 
    vendas: { receita_total: 0, custo_produtos_vendidos: 0 }, 
    compras: { total_compras: 0 }, 
    lucro: { lucro_bruto: 0 } 
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [marmitasRes, vendasRes, comprasRes, ingredientesRes, relatorioRes] = await Promise.all([
        marmitasAPI.getAll().catch(() => []), 
        vendasAPI.getAll().catch(() => []), 
        comprasAPI.getAll().catch(() => []), 
        ingredientesAPI.getAll().catch(() => []), 
        relatorioAPI.get().catch(() => ({ 
          vendas: { receita_total: 0, custo_produtos_vendidos: 0 }, 
          compras: { total_compras: 0 }, 
          lucro: { lucro_bruto: 0 } 
        }))
      ]);

      setData({
        marmitas: marmitasRes || [], 
        vendas: vendasRes || [], 
        compras: comprasRes || [], 
        ingredientes: ingredientesRes || []
      });

      setRelatorio(relatorioRes || { 
        vendas: { receita_total: 0, custo_produtos_vendidos: 0 }, 
        compras: { total_compras: 0 }, 
        lucro: { lucro_bruto: 0 } 
      });
    } catch (err) {
      console.error('Erro:', err);
      Alert.alert('Erro', 'Erro ao conectar com o servidor: ' + err.message);
    } finally { 
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    carregarDados();
  };

  const openModal = (type, item = null) => { 
    setModalType(type); 
    setEditingItem(item);
    setShowModal(true); 
  };

  const handleModalSubmit = async (formData) => {
    try {
      if (editingItem) {
        // Modo edição
        if (modalType === 'marmita') await marmitasAPI.update(editingItem.id, formData);
        if (modalType === 'venda') await vendasAPI.update(editingItem.id, formData);
        if (modalType === 'compra') await comprasAPI.update(editingItem.id, formData);
        if (modalType === 'ingrediente') await ingredientesAPI.update(editingItem.id, formData);
      } else {
        // Modo criação
        if (modalType === 'marmita') await marmitasAPI.create(formData);
        if (modalType === 'venda') await vendasAPI.create(formData);
        if (modalType === 'compra') await comprasAPI.create(formData);
        if (modalType === 'ingrediente') await ingredientesAPI.create(formData);
      }
      
      await carregarDados();
      setShowModal(false);
      setEditingItem(null);
      Alert.alert('Sucesso', 'Item salvo com sucesso!');
    } catch (err) { 
      Alert.alert('Erro', 'Erro ao salvar: ' + err.message); 
    }
  };

  const handleDelete = async (type, id) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir este item?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              if (type === 'marmita') await marmitasAPI.delete(id);
              if (type === 'venda') await vendasAPI.delete(id);
              if (type === 'compra') await comprasAPI.delete(id);
              if (type === 'ingrediente') await ingredientesAPI.delete(id);
              
              await carregarDados();
              Alert.alert('Sucesso', 'Item excluído com sucesso!');
            } catch (err) {
              Alert.alert('Erro', 'Erro ao excluir: ' + err.message);
            }
          }
        }
      ]
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Header />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Dashboard') {
                iconName = focused ? 'bar-chart' : 'bar-chart-outline';
              } else if (route.name === 'Marmitas') {
                iconName = focused ? 'restaurant' : 'restaurant-outline';
              } else if (route.name === 'Ingredientes') {
                iconName = focused ? 'leaf' : 'leaf-outline';
              } else if (route.name === 'Vendas') {
                iconName = focused ? 'cash' : 'cash-outline';
              } else if (route.name === 'Compras') {
                iconName = focused ? 'cart' : 'cart-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#3b82f6',
            tabBarInactiveTintColor: 'gray',
            headerShown: false,
          })}
        >
          <Tab.Screen 
            name="Dashboard" 
            options={{ title: 'Dashboard' }}
          >
            {() => (
              <ScrollView
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
              >
                <Dashboard relatorio={relatorio} vendas={data.vendas} />
              </ScrollView>
            )}
          </Tab.Screen>
          
          <Tab.Screen 
            name="Marmitas" 
            options={{ title: 'Marmitas' }}
          >
            {() => (
              <ScrollView
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
              >
                <Marmitas 
                  marmitas={data.marmitas} 
                  onAdd={() => openModal('marmita')} 
                  onEdit={(item) => openModal('marmita', item)}
                  onDelete={(id) => handleDelete('marmita', id)}
                />
              </ScrollView>
            )}
          </Tab.Screen>

          <Tab.Screen 
            name="Ingredientes" 
            options={{ title: 'Ingredientes' }}
          >
            {() => (
              <ScrollView
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
              >
                <Ingredientes 
                  ingredientes={data.ingredientes} 
                  onAdd={() => openModal('ingrediente')} 
                  onEdit={(item) => openModal('ingrediente', item)}
                  onDelete={(id) => handleDelete('ingrediente', id)}
                />
              </ScrollView>
            )}
          </Tab.Screen>

          <Tab.Screen 
            name="Vendas" 
            options={{ title: 'Vendas' }}
          >
            {() => (
              <ScrollView
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
              >
                <Vendas 
                  vendas={data.vendas} 
                  onAdd={() => openModal('venda')}
                  onEdit={(item) => openModal('venda', item)}
                  onDelete={(id) => handleDelete('venda', id)}
                />
              </ScrollView>
            )}
          </Tab.Screen>

          <Tab.Screen 
            name="Compras" 
            options={{ title: 'Compras' }}
          >
            {() => (
              <ScrollView
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
              >
                <Compras 
                  compras={data.compras} 
                  onAdd={() => openModal('compra')}
                  onEdit={(item) => openModal('compra', item)}
                  onDelete={(id) => handleDelete('compra', id)}
                />
              </ScrollView>
            )}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>

      {showModal && (
        <Modal
          type={modalType}
          data={data}
          editingItem={editingItem}
          onClose={() => {
            setShowModal(false);
            setEditingItem(null);
          }}
          onSubmit={handleModalSubmit}
        />
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
});

