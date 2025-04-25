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

  console.log('Input SQL (raw):', sql);
  console.log('Input Type:', typeof sql);

  // Extraire la requête SQL avec des vérifications plus robustes
  let cleanSql = '';
  try {
    // Cas 1 : Chaîne JSON
    if (typeof sql === 'string') {
      try {
        const parsedJson = JSON.parse(sql);
        console.log('Parsed JSON:', parsedJson);
        
        // Rechercher la propriété SQL de différentes manières
        if (typeof parsedJson === 'object') {
          cleanSql = 
            parsedJson.sql || 
            parsedJson.query || 
            (typeof parsedJson === 'string' ? parsedJson : '');
        } else if (typeof parsedJson === 'string') {
          cleanSql = parsedJson;
        }
      } catch (jsonError) {
        // Si ce n'est pas du JSON valide, traiter comme une chaîne directe
        cleanSql = sql;
      }
    } else if (typeof sql === 'object') {
      // Cas 2 : Objet avec propriété SQL
      const sqlObj = sql as Record<string, unknown>;
      cleanSql = 
        sqlObj.sql as string || 
        sqlObj.query as string || 
        (typeof sqlObj === 'string' ? sqlObj : '');
    }

    // Dernier recours : convertir en chaîne
    if (typeof cleanSql !== 'string') {
      cleanSql = String(cleanSql);
    }
  } catch (error) {
    console.error('Erreur lors de l\'extraction de la requête SQL:', error);
    throw new Error('Impossible de convertir la requête SQL');
  }

  // Nettoyer et valider la requête SQL
  console.log('Requête SQL extraite:', cleanSql);

  // Nettoyer la requête de manière sécurisée en préservant les guillemets
  // Fonction de nettoyage améliorée pour gérer correctement les guillemets
  cleanSql = cleanSql
    .replace(/\s+/g, ' ')  // Remplacer espaces multiples par un seul espace
    .trim();               // Supprimer espaces début/fin

  // Vérifier que la requête est sécurisée
  const safetyCheck = validateSQLSafety(cleanSql);
  if (!safetyCheck.safe) {
    throw new Error(`Requête SQL non sécurisée: ${safetyCheck.reason}`);
  }

  // Ajouter une clause LIMIT si elle est absente
  if (!cleanSql.toUpperCase().includes('LIMIT')) {
    cleanSql = `${cleanSql} LIMIT ${maxRows}`;
  }

  console.log('Requête SQL nettoyée:', cleanSql);
  console.log('Paramètres:', params);

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

    console.log('Résultat de la requête:', {
      rowCount: result.rowCount,
      columnsCount: result.fields?.length || 0
    });

    return {
      data: result.rows,
      columns: result.fields?.map(field => field.name) || [],
      rowCount: result.rowCount || 0,
      queryTime,
      sql: cleanSql
    };
  } catch (error) {
    console.error('Erreur complète lors de l\'exécution SQL:', error);
    throw error;
  }
}