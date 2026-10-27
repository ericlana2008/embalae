import React from 'react';
import { Category, Product } from '../types';
import { CategoryCard } from './CategoryCard';
import { PackageOpen, Minus, Plus, Search } from 'lucide-react';
import { formatCurrency } from '../utils/format';

interface ProductListProps {
  categories: Category[];
  products: Product[];
  quantities: Record<string, number>;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  searchTerm: string;
  onClearSearch: () => void;
  onSelectCategory: (category: Category) => void;
}

// Remove accents / diacritics and convert to lower case for insensitive search
const normalizeText = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export const ProductList: React.FC<ProductListProps> = ({
  categories,
  products,
  quantities,
  onUpdateQuantity,
  searchTerm,
  onClearSearch,
  onSelectCategory,
}) => {
  const activeCategories = categories.filter((c) => c.isActive !== false);
  const activeProducts = products.filter((p) => p.isActive !== false);

  // If user is searching, find products and categories matching the search
  const isSearching = searchTerm.trim().length > 0;
  const term = normalizeText(searchTerm);

  const matchedProducts = isSearching
    ? activeProducts.filter((p) => {
        return (
          normalizeText(p.name || '').includes(term) ||
          normalizeText(p.shortDescription || '').includes(term) ||
          normalizeText(p.category || '').includes(term)
        );
      })
    : [];

  const matchedCategories = isSearching
    ? activeCategories.filter((c) => {
        const matchesCategoryName = normalizeText(c.name || '').includes(term);
        const hasMatchingProduct = activeProducts.some(
          (p) =>
            p.categoryId === c.id &&
            (normalizeText(p.name || '').includes(term) ||
              normalizeText(p.shortDescription || '').includes(term))
        );
        return matchesCategoryName || hasMatchingProduct;
      })
    : activeCategories;

  // Empty state when there are no categories
  if (activeCategories.length === 0 && !isSearching) {
    return (
      <div className="py-16 px-4 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 mb-3 shadow-inner">
          <PackageOpen className="w-8 h-8 text-slate-400" />
        </div>
        <h4 className="text-sm font-bold text-slate-800">Nenhuma Categoria Cadastrada</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          Cadastre novas categorias e produtos através do painel administrativo (/admin).
        </p>
      </div>
    );
  }

  // When searching, if nothing matches
  if (isSearching && matchedProducts.length === 0 && matchedCategories.length === 0) {
    return (
      <div className="py-16 px-4 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 mb-3 shadow-inner">
          <Search className="w-8 h-8 text-slate-400" />
        </div>
        <h4 className="text-sm font-bold text-slate-800">Nenhum resultado encontrado</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          Não encontramos nenhum produto ou categoria correspondente a &quot;{searchTerm}&quot;.
        </p>
        <button
          onClick={onClearSearch}
          className="mt-3 px-4 py-2 text-xs font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors cursor-pointer"
        >
          Limpar pesquisa
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 space-y-4">
      {/* If searching and we matched direct products, show them in lines (no images) */}
      {isSearching && matchedProducts.length > 0 && (
        <div className="space-y-2.5 pb-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Produtos encontrados ({matchedProducts.length})
            </span>
            <button
              onClick={onClearSearch}
              className="text-[11px] font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
            >
              Ver todas as categorias
            </button>
          </div>

          <div className="space-y-2.5">
            {matchedProducts.map((product) => {
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
                  <div className="flex-1 min-w-0 pr-2">
                    <h4 className="text-sm font-bold text-slate-900 leading-snug truncate">
                      {product.name}
                    </h4>
                    {product.shortDescription && (
                      <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                        {product.shortDescription}
                      </p>
                    )}
                    <div className="mt-1.5 flex items-baseline gap-2">
                      <span className="text-sm font-black text-orange-600 tabular-nums leading-none">
                        R$ {formatCurrency(product.price)}
                      </span>
                    </div>
                  </div>

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
                      aria-label={`Diminuir ${product.name}`}
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
                      aria-label={`Aumentar ${product.name}`}
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main categories list: 100% filled container buttons */}
      <div className="space-y-3">
        {isSearching && matchedCategories.length > 0 && (
          <span className="text-xs font-black text-slate-800 uppercase tracking-wider block">
            Categorias correspondentes
          </span>
        )}

        {matchedCategories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            products={products}
            quantities={quantities}
            onSelectCategory={onSelectCategory}
          />
        ))}
      </div>
    </div>
  );
};
