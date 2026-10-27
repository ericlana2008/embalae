import React from 'react';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { DistributorConfig } from '../types';
import { formatCurrency } from '../utils/format';

interface SuccessViewProps {
  config: DistributorConfig;
  lastOrderSummary?: {
    customerName: string;
    total: number;
    itemsCount: number;
    whatsappUrl: string;
  } | null;
  onNewOrder: () => void;
}

export const SuccessView: React.FC<SuccessViewProps> = ({
  config,
  lastOrderSummary,
  onNewOrder,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xl text-center space-y-5 animate-in zoom-in-95 duration-200">
        {/* Animated Check Icon */}
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider inline-block">
            Pedido Enviado com Sucesso!
          </span>
          <h2 className="text-xl font-extrabold text-slate-900">
            Agradecemos a sua preferência!
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
            Seu pedido foi direcionado ao WhatsApp da {config.name || 'nossa distribuidora'}. Nossa equipe já está preparando a sua entrega!
          </p>
        </div>

        {/* Resumo compacto do pedido se disponível */}
        {lastOrderSummary && (
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-xs text-slate-600 space-y-1 text-left">
            <div className="flex justify-between font-semibold">
              <span>Cliente:</span>
              <span className="text-slate-800">{lastOrderSummary.customerName || 'Cliente'}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total do Pedido:</span>
              <span className="text-emerald-700 font-bold">
                R$ {formatCurrency(lastOrderSummary.total)}
              </span>
            </div>
          </div>
        )}

        {/* Botão Voltar ao Catálogo na mesma cor marrom do cabeçalho */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onNewOrder}
            className="w-full h-12 bg-gradient-to-r from-orange-700 via-orange-800 to-orange-900 hover:from-orange-800 hover:via-orange-900 hover:to-orange-950 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-orange-950/25 active:scale-95 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Voltar ao Catálogo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
