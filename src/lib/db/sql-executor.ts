// src/lib/db/sql-executor.ts
// Service d'exécution sécurisée de requêtes SQL

import { query } from './client';
import { validateSQLSafety } from '@/lib/ai/sql-generation';
import { SQLExecutionResult } from '@/types/ai-sql';

/**
 * Options pour l'exécution de requêtes SQL
 */
export interface SQLExecutionOptions {
  /**
   * Limite de temps d'exécution en ms
   * (Par défaut: 5000 ms)
   */
  timeoutMs?: number;

  /**
   * Nombre maximum de lignes à retourner
   * (Par défaut: 1000)
   */
  maxRows?: number;
}

/**
 * Exécute une requête SQL de façon sécurisée
 */
export async function executeSQLSafely(
  sql: string,
  params: unknown[] = [],
  options: SQLExecutionOptions = {}
): Promise<SQLExecutionResult> {
  // Valeurs par défaut
  const timeoutMs = options.timeoutMs || 5000;
  const maxRows = options.maxRows || 1000;

  // Essayer d'extraire la clé "sql" si on reçoit du JSON
  let cleanSql = sql;
  try {
    const maybeJson = JSON.parse(sql);
    if (maybeJson && typeof maybeJson.sql === 'string') {
      cleanSql = maybeJson.sql;
    }
  } catch (e) {
    // Ce n’est pas du JSON, pas grave, on continue
  }

  // Vérifier que la requête est sécurisée
  const safetyCheck = validateSQLSafety(cleanSql);
  if (!safetyCheck.safe) {
    throw new Error(`Requête SQL non sécurisée: ${safetyCheck.reason}`);
  }

  // Nettoyer la requête SQL - supprimer backslashes et sauts de ligne
  cleanSql = cleanSql
    .replace(/\\\s*/g, ' ')        // Backslashes + espaces
    .replace(/\\"/g, '"')          // Guillemets échappés
    .replace(/\\'/g, "'")          // Apostrophes échappées
    .replace(/\r\n|\r|\n/g, ' ')   // Sauts de ligne
    .replace(/\s+/g, ' ')          // Espaces multiples
    .trim();                       // Espaces en début/fin

  // Ajouter une clause LIMIT si elle est absente
  if (!cleanSql.toUpperCase().includes('LIMIT')) {
    cleanSql = `${cleanSql} LIMIT ${maxRows}`;
  }

  console.log('Exécution de la requête SQL nettoyée:', cleanSql);

  try {
    const startTime = Date.now();

    // Promesse de requête SQL
    const queryPromise = query(cleanSql, params);

    // Timeout manuel
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`La requête a dépassé le délai d'exécution de ${timeoutMs}ms`));
      }, timeoutMs);
    });

    // Course entre exécution réelle et timeout
    const result = await Promise.race([queryPromise, timeoutPromise]);

    const queryTime = Date.now() - startTime;

    return {
      data: result.rows,
      columns: result.fields?.map(field => field.name) || [],
      rowCount: result.rowCount || 0,
      queryTime,
      sql: cleanSql
    };
  } catch (error) {
    console.error('Erreur lors de l\'exécution SQL:', error);
    throw error;
  }
}