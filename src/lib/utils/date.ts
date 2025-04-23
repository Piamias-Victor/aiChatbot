/**
 * Formate une date selon le format français
 */
export const formatDate = (date: string | Date): string => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };
  
  /**
   * Formate une date avec l'heure
   */
  export const formatDateTime = (date: string | Date): string => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  /**
   * Retourne la date d'aujourd'hui au format YYYY-MM-DD
   */
  export const getTodayDate = (): string => {
    return new Date().toISOString().split('T')[0];
  };
  
  /**
   * Retourne la date d'il y a 'days' jours au format YYYY-MM-DD
   */
  export const getDateDaysAgo = (days: number): string => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  };
  
  /**
   * Retourne le premier jour du mois courant au format YYYY-MM-DD
   */
  export const getFirstDayOfMonth = (): string => {
    const date = new Date();
    date.setDate(1);
    return date.toISOString().split('T')[0];
  };
  
  /**
   * Retourne le premier jour du mois précédent au format YYYY-MM-DD
   */
  export const getFirstDayOfPreviousMonth = (): string => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    date.setDate(1);
    return date.toISOString().split('T')[0];
  };