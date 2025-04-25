// src/lib/ai/sql-validator.ts
// Service de validation et correction des requêtes SQL

import { getAICompletion } from './client';
import { AIMessage } from '@/types/ai-client';

/**
 * Interface pour les erreurs SQL
 */
interface SQLError {
  type: 'syntax' | 'semantic' | 'relation' | 'optimization';
  message: string;
}

/**
 * Vérifie la syntaxe d'une requête SQL
 * 
 * @param sql Requête SQL à vérifier
 * @returns Liste des erreurs de syntaxe détectées
 */
export function checkSQLSyntax(sql: string): SQLError[] {
  const errors: SQLError[] = [];
  
  // Vérifier les erreurs de syntaxe basiques
  if (!sql.trim().toUpperCase().startsWith('SELECT')) {
    errors.push({
      type: 'syntax',
      message: 'La requête doit commencer par SELECT'
    });
  }
  
  // Vérifier les clauses FROM manquantes
  if (!sql.toUpperCase().includes(' FROM ')) {
    errors.push({
      type: 'syntax',
      message: 'Clause FROM manquante'
    });
  }
  
  // Vérifier les parenthèses non équilibrées
  const openParenCount = (sql.match(/\(/g) || []).length;
  const closeParenCount = (sql.match(/\)/g) || []).length;
  
  if (openParenCount !== closeParenCount) {
    errors.push({
      type: 'syntax',
      message: 'Parenthèses non équilibrées'
    });
  }
  
  // Vérifier les guillemets non équilibrés
  const quoteCount = (sql.match(/"/g) || []).length;
  if (quoteCount % 2 !== 0) {
    errors.push({
      type: 'syntax',
      message: 'Guillemets non équilibrés'
    });
  }
  
  return errors;
}

/**
 * Vérifie les relations et jointures dans une requête SQL
 * 
 * @param sql Requête SQL à vérifier
 * @returns Liste des erreurs de relation détectées
 */
export function checkJoinRelationships(sql: string): SQLError[] {
  const errors: SQLError[] = [];
  
  // Tables et leurs relations
  const tableRelations = [
    { table: 'data_internalproduct', joinColumn: 'pharmacy_id', relatedTable: 'data_pharmacy', relatedColumn: 'id' },
    { table: 'data_internalproduct', joinColumn: 'code_13_ref_id', relatedTable: 'data_globalproduct', relatedColumn: 'code_13_ref' },
    { table: 'data_inventorysnapshot', joinColumn: 'product_id', relatedTable: 'data_internalproduct', relatedColumn: 'id' },
    { table: 'data_sales', joinColumn: 'product_id', relatedTable: 'data_inventorysnapshot', relatedColumn: 'id' },
    { table: 'data_order', joinColumn: 'pharmacy_id', relatedTable: 'data_pharmacy', relatedColumn: 'id' },
    { table: 'data_productorder', joinColumn: 'order_id', relatedTable: 'data_order', relatedColumn: 'id' },
    { table: 'data_productorder', joinColumn: 'product_id', relatedTable: 'data_internalproduct', relatedColumn: 'id' }
  ];
  
  // Vérifier si des jointures sont manquantes ou incorrectes
  for (const relation of tableRelations) {
    // Si la table est présente, vérifier la jointure correspondante
    if (sql.includes(relation.table) && sql.includes(relation.relatedTable)) {
      const joinPattern = new RegExp(`${relation.table}.*?${relation.joinColumn}\\s*=\\s*${relation.relatedTable}\\.${relation.relatedColumn}|${relation.relatedTable}.*?${relation.relatedColumn}\\s*=\\s*${relation.table}\\.${relation.joinColumn}`, 'i');
      
      if (!joinPattern.test(sql)) {
        errors.push({
          type: 'relation',
          message: `Jointure manquante ou incorrecte entre ${relation.table}.${relation.joinColumn} et ${relation.relatedTable}.${relation.relatedColumn}`
        });
      }
    }
  }
  
  // Vérifier spécifiquement la contrainte pharmacy_id
  if (sql.includes('data_internalproduct') && !sql.includes('pharmacy_id = $1')) {
    errors.push({
      type: 'relation',
      message: 'Filtre pharmacy_id = $1 manquant dans la clause WHERE'
    });
  }
  
  return errors;
}

/**
 * Vérifie les opportunités d'optimisation dans une requête SQL
 * 
 * @param sql Requête SQL à vérifier
 * @returns Liste des suggestions d'optimisation
 */
export function checkOptimization(sql: string): SQLError[] {
  const errors: SQLError[] = [];
  
  // Vérifier les sous-requêtes potentiellement non optimisées
  const subqueryCount = (sql.match(/SELECT.*SELECT/gs) || []).length;
  if (subqueryCount > 2) {
    errors.push({
      type: 'optimization',
      message: 'Utilisation excessive de sous-requêtes, considérer des jointures ou des CTE'
    });
  }
  
  // Vérifier l'absence de limite de résultats
  if (!sql.toUpperCase().includes('LIMIT')) {
    errors.push({
      type: 'optimization',
      message: 'Clause LIMIT manquante, ajouter une limite pour éviter des résultats trop volumineux'
    });
  }
  
  return errors;
}

/**
 * Vérifie les problèmes courants de GROUP BY dans une requête SQL
 * 
 * @param sql Requête SQL à vérifier
 * @returns Liste des erreurs de GROUP BY détectées
 */
export function checkGroupByIssues(sql: string): SQLError[] {
  const errors: SQLError[] = [];
  
  // Si la requête contient GROUP BY
  if (sql.toUpperCase().includes("GROUP BY")) {
    // Vérifier si des fonctions EXTRACT sont utilisées sans être dans le GROUP BY
    if (sql.toUpperCase().includes("EXTRACT(") && 
        !sql.toUpperCase().includes("GROUP BY EXTRACT(")) {
      
      // Rechercher les colonnes utilisées dans EXTRACT
      const extractRegex = /EXTRACT\(\s*\w+\s+FROM\s+(\w+\.\w+|\w+)\s*\)/gi;
      const matches = Array.from(sql.matchAll(extractRegex));
      
      for (const match of matches) {
        if (match[1]) {
          const column = match[1].trim();
          
          // Vérifier si cette colonne est dans le GROUP BY
          if (!sql.toUpperCase().includes(`GROUP BY ${column}`) && 
              !sql.toUpperCase().match(new RegExp(`GROUP BY[^,]*,[^,]*${column}`))) {
            errors.push({
              type: 'semantic',
              message: `Colonne ${column} utilisée dans EXTRACT() doit apparaître dans le GROUP BY`
            });
          }
        }
      }
    }
    
    // Rechercher les colonnes non agrégées dans SELECT mais absentes de GROUP BY
    const selectClause = sql.match(/SELECT\s+(.*?)\s+FROM/is)?.[1] || '';
    const groupByClause = sql.match(/GROUP BY\s+(.*?)(?:ORDER BY|LIMIT|HAVING|$)/is)?.[1] || '';
    
    // Extraire les colonnes du SELECT qui ne sont pas des agrégats
    const selectColumns = selectClause
      .split(',')
      .map(col => col.trim())
      .filter(col => !col.match(/^(SUM|COUNT|AVG|MIN|MAX|STRING_AGG|ARRAY_AGG)\(/i));
      
    // Vérifier que chaque colonne non agrégée est dans le GROUP BY
    for (const col of selectColumns) {
      // Extraire le nom de colonne (ignorer AS et les alias)
      const colName = col.split(/\s+AS\s+/i)[0].trim();
      
      // Ignorer les constantes, les expressions EXTRACT déjà traitées
      if (colName.match(/^\d+$/) || 
          colName.match(/^'.*'$/) || 
          colName.match(/^EXTRACT\(/i)) {
        continue;
      }
      
      if (!groupByClause.includes(colName)) {
        errors.push({
          type: 'semantic',
          message: `Colonne ${colName} dans SELECT doit apparaître dans le GROUP BY ou être utilisée dans une fonction d'agrégation`
        });
      }
    }
  }
  
  return errors;
}

/**
 * Corrige une requête SQL en utilisant l'IA
 * 
 * @param sql Requête SQL à corriger
 * @param pharmacyId ID de la pharmacie
 * @param errors Liste des erreurs détectées
 * @returns Requête SQL corrigée
 */
export async function correctSQLViaAI(
  sql: string,
  pharmacyId: string,
  errors: SQLError[]
): Promise<string> {
  const messages: AIMessage[] = [
    {
      role: 'system',
      content: `Tu es un expert PostgreSQL qui corrige les requêtes SQL. 
Voici le schéma de la base de données pharmaceutique:
- data_pharmacy: (id UUID, name VARCHAR(255), area VARCHAR(255))
- data_internalproduct: (id UUID, name VARCHAR(255), pharmacy_id UUID, code_13_ref_id VARCHAR(13))
- data_globalproduct: (code_13_ref VARCHAR(13), name TEXT, category VARCHAR(255))
- data_inventorysnapshot: (id BIGINT, date DATE, stock SMALLINT, price_with_tax NUMERIC, product_id UUID)
- data_sales: (id BIGINT, date DATE, quantity SMALLINT, product_id BIGINT)

RELATIONS:
- data_internalproduct.pharmacy_id -> data_pharmacy.id
- data_internalproduct.code_13_ref_id -> data_globalproduct.code_13_ref
- data_inventorysnapshot.product_id -> data_internalproduct.id
- data_sales.product_id -> data_inventorysnapshot.id

RÈGLES IMPORTANTES:
1. Avec GROUP BY, toutes les colonnes non agrégées dans SELECT doivent être dans GROUP BY
2. Pour utiliser EXTRACT(YEAR FROM date), cette colonne date doit être dans GROUP BY
3. Toujours inclure pharmacy_id = $1 dans WHERE
4. Toujours inclure une clause LIMIT
5. Pour les comparaisons avec année précédente, utiliser DATE(...) - INTERVAL '1 year'

Ta tâche est de corriger la requête SQL en tenant compte des erreurs identifiées.`
    },
    {
      role: 'user',
      content: `Voici la requête SQL à corriger:

\`\`\`sql
${sql}
\`\`\`

Problèmes identifiés:
${errors.map(error => `- ${error.type}: ${error.message}`).join('\n')}

Pharmacy ID à utiliser: ${pharmacyId}

Corrige la requête et retourne uniquement la requête SQL corrigée, sans explications ni commentaires.`
    }
  ];
  
  const response = await getAICompletion({
    messages,
    temperature: 0.1,
    maxTokens: 1000
  });
  
  // Extraire la requête SQL corrigée
  const sqlMatch = response.content.match(/```sql\s*([\s\S]*?)\s*```|SELECT[\s\S]*?(?:LIMIT \d+|;)/i);
  
  if (sqlMatch && sqlMatch[1]) {
    return sqlMatch[1].trim() || sqlMatch[0].replace(/```sql|```/g, '').trim();
  }
  
  // Si on n'a pas trouvé de requête formatée, nettoyer la sortie
  return response.content.replace(/```sql|```/g, '').trim();
}

/**
 * Valide et corrige une requête SQL
 * 
 * @param sql Requête SQL à valider et corriger
 * @param pharmacyId ID de la pharmacie
 * @returns Requête SQL validée et corrigée
 */
export async function validateAndCorrectSQL(sql: string, pharmacyId: string): Promise<string> {
  // Collecter toutes les erreurs
  const syntaxErrors = checkSQLSyntax(sql);
  const relationErrors = checkJoinRelationships(sql);
  const optimizationErrors = checkOptimization(sql);
  const groupByErrors = checkGroupByIssues(sql);
  
  const allErrors = [...syntaxErrors, ...relationErrors, ...optimizationErrors, ...groupByErrors];
  
  // Si des erreurs sont trouvées, corriger la requête
  if (allErrors.length > 0) {
    console.log(`Correction de ${allErrors.length} erreurs dans la requête SQL:`, allErrors);
    return await correctSQLViaAI(sql, pharmacyId, allErrors);
  }
  
  return sql;
}