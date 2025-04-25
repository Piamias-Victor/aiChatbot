// src/lib/ai/sql-generation.ts
// Service de génération de requêtes SQL à partir de questions en langage naturel

import { getAICompletion } from './client';
import { SQL_GENERATION_SYSTEM_PROMPT, generateSQLPrompt } from './prompts';
import { SQLGenerationRequest, SQLGenerationResponse } from '@/types/ai-sql';
import { AIMessage } from '@/types/ai-client';
import { findMatchingTemplate, prepareTemplateResponse } from './sql-templates';
import { validateAndCorrectSQL } from './sql-validator';

/**
 * Génère une requête SQL à partir d'une question en langage naturel
 */
export async function generateSQL(request: SQLGenerationRequest): Promise<SQLGenerationResponse> {
  try {
    // 1. Vérifier d'abord si la question correspond à un template prédéfini
    const matchingTemplate = findMatchingTemplate(request.query);
    if (matchingTemplate) {
      console.log('Template SQL trouvé pour la question:', request.query);
      return prepareTemplateResponse(matchingTemplate);
    }

    // 2. Si pas de template correspondant, générer avec l'IA
    console.log('Aucun template trouvé, génération SQL via IA pour:', request.query);
    
    // Construire les messages pour l'IA
    const messages: AIMessage[] = [
      // Message système avec le contexte et les instructions
      { 
        role: 'system', 
        content: SQL_GENERATION_SYSTEM_PROMPT 
      },
      
      // Question de l'utilisateur avec le contexte
      { 
        role: 'user', 
        content: generateSQLPrompt(request.query, request.pharmacyId, request.dateRange) 
      }
    ];
    
    // Appel à l'API pour obtenir la réponse de l'IA// Ajouter l'historique de conversation si disponible
    if (request.conversationHistory && request.conversationHistory.length > 0) {
      // Insérer l'historique de conversation entre le message système et la question actuelle
      const historyMessages = request.conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }) as AIMessage);
      
      // Insérer après le message système mais avant la question courante
      messages.splice(1, 0, ...historyMessages);
    }
    
    // Appeler l'API IA
    const completion = await getAICompletion({
      messages,
      temperature: 0.1, // Température basse pour plus de précision
      maxTokens: 1000   // Limite de tokens pour la réponse
    });
    
    const content = completion.content;
    console.log("Réponse brute de l'IA:", content);
    
    // Extraire la requête SQL, l'explication et la confiance
    let sqlQuery = '';
    let explanation = 'Explication non disponible';
    let confidence = 0.5;
    
    // Essayer de parser le JSON
    try {
      // Si la réponse est au format JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const jsonData = JSON.parse(jsonMatch[0]);
        sqlQuery = jsonData.sql || '';
        explanation = jsonData.explanation || 'Explication non disponible';
        confidence = jsonData.confidence || 0.5;
      }
    } catch (jsonError) {
      console.warn('Erreur lors du parsing JSON:', jsonError);
      
      // Si le parsing JSON échoue, essayer d'extraire la requête SQL directement
      const sqlMatch = content.match(/```sql\s*([\s\S]*?)\s*```|SELECT[\s\S]*?(?:LIMIT \d+|;)/i);
      
      if (sqlMatch) {
        sqlQuery = sqlMatch[1] || sqlMatch[0];
        sqlQuery = sqlQuery.replace(/```sql|```/g, '').trim();
        
        // Essayer de trouver une explication
        const explanationMatch = content.match(/explication:?\s*([\s\S]*?)(?=\n\n|\n```|$)/i);
        if (explanationMatch) {
          explanation = explanationMatch[1].trim();
        }
      }
    }
    
    // Si la requête SQL est vide ou invalide, considérer que c'est un échec
    if (!sqlQuery || !sqlQuery.toUpperCase().includes("SELECT")) {
      console.error('Impossible d\'extraire une requête SQL valide');
      
      // Approche de dernier recours - utiliser une requête simplifiée
      const simpleSql = `
        SELECT ip.name AS "Nom du produit", SUM(ds.quantity) AS "Quantité vendue"
        FROM data_sales ds
        JOIN data_inventorysnapshot dis ON ds.product_id = dis.id
        JOIN data_internalproduct ip ON dis.product_id = ip.id
        WHERE ip.pharmacy_id = '${request.pharmacyId}'
        ${request.dateRange ? `AND ds.date BETWEEN '${request.dateRange.startDate}' AND '${request.dateRange.endDate}'` : ''}
        GROUP BY ip.name
        ORDER BY SUM(ds.quantity) DESC
        LIMIT 10
      `;
      
      return {
        sql: simpleSql.trim(),
        explanation: 'Requête générée à partir d\'un modèle prédéfini car la génération automatique a échoué.',
        error: 'Impossible d\'extraire une requête SQL valide de la réponse',
        confidence: 0.3
      };
    }
    
    // 3. Valider et corriger la requête SQL
    console.log('Validation et correction de la requête SQL générée');
    const correctedSql = await validateAndCorrectSQL(sqlQuery, request.pharmacyId);
    
    console.log('Requête SQL finale:', correctedSql);
    
    // Retourner les résultats
    return {
      sql: correctedSql.trim(),
      explanation,
      confidence
    };
  } catch (error) {
    console.error('Erreur lors de la génération SQL:', error);
    
    return {
      sql: '',
      explanation: 'Une erreur s\'est produite lors de la génération de la requête SQL.',
      error: error instanceof Error ? error.message : String(error),
      confidence: 0
    };
  }
}

/**
 * Vérifie si une requête SQL est sécurisée (vérification basique)
 */
export function validateSQLSafety(sql: string): { safe: boolean; reason?: string } {
  // Liste de mots-clés interdits pour les opérations de modification
  const forbiddenKeywords = [
    'INSERT INTO', 'UPDATE ', 'DELETE FROM', 'DROP ', 
    'ALTER ', 'TRUNCATE ', 'GRANT ', 'REVOKE ',
    'CREATE ', 'EXEC ', 'EXECUTE '
  ];
  
  // Vérifier les mots-clés interdits
  for (const keyword of forbiddenKeywords) {
    if (sql.toUpperCase().includes(keyword)) {
      return {
        safe: false,
        reason: `Opération non autorisée: ${keyword.trim()}`
      };
    }
  }
  
  // Vérifier la présence de la clause WHERE pour les pharmacies
  if (sql.toUpperCase().includes('FROM DATA_') && 
      !sql.toUpperCase().includes('WHERE') && 
      !sql.toUpperCase().includes('PHARMACY_ID')) {
    return {
      safe: false,
      reason: 'Requête sans filtre sur pharmacy_id'
    };
  }
  
  return { safe: true };
}    