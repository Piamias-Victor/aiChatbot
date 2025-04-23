import { NextResponse } from 'next/server';
import { testConnection } from '@/lib/db/client';

/**
 * Route API pour tester la connexion à la base de données
 * GET /api/db/test-connection
 */
export async function GET() {
  try {
    const result = await testConnection();
    
    if (result.connected) {
      return NextResponse.json({
        status: 'success',
        message: 'Connexion à la base de données établie',
        timestamp: result.timestamp
      });
    } else {
      return NextResponse.json({
        status: 'error',
        message: 'Impossible de se connecter à la base de données',
        error: result.error
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Erreur lors du test de connexion',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}