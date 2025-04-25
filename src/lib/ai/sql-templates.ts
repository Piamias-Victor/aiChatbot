// src/lib/ai/sql-templates.ts
// Templates SQL pour les questions fréquentes

import { SQLGenerationResponse } from '@/types/ai-sql';

/**
 * Interface pour les templates SQL
 */
interface SQLTemplate {
  sql: string;
  explanation: string;
  keywords: string[];
}

/**
 * Templates SQL prédéfinis pour les questions courantes
 */
export const SQL_TEMPLATES: Record<string, SQLTemplate> = {
  topSellingProducts: {
    sql: `
      SELECT 
        ip.name AS "Nom du produit", 
        SUM(s.quantity) AS "Quantité vendue",
        gp.category AS "Catégorie",
        gp.brand_lab AS "Laboratoire"
      FROM 
        data_sales s
      JOIN 
        data_inventorysnapshot inv ON s.product_id = inv.id
      JOIN 
        data_internalproduct ip ON inv.product_id = ip.id
      LEFT JOIN
        data_globalproduct gp ON ip.code_13_ref_id = gp.code_13_ref
      WHERE 
        ip.pharmacy_id = $1
      AND 
        s.date BETWEEN $2 AND $3
      GROUP BY 
        ip.name, gp.category, gp.brand_lab
      ORDER BY 
        "Quantité vendue" DESC
      LIMIT 10
    `,
    explanation: "Cette requête identifie les produits les plus vendus sur la période spécifiée, en affichant la quantité totale vendue pour chaque produit, avec sa catégorie et son laboratoire.",
    keywords: ['vendu', 'top produit', 'meilleur vente', 'plus vend']
  },
  
  stockRupture: {
    sql: `
      SELECT 
        ip.name AS "Nom du produit", 
        gp.category AS "Catégorie", 
        gp.brand_lab AS "Laboratoire",
        inv.date AS "Date du stock"
      FROM 
        data_internalproduct ip 
      JOIN 
        data_globalproduct gp ON ip.code_13_ref_id = gp.code_13_ref 
      JOIN 
        data_inventorysnapshot inv ON ip.id = inv.product_id 
      WHERE 
        ip.pharmacy_id = $1 
      AND 
        inv.stock = 0 
      AND 
        inv.date = (SELECT MAX(date) FROM data_inventorysnapshot WHERE product_id = ip.id) 
      ORDER BY 
        gp.category, ip.name
      LIMIT 100
    `,
    explanation: "Cette requête identifie tous les produits en rupture de stock (stock = 0) selon le dernier inventaire disponible, classés par catégorie.",
    keywords: ['rupture', 'stock zéro', 'stock épuisé', 'manque stock']
  },
  
  marginByCategory: {
    sql: `
      SELECT 
        gp.category AS "Catégorie", 
        SUM(s.quantity * inv.price_with_tax) AS "Chiffre d'affaires", 
        SUM(s.quantity * inv.weighted_average_price) AS "Coût d'achat",
        SUM(s.quantity * (inv.price_with_tax - inv.weighted_average_price)) AS "Marge brute",
        ROUND(
          SUM(s.quantity * (inv.price_with_tax - inv.weighted_average_price)) / 
          NULLIF(SUM(s.quantity * inv.price_with_tax), 0) * 100, 
          2
        ) AS "Taux de marge (%)"
      FROM 
        data_sales s
      JOIN 
        data_inventorysnapshot inv ON s.product_id = inv.id
      JOIN 
        data_internalproduct ip ON inv.product_id = ip.id
      JOIN 
        data_globalproduct gp ON ip.code_13_ref_id = gp.code_13_ref
      WHERE 
        ip.pharmacy_id = $1
      AND 
        s.date BETWEEN $2 AND $3
      AND 
        inv.price_with_tax > 0
      GROUP BY 
        gp.category
      ORDER BY 
        "Marge brute" DESC
      LIMIT 100
    `,
    explanation: "Cette requête calcule la marge par catégorie de produits, en affichant le chiffre d'affaires, le coût d'achat, la marge brute et le taux de marge pour chaque catégorie.",
    keywords: ['marge', 'rentabilité', 'catégorie', 'taux de marge']
  },
  
  lowRotationProducts: {
    sql: `
      SELECT 
        ip.name AS "Nom du produit",
        gp.category AS "Catégorie",
        inv.stock AS "Stock actuel",
        inv.price_with_tax AS "Prix TTC",
        COALESCE(SUM(s.quantity), 0) AS "Ventes période",
        inv.stock * inv.weighted_average_price AS "Valeur stock"
      FROM 
        data_internalproduct ip
      JOIN 
        data_globalproduct gp ON ip.code_13_ref_id = gp.code_13_ref
      JOIN 
        data_inventorysnapshot inv ON ip.id = inv.product_id
      LEFT JOIN 
        data_sales s ON s.product_id = inv.id AND s.date BETWEEN $2 AND $3
      WHERE 
        ip.pharmacy_id = $1
        AND inv.date = (SELECT MAX(date) FROM data_inventorysnapshot WHERE product_id = ip.id)
        AND inv.stock > 0
      GROUP BY 
        ip.name, gp.category, inv.stock, inv.price_with_tax, inv.weighted_average_price
      HAVING 
        COALESCE(SUM(s.quantity), 0) < 3
      ORDER BY 
        "Ventes période" ASC, "Valeur stock" DESC
      LIMIT 100
    `,
    explanation: "Cette requête identifie les produits à faible rotation (moins de 3 ventes sur la période) qui sont encore en stock, triés par nombre de ventes (ascendant) et valeur de stock (descendant).",
    keywords: ['rotation', 'faible vente', 'invendu', 'stock dormant']
  },
  
  salesByDay: {
    sql: `
      SELECT 
        s.date AS "Date", 
        SUM(s.quantity * inv.price_with_tax) AS "Chiffre d'affaires",
        COUNT(DISTINCT s.id) AS "Nombre de ventes"
      FROM 
        data_sales s
      JOIN 
        data_inventorysnapshot inv ON s.product_id = inv.id
      JOIN 
        data_internalproduct ip ON inv.product_id = ip.id
      WHERE 
        ip.pharmacy_id = $1
      AND 
        s.date BETWEEN $2 AND $3
      GROUP BY 
        s.date
      ORDER BY 
        s.date
      LIMIT 100
    `,
    explanation: "Cette requête affiche le chiffre d'affaires quotidien et le nombre de ventes sur la période spécifiée.",
    keywords: ['vente jour', 'quotidien', 'journalier', 'ca par jour']
  },
  
  solarProductsComparison: {
    sql: `
      SELECT 
        EXTRACT(YEAR FROM s.date) AS "Année",
        EXTRACT(MONTH FROM s.date) AS "Mois",
        SUM(s.quantity) AS "Quantité vendue",
        SUM(s.quantity * inv.price_with_tax) AS "Chiffre d'affaires"
      FROM 
        data_sales s
      JOIN 
        data_inventorysnapshot inv ON s.product_id = inv.id
      JOIN 
        data_internalproduct ip ON inv.product_id = ip.id
      JOIN 
        data_globalproduct gp ON ip.code_13_ref_id = gp.code_13_ref
      WHERE 
        ip.pharmacy_id = $1
        AND gp.category = 'Solaire'
        AND (
          (s.date BETWEEN $2 AND $3) 
          OR 
          (s.date BETWEEN DATE($2) - INTERVAL '1 year' AND DATE($3) - INTERVAL '1 year')
        )
      GROUP BY 
        EXTRACT(YEAR FROM s.date),
        EXTRACT(MONTH FROM s.date)
      ORDER BY 
        EXTRACT(YEAR FROM s.date),
        EXTRACT(MONTH FROM s.date)
      LIMIT 100
    `,
    explanation: "Cette requête compare les ventes de produits solaires entre l'année en cours et l'année précédente, en affichant les quantités vendues et le chiffre d'affaires par mois.",
    keywords: ['solaire', 'compar', 'année dernière', 'compare']
  },
  
  monthlySales: {
    sql: `
      SELECT 
        DATE_TRUNC('month', s.date) AS "Mois", 
        SUM(s.quantity * inv.price_with_tax) AS "Chiffre d'affaires"
      FROM 
        data_sales s
      JOIN 
        data_inventorysnapshot inv ON s.product_id = inv.id
      JOIN 
        data_internalproduct ip ON inv.product_id = ip.id
      WHERE 
        ip.pharmacy_id = $1
        AND s.date BETWEEN $2 AND $3
      GROUP BY 
        DATE_TRUNC('month', s.date)
      ORDER BY 
        "Mois"
      LIMIT 100
    `,
    explanation: "Cette requête calcule le chiffre d'affaires mensuel pour la période spécifiée.",
    keywords: ['chiffre d\'affaires', 'ca', 'mensuel', 'mois', 'ventes']
  },
  
  gripMedicineComparison: {
    sql: `
      SELECT 
        EXTRACT(YEAR FROM s.date) AS "Année",
        EXTRACT(MONTH FROM s.date) AS "Mois",
        SUM(s.quantity) AS "Quantité vendue",
        SUM(s.quantity * inv.price_with_tax) AS "Chiffre d'affaires"
      FROM 
        data_sales s
      JOIN 
        data_inventorysnapshot inv ON s.product_id = inv.id
      JOIN 
        data_internalproduct ip ON inv.product_id = ip.id
      JOIN 
        data_globalproduct gp ON ip.code_13_ref_id = gp.code_13_ref
      WHERE 
        ip.pharmacy_id = $1
        AND (
          gp.category = 'Médicaments' 
          AND (
            gp.name ILIKE '%grippe%' 
            OR gp.name ILIKE '%rhume%' 
            OR gp.name ILIKE '%fièvre%'
            OR gp.name ILIKE '%toux%'
          )
        )
        AND (
          (s.date BETWEEN $2 AND $3) 
          OR 
          (s.date BETWEEN DATE($2) - INTERVAL '1 year' AND DATE($3) - INTERVAL '1 year')
        )
      GROUP BY 
        EXTRACT(YEAR FROM s.date),
        EXTRACT(MONTH FROM s.date)
      ORDER BY 
        EXTRACT(YEAR FROM s.date),
        EXTRACT(MONTH FROM s.date)
      LIMIT 100
    `,
    explanation: "Cette requête compare les ventes de médicaments contre la grippe entre l'année en cours et l'année précédente, en affichant les quantités vendues et le chiffre d'affaires par mois.",
    keywords: ['grippe', 'médicament', 'compar', 'année dernière', 'rhume', 'toux']
  }
};

