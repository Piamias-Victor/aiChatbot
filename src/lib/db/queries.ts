import { query } from './client';

/**
 * Récupère les produits d'une pharmacie avec des informations détaillées
 * 
 * @param pharmacyId ID de la pharmacie
 * @param limit Nombre de produits à récupérer (défaut: 100)
 * @param offset Décalage pour la pagination (défaut: 0)
 * @returns Liste des produits
 */
export async function getProducts(pharmacyId: string, limit = 100, offset = 0) {
  const sql = `
    SELECT 
      ip.id,
      ip.name,
      ip.internal_id,
      gp.category,
      gp.brand_lab,
      gp.lab_distributor,
      gp.universe,
      gp.sub_category,
      inv.stock,
      inv.price_with_tax,
      inv.weighted_average_price,
      inv.date as inventory_date
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
    ORDER BY
      ip.name
    LIMIT $2 OFFSET $3
  `;

  try {
    const result = await query(sql, [pharmacyId, limit, offset]);
    return result.rows;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

/**
 * Récupère les ventes pour une période donnée
 * 
 * @param startDate Date de début (format YYYY-MM-DD)
 * @param endDate Date de fin (format YYYY-MM-DD)
 * @param pharmacyId ID de la pharmacie
 * @param limit Nombre de résultats à récupérer (défaut: 100)
 * @returns Données de ventes
 */
export async function getSales(startDate: string, endDate: string, pharmacyId: string, limit = 100) {
  const sql = `
    SELECT 
      s.id,
      s.date,
      s.quantity,
      inv.price_with_tax,
      (s.quantity * inv.price_with_tax) as total_price,
      ip.name as product_name,
      gp.category,
      gp.brand_lab
    FROM 
      data_sales s
    JOIN 
      data_inventorysnapshot inv ON s.product_id = inv.id
    JOIN 
      data_internalproduct ip ON inv.product_id = ip.id
    LEFT JOIN 
      data_globalproduct gp ON ip.code_13_ref_id = gp.code_13_ref
    WHERE 
      s.date BETWEEN $1 AND $2
    AND 
      ip.pharmacy_id = $3
    ORDER BY 
      s.date DESC
    LIMIT $4
  `;

  try {
    const result = await query(sql, [startDate, endDate, pharmacyId, limit]);
    return result.rows;
  } catch (error) {
    console.error('Error fetching sales:', error);
    throw error;
  }
}

/**
 * Récupère les produits avec un stock faible
 * 
 * @param pharmacyId ID de la pharmacie
 * @param threshold Seuil de stock (défaut: 10)
 * @param limit Nombre de résultats à récupérer (défaut: 50)
 * @returns Produits avec stock faible
 */
export async function getLowStockProducts(pharmacyId: string, threshold = 10, limit = 50) {
  const sql = `
    SELECT 
      ip.id,
      ip.name,
      gp.category,
      gp.brand_lab,
      inv.stock,
      inv.price_with_tax,
      inv.date as inventory_date
    FROM 
      data_internalproduct ip
    LEFT JOIN 
      data_globalproduct gp ON ip.code_13_ref_id = gp.code_13_ref
    JOIN 
      data_inventorysnapshot inv ON ip.id = inv.product_id
    WHERE 
      ip.pharmacy_id = $1
    AND 
      inv.date = (
        SELECT MAX(date) FROM data_inventorysnapshot 
        WHERE product_id = ip.id
      )
    AND 
      inv.stock <= $2
    AND 
      inv.stock > 0
    ORDER BY 
      inv.stock ASC
    LIMIT $3
  `;

  try {
    const result = await query(sql, [pharmacyId, threshold, limit]);
    return result.rows;
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    throw error;
  }
}

/**
 * Récupère les informations sur la pharmacie
 * 
 * @param pharmacyId ID de la pharmacie
 * @returns Informations sur la pharmacie
 */
export async function getPharmacyInfo(pharmacyId: string) {
  const sql = `
    SELECT 
      id,
      name,
      id_nat,
      ca,
      area,
      employees_count,
      address
    FROM 
      data_pharmacy
    WHERE 
      id = $1
  `;

  try {
    const result = await query(sql, [pharmacyId]);
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching pharmacy info:', error);
    throw error;
  }
}