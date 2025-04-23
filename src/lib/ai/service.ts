/**
 * Service principal d'IA pour l'analyse pharmaceutique
 */

import { AIMessage, AICompletionParams } from '@/types/ai-client';
import { getAICompletion, isAIClientAvailable } from './client';
import { systemPrompt, outOfScopePrompt } from './prompts/base';
import { 
  pharmacyDomainContext, 
  salesAnalysisPrompt, 
  stockAnalysisPrompt, 
  marginAnalysisPrompt 
} from './prompts/pharmacy';
import { 
  detectQuestionCategory, 
  isPharmacyRelatedQuestion,
  limitMessagesHistory 
} from './utils';

/**
 * Paramètres pour le service d'IA pharmaceutique
 */
interface PharmacyAIServiceParams {
  question: string;
  conversationHistory?: AIMessage[];
  includeSystemPrompt?: boolean;
}

/**
 * Service d'IA pour l'analyse pharmaceutique
 */
export class PharmacyAIService {
  /**
   * Vérifie si le service d'IA est disponible
   */
  static isAvailable(): boolean {
    return isAIClientAvailable();
  }
  
  /**
   * Génère une réponse à une question pharmaceutique
   */
  static async generateResponse(params: PharmacyAIServiceParams): Promise<string> {
    const { question, conversationHistory = [], includeSystemPrompt = true } = params;
    
    // Vérifier que le client IA est disponible
    if (!PharmacyAIService.isAvailable()) {
      return "Le service d'IA n'est pas disponible actuellement. Veuillez vérifier votre configuration.";
    }
    
    try {
      // Détecter le type de question
      const category = detectQuestionCategory(question);
      
      // Vérifier si la question est liée au domaine pharmaceutique
      const isRelevant = isPharmacyRelatedQuestion(question);
      
      // Construire les messages pour l'IA
      const messages: AIMessage[] = [];
      
      // Ajouter le prompt système si nécessaire
      if (includeSystemPrompt) {
        let fullSystemPrompt = `${systemPrompt}

${pharmacyDomainContext}

FORMATAGE:
- Utilise le formatage Markdown pour structurer tes réponses
- Utilise des listes à puces ou numérotées pour les étapes ou points clés
- Met en gras (**texte**) les concepts ou termes importants
- Utilise des titres de section (## Titre) pour les sections distinctes
- Présente les données chiffrées de manière claire et lisible
- Sépare clairement l'analyse des recommandations
`;
        
        // Ajouter le prompt spécifique à la catégorie
        if (isRelevant) {
          switch (category) {
            case 'sales':
              fullSystemPrompt += '\n\n' + salesAnalysisPrompt;
              break;
            case 'stock':
              fullSystemPrompt += '\n\n' + stockAnalysisPrompt;
              break;
            case 'margin':
              fullSystemPrompt += '\n\n' + marginAnalysisPrompt;
              break;
          }
        } else {
          fullSystemPrompt += '\n\n' + outOfScopePrompt;
        }
        
        messages.push({ role: 'system', content: fullSystemPrompt });
      }
      
      // Ajouter l'historique de conversation limité
      const limitedHistory = limitMessagesHistory(conversationHistory, 5);
      messages.push(...limitedHistory);
      
      // Ajouter la question actuelle
      messages.push({ role: 'user', content: question });
      
      // Appeler l'API IA
      const completionParams: AICompletionParams = {
        messages,
      };
      
      const response = await getAICompletion(completionParams);
      return response.content;
      
    } catch (error) {
      console.error('Erreur lors de la génération de réponse:', error);
      return "Désolé, une erreur s'est produite lors de la génération de la réponse. Veuillez réessayer ultérieurement.";
    }
  }
}