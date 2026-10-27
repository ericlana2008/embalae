/**
 * Formata um valor numérico para o padrão de moeda brasileiro (pt-BR).
 * Garante o separador de milhar com ponto (.) para valores >= 1000 e vírgula para decimais.
 * Suporta números e strings formatadas (ex: "105", "25,50", "1.450,00", 25000.5).
 * Ex: 105 -> "105,00"
 * Ex: 1450 -> "1.450,00"
 * Ex: 25000.5 -> "25.000,50"
 */
export const formatCurrency = (val: number | string | undefined | null): string => {
  if (val === undefined || val === null || val === '') return '0,00';
  let num: number;
  if (typeof val === 'number') {
    num = val;
  } else {
    const str = String(val).trim();
    if (str.includes(',')) {
      // Valor com vírgula decimal brasileira (ex: "1.450,50" ou "25,50")
      num = parseFloat(str.replace(/\./g, '').replace(',', '.'));
    } else {
      num = parseFloat(str.replace(/[^\d.-]/g, ''));
    }
  }
  return (isNaN(num) ? 0 : num).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
