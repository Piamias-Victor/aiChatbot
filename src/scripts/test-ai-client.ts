import { getAICompletion, isAIClientAvailable } from '../lib/ai/client';
import { aiConfig } from '../lib/ai/config';

async function testAIClient() {
  console.log('=== Test du client IA ===');
  console.log('Configuration:', {
    model: aiConfig.model,
    temperature: aiConfig.temperature,
    maxTokens: aiConfig.maxTokens,
    apiKeyConfigured: !!process.env.OPENAI_API_KEY
  });
  
  const available = isAIClientAvailable();
  console.log('Client disponible:', available);
  
  if (!available) {
    console.error('❌ Le client n\'est pas disponible. Vérifiez la clé API dans .env.local');
    return;
  }
  
  try {
    console.log('Envoi d\'une requête test à l\'API...');
    
    const response = await getAICompletion({
      messages: [
        { role: 'system', content: 'Vous êtes un assistant analytique pour pharmaciens.' },
        { role: 'user', content: 'Bonjour, pouvez-vous me donner un conseil rapide pour la gestion des stocks en pharmacie?' }
      ]
    });
    
    console.log('✅ Réponse reçue avec succès:');
    console.log('Modèle utilisé:', response.model);
    console.log('Contenu:', response.content);
    
    if (response.usage) {
      console.log('Utilisation:', response.usage);
    }
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Exécuter le test
testAIClient();