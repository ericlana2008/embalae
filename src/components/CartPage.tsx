import React, { useEffect } from 'react';
import { ShoppingBag, ArrowLeft, Trash2 } from 'lucide-react';
import { CartItem } from '../types';
import { formatCurrency } from '../utils/format';

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

interface CartPageProps {
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onClearCart: () => void;
  onBackToCatalog: () => void;
  onSubmitOrder: () => void;
}

export const CartPage: React.FC<CartPageProps> = ({
  items,
  totalPrice,
  onUpdateQuantity,
  onClearCart,
  onBackToCatalog,
  onSubmitOrder,
}) => {
  // Ao excluir os produtos e o carrinho ficar vazio, exibe a mensagem por 1,4s e fecha automaticamente
  useEffect(() => {
    if (items.length === 0) {
      const timer = setTimeout(() => {
        onBackToCatalog();
      }, 1400);
      return () => clearTimeout(timer);
    }
  }, [items.length, onBackToCatalog]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 p-3 pb-8 max-w-md mx-auto w-full space-y-3">
        {/* CONTAINER PRINCIPAL DO CARRINHO */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          {/* Header da página */}
          <div className="bg-slate-50/90 px-3.5 py-2.5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-orange-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Meu Carrinho
              </h2>
            </div>
            <button
              type="button"
              onClick={onBackToCatalog}
              className="text-xs font-bold text-orange-700 hover:text-orange-800 flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Continuar Comprando</span>
            </button>
          </div>

          {/* Conteúdo do Carrinho */}
          <div className="p-3.5 space-y-3">
            {items.length === 0 ? (
              <div className="py-16 text-center flex flex-col items-center justify-center animate-in fade-in duration-200">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-3">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="text-base font-bold text-slate-800">Seu carrinho está vazio</p>
                <p className="text-xs text-slate-500 mt-1 max-w-[240px]">
                  Adicione produtos no carrinho para continuar.
                </p>
                <button
                  type="button"
                  onClick={onBackToCatalog}
                  className="mt-5 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Ver Produtos do Catálogo</span>
                </button>
              </div>
            ) : (
              <>
                {/* Lista dos produtos do carrinho */}
                <div className="divide-y divide-slate-100">
                  {items.map(({ product, quantity }) => (
                    <div
                      key={product.id}
                      className="py-3 first:pt-0 last:pb-2 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-orange-600 shrink-0" />
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 truncate leading-snug">
                            {product.name}
                          </h4>
                          <p className="text-xs font-semibold text-slate-600 tabular-nums mt-0.5">
                            {String(quantity).padStart(2, '0')} x R$ {formatCurrency(product.price)} = R$ {formatCurrency(product.price * quantity)}
                          </p>
                        </div>
                      </div>

                      {/* Seletor de quantidades (- e +) */}
                      <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200/80 shrink-0 shadow-inner">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                          className="w-8 h-8 rounded-lg bg-white text-slate-800 flex items-center justify-center shadow-xs active:scale-90 hover:bg-slate-50 transition-all font-bold cursor-pointer"
                          aria-label={`Diminuir quantidade de ${product.name}`}
                        >
                          -
                        </button>
                        <span className="w-7 text-center text-xs font-black text-slate-900 tabular-nums select-none">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                          className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center shadow-xs active:scale-90 hover:bg-orange-700 transition-all font-bold cursor-pointer"
                          aria-label={`Aumentar quantidade de ${product.name}`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* BOTÃO LIMPAR */}
                <div className="pt-2.5 pb-1 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={onClearCart}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-500 hover:text-rose-600 active:scale-95 rounded-lg hover:bg-rose-50 border border-rose-200/80 transition-colors cursor-pointer"
                    title="Limpar todos os produtos do carrinho"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Limpar</span>
                  </button>
                </div>

                {/* RESUMO: VALOR DOS PRODUTOS + BOTÃO ENVIAR PEDIDO COM ÍCONE NA FRENTE */}
                <div className="mt-2 p-3.5 bg-slate-50/90 rounded-xl border border-slate-200/90 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-700">Total do Pedido:</span>
                    <span className="text-base font-black text-slate-900 tabular-nums">
                      R$ {formatCurrency(totalPrice)}
                    </span>
                  </div>

                  {/* Botão ENVIAR PEDIDO com cor verde e ícone oficial do WhatsApp em branco */}
                  <button
                    type="button"
                    onClick={onSubmitOrder}
                    className="w-full h-12 rounded-xl bg-[#4fcc5d] hover:bg-[#43b64f] active:bg-[#3ba647] text-white font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2.5 shadow-lg shadow-[#4fcc5d]/30 active:scale-[0.98] transition-all ring-2 ring-[#4fcc5d]/40 cursor-pointer"
                  >
                    <WhatsAppIcon className="w-5 h-5 text-white shrink-0" />
                    <span>ENVIAR PEDIDO</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
