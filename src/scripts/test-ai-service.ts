import { PharmacyAIService } from '../lib/ai/service';
import { AIMessage } from '@/types/ai-client';

async function testAIService() {
  console.log('=== Test du service IA pour pharmacie ===');
  
  // Vérifier si le service est disponible
  const available = PharmacyAIService.isAvailable();
  console.log('Service disponible:', available);
  
  if (!available) {
    console.error('❌ Le service IA n\'est pas disponible');
    return;
  }
  
  // Questions de test par catégorie
  const testQuestions = [
    { 
      category: 'Ventes', 
      question: "Quels ont été mes produits les plus vendus ce mois-ci?" 
    },
    { 
      category: 'Stock', 
      question: "Quels produits risquent d'être en rupture prochainement?" 
    },
    { 
      category: 'Marge', 
      question: "Quelles sont mes catégories de produits les plus rentables?" 
    },
    { 
      category: 'Hors contexte', 
      question: "Peux-tu me donner la recette de la tarte aux pommes?" 
    }
  ];
  
  // Historique de conversation simulé
  const conversationHistory: AIMessage[] = [
    { role: 'user', content: "Bonjour, je souhaite analyser mes données de pharmacie." },
    { role: 'assistant', content: "Bonjour ! Je suis votre assistant analytique pour la pharmacie. Comment puis-je vous aider aujourd'hui?" }
  ];
  
  // Tester une question avec historique
  try {
    console.log('\n[Test avec historique de conversation]');
    console.log(`Question: "${testQuestions[0].question}"`);
    
    console.log('Génération de la réponse...');
    const response = await PharmacyAIService.generateResponse({
      question: testQuestions[0].question,
      conversationHistory,
      includeSystemPrompt: true
    });
    
    console.log('Réponse:');
    console.log(response);
  } catch (error) {
    console.error('❌ Erreur lors du test avec historique:', error);
  }
  
  // Tester chaque type de question individuellement
  for (const test of testQuestions) {
    try {
      console.log(`\n[Test catégorie: ${test.category}]`);
      console.log(`Question: "${test.question}"`);
      
      console.log('Génération de la réponse...');
      const response = await PharmacyAIService.generateResponse({
        question: test.question,
        includeSystemPrompt: true
      });
      
      console.log('Réponse:');
      console.log(response);
    } catch (error) {
      console.error(`❌ Erreur lors du test ${test.category}:`, error);
    }
  }
}

// Exécuter le test
testAIService();