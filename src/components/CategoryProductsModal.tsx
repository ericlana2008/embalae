import React from 'react';
import { X, Minus, Plus, ShoppingBag, ArrowRight, PackageOpen } from 'lucide-react';
import { Category, Product } from '../types';
import { formatCurrency } from '../utils/format';

interface CategoryProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  products: Product[];
  quantities: Record<string, number>;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onGoToCart?: () => void;
}

export const CategoryProductsModal: React.FC<CategoryProductsModalProps> = ({
  isOpen,
  onClose,
  category,
  products,
  quantities,
  onUpdateQuantity,
  onGoToCart,
}) => {
  if (!isOpen || !category) return null;

  // Filter products belonging to this category
  const categoryProducts = products.filter(
    (p) =>
      (p.categoryId === category.id ||
        (!p.categoryId && (p.category === category.name || p.category === category.id))) &&
      p.isActive !== false
  );

  // Total quantity of items in cart for this category and overall
  const categoryCartItemsCount = categoryProducts.reduce(
    (acc, p) => acc + (quantities[p.id] || 0),
    0
  );

  const categorySubtotal = categoryProducts.reduce(
    (acc, p) => acc + p.price * (quantities[p.id] || 0),
    0
  );

  const totalCartCount = Object.values(quantities).reduce((acc, qty) => acc + qty, 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/65 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200"
      >
        {/* Header do Modal com Nome da Categoria */}
        <div className="p-4 pb-3.5 border-b border-slate-100 bg-slate-50/90 flex items-center justify-between">
          <div className="min-w-0 flex-1 pr-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-600 shrink-0" />
              <h3 className="text-base font-black text-slate-900 tracking-tight leading-tight truncate">
                {category.name}
              </h3>
            </div>
            {category.description && (
              <p className="text-xs text-slate-500 font-normal line-clamp-1 mt-0.5">
                {category.description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Fechar"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Lista de Produtos em Linhas (sem imagem nos produtos) */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2.5">
          {categoryProducts.length === 0 ? (
            <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-2.5">
                <PackageOpen className="w-7 h-7 text-slate-400" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                Nenhum produto cadastrado
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Ainda não há produtos cadastrados nesta categoria. Você pode adicionar novos produtos através do painel de gerenciamento.
              </p>
            </div>
          ) : (
            categoryProducts.map((product) => {
              const qty = quantities[product.id] || 0;

              return (
                <div
                  key={product.id}
                  className={`p-3.5 rounded-2xl border transition-all duration-150 flex items-center justify-between gap-3 ${
                    qty > 0
                      ? 'border-orange-500/60 bg-orange-50/25 ring-1 ring-orange-500/30 shadow-xs'
                      : 'border-slate-200/90 bg-white hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  {/* Dados do produto em linhas: Nome na 1ª linha, descrição logo abaixo na 2ª linha, preço */}
                  <div className="flex-1 min-w-0 pr-2">
                    {/* Linha 1: Nome do produto */}
                    <h4 className="text-sm font-bold text-slate-900 leading-snug truncate">
                      {product.name}
                    </h4>

                    {/* Linha 2: Pequena descrição logo abaixo */}
                    {product.shortDescription && (
                      <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                        {product.shortDescription}
                      </p>
                    )}

                    {/* Preço do produto */}
                    <div className="mt-1.5 flex items-baseline gap-2">
                      <span className="text-sm font-black text-orange-600 tabular-nums leading-none">
                        R$ {formatCurrency(product.price)}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-[10px] text-slate-400 line-through tabular-nums leading-none">
                          R$ {formatCurrency(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Seletor de quantidades (- e +) */}
                  <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200/80 shrink-0 shadow-inner">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(product.id, Math.max(0, qty - 1))}
                      disabled={qty === 0}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                        qty === 0
                          ? 'text-slate-300 cursor-not-allowed opacity-40'
                          : 'bg-white text-orange-700 shadow-xs hover:bg-slate-50 active:scale-90 font-bold cursor-pointer'
                      }`}
                      aria-label={`Diminuir quantidade de ${product.name}`}
                    >
                      <Minus className="w-4 h-4 stroke-[2.5]" />
                    </button>

                    <span className="w-7 text-center text-xs font-black text-slate-900 tabular-nums select-none">
                      {qty}
                    </span>

                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(product.id, qty + 1)}
                      className="w-8 h-8 rounded-lg bg-orange-600 hover:bg-orange-700 active:scale-90 text-white shadow-xs flex items-center justify-center transition-all font-bold cursor-pointer"
                      aria-label={`Aumentar quantidade de ${product.name}`}
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Rodapé do Modal: Total e Ação */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/90 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              {categoryCartItemsCount > 0
                ? `${categoryCartItemsCount} ${categoryCartItemsCount === 1 ? 'item nesta categoria' : 'itens nesta categoria'}`
                : 'Nenhum item selecionado'}
            </span>
            {categorySubtotal > 0 && (
              <span className="text-sm font-black text-slate-900 tabular-nums">
                R$ {formatCurrency(categorySubtotal)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2.5 rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Voltar
            </button>

            {totalCartCount > 0 && onGoToCart && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onGoToCart();
                }}
                className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-black shadow-md shadow-orange-600/25 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Ver Carrinho</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
