// src/types/ai-sql.ts
// Types pour le service de génération SQL par IA

export interface SQLGenerationRequest {
    query: string;            // Question en langage naturel
    pharmacyId: string;       // ID de la pharmacie concernée
    dateRange?: {             // Plage de dates optionnelle
      startDate: string;      // Format YYYY-MM-DD
      endDate: string;        // Format YYYY-MM-DD
    };
    conversationHistory?: SQLConversationMessage[]; // Historique de conversation pour contexte
  }
  
  export interface SQLConversationMessage {
    role: 'user' | 'assistant';
    content: string;
  }
  
  export interface SQLGenerationResponse {
    sql: string;              // Requête SQL générée
    explanation: string;      // Explication de la requête en langage naturel
    error?: string;           // Message d'erreur si la génération a échoué
    confidence: number;       // Niveau de confiance entre 0 et 1
  }
  
  export interface SQLExecutionResult {
    data: Record<string, unknown>[];              // Données retournées par la requête
    columns: string[];        // Noms des colonnes
    rowCount: number;         // Nombre de lignes retournées
    queryTime: number;        // Temps d'exécution en ms
    sql: string;              // Requête SQL exécutée
  }
  
  export interface AnalysisResponse {
    result?: SQLExecutionResult;   // Résultat de la requête SQL
    analysis: string;              // Analyse textuelle des données
    error?: string;                // Message d'erreur en cas de problème
    visualizationType?: string;    // Type de visualisation recommandé
    visualizationData?: Record<string, unknown>[];       // Données formatées pour la visualisation
  }