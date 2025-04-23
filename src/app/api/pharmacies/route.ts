import { NextResponse } from 'next/server';
import { query } from '@/lib/db/client';

export async function GET() {
  try {
    const sql = `
      SELECT 
        id, 
        name, 
        id_nat, 
        area 
      FROM 
        data_pharmacy 
      ORDER BY 
        name
      LIMIT 10
    `;
    
    const result = await query(sql);
    
    return NextResponse.json({
      status: 'success',
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error in pharmacies API:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Erreur lors de la récupération des pharmacies',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}