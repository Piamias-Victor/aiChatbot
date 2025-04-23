// src/lib/ai/result-analyzer.ts
// Service d'analyse des résultats SQL pour générer des insights

import { getAICompletion } from './client';
import { SQL_ANALYSIS_SYSTEM_PROMPT } from './prompts';
import { AIMessage } from '@/types/ai-client';
import { SQLExecutionResult, AnalysisResponse } from '@/types/ai-sql';

/**
 * Options pour l'analyse des résultats
 */
export interface ResultAnalysisOptions {
  /**
   * Question originale de l'utilisateur
   */
  originalQuery: string;
  
  /**
   * Explication de la requête SQL générée
   */
  sqlExplanation?: string;
  
  /**
   * Si les visualisations doivent être suggérées
   * (Par défaut: true)
   */
  suggestVisualization?: boolean;
}

/**
 * Analyse les résultats d'une requête SQL pour générer des insights
 */
export async function analyzeQueryResults(
  result: SQLExecutionResult,
  options: ResultAnalysisOptions
): Promise<AnalysisResponse> {
  try {
    // Préparer le contexte pour l'IA
    const dataContext = prepareDataContext(result);
    const queryContext = prepareQueryContext(options);
    
    // Construire les messages pour l'IA
    const messages: AIMessage[] = [
      // Message système avec le contexte et les instructions
      { 
        role: 'system', 
        content: SQL_ANALYSIS_SYSTEM_PROMPT 
      },
      
      // Message utilisateur avec les données et le contexte
      { 
        role: 'user', 
        content: `
        QUESTION ORIGINALE: "${options.originalQuery}"
        
        REQUÊTE SQL EXÉCUTÉE: 
        ${result.sql}
        
        ${options.sqlExplanation ? `EXPLICATION DE LA REQUÊTE: ${options.sqlExplanation}` : ''}
        
        ${queryContext}
        
        ${dataContext}
        
        Analyse ces résultats et fournit des insights pertinents pour un pharmacien. 
        ${options.suggestVisualization !== false ? 'Suggère aussi le type de visualisation le plus approprié pour ces données.' : ''}
        `
      }
    ];
    
    // Appeler l'API IA
    const completion = await getAICompletion({
      messages,
      temperature: 0.3, // Température modérée pour un bon équilibre entre créativité et précision
      maxTokens: 1500   // Limite de tokens pour une réponse détaillée
    });
    
    // Extraire l'analyse du texte de la réponse
    const analysisText = extractAnalysis(completion.content);
    
    // Extraire le type de visualisation suggéré (s'il existe)
    const visualizationType = extractVisualizationType(completion.content);
    
    // Préparer les données pour la visualisation si un type est suggéré
    const visualizationData = visualizationType 
      ? prepareVisualizationData(result, visualizationType) 
      : undefined;
    
    // Retourner l'analyse complète
    return {
      result,
      analysis: analysisText,
      visualizationType,
      visualizationData
    };
  } catch (error) {
    console.error('Erreur lors de l\'analyse des résultats:', error);
    
    // Retourner une analyse de secours en cas d'erreur
    return {
      result,
      analysis: `Voici les données que vous avez demandées. La requête a retourné ${result.rowCount} ligne(s) de résultats.`,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Prépare le contexte des données pour l'IA
 */
function prepareDataContext(result: SQLExecutionResult): string {
  const { data, columns, rowCount } = result;
  
  // Si pas de données, retourner un message approprié
  if (rowCount === 0 || !data || data.length === 0) {
    return 'RÉSULTATS: Aucune donnée trouvée.';
  }
  
  // Préparer l'en-tête des colonnes
  const header = columns.join(' | ');
  const separator = columns.map(() => '---').join(' | ');
  
  // Préparer un échantillon des données (max 20 lignes)
  const sampleSize = Math.min(20, data.length);
  const sampleData = data.slice(0, sampleSize);
  
  // Formater les lignes d'échantillon
  const rows = sampleData.map(row => {
    return columns
      .map(col => {
        const value = row[col];
        // Formater les nombres et les dates pour une meilleure lisibilité
        if (typeof value === 'number') {
          return Number.isInteger(value) ? value : value.toFixed(2);
        }
        if (value instanceof Date) {
          return value.toISOString().split('T')[0];
        }
        // Limiter la longueur des chaines de caractères
        if (typeof value === 'string' && value.length > 50) {
          return value.substring(0, 47) + '...';
        }
        return value === null || value === undefined ? 'NULL' : String(value);
      })
      .join(' | ');
  });
  
  // Construire le contexte des données
  return `
  RÉSULTATS (${rowCount} ligne(s) au total, montrant ${sampleSize} ${sampleSize < rowCount ? 'premières ' : ''}lignes):
  
  ${header}
  ${separator}
  ${rows.join('\n  ')}
  
  ${sampleSize < rowCount ? `...et ${rowCount - sampleSize} lignes supplémentaires non affichées.` : ''}
  `;
}

/**
 * Prépare le contexte de la requête pour l'IA
 */
function prepareQueryContext(options: ResultAnalysisOptions): string {
  // Extraire des informations sur la nature de la requête
  const queryLower = options.originalQuery.toLowerCase();
  
  // Détecter le type d'analyse demandée
  let analysisType = 'générale';
  if (queryLower.includes('vente') || queryLower.includes('vendu') || queryLower.includes('chiffre d\'affaire')) {
    analysisType = 'ventes';
  } else if (queryLower.includes('stock') || queryLower.includes('inventaire') || queryLower.includes('rupture')) {
    analysisType = 'stocks';
  } else if (queryLower.includes('marge') || queryLower.includes('profit') || queryLower.includes('rentable')) {
    analysisType = 'marges';
  }
  
  // Détecter si une période spécifique est mentionnée
  let timePeriod = 'non spécifiée';
  if (queryLower.includes('jour') || queryLower.includes('aujourd\'hui') || queryLower.includes('quotidien')) {
    timePeriod = 'journalière';
  } else if (queryLower.includes('semaine') || queryLower.includes('hebdomadaire')) {
    timePeriod = 'hebdomadaire';
  } else if (queryLower.includes('mois') || queryLower.includes('mensuel')) {
    timePeriod = 'mensuelle';
  } else if (queryLower.includes('année') || queryLower.includes('annuel')) {
    timePeriod = 'annuelle';
  }
  
  return `
  CONTEXTE D'ANALYSE:
  - Type d'analyse demandée: ${analysisType}
  - Période temporelle: ${timePeriod}
  - Focus: ${queryLower.includes('top') || queryLower.includes('meilleur') ? 'performances élevées' : 
            queryLower.includes('pire') || queryLower.includes('faible') ? 'performances faibles' : 'général'}
  `;
}

/**
 * Extrait l'analyse textuelle de la réponse de l'IA
 */
function extractAnalysis(responseContent: string): string {
  // Tenter d'extraire l'analyse d'un format JSON si présent
  const jsonMatch = responseContent.match(/"analysis"\s*:\s*"([^"]+)"/);
  if (jsonMatch && jsonMatch[1]) {
    return jsonMatch[1];
  }
  
  // Sinon, utiliser toute la réponse comme analyse
  return responseContent;
}

/**
 * Extrait le type de visualisation suggéré de la réponse de l'IA
 */
function extractVisualizationType(responseContent: string): string | undefined {
  // Types de visualisation valides
  const validTypes = ['bar', 'line', 'pie', 'table', 'metric'];
  
  // Rechercher un pattern JSON pour le type de visualisation
  const jsonMatch = responseContent.match(/"visualizationType"\s*:\s*"([^"]+)"/);
  if (jsonMatch && jsonMatch[1] && validTypes.includes(jsonMatch[1])) {
    return jsonMatch[1];
  }
  
  // Rechercher des mentions de types de visualisation dans le texte
  for (const type of validTypes) {
    const typeRegex = new RegExp(`\\b${type}\\s+(chart|graph|diagram|plot)\\b`, 'i');
    if (typeRegex.test(responseContent)) {
      return type;
    }
  }
  
  // Détection basée sur des mots-clés
  if (responseContent.includes('tendance') || responseContent.includes('évolution') || 
      responseContent.includes('temps') || responseContent.includes('période')) {
    return 'line';
  }
  
  if (responseContent.includes('proportion') || responseContent.includes('répartition') || 
      responseContent.includes('pourcentage') || responseContent.includes('distribution')) {
    return 'pie';
  }
  
  if (responseContent.includes('comparer') || responseContent.includes('comparaison') || 
      responseContent.includes('classement') || responseContent.includes('top')) {
    return 'bar';
  }
  
  // Par défaut, table pour les données brutes
  return 'table';
}

/**
 * Prépare les données pour la visualisation
 */
function prepareVisualizationData(
  result: SQLExecutionResult, 
  visualizationType: string
): Record<string, unknown> {
  const { data, columns } = result;
  
  if (!data || data.length === 0) {
    return { type: visualizationType, data: [] };
  }
  
  // Selon le type de visualisation, formater les données différemment
  switch (visualizationType) {
    case 'bar':
    case 'line':
      // Pour les graphiques à barres et linéaires, nous avons besoin d'un format spécifique
      // Supposer que la première colonne est une étiquette et les autres des valeurs
      return {
        type: visualizationType,
        data: data.map(row => {
          const formattedRow: Record<string, unknown> = {};
          columns.forEach(col => {
            formattedRow[col] = row[col];
          });
          return formattedRow;
        }),
        xAxis: columns[0],
        series: columns.slice(1)
      };
      
    case 'pie':
      // Pour les graphiques camembert, nous avons besoin d'un format label/value
      // Supposer que la première colonne est une étiquette et la deuxième une valeur
      return {
        type: visualizationType,
        data: data.map(row => ({
          name: String(row[columns[0]]),
          value: Number(row[columns[1]] || 0)
        }))
      };
      
    case 'metric':
      // Pour les métriques simples, prendre juste la première valeur
      const metricValue = data[0] ? data[0][columns[1] || columns[0]] : 0;
      const metricLabel = columns[0];
      return {
        type: visualizationType,
        data: {
          value: metricValue,
          label: metricLabel
        }
      };
      
    case 'table':
    default:
      // Pour les tableaux, utiliser les données telles quelles
      return {
        type: 'table',
        data: data,
        columns: columns
      };
  }
}