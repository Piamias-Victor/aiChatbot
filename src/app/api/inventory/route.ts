import { NextRequest, NextResponse } from 'next/server';
import { getLowStockProducts } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    // Récupérer les paramètres de requête
    const searchParams = request.nextUrl.searchParams;
    const pharmacyId = searchParams.get('pharmacyId') || '';
    const threshold = parseInt(searchParams.get('threshold') || '10', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    
    // Vérifier si l'ID de la pharmacie est fourni
    if (!pharmacyId) {
      return NextResponse.json({
        status: 'error',
        message: 'Le paramètre pharmacyId est requis'
      }, { status: 400 });
    }
    
    const lowStockProducts = await getLowStockProducts(pharmacyId, threshold, limit);
    
    return NextResponse.json({
      status: 'success',
      count: lowStockProducts.length,
      data: lowStockProducts
    });
  } catch (error) {
    console.error('Error in inventory API:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Erreur lors de la récupération des produits à faible stock',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}