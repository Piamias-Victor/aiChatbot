/**
 * Calcule la marge en pourcentage
 * @param purchasePrice Prix d'achat
 * @param sellingPrice Prix de vente
 * @returns Pourcentage de marge (0.2 pour 20%)
 */
export const calculateMarginPercentage = (
    purchasePrice: number,
    sellingPrice: number
  ): number => {
    if (sellingPrice === 0) return 0;
    return (sellingPrice - purchasePrice) / sellingPrice;
  };
  
  /**
   * Calcule la marge en valeur absolue
   * @param purchasePrice Prix d'achat
   * @param sellingPrice Prix de vente
   * @returns Marge en valeur absolue
   */
  export const calculateMarginAmount = (
    purchasePrice: number,
    sellingPrice: number
  ): number => {
    return sellingPrice - purchasePrice;
  };
  
  /**
   * Calcule le coefficient multiplicateur
   * @param purchasePrice Prix d'achat
   * @param sellingPrice Prix de vente
   * @returns Coefficient multiplicateur
   */
  export const calculateMultiplier = (
    purchasePrice: number,
    sellingPrice: number
  ): number => {
    if (purchasePrice === 0) return 0;
    return sellingPrice / purchasePrice;
  };
  
  /**
   * Formate un prix en euros
   * @param price Prix à formater
   * @returns Prix formaté (ex: 12,50 €)
   */
  export const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };