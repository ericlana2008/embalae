import React, { useState, useMemo, useEffect } from 'react';
import {
  Product,
  Category,
  CartItem,
  AppView,
  DistributorConfig,
} from './types';
import {
  PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_DISTRIBUTOR_CONFIG,
} from './data/products';
import { Header } from './components/Header';
import { SearchBarAndCart } from './components/SearchBarAndCart';
import { ProductList } from './components/ProductList';
import { CategoryProductsModal } from './components/CategoryProductsModal';
import { CartPage } from './components/CartPage';
import { SuccessView } from './components/SuccessView';
import { Footer } from './components/Footer';
import { Banner } from './components/Banner';
import { AdminPage } from './components/AdminPage';
import { formatCurrency } from './utils/format';
import {
  testSupabaseConnection,
  subscribeToDistributorConfig,
  subscribeToCategories,
  subscribeToProducts,
  saveDistributorConfigToCloud,
  syncCategoriesToCloud,
  syncProductsToCloud,
  clearCloudData,
} from './supabase';

const PURGE_MEMORY_KEY = 'app_memory_purged_clean_v4';
try {
  if (typeof window !== 'undefined' && localStorage.getItem(PURGE_MEMORY_KEY) !== 'true') {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem(PURGE_MEMORY_KEY, 'true');
  }
} catch (e) {
  console.warn('Memory cleanup error', e);
}

// Helper to check if current browser URL corresponds to /admin
const checkIsAdminRoute = (): boolean => {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  return (
    path === '/admin' ||
    path === '/admin/' ||
    path.startsWith('/admin') ||
    hash === '#/admin' ||
    hash.startsWith('#/admin')
  );
};

