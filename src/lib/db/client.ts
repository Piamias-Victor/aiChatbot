import { Pool, QueryResult } from 'pg';

/**
 * Configuration et instance du pool de connexions PostgreSQL.
 * 
 * Ce pool permet de gérer plusieurs connexions à la base de données de manière efficace.
 */
const pool = new Pool({
  user: process.env.DB_USER, // Utilisateur de la base de données
  host: process.env.DB_HOST, // Hôte de la base de données
  database: process.env.DB_NAME, // Nom de la base de données
  password: process.env.DB_PASSWORD, // Mot de passe de la base de données
  port: parseInt(process.env.DB_PORT || '5432', 10), // Port de la base de données avec valeur par défaut
  ssl: {
    rejectUnauthorized: false, // Désactive la vérification SSL si nécessaire (utilisé souvent avec AWS RDS)
  },
});

// Gestion des erreurs de connexion au pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1); // Ferme le processus en cas d'erreur critique
});

/**
 * Exécute une requête SQL avec des paramètres optionnels.
 * 
 * @param {string} text - La requête SQL à exécuter
 * @param {unknown[]} params - Les paramètres à utiliser dans la requête
 * @returns {Promise<QueryResult>} - Le résultat de la requête
 */
export async function query(text: string, params?: unknown[]): Promise<QueryResult> {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Fonction utilitaire pour tester la connexion à la base de données
 */
export async function testConnection() {
  try {
    const result = await query('SELECT NOW()');
    return {
      connected: true,
      timestamp: result.rows[0].now
    };
  } catch (error) {
    console.error('Failed to connect to database:', error);
    return {
      connected: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export default pool;