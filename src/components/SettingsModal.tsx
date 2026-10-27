import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Check,
  Store,
  Phone,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  UploadCloud,
  Image as ImageIcon,
  ZoomIn,
  RotateCcw,
  Package,
  Layers,
  Eye,
  EyeOff,
  Copyright,
} from 'lucide-react';
import { DistributorConfig, Product, Category } from '../types';
import { formatCurrency } from '../utils/format';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: DistributorConfig;
  onSaveConfig: (newConfig: DistributorConfig) => void;
  categories: Category[];
  onUpdateCategories: (categories: Category[]) => void;
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
  initialTab?: 'config' | 'categories' | 'products';
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  categories,
  onUpdateCategories,
  products,
  onUpdateProducts,
  initialTab = 'config',
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'categories' | 'products'>(
    initialTab
  );

  // TAB 1: DISTRIBUTOR CONFIG STATE
  const [formData, setFormData] = useState<DistributorConfig>({ ...config });
  const [savedConfigSuccess, setSavedConfigSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const [brandNameUploadError, setBrandNameUploadError] = useState<string | null>(null);
  const brandNameFileInputRef = useRef<HTMLInputElement>(null);

  // Format Brazilian phone
  const formatPhoneOrMobile = (val: string): string => {
    let digits = val.replace(/\D/g, '');
    if ((digits.length === 12 || digits.length === 13) && digits.startsWith('55')) {
      digits = digits.slice(2);
    }
    digits = digits.slice(0, 11);
    if (!digits) return '';
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  // Sync formData when config or modal open state changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        ...config,
        whatsappNumber: formatPhoneOrMobile(config.whatsappNumber || ''),
        phone: formatPhoneOrMobile(config.phone || ''),
        logoImage: config.logoImage || '',
        logoZoom: config.logoZoom ?? 100,
        brandNameImage: config.brandNameImage || '',
        brandNameZoom: config.brandNameZoom ?? 100,
        footerYear: config.footerYear || '',
      });
    }
  }, [isOpen, config]);

  const handleImageFile = (file: File) => {
    setUploadError(null);
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WebP).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setUploadError('O arquivo de imagem deve ter menos de 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxW = 1080;
        const maxH = 400;
        let { width, height } = img;
        if (width > maxW || height > maxH) {
          const ratio = Math.min(maxW / width, maxH / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setFormData((prev) => ({
            ...prev,
            bannerImage: dataUrl,
            bannerZoom: prev.bannerZoom || 100,
          }));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleZoomChange = (newZoom: number) => {
    const clamped = Math.max(50, Math.min(200, Math.round(newZoom)));
    setFormData((prev) => ({ ...prev, bannerZoom: clamped }));
  };

  const handleRemoveBanner = () => {
    setFormData((prev) => ({
      ...prev,
      bannerImage: '',
      bannerZoom: 100,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLogoImageFile = (file: File) => {
    setLogoUploadError(null);
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setLogoUploadError('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WebP, SVG).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setLogoUploadError('O arquivo de imagem deve ter menos de 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 512;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/png');
          setFormData((prev) => ({
            ...prev,
            logoImage: dataUrl,
            logoZoom: prev.logoZoom || 100,
          }));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleLogoZoomChange = (newZoom: number) => {
    const clamped = Math.max(30, Math.min(250, Math.round(newZoom)));
    setFormData((prev) => ({ ...prev, logoZoom: clamped }));
  };

  const handleRemoveLogo = () => {
    setFormData((prev) => ({
      ...prev,
      logoImage: '',
      logoZoom: 100,
    }));
    if (logoFileInputRef.current) {
      logoFileInputRef.current.value = '';
    }
  };

  const handleBrandNameImageFile = (file: File) => {
    setBrandNameUploadError(null);
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setBrandNameUploadError('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WebP, SVG).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setBrandNameUploadError('O arquivo de imagem deve ter menos de 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxW = 900;
        const maxH = 300;
        let { width, height } = img;
        if (width > maxW || height > maxH) {
          const ratio = Math.min(maxW / width, maxH / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/png');
          setFormData((prev) => ({
            ...prev,
            brandNameImage: dataUrl,
            brandNameZoom: prev.brandNameZoom || 100,
          }));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleBrandNameZoomChange = (newZoom: number) => {
    const clamped = Math.max(40, Math.min(200, Math.round(newZoom)));
    setFormData((prev) => ({ ...prev, brandNameZoom: clamped }));
  };

  const handleRemoveBrandNameImage = () => {
    setFormData((prev) => ({
      ...prev,
      brandNameImage: '',
      brandNameZoom: 100,
    }));
    if (brandNameFileInputRef.current) {
      brandNameFileInputRef.current.value = '';
    }
  };

  const handleConfigSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    setSavedConfigSuccess(true);
    setTimeout(() => {
      setSavedConfigSuccess(false);
      onClose();
    }, 800);
  };

  // TAB 2: CATEGORIES STATE
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryImageUrl, setCategoryImageUrl] = useState('');
  const [categoryImageZoom, setCategoryImageZoom] = useState(100);
  const [categoryFormError, setCategoryFormError] = useState<string | null>(null);
  const [categoryFeedback, setCategoryFeedback] = useState<string | null>(null);
  const [categoryUploadError, setCategoryUploadError] = useState<string | null>(null);
  const categoryFileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenNewCategory = () => {
    setEditingCategoryId(null);
    setCategoryName('');
    setCategoryDescription('');
    setCategoryImageUrl('');
    setCategoryImageZoom(100);
    setCategoryFormError(null);
    setCategoryUploadError(null);
    setIsCategoryFormOpen(true);
  };

  const handleEditCategory = (cat: Category) => {
    setEditingCategoryId(cat.id);
    setCategoryName(cat.name);
    setCategoryDescription(cat.description || '');
    setCategoryImageUrl(cat.imageUrl || '');
    setCategoryImageZoom(cat.imageZoom ?? 100);
    setCategoryFormError(null);
    setCategoryUploadError(null);
    setIsCategoryFormOpen(true);
  };

  const handleCancelCategoryForm = () => {
    setIsCategoryFormOpen(false);
    setEditingCategoryId(null);
    setCategoryName('');
    setCategoryDescription('');
    setCategoryImageUrl('');
    setCategoryFormError(null);
    setCategoryUploadError(null);
  };

  const handleCategoryImageFile = (file: File) => {
    setCategoryUploadError(null);
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setCategoryUploadError('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WebP).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setCategoryUploadError('A imagem deve ter no máximo 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxW = 960;
        const maxH = 480;
        let { width, height } = img;
        if (width > maxW || height > maxH) {
          const ratio = Math.min(maxW / width, maxH / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setCategoryImageUrl(dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = categoryName.trim();
    if (!cleanName) {
      setCategoryFormError('Por favor, informe o nome da categoria.');
      return;
    }

    if (!categoryImageUrl) {
      setCategoryFormError('Por favor, selecione uma imagem para a categoria.');
      return;
    }

    if (editingCategoryId) {
      const updatedList = categories.map((c) =>
        c.id === editingCategoryId
          ? {
              ...c,
              name: cleanName,
              description: categoryDescription.trim(),
              imageUrl: categoryImageUrl,
              imageZoom: categoryImageZoom,
            }
          : c
      );
      onUpdateCategories(updatedList);
      setCategoryFeedback(`Categoria "${cleanName}" atualizada com sucesso!`);
    } else {
      const newCategory: Category = {
        id: `cat-${Date.now()}`,
        name: cleanName,
        description: categoryDescription.trim(),
        imageUrl: categoryImageUrl,
        imageZoom: categoryImageZoom,
        isActive: true,
      };
      onUpdateCategories([...categories, newCategory]);
      setCategoryFeedback(`Categoria "${cleanName}" criada com sucesso!`);
    }

    handleCancelCategoryForm();
    setTimeout(() => setCategoryFeedback(null), 2500);
  };

  const handleDeleteCategory = (id: string, name: string) => {
    const linkedCount = products.filter((p) => p.categoryId === id).length;
    const confirmMsg =
      linkedCount > 0
        ? `A categoria "${name}" possui ${linkedCount} produto(s) vinculado(s). Deseja realmente excluí-la? Os produtos ficarão sem categoria definida.`
        : `Deseja realmente excluir a categoria "${name}"?`;

    if (confirm(confirmMsg)) {
      onUpdateCategories(categories.filter((c) => c.id !== id));
      if (editingCategoryId === id) {
        handleCancelCategoryForm();
      }
      setCategoryFeedback(`Categoria "${name}" removida.`);
      setTimeout(() => setCategoryFeedback(null), 2000);
    }
  };

  const handleToggleCategoryActive = (id: string, name: string, currentlyActive: boolean) => {
    const updated = categories.map((c) =>
      c.id === id ? { ...c, isActive: !currentlyActive } : c
    );
    onUpdateCategories(updated);
    setCategoryFeedback(
      !currentlyActive
        ? `Categoria "${name}" ativada no catálogo!`
        : `Categoria "${name}" desativada do catálogo.`
    );
    setTimeout(() => setCategoryFeedback(null), 2000);
  };

  const handleMoveCategory = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;
    const updated = [...categories];
    const [removed] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, removed);
    onUpdateCategories(updated);
    setCategoryFeedback('Ordem das categorias atualizada!');
    setTimeout(() => setCategoryFeedback(null), 2000);
  };

  // TAB 3: PRODUCTS STATE
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productCategoryId, setProductCategoryId] = useState<string>('');
  const [productFormError, setProductFormError] = useState<string | null>(null);
  const [productFeedback, setProductFeedback] = useState<string | null>(null);

  const formatCurrencyInput = (val: string): string => {
    const digits = val.replace(/\D/g, '');
    if (!digits) return '0,00';
    const num = (parseInt(digits, 10) / 100).toFixed(2);
    return num.replace('.', ',');
  };

  const parseCurrency = (val: string): number => {
    const clean = val.replace(/[^\d,.]/g, '').replace(',', '.');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : Math.max(0, num);
  };

  const handleOpenNewProduct = () => {
    setEditingProductId(null);
    setProductName('');
    setProductDescription('');
    setProductPrice('');
    setProductCategoryId(categories[0]?.id || '');
    setProductFormError(null);
    setIsProductFormOpen(true);
  };

  const handleEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setProductName(prod.name);
    setProductDescription(prod.shortDescription || '');
    setProductPrice(prod.price.toFixed(2).replace('.', ','));
    setProductCategoryId(prod.categoryId || categories[0]?.id || '');
    setProductFormError(null);
    setIsProductFormOpen(true);
  };

  const handleCancelProductForm = () => {
    setIsProductFormOpen(false);
    setEditingProductId(null);
    setProductName('');
    setProductDescription('');
    setProductPrice('');
    setProductFormError(null);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = productName.trim();
    if (!cleanName) {
      setProductFormError('Por favor, informe o nome do produto.');
      return;
    }

    const priceNum = parseCurrency(productPrice);
    if (priceNum <= 0) {
      setProductFormError('O preço do produto deve ser maior que zero.');
      return;
    }

    const linkedCategory = categories.find((c) => c.id === (productCategoryId || categories[0]?.id));

    if (editingProductId) {
      const updatedList = products.map((item) =>
        item.id === editingProductId
          ? {
              ...item,
              name: cleanName,
              shortDescription: productDescription.trim(),
              price: priceNum,
              categoryId: productCategoryId,
              category: linkedCategory?.name || item.category,
            }
          : item
      );
      onUpdateProducts(updatedList);
      setProductFeedback(`Produto "${cleanName}" atualizado com sucesso!`);
    } else {
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        name: cleanName,
        shortDescription: productDescription.trim(),
        price: priceNum,
        categoryId: productCategoryId || categories[0]?.id || '',
        category: linkedCategory?.name || '',
        isActive: true,
      };
      onUpdateProducts([...products, newProduct]);
      setProductFeedback(`Produto "${cleanName}" cadastrado com sucesso!`);
    }

    handleCancelProductForm();
    setTimeout(() => setProductFeedback(null), 2500);
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (confirm(`Deseja realmente remover o produto "${name}" do catálogo?`)) {
      onUpdateProducts(products.filter((p) => p.id !== id));
      if (editingProductId === id) {
        handleCancelProductForm();
      }
      setProductFeedback(`Produto "${name}" removido.`);
      setTimeout(() => setProductFeedback(null), 2000);
    }
  };

  const handleToggleProductActive = (id: string, name: string, currentlyActive: boolean) => {
    const updated = products.map((p) =>
      p.id === id ? { ...p, isActive: !currentlyActive } : p
    );
    onUpdateProducts(updated);
    setProductFeedback(
      !currentlyActive
        ? `Produto "${name}" ativado no catálogo!`
        : `Produto "${name}" desativado do catálogo.`
    );
    setTimeout(() => setProductFeedback(null), 2000);
  };

  const handleMoveProduct = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= products.length) return;
    const updated = [...products];
    const [removed] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, removed);
    onUpdateProducts(updated);
    setProductFeedback('Ordem dos produtos atualizada!');
    setTimeout(() => setProductFeedback(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/65 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-sm sm:max-w-md w-full shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Top Header */}
        <div className="p-4 pb-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 leading-tight">Painel de Gerenciamento</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            title="Fechar"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3 ABAS: Loja, Categorias, Produtos */}
        <div className="flex border-b border-slate-200 bg-slate-100/80 p-1 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className={`flex-1 py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'config'
                ? 'bg-white text-orange-700 shadow-xs ring-1 ring-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Store className="w-3.5 h-3.5 shrink-0" />
            <span>Loja</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`flex-1 py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-white text-orange-700 shadow-xs ring-1 ring-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span>Categorias</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`flex-1 py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'products'
                ? 'bg-white text-orange-700 shadow-xs ring-1 ring-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Package className="w-3.5 h-3.5 shrink-0" />
            <span>Produtos</span>
          </button>
        </div>

        {/* TAB 1: CONFIGURAR DISTRIBUIDORA */}
        {activeTab === 'config' && (
          <div className="p-4 overflow-y-auto flex-1">
            <form onSubmit={handleConfigSubmit} className="space-y-3">
              {/* NOME DA DISTRIBUIDORA & IMAGEM DE SUBSTITUIÇÃO */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-3">
                <div>
                  <label className="text-[11px] font-black text-slate-800 uppercase tracking-wide block mb-1">
                    Nome no Catálogo
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-xl focus:border-orange-500 outline-none font-semibold text-slate-800"
                    placeholder="Ex: Nome da Loja"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Slogan
                  </label>
                  <input
                    type="text"
                    value={formData.slogan}
                    onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                    className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-xl focus:border-orange-500 outline-none"
                    placeholder="Ex: Todos os tipos de embalagens para o seu comércio!"
                  />
                </div>

                {/* OPÇÃO DE IMAGEM DO NOME DA DISTRIBUIDORA */}
                <div className="pt-2 border-t border-slate-200/80">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                      <ImageIcon className="w-3.5 h-3.5 text-orange-600" />
                      <span>Trocar Nome por Imagem</span>
                    </label>
                    {formData.brandNameImage && (
                      <button
                        type="button"
                        onClick={handleRemoveBrandNameImage}
                        className="text-[10px] text-red-600 hover:text-red-700 font-bold flex items-center gap-1 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                        title="Remover imagem e voltar ao nome em texto"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remover</span>
                      </button>
                    )}
                  </div>

                  <input
                    type="file"
                    ref={brandNameFileInputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleBrandNameImageFile(file);
                    }}
                    accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                    className="hidden"
                  />

                  {formData.brandNameImage ? (
                    <div className="space-y-2.5">
                      {/* Prévia da imagem no tom de fundo do cabeçalho */}
                      <div className="p-3.5 rounded-xl bg-gradient-to-r from-orange-800 via-orange-850 to-orange-900 border border-orange-950 flex items-center justify-between gap-3 shadow-inner min-h-[64px]">
                        <div className="flex-1 overflow-visible py-1 flex items-center">
                          <img
                            src={formData.brandNameImage}
                            alt="Prévia da Imagem do Nome"
                            className="w-auto max-w-full object-contain drop-shadow-sm transition-all duration-100 ease-out"
                            style={{
                              height: `${Math.round(36 * (Math.max(40, Math.min(200, formData.brandNameZoom ?? 100)) / 100))}px`,
                              maxHeight: '84px',
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => brandNameFileInputRef.current?.click()}
                          className="px-2.5 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all shrink-0 cursor-pointer shadow-xs"
                        >
                          <UploadCloud className="w-3 h-3" />
                          <span>Trocar Imagem</span>
                        </button>
                      </div>

                      {/* Slider de ajuste de tamanho / zoom */}
                      <div className="bg-white p-2 rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                            <ZoomIn className="w-3 h-3 text-orange-600" />
                            <span>Tamanho da Imagem:</span>
                            <strong className="text-orange-700 font-black ml-1">
                              {formData.brandNameZoom ?? 100}%
                            </strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleBrandNameZoomChange(100)}
                            className="text-[10px] font-bold text-slate-500 hover:text-orange-600 flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Redefinir tamanho para 100%"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                            <span>100%</span>
                          </button>
                        </div>
                        <input
                          type="range"
                          min="40"
                          max="200"
                          step="1"
                          value={formData.brandNameZoom ?? 100}
                          onChange={(e) => handleBrandNameZoomChange(Number(e.target.value))}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                        />
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => brandNameFileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-orange-300 hover:border-orange-500 bg-white hover:bg-orange-50/50 rounded-xl p-3 text-center cursor-pointer transition-all group"
                      role="button"
                      tabIndex={0}
                    >
                      <UploadCloud className="w-4 h-4 text-orange-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] font-bold text-slate-800 block">
                        Clique para subir uma imagem para o Nome
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        PNG transparente recomendado (substitui o texto no cabeçalho)
                      </span>
                    </div>
                  )}

                  {brandNameUploadError && (
                    <p className="text-[10px] font-semibold text-red-600 bg-red-50 p-2 rounded-lg border border-red-200 mt-2">
                      {brandNameUploadError}
                    </p>
                  )}
                </div>
              </div>

              {/* SEÇÃO DO LOGOTIPO DO CABEÇALHO */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                    <ImageIcon className="w-3.5 h-3.5 text-orange-600" />
                    <span>Logotipo do Cabeçalho</span>
                  </label>
                  {formData.logoImage && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="text-[10px] text-red-600 hover:text-red-700 font-bold flex items-center gap-1 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                      title="Remover logotipo"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remover</span>
                    </button>
                  )}
                </div>

                <input
                  type="file"
                  ref={logoFileInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLogoImageFile(file);
                  }}
                  accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                  className="hidden"
                />

                {/* Prévia da logo exatamente com o formato do cabeçalho */}
                <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
                  <div className="shrink-0 w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden relative bg-gradient-to-r from-orange-700 to-orange-800">
                    {formData.logoImage ? (
                      <img
                        src={formData.logoImage}
                        alt="Prévia do Logo"
                        className="w-full h-full object-contain transition-transform duration-100 ease-out"
                        style={{
                          transform: `scale(${Math.max(30, Math.min(250, formData.logoZoom ?? 100)) / 100})`,
                          transformOrigin: 'center center',
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 text-[10px] font-bold">
                        Sem logo
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <p className="text-[11px] font-bold text-slate-800 leading-tight">
                      {formData.logoImage ? 'Logotipo Personalizado' : 'Logotipo do Cabeçalho'}
                    </p>
                    <button
                      type="button"
                      onClick={() => logoFileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-xs cursor-pointer inline-flex"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>{formData.logoImage ? 'Trocar Logotipo' : 'Fazer Upload do Logotipo'}</span>
                    </button>
                  </div>
                </div>

                {logoUploadError && (
                  <p className="text-[10px] font-semibold text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                    {logoUploadError}
                  </p>
                )}

                {formData.logoImage && (
                  <div className="pt-1 border-t border-slate-200/80">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                        <ZoomIn className="w-3 h-3 text-orange-600" />
                        <span>Tamanho da Logo:</span>
                        <strong className="text-orange-700 font-black ml-1">
                          {formData.logoZoom ?? 100}%
                        </strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleLogoZoomChange(100)}
                        className="text-[10px] font-bold text-slate-500 hover:text-orange-600 flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-slate-200/60 transition-colors cursor-pointer"
                        title="Voltar ao zoom padrão (100%)"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        <span>100%</span>
                      </button>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="250"
                      step="1"
                      value={formData.logoZoom ?? 100}
                      onChange={(e) => handleLogoZoomChange(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                    />
                  </div>
                )}
              </div>

              {/* SEÇÃO DO BANNER DO CATÁLOGO */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                    <ImageIcon className="w-3.5 h-3.5 text-orange-600" />
                    <span>Banner do Catálogo (Opcional)</span>
                  </label>
                  {formData.bannerImage && (
                    <button
                      type="button"
                      onClick={handleRemoveBanner}
                      className="text-[10px] text-red-600 hover:text-red-700 font-bold flex items-center gap-1 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remover</span>
                    </button>
                  )}
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageFile(file);
                  }}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />

                {formData.bannerImage ? (
                  <div className="relative group rounded-xl overflow-hidden border border-slate-300 bg-white shadow-xs">
                    <div className="w-full h-28 overflow-hidden flex items-center justify-center bg-white relative p-1">
                      <img
                        src={formData.bannerImage}
                        alt="Pré-visualização do Banner"
                        className="w-full h-full object-contain transition-transform duration-100 ease-out"
                        style={{
                          transform: `scale(${Math.max(50, Math.min(200, formData.bannerZoom ?? 100)) / 100})`,
                          transformOrigin: 'center center',
                        }}
                      />
                    </div>
                    <div className="p-2 bg-slate-900 border-t border-slate-200 flex items-center justify-between text-xs text-white">
                      <span className="text-[10px] text-slate-300">
                        Zoom atual: <strong className="text-white font-bold">{formData.bannerZoom ?? 100}%</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 active:scale-95 transition-all shadow-xs cursor-pointer"
                      >
                        <UploadCloud className="w-3 h-3" />
                        <span>Trocar Imagem</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-24 border-2 border-dashed border-orange-300 hover:border-orange-500 bg-white hover:bg-orange-50/50 rounded-2xl flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all active:scale-[0.99] group shadow-xs"
                    role="button"
                    tabIndex={0}
                  >
                    <UploadCloud className="w-5 h-5 text-orange-600 mb-1" />
                    <span className="text-xs font-bold text-slate-800 block">
                      Clique para fazer upload de banner
                    </span>
                  </div>
                )}

                {uploadError && (
                  <p className="text-[10px] font-semibold text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                    {uploadError}
                  </p>
                )}

                {formData.bannerImage && (
                  <div className="pt-1 border-t border-slate-200/80">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                        <ZoomIn className="w-3 h-3 text-orange-600" />
                        <span>Zoom do banner:</span>
                        <strong className="text-orange-700 font-black ml-1">
                          {formData.bannerZoom ?? 100}%
                        </strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleZoomChange(100)}
                        className="text-[10px] font-bold text-slate-500 hover:text-orange-600 flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-slate-200/60 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        <span>100%</span>
                      </button>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="200"
                      step="1"
                      value={formData.bannerZoom ?? 100}
                      onChange={(e) => handleZoomChange(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-orange-600" />
                  <span>WhatsApp ( Pedidos )</span>
                </label>
                <input
                  type="text"
                  value={formData.whatsappNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, whatsappNumber: formatPhoneOrMobile(e.target.value) })
                  }
                  className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-orange-500 outline-none"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-orange-600" />
                  <span>Telefone ( Rodapé )</span>
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: formatPhoneOrMobile(e.target.value) })
                  }
                  className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-orange-600" />
                  <span>Endereço ( Rodapé )</span>
                </label>
                <input
                  type="text"
                  value={formData.addressInfo}
                  onChange={(e) => setFormData({ ...formData, addressInfo: e.target.value })}
                  className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1 flex items-center gap-1">
                  <Copyright className="w-3 h-3 text-orange-600" />
                  <span>Ano ( Rodapé )</span>
                </label>
                <input
                  type="text"
                  value={formData.footerYear ?? ''}
                  onChange={(e) => setFormData({ ...formData, footerYear: e.target.value })}
                  className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-orange-500 outline-none"
                  placeholder="Ex: 2026"
                />
              </div>


              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 h-10 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-orange-600/30 cursor-pointer"
                >
                  {savedConfigSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Salvo!</span>
                    </>
                  ) : (
                    <span>Salvar Alterações</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: GERENCIAMENTO DE CATEGORIAS */}
        {activeTab === 'categories' && (
          <div className="p-4 overflow-y-auto flex-1 space-y-3.5">
            {categoryFeedback && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{categoryFeedback}</span>
              </div>
            )}

            {/* BOTÃO "NOVA CATEGORIA" */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 shadow-xs">
              {!isCategoryFormOpen ? (
                <button
                  type="button"
                  onClick={handleOpenNewCategory}
                  className="w-full h-11 bg-orange-600 hover:bg-orange-700 active:scale-[0.99] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-orange-600/25 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Nova Categoria</span>
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-orange-600" />
                      {editingCategoryId ? 'Editar Categoria' : 'Cadastrar Nova Categoria'}
                    </span>
                    <button
                      type="button"
                      onClick={handleCancelCategoryForm}
                      className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Fechar</span>
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveCategory} className="space-y-3 pt-1">
                    {categoryFormError && (
                      <div className="p-2.5 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        <span>{categoryFormError}</span>
                      </div>
                    )}

                    {/* NOME DA CATEGORIA */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-800 block mb-1">
                        Nome da Categoria <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        placeholder="Ex: Sacolas, Caixas, Descartáveis, Bobinas..."
                        className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-xl focus:border-orange-500 outline-none"
                        autoFocus
                        required
                      />
                    </div>

                    {/* DESCRIÇÃO DA CATEGORIA */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-800 block mb-1">
                        Descrição da Categoria (opcional)
                      </label>
                      <input
                        type="text"
                        value={categoryDescription}
                        onChange={(e) => setCategoryDescription(e.target.value)}
                        placeholder="Ex: Sacolas Kraft, Plásticas e Biodegradáveis"
                        className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-xl focus:border-orange-500 outline-none"
                      />
                    </div>

                    {/* IMAGEM DA CATEGORIA */}
                    <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-orange-600" />
                          <span>Imagem da Categoria</span>
                        </label>
                      </div>

                      {/* Prévia com fundo branco e imagem ocupando até 70% à direita */}
                      <div className="relative w-full h-28 rounded-xl overflow-hidden border border-slate-300 bg-white shadow-xs flex items-center">
                        <div className="absolute right-0 top-0 bottom-0 w-[70%] h-full flex items-center justify-center pr-5 pl-2 py-1 overflow-hidden bg-white">
                          {categoryImageUrl ? (
                            <img
                              src={categoryImageUrl}
                              alt="Prévia da Categoria"
                              className="w-full h-full object-contain transition-transform duration-100 ease-out"
                              style={{
                                transform: `scale(${Math.max(20, Math.min(250, categoryImageZoom ?? 100)) / 100})`,
                                transformOrigin: 'center center',
                              }}
                            />
                          ) : (
                            <span className="text-[10px] text-slate-300 font-medium text-center">
                              Sem imagem
                            </span>
                          )}
                        </div>
                        <span className="absolute top-2 left-2 bg-white text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm border border-slate-200 max-w-[46%] truncate">
                          {categoryName || 'Nome da Categoria'}
                        </span>
                      </div>

                      {/* Botões de Ação de Imagem */}
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          ref={categoryFileInputRef}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleCategoryImageFile(file);
                          }}
                          accept="image/png, image/jpeg, image/jpg, image/webp"
                          className="hidden"
                        />

                        <button
                          type="button"
                          onClick={() => categoryFileInputRef.current?.click()}
                          className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-200 transition-colors cursor-pointer"
                        >
                          <UploadCloud className="w-3.5 h-3.5 text-orange-600" />
                          <span>Fazer Upload da Imagem</span>
                        </button>
                      </div>

                      {categoryUploadError && (
                        <p className="text-[10px] text-rose-600 font-medium">
                          {categoryUploadError}
                        </p>
                      )}

                      {/* Slider de Zoom proporcional da imagem */}
                      <div className="pt-2 border-t border-slate-100 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                          <span className="flex items-center gap-1">
                            <ZoomIn className="w-3 h-3 text-orange-600" />
                            <span>Zoom proporcional:</span>
                            <strong className="text-orange-700 font-black ml-1">
                              {categoryImageZoom}%
                            </strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => setCategoryImageZoom(100)}
                            className="text-[10px] text-slate-500 hover:text-orange-600 font-bold flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Voltar ao zoom padrão (100%)"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                            <span>100%</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setCategoryImageZoom((prev) => Math.max(20, prev - 5))}
                            disabled={categoryImageZoom <= 20}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-black text-sm flex items-center justify-center disabled:opacity-40 shrink-0 cursor-pointer transition-all"
                            title="Diminuir"
                          >
                            -
                          </button>
                          <input
                            type="range"
                            min="20"
                            max="250"
                            step="1"
                            value={categoryImageZoom}
                            onChange={(e) => setCategoryImageZoom(Number(e.target.value))}
                            className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                          />
                          <button
                            type="button"
                            onClick={() => setCategoryImageZoom((prev) => Math.min(250, prev + 5))}
                            disabled={categoryImageZoom >= 250}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-black text-sm flex items-center justify-center disabled:opacity-40 shrink-0 cursor-pointer transition-all"
                            title="Aumentar"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleCancelCategoryForm}
                        className="flex-1 h-9 bg-slate-200/80 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="flex-1 h-9 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm shadow-orange-600/30 transition-all cursor-pointer"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>{editingCategoryId ? 'Salvar Categoria' : 'Cadastrar Categoria'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* LISTA DE CATEGORIAS CADASTRADAS */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-orange-600" />
                  <span>Categorias Cadastradas ({categories.length})</span>
                </span>
              </div>

              {categories.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-400">
                  <Layers className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                  <p className="text-xs font-semibold text-slate-600">Nenhuma categoria cadastrada</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Clique em &quot;Nova Categoria&quot; acima para criar uma categoria de produtos.
                  </p>
                </div>
              ) : (
                categories.map((cat, idx) => {
                  const isBeingEdited = editingCategoryId === cat.id;
                  const linkedProductsCount = products.filter(
                    (p) => p.categoryId === cat.id || (!p.categoryId && (p.category === cat.name || p.category === cat.id))
                  ).length;

                  return (
                    <div
                      key={cat.id}
                      className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 select-none ${
                        isBeingEdited
                          ? 'bg-orange-50/70 border-orange-400 ring-2 ring-orange-200'
                          : cat.isActive === false
                          ? 'bg-slate-50/80 border-slate-200 opacity-75'
                          : 'bg-white border-slate-200/90 shadow-2xs hover:border-slate-300'
                      }`}
                    >
                      {/* Controles Up / Down */}
                      <div className="flex flex-col -space-y-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveCategory(idx, 'up')}
                          disabled={idx === 0}
                          className="p-0.5 text-slate-400 hover:text-orange-600 disabled:opacity-20 transition-colors cursor-pointer"
                          title="Mover para cima"
                        >
                          <ChevronUp className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveCategory(idx, 'down')}
                          disabled={idx === categories.length - 1}
                          className="p-0.5 text-slate-400 hover:text-orange-600 disabled:opacity-20 transition-colors cursor-pointer"
                          title="Mover para baixo"
                        >
                          <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>

                      {/* Imagem Thumbnail da Categoria */}
                      <div className="w-16 h-11 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0 relative flex items-center justify-center p-0.5">
                        <img
                          src={cat.imageUrl}
                          alt={cat.name}
                          className={`w-full h-full object-contain ${
                            cat.isActive === false ? 'grayscale opacity-75' : ''
                          }`}
                        />
                        {cat.isActive === false && (
                          <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center">
                            <EyeOff className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Dados da Categoria */}
                      <div className="min-w-0 flex-1 pr-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h5
                            className={`text-xs font-bold leading-snug truncate ${
                              cat.isActive === false ? 'text-slate-500 line-through' : 'text-slate-900'
                            }`}
                          >
                            {cat.name}
                          </h5>
                          {cat.isActive === false && (
                            <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-sm bg-slate-200 text-slate-600">
                              Inativa
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                          {linkedProductsCount}{' '}
                          {linkedProductsCount === 1 ? 'produto vinculado' : 'produtos vinculados'}
                        </span>
                      </div>

                      {/* Ações */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleCategoryActive(cat.id, cat.name, cat.isActive !== false)
                          }
                          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                            cat.isActive !== false
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                          title={cat.isActive !== false ? 'Desativar categoria' : 'Ativar categoria'}
                        >
                          {cat.isActive !== false ? (
                            <Eye className="w-3.5 h-3.5 stroke-[2.5]" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5 stroke-[2.5]" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEditCategory(cat)}
                          className="p-1.5 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 active:scale-95 transition-all cursor-pointer"
                          title={`Editar categoria ${cat.name}`}
                        >
                          <Edit2 className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:scale-95 transition-all cursor-pointer"
                          title={`Excluir categoria ${cat.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 3: GERENCIAMENTO DE PRODUTOS */}
        {activeTab === 'products' && (
          <div className="p-4 overflow-y-auto flex-1 space-y-3.5">
            {productFeedback && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{productFeedback}</span>
              </div>
            )}

            {/* BOTÃO "NOVO PRODUTO" */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 shadow-xs">
              {!isProductFormOpen ? (
                <button
                  type="button"
                  onClick={handleOpenNewProduct}
                  className="w-full h-11 bg-orange-600 hover:bg-orange-700 active:scale-[0.99] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-orange-600/25 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Novo Produto</span>
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-orange-600" />
                      {editingProductId ? 'Editar Produto' : 'Cadastrar Novo Produto'}
                    </span>
                    <button
                      type="button"
                      onClick={handleCancelProductForm}
                      className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Fechar</span>
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveProduct} className="space-y-3 pt-1">
                    {productFormError && (
                      <div className="p-2.5 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        <span>{productFormError}</span>
                      </div>
                    )}

                    {/* VINCULAR À CATEGORIA */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-800 block mb-1">
                        Categoria do Produto <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={productCategoryId}
                        onChange={(e) => setProductCategoryId(e.target.value)}
                        className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-xl focus:border-orange-500 outline-none font-bold text-slate-800"
                        required
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* NOME DO PRODUTO */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Nome do Produto <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        placeholder="Ex: Sacola Kraft M - Pacote c/ 50 un."
                        className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-xl focus:border-orange-500 outline-none"
                        required
                      />
                    </div>

                    {/* DESCRIÇÃO DO PRODUTO */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Descrição Curta
                      </label>
                      <input
                        type="text"
                        value={productDescription}
                        onChange={(e) => setProductDescription(e.target.value)}
                        placeholder="Ex: Medidas 24x10x33cm - Papel Kraft 80g"
                        className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-xl focus:border-orange-500 outline-none"
                      />
                    </div>

                    {/* PREÇO DO PRODUTO */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Preço (R$) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400 select-none">
                          R$
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={productPrice}
                          onChange={(e) => setProductPrice(formatCurrencyInput(e.target.value))}
                          placeholder="0,00"
                          className="w-full h-10 pl-9 pr-3 text-xs font-black text-orange-700 bg-white border border-slate-300 rounded-xl focus:border-orange-500 outline-none tabular-nums"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleCancelProductForm}
                        className="flex-1 h-9 bg-slate-200/80 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="flex-1 h-9 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm shadow-orange-600/30 transition-all cursor-pointer"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>{editingProductId ? 'Salvar Produto' : 'Cadastrar Produto'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* LISTA DE PRODUTOS */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-orange-600" />
                  <span>Produtos Cadastrados ({products.length})</span>
                </span>
              </div>

              {products.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-400">
                  <Package className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                  <p className="text-xs font-semibold text-slate-600">Nenhum produto cadastrado</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Clique em &quot;Novo Produto&quot; acima para adicionar itens ao catálogo.
                  </p>
                </div>
              ) : (
                products.map((item, idx) => {
                  const isBeingEdited = editingProductId === item.id;
                  const cat = categories.find((c) => c.id === item.categoryId);

                  return (
                    <div
                      key={item.id}
                      className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 select-none ${
                        isBeingEdited
                          ? 'bg-orange-50/70 border-orange-400 ring-2 ring-orange-200'
                          : item.isActive === false
                          ? 'bg-slate-50/80 border-slate-200 opacity-75'
                          : 'bg-white border-slate-200/90 shadow-2xs hover:border-slate-300'
                      }`}
                    >
                      {/* Controles Up/Down */}
                      <div className="flex flex-col -space-y-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveProduct(idx, 'up')}
                          disabled={idx === 0}
                          className="p-0.5 text-slate-400 hover:text-orange-600 disabled:opacity-20 transition-colors cursor-pointer"
                          title="Mover para cima"
                        >
                          <ChevronUp className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveProduct(idx, 'down')}
                          disabled={idx === products.length - 1}
                          className="p-0.5 text-slate-400 hover:text-orange-600 disabled:opacity-20 transition-colors cursor-pointer"
                          title="Mover para baixo"
                        >
                          <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>

                      {/* Informações do Produto */}
                      <div className="min-w-0 flex-1 pr-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h5
                            className={`text-xs font-bold leading-snug truncate ${
                              item.isActive === false ? 'text-slate-500 line-through' : 'text-slate-900'
                            }`}
                          >
                            {item.name}
                          </h5>
                          {cat && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-orange-100 text-orange-800 truncate max-w-[110px]">
                              {cat.name}
                            </span>
                          )}
                          {item.isActive === false && (
                            <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-sm bg-slate-200 text-slate-600">
                              Inativo
                            </span>
                          )}
                        </div>
                        {item.shortDescription && (
                          <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                            {item.shortDescription}
                          </p>
                        )}
                        <span
                          className={`text-xs font-black tabular-nums mt-0.5 block ${
                            item.isActive === false ? 'text-slate-400' : 'text-orange-700'
                          }`}
                        >
                          R$ {formatCurrency(item.price)}
                        </span>
                      </div>

                      {/* Botões Ativar/Desativar, Editar, Excluir */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleProductActive(item.id, item.name, item.isActive !== false)
                          }
                          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                            item.isActive !== false
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                          title={item.isActive !== false ? 'Desativar produto' : 'Ativar produto'}
                        >
                          {item.isActive !== false ? (
                            <Eye className="w-3.5 h-3.5 stroke-[2.5]" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5 stroke-[2.5]" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEditProduct(item)}
                          className="p-1.5 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 active:scale-95 transition-all cursor-pointer"
                          title={`Editar produto ${item.name}`}
                        >
                          <Edit2 className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(item.id, item.name)}
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:scale-95 transition-all cursor-pointer"
                          title={`Excluir ${item.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
