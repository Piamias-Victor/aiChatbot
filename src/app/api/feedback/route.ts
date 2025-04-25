// src/app/api/feedback/sql-error/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Interface pour les données de feedback
interface SQLErrorFeedback {
  messageId: string;
  userQuery: string;
  sqlQuery: string;
  timestamp: number;
  notes?: string;
}

/**
 * Enregistre un feedback d'erreur SQL
 * 
 * Cette API permet d'enregistrer les erreurs SQL signalées par les utilisateurs
 * pour améliorer la génération SQL future.
 * 
 * POST /api/feedback/sql-error
 */
export async function POST(request: NextRequest) {
  try {
    // Récupérer le corps de la requête
    const body = await request.json();
    
    // Valider les données requises
    if (!body.messageId || !body.sqlQuery || !body.userQuery) {
      return NextResponse.json({
        status: 'error',
        message: 'Données incomplètes. messageId, sqlQuery et userQuery sont requis.'
      }, { status: 400 });
    }
    
    // Formater les données pour l'enregistrement
    const feedbackData: SQLErrorFeedback = {
      messageId: body.messageId,
      userQuery: body.userQuery,
      sqlQuery: body.sqlQuery,
      timestamp: body.timestamp || Date.now(),
      notes: body.notes
    };
    
    // Créer le dossier logs s'il n'existe pas
    const logsDir = path.join(process.cwd(), 'logs');
    try {
      await fs.mkdir(logsDir, { recursive: true });
    } catch (err) {
      console.warn('Erreur lors de la création du dossier logs:', err);
    }
    
    // Nom du fichier de log basé sur la date
    const date = new Date();
    const fileName = `sql_errors_${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}.json`;
    const filePath = path.join(logsDir, fileName);
    
    // Charger les données existantes ou créer un nouvel array
    let existingData: SQLErrorFeedback[] = [];
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      existingData = JSON.parse(fileContent);
    } catch (err) {
      // Le fichier n'existe pas encore ou n'est pas lisible, on utilise un array vide
      console.log('Création d\'un nouveau fichier de log:', fileName);
    }
    
    // Ajouter la nouvelle entrée
    existingData.push(feedbackData);
    
    // Écrire les données dans le fichier
    await fs.writeFile(filePath, JSON.stringify(existingData, null, 2), 'utf-8');
    
    console.log(`Erreur SQL enregistrée: ${feedbackData.messageId}`);
    
    // Retourner une réponse de succès
    return NextResponse.json({
      status: 'success',
      message: 'Feedback enregistré avec succès',
      feedbackId: `${fileName}:${existingData.length - 1}`
    });
    
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du feedback:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erreur lors de l\'enregistrement du feedback',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}