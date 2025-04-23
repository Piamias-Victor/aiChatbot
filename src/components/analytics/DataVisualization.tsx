"use client";

import { FC, useState } from 'react';
import { useApiData } from '@/hooks/useApiData';
import { ProductsTable } from './tables/ProductsTable';
import { SalesTable } from './tables/SalesTable';
import { StockSummary } from './metrics/StockSummary';

// Définir les types pour nos données
interface Pharmacy {
  id: string;
  name: string;
  area?: string;
  id_nat?: string;
}

interface Product {
  id: string;
  name: string;
  category?: string;
  brand_lab?: string;
  stock?: number;
  price_with_tax?: number;
}

interface Sale {
  id: string;
  date: string;
  product_name: string;
  quantity: number;
  price_with_tax?: number;
  total_price?: number;
  category?: string;
}

enum DataView {
  Products = 'products',
  Sales = 'sales',
  Stock = 'stock'
}

export const DataVisualization: FC = () => {
  const [pharmacyId, setPharmacyId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<DataView>(DataView.Products);
  
  // Récupérer la liste des pharmacies
  const { data: pharmacies, isLoading: pharmaciesLoading, error: pharmaciesError } = 
    useApiData<Pharmacy[]>('/api/pharmacies');
  
  // Définir les URLs pour les différentes vues en fonction de la pharmacie sélectionnée
  const productsUrl = pharmacyId ? `/api/products?pharmacyId=${pharmacyId}&limit=20` : null;
  const salesUrl = pharmacyId ? 
    `/api/sales?pharmacyId=${pharmacyId}&startDate=2023-01-01&endDate=2023-12-31&limit=20` : null;
  const stockUrl = pharmacyId ? `/api/inventory?pharmacyId=${pharmacyId}&threshold=10` : null;
  
  // Utiliser les hooks pour récupérer les données
  const { data: products, isLoading: productsLoading } = useApiData<Product[]>(
    activeView === DataView.Products ? productsUrl : null
  );
  
  const { data: sales, isLoading: salesLoading } = useApiData<Sale[]>(
    activeView === DataView.Sales ? salesUrl : null
  );
  
  const { data: lowStockProducts, isLoading: stockLoading } = useApiData<Product[]>(
    activeView === DataView.Stock ? stockUrl : null
  );
  
  // Gérer le chargement et les erreurs
  if (pharmaciesLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
          <p className="text-gray-500">Chargement des pharmacies...</p>
        </div>
      </div>
    );
  }
  
  if (pharmaciesError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-red-500">
          <p>Erreur lors du chargement des données:</p>
          <p className="text-sm">{pharmaciesError}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col">
      <div className="bg-white p-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <label htmlFor="pharmacy-select" className="block text-sm font-medium text-gray-700 mb-1">
              Sélectionner une pharmacie:
            </label>
            <select
              id="pharmacy-select"
              className="w-full md:w-64 rounded-md border border-gray-300 p-2 text-sm"
              value={pharmacyId || ''}
              onChange={(e) => setPharmacyId(e.target.value || null)}
            >
              <option value="">Choisir une pharmacie</option>
              {pharmacies?.map((pharmacy) => (
                <option key={pharmacy.id} value={pharmacy.id}>
                  {pharmacy.name} - {pharmacy.area}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex space-x-2">
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeView === DataView.Products
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setActiveView(DataView.Products)}
            >
              Produits
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeView === DataView.Sales
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setActiveView(DataView.Sales)}
            >
              Ventes
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeView === DataView.Stock
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setActiveView(DataView.Stock)}
            >
              Stock
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4">
        {!pharmacyId ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p>Veuillez sélectionner une pharmacie pour afficher les données</p>
            </div>
          </div>
        ) : (
          <>
            {activeView === DataView.Products && (
              <ProductsTable products={products || []} isLoading={productsLoading} />
            )}
            
            {activeView === DataView.Sales && (
              <SalesTable sales={sales || []} isLoading={salesLoading} />
            )}
            
            {activeView === DataView.Stock && (
              <StockSummary products={lowStockProducts || []} isLoading={stockLoading} />
            )}
          </>
        )}
      </div>
    </div>
  );
};