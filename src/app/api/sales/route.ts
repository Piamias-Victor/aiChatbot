import { NextRequest, NextResponse } from 'next/server';
import { getSales } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    // Récupérer les paramètres de requête
    const searchParams = request.nextUrl.searchParams;
    const pharmacyId = searchParams.get('pharmacyId') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    
    // Vérifier que tous les paramètres requis sont fournis
    if (!pharmacyId || !startDate || !endDate) {
      return NextResponse.json({
        status: 'error',
        message: 'Les paramètres pharmacyId, startDate et endDate sont requis'
      }, { status: 400 });
    }
    
    const sales = await getSales(startDate, endDate, pharmacyId, limit);
    
    return NextResponse.json({
      status: 'success',
      count: sales.length,
      data: sales
    });
  } catch (error) {
    console.error('Error in sales API:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Erreur lors de la récupération des ventes',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}