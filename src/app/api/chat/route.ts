import { NextRequest, NextResponse } from 'next/server';
import { PharmacyAIService } from '@/lib/ai/service';
import { generateId } from '@/lib/utils';
import { AIMessage } from '@/types/ai-client';
import { ChatRequestBody, ChatResponseBody, ChatErrorResponse } from '@/types/api-chat';

/**
 * Validation du corps de la requête
 */
function validateRequestBody(body: unknown): body is ChatRequestBody {
  if (!body || typeof body !== 'object') {
    return false;
  }
  
  const chatRequest = body as Partial<ChatRequestBody>;
  
  // Le message est obligatoire
  if (!chatRequest.message || typeof chatRequest.message !== 'string') {
    return false;
  }
  
  // Si l'historique est fourni, il doit être un tableau
  if (chatRequest.messageHistory && !Array.isArray(chatRequest.messageHistory)) {
    return false;
  }
  
  return true;
}

/**
 * API route pour le chat IA
 * POST /api/chat
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier que le service IA est disponible
    if (!PharmacyAIService.isAvailable()) {
      const errorResponse: ChatErrorResponse = {
        error: {
          code: 'service_unavailable',
          message: 'Le service IA n\'est pas disponible actuellement'
        }
      };
      return NextResponse.json(errorResponse, { status: 503 });
    }
    
    // Récupérer et valider le corps de la requête
    const body = await request.json();
    
    if (!validateRequestBody(body)) {
      const errorResponse: ChatErrorResponse = {
        error: {
          code: 'invalid_request',
          message: 'Corps de la requête invalide. Le message est requis.'
        }
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }
    
    // Extraire les données de la requête
    const { message, conversationId = generateId(), messageHistory = [] } = body;
    
    // Normaliser l'historique des messages pour s'assurer qu'il est au bon format
    const normalizedHistory: AIMessage[] = messageHistory.map(msg => ({
      role: msg.role === 'user' || msg.role === 'assistant' || msg.role === 'system' 
        ? msg.role 
        : 'user',
      content: msg.content || ''
    }));
    
    // Générer une réponse via le service IA
    const answer = await PharmacyAIService.generateResponse({
      question: message,
      conversationHistory: normalizedHistory,
      includeSystemPrompt: true
    });
    
    // Préparer la réponse
    const response: ChatResponseBody = {
      answer,
      conversationId,
      timestamp: Date.now()
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Erreur dans l\'API chat:', error);
    
    // Préparer la réponse d'erreur
    const errorResponse: ChatErrorResponse = {
      error: {
        code: 'internal_error',
        message: 'Une erreur est survenue lors du traitement de la requête'
      }
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}