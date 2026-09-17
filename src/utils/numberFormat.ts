// Formats numbers with French / Western numerals (e.g. 50 000, 1 500 000)
export const formatNumberFr = (num: number | string | undefined | null): string => {
  if (num === undefined || num === null) return '0';
  const val = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(val)) return '0';
  return val.toLocaleString('fr-FR');
};

export const formatCoins = (coins: number | undefined | null): string => {
  return formatNumberFr(coins);
};

export const formatDiamonds = (diamonds: number | undefined | null): string => {
  return formatNumberFr(diamonds);
};
