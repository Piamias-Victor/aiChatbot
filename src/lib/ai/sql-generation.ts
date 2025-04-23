// src/lib/ai/sql-generation.ts
// Service de génération de requêtes SQL à partir de questions en langage naturel

import { getAICompletion } from './client';
import { SQL_GENERATION_SYSTEM_PROMPT, generateSQLPrompt } from './prompts';
import { SQLGenerationRequest, SQLGenerationResponse } from '@/types/ai-sql';
import { AIMessage } from '@/types/ai-client';

/**
 * Génère une requête SQL à partir d'une question en langage naturel
 */
export async function generateSQL(request: SQLGenerationRequest): Promise<SQLGenerationResponse> {
  try {
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
    
    // Ajouter l'historique de conversation si disponible
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
    
    // Solution ultra-robuste - manuellement rechercher et reconstruire la requête SQL
    
    // 1. Récupérer la structure complète de la requête SQL
    const fullText = content.replace(/\\"/g, '"');
    
    // Identifier où la requête SQL commence et se termine (à partir de "SELECT" jusqu'à "LIMIT")
    const selectIndex = fullText.indexOf("SELECT");
    let sqlQuery = '';
    
    if (selectIndex >= 0) {
      // Extraire toute la requête SQL en cherchant les mots-clés typiques
      // et en reconstruisant une chaîne propre
      const keywords = [
        "SELECT", "FROM", "JOIN", "WHERE", "GROUP BY", 
        "ORDER BY", "LIMIT", "HAVING", "UNION"
      ];
      
      // Chercher tous les mots-clés dans le texte
      const parts: {keyword: string, index: number}[] = [];
      
      keywords.forEach(keyword => {
        let pos = fullText.indexOf(keyword, selectIndex);
        while (pos >= 0) {
          parts.push({keyword, index: pos});
          pos = fullText.indexOf(keyword, pos + 1);
        }
      });
      
      // Trier les parties par position
      parts.sort((a, b) => a.index - b.index);
      
      // Extraire les clauses et reconstruire la requête
      if (parts.length > 0) {
        for (let i = 0; i < parts.length; i++) {
          const current = parts[i];
          const next = i < parts.length - 1 ? parts[i + 1] : null;
          
          const start = current.index;
          const end = next ? next.index : fullText.length;
          
          // Extraire cette partie de la requête
          let part = fullText.substring(start, end).trim();
          // Supprimer les caractères d'échappement et formater
          part = part.replace(/\\\s*/g, ' ').trim();
          
          // Ajouter à la requête reconstruite
          sqlQuery += part + ' ';
        }
      } else {
        // Fallback - essayer de trouver une requête SQL basique
        const simpleMatch = fullText.match(/SELECT[\s\S]*?(?:LIMIT \d+|;)/i);
        if (simpleMatch) {
          sqlQuery = simpleMatch[0].replace(/\\\s*/g, ' ').trim();
        }
      }
    }
    
    // 2. Récupérer l'explication
    let explanation = 'Explication non disponible';
    const explanationMatch = fullText.match(/"explanation":\s*"([^"]+)"/);
    if (explanationMatch && explanationMatch[1]) {
      explanation = explanationMatch[1]
        .replace(/\\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
    
    // 3. Récupérer le niveau de confiance
    const confidenceMatch = content.match(/confidence"?:\s*([\d.]+)/);
    const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.5;
    
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
    
    // Retourner les résultats extraits
    return {
      sql: sqlQuery.trim(),
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
  // Cette vérification est simple et pourrait être améliorée
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