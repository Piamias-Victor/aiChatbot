/**
 * Test de l'API route de chat
 * Ce script envoie une requête à l'API de chat et affiche la réponse
 */

// Fonction pour tester l'API de chat
async function testChatAPI() {
    console.log('=== Test de l\'API de chat ===');
    
    try {
      // URL de l'API (en développement, elle est sur localhost:3000)
      // Note: assurez-vous que votre serveur Next.js est en cours d'exécution
      const apiUrl = 'http://localhost:3000/api/chat';
      
      console.log(`Envoi d'une requête à ${apiUrl}`);
      
      // Corps de la requête
      const requestBody = {
        message: "Quels sont mes produits les plus rentables ce mois-ci?",
        messageHistory: [
          { role: 'user', content: "Bonjour, j'aimerais analyser les performances de ma pharmacie." },
          { role: 'assistant', content: "Bonjour! Je suis votre assistant analytique pour la pharmacie. Comment puis-je vous aider aujourd'hui?" }
        ]
      };
      
      console.log('Corps de la requête:', JSON.stringify(requestBody, null, 2));
      
      // Envoyer la requête
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      // Vérifier si la requête a réussi
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erreur ${response.status}: ${JSON.stringify(errorData)}`);
      }
      
      // Analyser la réponse
      const data = await response.json();
      
      console.log('✅ Réponse reçue:');
      console.log('Status:', response.status);
      console.log('Conversation ID:', data.conversationId);
      console.log('Timestamp:', new Date(data.timestamp).toLocaleString());
      console.log('Réponse:');
      console.log(data.answer);
      
    } catch (error) {
      console.error('❌ Erreur lors du test de l\'API:', error);
    }
  }
  
  // Ce script doit être exécuté quand le serveur Next.js est en cours d'exécution
  console.log('Note: Assurez-vous que votre serveur Next.js est en cours d\'exécution (npm run dev)');
  console.log('Le test va démarrer dans 2 secondes...');
  
  setTimeout(() => {
    testChatAPI();
  }, 2000);