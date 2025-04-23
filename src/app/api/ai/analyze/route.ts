// src/app/api/ai/analyze/route.ts
// Route API pour générer des requêtes SQL, les exécuter et analyser les résultats

import { NextRequest, NextResponse } from 'next/server';
import { generateSQL, validateSQLSafety } from '@/lib/ai/sql-generation';
import { executeSQLSafely } from '@/lib/db/sql-executor';
import { analyzeQueryResults } from '@/lib/ai/result-analyzer';
import { SQLGenerationRequest, SQLGenerationResponse } from '@/types/ai-sql';

export async function POST(request: NextRequest) {
  try {
    // Récupérer et valider le corps de la requête
    const body = await request.json();

    if (!body.query || !body.pharmacyId) {
      return NextResponse.json({
        status: 'error',
        message: 'Les paramètres query et pharmacyId sont requis'
      }, { status: 400 });
    }

    // 1. GÉNÉRATION SQL
    const sqlRequest: SQLGenerationRequest = {
      query: body.query,
      pharmacyId: body.pharmacyId,
      dateRange: body.dateRange,
      conversationHistory: body.conversationHistory
    };

    const sqlResponse: SQLGenerationResponse = await generateSQL(sqlRequest);

    if (sqlResponse.error || !sqlResponse.sql) {
      return NextResponse.json({
        status: 'error',
        message: sqlResponse.error || 'Échec de la génération SQL',
        explanation: sqlResponse.explanation
      }, { status: 400 });
    }

    const safetyCheck = validateSQLSafety(sqlResponse.sql);

    if (!safetyCheck.safe) {
      return NextResponse.json({
        status: 'error',
        message: 'Requête SQL non sécurisée',
        reason: safetyCheck.reason,
        explanation: sqlResponse.explanation
      }, { status: 400 });
    }

    // 2. EXÉCUTION SQL
    const params = [body.pharmacyId];

    // Nettoyage de la requête SQL
    const rawSQL = sqlResponse.sql.trim();

    // Remplacement sécurisé des identifiants de pharmacie entre quotes
    const parameterizedSql = rawSQL.replaceAll(`'${body.pharmacyId}'`, '$1');

    console.log('Requête SQL envoyée :', parameterizedSql);
    console.log('Paramètres :', params);

    const executionResult = await executeSQLSafely(
      parameterizedSql,
      params,
      { maxRows: 100 }
    );

    // 3. ANALYSE DES RÉSULTATS
    const analysisResult = await analyzeQueryResults(executionResult, {
      originalQuery: body.query,
      sqlExplanation: sqlResponse.explanation,
      suggestVisualization: true
    });

    // 4. RETOURNER RÉPONSE COMPLÈTE
    return NextResponse.json({
      status: 'success',
      data: {
        sql: sqlResponse.sql,
        explanation: sqlResponse.explanation,
        confidence: sqlResponse.confidence,
        result: executionResult,
        analysis: analysisResult.analysis,
        visualizationType: analysisResult.visualizationType,
        visualizationData: analysisResult.visualizationData
      }
    });

  } catch (error) {
    console.error('Erreur dans l\'API analyze:', error);

    return NextResponse.json({
      status: 'error',
      message: 'Erreur lors du traitement de la requête',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}