export default function App() {
  // Route state: true if URL is /admin, false for public catalog
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(checkIsAdminRoute);

  useEffect(() => {
    const handleLocationChange = () => {
      setIsAdminRoute(checkIsAdminRoute());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const handleNavigateToCatalog = () => {
    window.history.pushState({}, '', '/');
    setIsAdminRoute(false);
  };

  // Distributor configuration (clean defaults without old residues)
  const [config, setConfig] = useState<DistributorConfig>(() => {
    try {
      const saved = localStorage.getItem('embalae_distributor_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return INITIAL_DISTRIBUTOR_CONFIG;
  });

  // Categories list
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('embalae_categories');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return INITIAL_CATEGORIES;
  });

  // Catalog products
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('embalae_products');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return PRODUCTS;
  });

  // Selected Category modal state
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Initialize Firestore listeners and test connection on boot
  useEffect(() => {
    testSupabaseConnection();

    // Realtime listener for store config
    const unsubConfig = subscribeToDistributorConfig((remoteConfig) => {
      if (remoteConfig && remoteConfig.name !== undefined) {
        setConfig((prev) => ({ ...prev, ...remoteConfig }));
        try {
          localStorage.setItem('embalae_distributor_config', JSON.stringify(remoteConfig));
        } catch (e) {
          console.warn(e);
        }
      }
    });

    // Realtime listener for categories
    const unsubCats = subscribeToCategories((remoteCats) => {
      if (remoteCats && remoteCats.length > 0) {
        setCategories(remoteCats);
        try {
          localStorage.setItem('embalae_categories', JSON.stringify(remoteCats));
        } catch (e) {
          console.warn(e);
        }
      }
    });

    // Realtime listener for products
    const unsubProds = subscribeToProducts((remoteProds) => {
      if (remoteProds && remoteProds.length > 0) {
        setProducts(remoteProds);
        try {
          localStorage.setItem('embalae_products', JSON.stringify(remoteProds));
        } catch (e) {
          console.warn(e);
        }
      }
    });

    return () => {
      unsubConfig();
      unsubCats();
      unsubProds();
    };
  }, []);

  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleCloseCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setSelectedCategory(null);
  };

  const handleSaveConfig = async (newConfig: DistributorConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem('embalae_distributor_config', JSON.stringify(newConfig));
    } catch (e) {
      console.warn('Storage unavailable', e);
    }
    try {
      await saveDistributorConfigToCloud(newConfig);
    } catch (e) {
      console.error('Erro ao sincronizar configurações na nuvem:', e);
    }
  };

  const handleUpdateCategories = async (newList: Category[]) => {
    setCategories(newList);
    try {
      localStorage.setItem('embalae_categories', JSON.stringify(newList));
    } catch (e) {
      console.warn('Storage unavailable', e);
    }
    try {
      await syncCategoriesToCloud(newList);
    } catch (e) {
      console.error('Erro ao sincronizar categorias na nuvem:', e);
    }
  };

  const handleUpdateProducts = async (newList: Product[]) => {
    setProducts(newList);
    try {
      localStorage.setItem('embalae_products', JSON.stringify(newList));
    } catch (e) {
      console.warn('Storage unavailable', e);
    }
    try {
      await syncProductsToCloud(newList);
    } catch (e) {
      console.error('Erro ao sincronizar produtos na nuvem:', e);
    }
  };

  const handleClearAllMemory = async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem(PURGE_MEMORY_KEY, 'true');
    } catch (e) {
      console.warn('Storage clear error', e);
    }
    setConfig(INITIAL_DISTRIBUTOR_CONFIG);
    setCategories([]);
    setProducts([]);
    setQuantities({});
    try {
      await clearCloudData();
    } catch (e) {
      console.error('Erro ao limpar dados na nuvem:', e);
    }
  };

  // App step / page view: 'catalog' | 'cart' | 'success'
  const [currentView, setCurrentView] = useState<AppView>('catalog');

  // Product quantities by ID in cart
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  // Last order summary for success screen
  const [lastOrderSummary, setLastOrderSummary] = useState<{
    customerName: string;
    total: number;
    itemsCount: number;
    whatsappUrl: string;
  } | null>(null);

  // Cart items calculation
  const cartItems: CartItem[] = useMemo(() => {
    return Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => {
        const prod = products.find((p) => p.id === id);
        return prod ? { product: prod, quantity: qty } : null;
      })
      .filter((item): item is CartItem => item !== null);
  }, [quantities, products]);

  const totalItems = useMemo(() => {
    return cartItems.reduce((acc, curr) => acc + curr.quantity, 0);
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, curr) => acc + curr.product.price * curr.quantity, 0);
  }, [cartItems]);

  // Update product quantity handler
  const handleUpdateQuantity = (productId: string, quantity: number) => {
    setQuantities((prev) => {
      const next = { ...prev };
      if (quantity <= 0) {
        delete next[productId];
      } else {
        next[productId] = quantity;
      }
      return next;
    });
  };

  // Clear entire cart
  const handleClearCart = () => {
    setQuantities({});
  };

  // Advance to Cart view
  const handleGoToCart = () => {
    setIsCategoryModalOpen(false);
    setCurrentView('cart');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Back to Catalog view
  const handleBackToCatalog = () => {
    setCurrentView('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit Order via WhatsApp directly from Cart
  const handleSubmitOrder = () => {
    if (cartItems.length === 0) return;

    const distributorTitle = config.name?.trim() ? config.name.toUpperCase() : 'CATÁLOGO DE PRODUTOS';
    const slogan = config.slogan?.trim() || '';
    const address = config.addressInfo?.trim() || '';
    const phone = config.phone?.trim() || '';

    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR');
    const formattedTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const itemsText = cartItems
      .map(
        (it) =>
          `• *${String(it.quantity).padStart(2, '0')}x* ${it.product.name}${
            it.product.weightOrVolume ? ` (${it.product.weightOrVolume})` : ''
          }\n   └ R$ ${formatCurrency(it.product.price * it.quantity)} (R$ ${formatCurrency(it.product.price)} un.)`
      )
      .join('\n\n');

    const message = `📦 *NOVO PEDIDO DE PRODUTOS*
🏪 *${distributorTitle}*${slogan ? `\n_${slogan}_` : ''}

📅 *Data do Pedido:* ${formattedDate} às ${formattedTime}

📋 *ITENS SOLICITADOS:*
${itemsText}

────────────────────────────
📦 *Total de Itens:* ${totalItems} volume(s)
💰 *VALOR TOTAL: R$ ${formatCurrency(subtotal)}*
────────────────────────────

👤 *DADOS PARA FATURAMENTO E ENTREGA:*
• *Nome / Razão Social:* 
• *CNPJ / CPF:* 
• *Telefone / WhatsApp:* 
• *Endereço Completo de Entrega:* 
• *Cidade / Bairro:* 
• *Observações:* 
${address || phone ? `\n────────────────────────────\n🏢 *${distributorTitle}*\n${address ? `📍 ${address}\n` : ''}${phone ? `📞 ${phone}\n` : ''}` : ''}
🚀 _Aguardamos a confirmação do pedido e prazo de separação!_`;

    let cleanWhatsapp = (config.whatsappNumber || '').replace(/\D/g, '');
    if (cleanWhatsapp.length === 10 || cleanWhatsapp.length === 11) {
      cleanWhatsapp = `55${cleanWhatsapp}`;
    }
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanWhatsapp}&text=${encodedMessage}`;

    // Store summary for success page before wiping state
    setLastOrderSummary({
      customerName: 'Cliente',
      total: subtotal,
      itemsCount: totalItems,
      whatsappUrl,
    });

    // Open WhatsApp
    const link = document.createElement('a');
    link.href = whatsappUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean cart state
    setQuantities({});
    setSearchTerm('');

    // Switch to success view
    setCurrentView('success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Start fresh order from success view
  const handleNewOrder = () => {
    setQuantities({});
    setSearchTerm('');
    setLastOrderSummary(null);
    setCurrentView('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // When visiting /admin, render the administrative area with password protection
  if (isAdminRoute) {
    return (
      <AdminPage
        config={config}
        onSaveConfig={handleSaveConfig}
        categories={categories}
        onUpdateCategories={handleUpdateCategories}
        products={products}
        onUpdateProducts={handleUpdateProducts}
        onNavigateToCatalog={handleNavigateToCatalog}
        onClearAllMemory={handleClearAllMemory}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex justify-center selection:bg-orange-200">
      {/* Mobile-first viewport container */}
      <div className="w-full max-w-md min-h-screen bg-white shadow-2xl border-x border-slate-100 flex flex-col relative overflow-x-hidden">
        {/* VIEW 1: CATALOG (Totalmente separado do painel administrativo) */}
        {currentView === 'catalog' && (
          <div className="flex-1 flex flex-col">
            {/* Header público do catálogo (sem botão de configurações) */}
            <Header config={config} />

            {/* Banner promocional se configurado */}
            <Banner
              bannerImage={config.bannerImage}
              bannerZoom={config.bannerZoom ?? 100}
              distributorName={config.name}
            />

            {/* Barra de pesquisa à esquerda e Carrinho de compras na mesma linha à direita */}
            <SearchBarAndCart
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              totalItems={totalItems}
              totalPrice={subtotal}
              onOpenCart={handleGoToCart}
            />

            {/* Lista de Categorias: botões preenchidos com imagem até 70% à direita */}
            <ProductList
              categories={categories}
              products={products}
              quantities={quantities}
              onUpdateQuantity={handleUpdateQuantity}
              searchTerm={searchTerm}
              onClearSearch={() => setSearchTerm('')}
              onSelectCategory={handleSelectCategory}
            />

            {/* Rodapé com informações da distribuidora */}
            <Footer config={config} hasCartItems={totalItems > 0} />
          </div>
        )}

        {/* MODAL DE PRODUTOS DA CATEGORIA (Abre ao clicar no container da categoria) */}
        <CategoryProductsModal
          isOpen={isCategoryModalOpen}
          onClose={handleCloseCategoryModal}
          category={selectedCategory}
          products={products}
          quantities={quantities}
          onUpdateQuantity={handleUpdateQuantity}
          onGoToCart={handleGoToCart}
        />

        {/* VIEW 2: CARRINHO DE COMPRAS COM ENVIAR PEDIDO DIRETO */}
        {currentView === 'cart' && (
          <CartPage
            items={cartItems}
            totalPrice={subtotal}
            totalItems={totalItems}
            onUpdateQuantity={handleUpdateQuantity}
            onClearCart={handleClearCart}
            onBackToCatalog={handleBackToCatalog}
            onSubmitOrder={handleSubmitOrder}
          />
        )}

        {/* VIEW 3: TELA DE SUCESSO APÓS ENVIAR PEDIDO VIA WHATSAPP */}
        {currentView === 'success' && (
          <SuccessView
            config={config}
            lastOrderSummary={lastOrderSummary}
            onNewOrder={handleNewOrder}
          />
        )}
      </div>
    </div>
  );
}
