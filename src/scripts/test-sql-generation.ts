// src/scripts/test-sql-generation.ts
// Script pour tester la génération SQL

import { generateSQL } from '../lib/ai/sql-generation';

async function testSQLGeneration() {
  console.log('=== Test de génération SQL ===');
  
  // Requête de test
  const testRequest = {
    query: "Quels sont mes 10 produits les plus vendus ce mois-ci ?",
    pharmacyId: "test-pharmacy-id",
    dateRange: {
      startDate: "2023-04-01",
      endDate: "2023-04-30"
    }
  };
  
  try {
    console.log(`Question: "${testRequest.query}"`);
    console.log('Génération de la requête SQL...');
    
    const response = await generateSQL(testRequest);
    
    console.log('\nRésultat:');
    console.log('Confiance:', response.confidence);
    console.log('Explication:', response.explanation);
    console.log('\nRequête SQL:');
    console.log(response.sql);
    
    if (response.error) {
      console.error('\nErreur:', response.error);
    }
  } catch (error) {
    console.error('Erreur lors du test:', error);
  }
}

// Exécuter le test
testSQLGeneration();