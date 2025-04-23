import { isAIClientAvailable } from './client';
import { aiConfig } from './config';

// Fonction simple pour tester la configuration
function testAIClientConfiguration() {
  console.log('Configuration IA actuelle:', {
    provider: aiConfig.provider,
    model: aiConfig.model,
    temperature: aiConfig.temperature,
    maxTokens: aiConfig.maxTokens,
    apiKeyConfigured: !!aiConfig.apiKey,
  });
  
  const isAvailable = isAIClientAvailable();
  console.log(`Client IA (${aiConfig.provider}) disponible:`, isAvailable);
  
  return {
    isConfigured: !!aiConfig.apiKey,
    isAvailable,
  };
}

// Exécuter le test
const result = testAIClientConfiguration();
console.log('Résultat du test:', result);

export { testAIClientConfiguration };