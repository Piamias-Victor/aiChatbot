// src/scripts/test-with-env.ts
// Charge explicitement les variables d'environnement avant d'exécuter les tests

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

// Afficher les variables de connexion à la BD (sans mot de passe)
console.log('Variables d\'environnement de base de données:');
console.log('- DB_USER:', process.env.DB_USER);
console.log('- DB_HOST:', process.env.DB_HOST);
console.log('- DB_PORT:', process.env.DB_PORT);
console.log('- DB_NAME:', process.env.DB_NAME);
console.log('- DB_PASSWORD:', process.env.DB_PASSWORD ? '[Défini]' : '[Non défini]');

// Importer et exécuter le script de test de connexion
import '../lib/db/client';
import { testConnection } from '../lib/db/client';

async function runDatabaseTest() {
  try {
    console.log('\nTest de connexion à la base de données...');
    const result = await testConnection();
    
    if (result.connected) {
      console.log('✅ Connexion réussie à la base de données');
      console.log('Timestamp du serveur:', result.timestamp);
    } else {
      console.log('❌ Échec de la connexion à la base de données');
      console.log('Erreur:', result.error);
    }
  } catch (error) {
    console.error('Erreur lors du test de connexion:', error);
  }
}

runDatabaseTest();