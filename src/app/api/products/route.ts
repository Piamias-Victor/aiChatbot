import { NextRequest, NextResponse } from 'next/server';
import { getProducts } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    // Récupérer les paramètres de requête
    const searchParams = request.nextUrl.searchParams;
    const pharmacyId = searchParams.get('pharmacyId') || '';
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    
    // Vérifier si l'ID de la pharmacie est fourni
    if (!pharmacyId) {
      return NextResponse.json({
        status: 'error',
        message: 'Le paramètre pharmacyId est requis'
      }, { status: 400 });
    }
    
    const products = await getProducts(pharmacyId, limit, offset);
    
    return NextResponse.json({
      status: 'success',
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Error in products API:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Erreur lors de la récupération des produits',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}