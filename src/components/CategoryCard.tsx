import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { Category, Product } from '../types';

interface CategoryCardProps {
  category: Category;
  products: Product[];
  quantities: Record<string, number>;
  onSelectCategory: (category: Category) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  products,
  quantities,
  onSelectCategory,
}) => {
  // Count how many products belong to this category and how many items are in cart
  const categoryProducts = products.filter(
    (p) =>
      (p.categoryId === category.id ||
        (!p.categoryId && (p.category === category.name || p.category === category.id))) &&
      p.isActive !== false
  );

  const cartItemsCount = categoryProducts.reduce(
    (acc, p) => acc + (quantities[p.id] || 0),
    0
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelectCategory(category)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectCategory(category);
        }
      }}
      className="relative w-full h-36 sm:h-44 rounded-2xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-md border border-slate-200/90 hover:border-orange-500/80 active:scale-[0.985] transition-all duration-200 select-none bg-white flex items-center"
      aria-label={`Categoria ${category.name}. Clique para ver os produtos.`}
    >
      {/* Imagem ocupando até 70% da largura, posicionada à direita com maior espaçamento da borda */}
      <div className="absolute right-0 top-0 bottom-0 w-[70%] h-full flex items-center justify-center pr-6 sm:pr-8 pl-3 py-2 overflow-hidden bg-white">
        <div className="w-full h-full flex items-center justify-center transition-transform duration-300 ease-out group-hover:scale-108 group-active:scale-102">
          {category.imageUrl ? (
            <img
              src={category.imageUrl}
              alt={category.name}
              className="w-full h-full object-contain transition-transform duration-150 ease-out"
              style={{
                transform: `scale(${Math.max(20, Math.min(250, category.imageZoom ?? 100)) / 100})`,
                transformOrigin: 'center center',
              }}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-white flex items-center justify-center text-slate-300 font-semibold text-xs">
              Sem imagem
            </div>
          )}
        </div>
      </div>

      {/* Lado esquerdo: Tarja branca com o nome da categoria na parte superior */}
      <div className="absolute top-3 left-3 z-10 pointer-events-none max-w-[48%]">
        <div className="bg-white text-slate-900 font-black text-xs sm:text-sm px-3 py-1.5 rounded-xl shadow-sm border border-slate-200/90 tracking-tight leading-snug flex items-center gap-1.5">
          <span className="truncate">{category.name}</span>
        </div>
      </div>

      {/* Indicador de itens já adicionados ao carrinho (posicionado no canto inferior esquerdo) */}
      {cartItemsCount > 0 && (
        <div className="absolute bottom-3 left-3 z-10 bg-orange-600 text-white font-extrabold text-[11px] px-2.5 py-1 rounded-full shadow-md border border-white/90 flex items-center gap-1.5 animate-in zoom-in-75">
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>
            {cartItemsCount} {cartItemsCount === 1 ? 'item' : 'itens'}
          </span>
        </div>
      )}
    </div>
  );
};
