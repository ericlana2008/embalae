import React from 'react';
import { Search, ShoppingBag, X } from 'lucide-react';
import { formatCurrency } from '../utils/format';

interface SearchBarAndCartProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  totalItems: number;
  totalPrice: number;
  onOpenCart: () => void;
}

export const SearchBarAndCart: React.FC<SearchBarAndCartProps> = ({
  searchTerm,
  onSearchChange,
  totalItems,
  totalPrice,
  onOpenCart,
}) => {
  return (
    <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-slate-200/80 shadow-xs">
      <div className="flex items-center gap-2">
        {/* Barra de Pesquisa (lado esquerdo) */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Digite o que procura..."
            className="w-full h-11 pl-9 pr-8 text-sm bg-slate-100 hover:bg-slate-50 focus:bg-white text-slate-900 placeholder:text-slate-400 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
              aria-label="Limpar pesquisa"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Carrinho de Compras Funcional (mesma linha, lado direito) */}
        <button
          onClick={onOpenCart}
          className={`relative h-11 px-3.5 rounded-xl flex items-center gap-2 transition-all active:scale-95 shrink-0 ${
            totalItems > 0
              ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-500/25 ring-2 ring-orange-500/30'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
          }`}
          aria-label={`Carrinho com ${totalItems} itens, total de R$ ${totalPrice.toFixed(2)}`}
        >
          <div className="relative flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2.5 bg-orange-800 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-in zoom-in-50 duration-200">
                {totalItems}
              </span>
            )}
          </div>

          <div className="flex flex-col text-left leading-tight hidden xs:flex">
            <span className="text-[10px] uppercase font-bold tracking-tight opacity-90">
              {totalItems === 0 ? 'Carrinho' : `${totalItems} ${totalItems === 1 ? 'item' : 'itens'}`}
            </span>
            {totalItems > 0 && (
              <span className="text-xs font-black tabular-nums">
                R$ {formatCurrency(totalPrice)}
              </span>
            )}
          </div>
        </button>
      </div>
    </div>
  );
};
