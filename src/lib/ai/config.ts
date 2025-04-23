import { AIConfig } from '@/types/ai-client';
import dotenv from 'dotenv';

// Charger explicitement les variables d'environnement du fichier .env.local
dotenv.config({ path: '.env.local' });

// Vérifier que les variables d'environnement nécessaires sont définies
if (!process.env.OPENAI_API_KEY) {
  console.warn('Aucune clé API n\'est définie pour OpenAI. La fonctionnalité IA sera limitée.');
}

// Configuration par défaut pour l'IA
export const aiConfig: AIConfig = {
  provider: 'openai' as const,
  model: process.env.AI_MODEL || 'gpt-3.5-turbo',
  temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
  maxTokens: parseInt(process.env.AI_MAX_TOKENS || '2000', 10),
  apiKey: process.env.OPENAI_API_KEY || ''
};

// Modèles disponibles par fournisseur
export const availableModels = {
  openai: [
    'gpt-4',
    'gpt-4-turbo',
    'gpt-3.5-turbo',
  ]
};