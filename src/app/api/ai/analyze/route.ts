// src/app/api/ai/analyze/route.ts
// Route API pour générer des requêtes SQL, les exécuter et analyser les résultats

import { NextRequest, NextResponse } from 'next/server';
import { generateSQL, validateSQLSafety } from '@/lib/ai/sql-generation';
import { executeSQLSafely } from '@/lib/db/sql-executor';
import { analyzeQueryResults } from '@/lib/ai/result-analyzer';
import { SQLGenerationRequest, SQLGenerationResponse } from '@/types/ai-sql';

export async function POST(request: NextRequest) {
  // Horodatage du début du traitement
  const startTime = Date.now();

  try {
    // Récupérer et valider le corps de la requête
    const body = await request.json();

    // Logs détaillés de la requête entrante
    console.log('------- DÉBUT DE LA REQUÊTE D\'ANALYSE -------');
    console.log('Corps de la requête:', JSON.stringify(body, null, 2));

    // Validation de base
    if (!body.query || !body.pharmacyId) {
      console.warn('Requête invalide : query ou pharmacyId manquant');
      return NextResponse.json({
        status: 'error',
        message: 'Les paramètres query et pharmacyId sont requis'
      }, { status: 400 });
    }

    // 1. GÉNÉRATION SQL
    console.log('🔍 Étape 1 : Génération de la requête SQL');
    const sqlRequest: SQLGenerationRequest = {
      query: body.query,
      pharmacyId: body.pharmacyId,
      dateRange: body.dateRange,
      conversationHistory: body.conversationHistory
    };

    const sqlResponse: SQLGenerationResponse = await generateSQL(sqlRequest);

    // Log du résultat de génération SQL
    console.log('Résultat génération SQL:', {
      sql: sqlResponse.sql,
      explanation: sqlResponse.explanation,
      confidence: sqlResponse.confidence,
      error: sqlResponse.error
    });

    if (sqlResponse.error || !sqlResponse.sql) {
      console.error('❌ Échec de la génération SQL:', sqlResponse.error);
      return NextResponse.json({
        status: 'error',
        message: sqlResponse.error || 'Échec de la génération SQL',
        explanation: sqlResponse.explanation
      }, { status: 400 });
    }

    // Vérification de sécurité
    console.log('🛡️ Vérification de sécurité de la requête SQL');
    const safetyCheck = validateSQLSafety(sqlResponse.sql);

    if (!safetyCheck.safe) {
      console.warn('⚠️ Requête SQL non sécurisée:', safetyCheck.reason);
      return NextResponse.json({
        status: 'error',
        message: 'Requête SQL non sécurisée',
        reason: safetyCheck.reason,
        explanation: sqlResponse.explanation
      }, { status: 400 });
    }

    // 2. EXÉCUTION SQL
    console.log('💾 Étape 2 : Exécution de la requête SQL');
    const params = [body.pharmacyId];

    // Nettoyage de la requête SQL
    const rawSQL = sqlResponse.sql.trim();

    // Remplacement sécurisé des identifiants de pharmacie entre quotes
    const parameterizedSql = rawSQL.replaceAll(`'${body.pharmacyId}'`, '$1');

    console.log('Requête SQL paramétrée :', parameterizedSql);
    console.log('Paramètres :', params);

    const executionResult = await executeSQLSafely(
      parameterizedSql,
      params,
      { maxRows: 100 }
    );

    // Log du résultat d'exécution
    console.log('Résultat exécution SQL:', {
      rowCount: executionResult.rowCount,
      columns: executionResult.columns
    });

    // 3. ANALYSE DES RÉSULTATS
    console.log('📊 Étape 3 : Analyse des résultats');
    const analysisResult = await analyzeQueryResults(executionResult, {
      originalQuery: body.query,
      sqlExplanation: sqlResponse.explanation,
      suggestVisualization: true
    });

    // Log de l'analyse
    console.log('Type de visualisation suggéré:', analysisResult.visualizationType);

    // Calcul du temps total de traitement
    const processingTime = Date.now() - startTime;
    console.log(`⏱️ Temps total de traitement : ${processingTime}ms`);

    console.log('------- FIN DE LA REQUÊTE D\'ANALYSE -------');

    // 4. RETOURNER RÉPONSE COMPLÈTE
    return NextResponse.json({
      status: 'success',
      processingTime,
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
    const processingTime = Date.now() - startTime;
    console.error('❌ Erreur complète dans l\'API analyze:', error);

    return NextResponse.json({
      status: 'error',
      processingTime,
      message: 'Erreur lors du traitement de la requête',
      error: {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      }
    }, { status: 500 });
  }
}