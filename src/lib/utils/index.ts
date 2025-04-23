// Fonctions utilitaires génériques

/**
 * Génère un ID unique pour les éléments de l'application
 */
export const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };
  
  /**
   * Formate un nombre en valeur monétaire
   */
  export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };
  
  /**
   * Limite le nombre de caractères d'une chaîne et ajoute ... si nécessaire
   */
  export const truncateString = (str: string, maxLength: number): string => {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength) + '...';
  };
  
  /**
   * Convertit un pourcentage décimal en chaîne formatée
   */
  export const formatPercentage = (value: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };