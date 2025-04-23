// Types spécifiques au domaine pharmaceutique

export interface Product {
    id: string;
    name: string;
    laboratory: string;
    category: string;
    subcategory?: string;
    purchasePrice: number;
    sellingPrice: number;
    stock: number;
    reorderPoint: number;
    lastSoldDate?: string;
  }
  
  export interface Sale {
    id: string;
    date: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    margin: number;
  }
  
  export type ProductCategory = 
    | 'Médicaments'
    | 'Parapharmacie'
    | 'Orthopédie'
    | 'Homéopathie'
    | 'Compléments alimentaires'
    | 'Produits vétérinaires'
    | 'Hygiène'
    | 'Cosmétique';
  
  export interface StockAlert {
    productId: string;
    currentStock: number;
    reorderPoint: number;
    averageSalesPerWeek: number;
    estimatedDaysRemaining: number;
  }