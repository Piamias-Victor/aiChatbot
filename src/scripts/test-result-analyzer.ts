// src/scripts/test-result-analyzer.ts
// Script pour tester l'analyse des résultats SQL

import { analyzeQueryResults } from '../lib/ai/result-analyzer';
import { SQLExecutionResult } from '@/types/ai-sql';

async function testResultAnalyzer() {
  console.log('=== Test d\'analyse des résultats SQL ===');
  
  // Créer un jeu de données de test
  const testResult: SQLExecutionResult = {
    data: [
      { 'Nom du produit': 'Doliprane 1000mg', 'Catégorie': 'Médicaments', 'Stock': 45, 'Ventes': 127 },
      { 'Nom du produit': 'Advil 200mg', 'Catégorie': 'Médicaments', 'Stock': 32, 'Ventes': 98 },
      { 'Nom du produit': 'Crème hydratante Avène', 'Catégorie': 'Cosmétique', 'Stock': 18, 'Ventes': 74 },
      { 'Nom du produit': 'Compléments Vitamine D', 'Catégorie': 'Compléments alimentaires', 'Stock': 51, 'Ventes': 62 },
      { 'Nom du produit': 'Baume du Tigre', 'Catégorie': 'Parapharmacie', 'Stock': 7, 'Ventes': 53 }
    ],
    columns: ['Nom du produit', 'Catégorie', 'Stock', 'Ventes'],
    rowCount: 5,
    queryTime: 145,
    sql: 'SELECT p.name AS "Nom du produit", p.category AS "Catégorie", i.stock AS "Stock", SUM(s.quantity) AS "Ventes" FROM products p JOIN inventory i ON p.id = i.product_id JOIN sales s ON p.id = s.product_id GROUP BY p.name, p.category, i.stock ORDER BY "Ventes" DESC LIMIT 5'
  };
  
  const testQueries = [
    'Quels sont mes produits les plus vendus ce mois-ci ?',
    'Quels produits ont un stock faible ?',
    'Quelle est la répartition de mes ventes par catégorie ?'
  ];
  
  for (const query of testQueries) {
    console.log(`\nTest avec la question: "${query}"`);
    
    try {
      const analysisResult = await analyzeQueryResults(testResult, {
        originalQuery: query,
        sqlExplanation: 'Cette requête récupère les produits avec leurs ventes et stock, triés par quantité vendue.',
        suggestVisualization: true
      });
      
      console.log('\nAnalyse:');
      console.log(analysisResult.analysis);
      
      console.log('\nType de visualisation suggéré:');
      console.log(analysisResult.visualizationType);
      
      console.log('\nDonnées pour visualisation (aperçu):');
      console.log(JSON.stringify(analysisResult.visualizationData, null, 2).substring(0, 200) + '...');
      
    } catch (error) {
      console.error('Erreur lors de l\'analyse des résultats:', error);
    }
  }
}

// Exécuter le test
testResultAnalyzer();