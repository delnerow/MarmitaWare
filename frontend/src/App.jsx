// App.jsx - versão completa com Ingredientes
import { useState, useEffect } from 'react';
import { BarChart3, ShoppingCart, Package, DollarSign, Loader2, Carrot } from 'lucide-react';
import { marmitasAPI, vendasAPI, comprasAPI, relatorioAPI, ingredientesAPI } from './services/api';
import Dashboard from './components/Dashboard';
import Marmitas from './components/Marmitas';
import Vendas from './components/Vendas';
import Compras from './components/Compras';
import Ingredientes from './components/Ingredientes';
import Modal from './components/Modal';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState({ marmitas: [], vendas: [], compras: [], ingredientes: [] });
  const [relatorio, setRelatorio] = useState({ vendas: { receita_total: 0, custo_produtos_vendidos: 0 }, compras: { total_compras: 0 }, lucro: { lucro_bruto: 0 } });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => { carregarDados(); }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [marmitasRes, vendasRes, comprasRes, ingredientesRes, relatorioRes] = await Promise.all([
        marmitasAPI.getAll(), 
        vendasAPI.getAll(), 
        comprasAPI.getAll(), 
        ingredientesAPI.getAll(), 
        relatorioAPI.get()
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
      alert('Erro ao conectar com o servidor: ' + err.message);
    } finally { 
      setLoading(false); 
    }
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
    } catch (err) { 
      alert('Erro ao salvar: ' + err.message); 
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Tem certeza que deseja excluir este item?')) return;
    
    try {
      if (type === 'marmita') await marmitasAPI.delete(id);
      if (type === 'venda') await vendasAPI.delete(id);
      if (type === 'compra') await comprasAPI.delete(id);
      if (type === 'ingrediente') await ingredientesAPI.delete(id);
      
      await carregarDados();
      alert('Item excluído com sucesso!');
    } catch (err) {
      alert('Erro ao excluir: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

      {/* HEADER */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-xl rounded-b-3xl">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-white rounded-3xl flex items-center justify-center shadow-md">
              <span className="text-3xl">🍲</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">MarmitaWare</h1>
              <p className="text-blue-100 text-sm">Sistema de Gestão Profissional</p>
            </div>
          </div>

          <button
            onClick={carregarDados}
            className="px-6 py-2 bg-white/20 backdrop-blur text-white rounded-full hover:bg-white/30 transition shadow-md"
          >
            🔄 Atualizar
          </button>
        </div>
      </header>

      {/* NAV */}
      <nav className="bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-2 overflow-x-auto py-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'marmitas', label: 'Marmitas', icon: Package },
              { id: 'ingredientes', label: 'Ingredientes', icon: Carrot },
              { id: 'vendas', label: 'Vendas', icon: DollarSign },
              { id: 'compras', label: 'Compras', icon: ShoppingCart }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-medium transition-all shadow-sm
                  ${activeTab === tab.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'}
                `}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        {activeTab === 'dashboard' && <Dashboard relatorio={relatorio} vendas={data.vendas} />}
        {activeTab === 'marmitas' && (
          <Marmitas 
            marmitas={data.marmitas} 
            onAdd={() => openModal('marmita')} 
            onEdit={(item) => openModal('marmita', item)}
            onDelete={(id) => handleDelete('marmita', id)}
          />
        )}
        {activeTab === 'ingredientes' && (
          <Ingredientes 
            ingredientes={data.ingredientes} 
            onAdd={() => openModal('ingrediente')} 
            onEdit={(item) => openModal('ingrediente', item)}
            onDelete={(id) => handleDelete('ingrediente', id)}
          />
        )}
        {activeTab === 'vendas' && (
          <Vendas 
            vendas={data.vendas} 
            onAdd={() => openModal('venda')}
            onEdit={(item) => openModal('venda', item)}
            onDelete={(id) => handleDelete('venda', id)}
          />
        )}
        {activeTab === 'compras' && (
          <Compras 
            compras={data.compras} 
            onAdd={() => openModal('compra')}
            onEdit={(item) => openModal('compra', item)}
            onDelete={(id) => handleDelete('compra', id)}
          />
        )}
      </main>

      {/* MODAL */}
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
    </div>
  );
}

export default App;