import { AIMessage } from './ai-client';

// Types pour la requête API de chat
export interface ChatRequestBody {
  message: string;              // Message de l'utilisateur
  conversationId?: string;      // ID de la conversation
  messageHistory?: AIMessage[]; // Historique de la conversation
}

// Types pour la réponse API de chat
export interface ChatResponseBody {
  answer: string;               // Réponse du modèle IA
  conversationId: string;       // ID de la conversation 
  timestamp: number;            // Horodatage de la réponse
}

// Types d'erreur pour l'API de chat
export type ChatErrorCode = 
  | 'service_unavailable'       // Service IA non disponible
  | 'invalid_request'           // Requête invalide
  | 'internal_error';           // Erreur interne du serveur

// Structure d'erreur pour l'API de chat
export interface ChatErrorResponse {
  error: {
    code: ChatErrorCode;
    message: string;
  }
}