/**
 * Cherche un template SQL qui correspond à la question de l'utilisateur
 * 
 * @param query Question de l'utilisateur
 * @returns Template SQL correspondant ou null si aucun ne correspond
 */
export function findMatchingTemplate(query: string): SQLTemplate | null {
  const normalizedQuery = query.toLowerCase();
  
  // Recherche pour médicaments contre la grippe
  if (normalizedQuery.includes('grippe') || 
      (normalizedQuery.includes('médicament') && 
       (normalizedQuery.includes('rhume') || normalizedQuery.includes('toux')))) {
    return SQL_TEMPLATES.gripMedicineComparison;
  }
  
  // Recherche pour chiffre d'affaires mensuel
  if ((normalizedQuery.includes('chiffre d\'affaires') || normalizedQuery.includes('ca ')) && 
      (normalizedQuery.includes('mois') || normalizedQuery.includes('mensuel'))) {
    return SQL_TEMPLATES.monthlySales;
  }
  
  // Recherche de mots-clés pour les produits solaires
  if (normalizedQuery.includes('solaire') && 
      (normalizedQuery.includes('année dernière') || 
       normalizedQuery.includes('compar'))) {
    return SQL_TEMPLATES.solarProductsComparison;
  }
  
  // Parcourir tous les templates et vérifier si les mots-clés correspondent
  for (const [key, template] of Object.entries(SQL_TEMPLATES)) {
    if (template.keywords.some(keyword => normalizedQuery.includes(keyword))) {
      return template;
    }
  }
  
  return null;
}

/**
 * Prépare une réponse SQL à partir d'un template
 * 
 * @param template Template SQL à utiliser
 * @param params Paramètres à remplacer dans le template
 * @returns Réponse SQL formatée
 */
export function prepareTemplateResponse(
  template: SQLTemplate, 
  confidence: number = 0.9
): SQLGenerationResponse {
  return {
    sql: template.sql,
    explanation: template.explanation,
    confidence
  };
}