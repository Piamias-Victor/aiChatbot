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

    // Vérification de sécurité supplémentaire
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
    
    // Préparation des paramètres pour la requête
    const params = [body.pharmacyId];
    
    // Ajout des paramètres de date si présents
    if (body.dateRange) {
      params.push(body.dateRange.startDate, body.dateRange.endDate);
    }
    
    // Ajout d'une valeur pour le paramètre LIMIT si nécessaire
    // Vérifier si la requête contient un paramètre LIMIT $4
    if (sqlResponse.sql.includes('LIMIT $4')) {
      params.push(10); // Valeur par défaut pour la limite
    }
    
    // Si des dates littérales sont présentes dans la requête, les remplacer par les paramètres
    let parameterizedSql = sqlResponse.sql;
    if (parameterizedSql.includes("'2025-01-01'") && parameterizedSql.includes("'2025-12-31'")) {
      // Pour les requêtes avec des dates codées en dur pour l'année en cours
      params.splice(1, 0, '2025-01-01', '2025-12-31');
    }
    
    // Nettoyage de la requête SQL
    const rawSQL = sqlResponse.sql.trim();

    // Remplacement des valeurs littérales par des paramètres préparés
    parameterizedSql = rawSQL;
    
    // Remplacer les ID de pharmacie littéraux par des paramètres
    parameterizedSql = parameterizedSql.replace(
      new RegExp(`'${body.pharmacyId}'|"${body.pharmacyId}"`, 'g'), 
      '$1'
    );
    
    // Remplacer les dates littérales par des paramètres si nécessaire
    if (body.dateRange) {
      parameterizedSql = parameterizedSql
        .replace(
          new RegExp(`'${body.dateRange.startDate}'|"${body.dateRange.startDate}"`, 'g'), 
          '$2'
        )
        .replace(
          new RegExp(`'${body.dateRange.endDate}'|"${body.dateRange.endDate}"`, 'g'), 
          '$3'
        );
    }

    console.log('Requête SQL paramétrée :', parameterizedSql);
    console.log('Paramètres :', params);

    try {
      const executionResult = await executeSQLSafely(
        parameterizedSql,
        params,
        { maxRows: 100, timeoutMs: 10000 }
      );

      // Log du résultat d'exécution
      console.log('Résultat exécution SQL:', {
        rowCount: executionResult.rowCount,
        columns: executionResult.columns,
        queryTime: executionResult.queryTime
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
      
    } catch (sqlExecError) {
      console.error('Erreur d\'exécution SQL:', sqlExecError);
      
      // En cas d'erreur SQL, tenter avec une requête simplifiée
      const fallbackSQL = `
        SELECT 
          ip.name AS "Nom du produit", 
          gp.category AS "Catégorie",
          inv.stock AS "Stock actuel"
        FROM 
          data_internalproduct ip
        LEFT JOIN 
          data_globalproduct gp ON ip.code_13_ref_id = gp.code_13_ref
        LEFT JOIN 
          data_inventorysnapshot inv ON ip.id = inv.product_id
        WHERE 
          ip.pharmacy_id = $1
        AND 
          (inv.date IS NULL OR inv.date = (
            SELECT MAX(date) FROM data_inventorysnapshot 
            WHERE product_id = ip.id
          ))
        LIMIT 20
      `;
      
      console.log('Tentative avec requête de secours:', fallbackSQL);
      
      const fallbackResult = await executeSQLSafely(
        fallbackSQL,
        [body.pharmacyId],
        { maxRows: 20 }
      );
      
      const processingTime = Date.now() - startTime;
      
      return NextResponse.json({
        status: 'partial_success',
        processingTime,
        message: 'La requête originale a échoué, utilisation d\'une requête simplifiée',
        error: sqlExecError instanceof Error ? sqlExecError.message : String(sqlExecError),
        data: {
          sql: fallbackSQL,
          explanation: 'Requête simplifiée retournant les produits disponibles suite à une erreur dans la requête originale.',
          confidence: 0.3,
          result: fallbackResult,
          analysis: 'Suite à une erreur dans la requête initiale, voici les produits disponibles dans votre pharmacie. La requête originale n\'a pas pu être exécutée.'
        }
      });
    }

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