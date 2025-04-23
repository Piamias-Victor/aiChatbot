// Version simplifiée avec uniquement OpenAI
import { AICompletionParams, AICompletionResponse } from '@/types/ai-client';
import { aiConfig } from './config';
import OpenAI from 'openai';

// Initialisation du client OpenAI
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

/**
 * Vérifie si le client OpenAI est disponible
 */
export function isAIClientAvailable(): boolean {
  return openai !== null;
}

/**
 * Obtient une complétion de l'IA via OpenAI
 */
export async function getAICompletion(
  params: AICompletionParams
): Promise<AICompletionResponse> {
  const model = params.model || aiConfig.model;
  const temperature = params.temperature || aiConfig.temperature;
  const maxTokens = params.maxTokens || aiConfig.maxTokens;
  
  if (!openai) {
    throw new Error('Client OpenAI non disponible. Vérifiez votre configuration.');
  }
  
  try {
    const response = await openai.chat.completions.create({
      model: model,
      messages: params.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      temperature: temperature,
      max_tokens: maxTokens,
    });
    
    return {
      content: response.choices[0]?.message?.content || '',
      model: response.model,
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      }
    };
  } catch (error) {
    console.error('Erreur lors de l\'appel à l\'API OpenAI:', error);
    throw error;
  }
}