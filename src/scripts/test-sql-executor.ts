// src/scripts/test-sql-executor.ts
// Script pour tester l'exécution sécurisée des requêtes SQL

// Charger les variables d'environnement
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Charger les variables d'environnement du fichier .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log(`Chargement des variables d'environnement depuis ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.log('Fichier .env.local non trouvé, utilisation des variables d\'environnement existantes');
}

import { executeSQLSafely } from '../lib/db/sql-executor';

async function testSQLExecutor() {
  console.log('=== Test d\'exécution SQL sécurisée ===');
  
  // Afficher les variables de connexion à la BD (sans mot de passe)
  console.log('Variables d\'environnement de base de données:');
  console.log('- DB_USER:', process.env.DB_USER);
  console.log('- DB_HOST:', process.env.DB_HOST);
  console.log('- DB_PORT:', process.env.DB_PORT);
  console.log('- DB_NAME:', process.env.DB_NAME);
  console.log('- DB_PASSWORD:', process.env.DB_PASSWORD ? '[Défini]' : '[Non défini]');
  
  // Requête SQL de test (sécurisée)
  const safeSql = `
    SELECT 
      'Produit Test' AS "Nom du produit", 
      'Catégorie Test' AS "Catégorie", 
      10 AS "Stock",
      19.99 AS "Prix TTC"
    LIMIT 5
  `;
  
  // Requête SQL non sécurisée (pour tester la validation)
  const unsafeSql = `
    DROP TABLE data_pharmacy;
  `;
  
  try {
    // Test 1: Exécuter une requête sécurisée simple
    console.log('\nTest 1: Exécution d\'une requête SQL simple');
    console.log('Requête:', safeSql);
    
    try {
      const result = await executeSQLSafely(safeSql, []);
      
      console.log('\nRésultat:');
      console.log('Temps d\'exécution:', result.queryTime, 'ms');
      console.log('Nombre de lignes:', result.rowCount);
      console.log('Colonnes:', result.columns);
      
      // Afficher les données
      console.log('\nDonnées:');
      console.log(result.data);
    } catch (error) {
      console.error('Erreur lors de l\'exécution de la requête sécurisée:', error);
    }
    
    // Test 2: Tenter d'exécuter une requête non sécurisée
    console.log('\nTest 2: Tentative d\'exécution d\'une requête non sécurisée');
    console.log('Requête:', unsafeSql);
    
    try {
      await executeSQLSafely(unsafeSql);
      console.log('❌ La requête non sécurisée a été exécutée (problème de sécurité)');
    } catch (error) {
      console.log('✅ La requête non sécurisée a été correctement bloquée:');
      console.log(error instanceof Error ? error.message : String(error));
    }
    
  } catch (error) {
    console.error('Erreur générale lors du test:', error);
  }
}

// Exécuter le test
testSQLExecutor();