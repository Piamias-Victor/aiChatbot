/**
 * Utilitaires pour le service IA
 */

import { AIMessage } from '@/types/ai-client';

/**
 * Détecte la catégorie de question posée
 * @param question Question de l'utilisateur
 * @returns Catégorie de la question (ventes, stocks, marges, autre)
 */
export function detectQuestionCategory(question: string): 'sales' | 'stock' | 'margin' | 'other' {
  const lowerQuestion = question.toLowerCase();
  
  if (lowerQuestion.includes('vente') || 
      lowerQuestion.includes('chiffre') || 
      lowerQuestion.includes('ca ') || 
      lowerQuestion.includes('revenu')) {
    return 'sales';
  }
  
  if (lowerQuestion.includes('stock') || 
      lowerQuestion.includes('inventaire') || 
      lowerQuestion.includes('rupture') || 
      lowerQuestion.includes('invendu')) {
    return 'stock';
  }
  
  if (lowerQuestion.includes('marge') || 
      lowerQuestion.includes('rentabilité') || 
      lowerQuestion.includes('profit') || 
      lowerQuestion.includes('bénéfice')) {
    return 'margin';
  }
  
  return 'other';
}

/**
 * Vérifie si la question est liée au domaine pharmaceutique
 * @param question Question de l'utilisateur
 * @returns Booléen indiquant si la question est pertinente
 */
export function isPharmacyRelatedQuestion(question: string): boolean {
  const lowerQuestion = question.toLowerCase();
  
  const pharmacyKeywords = [
    'pharmacie', 'médicament', 'produit', 'vente', 'stock', 
    'marge', 'laboratoire', 'client', 'patient', 'ordonnance',
    'parapharmacie', 'commande', 'fournisseur'
  ];
  
  return pharmacyKeywords.some(keyword => lowerQuestion.includes(keyword));
}

/**
 * Limite le nombre de messages pour respecter les contraintes de l'API
 * @param messages Liste de messages
 * @param maxMessages Nombre maximum de messages à conserver
 * @returns Liste de messages filtrée
 */
export function limitMessagesHistory(messages: AIMessage[], maxMessages: number = 10): AIMessage[] {
  // Toujours garder le premier message système s'il existe
  const systemMessage = messages.find(msg => msg.role === 'system');
  const otherMessages = messages.filter(msg => msg.role !== 'system');
  
  // Prendre les N derniers messages non-système
  const limitedOtherMessages = otherMessages.slice(-maxMessages);
  
  // Recombiner avec le message système si présent
  return systemMessage ? [systemMessage, ...limitedOtherMessages] : limitedOtherMessages;
}