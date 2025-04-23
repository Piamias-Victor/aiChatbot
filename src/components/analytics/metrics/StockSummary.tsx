"use client";

import { FC } from 'react';

interface Product {
  id: string;
  name: string;
  stock?: number;
  category?: string;
}

interface StockSummaryProps {
  products: Product[];
  isLoading?: boolean;
}

export const StockSummary: FC<StockSummaryProps> = ({ products, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
          <p className="text-gray-500">Chargement des données de stock...</p>
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucune donnée de stock disponible.
      </div>
    );
  }

  // Calculer les métriques de stock
  const productsWithStock = products.filter(p => p.stock !== undefined);
  const totalProducts = productsWithStock.length;
  const outOfStock = productsWithStock.filter(p => p.stock === 0).length;
  const lowStock = productsWithStock.filter(p => p.stock !== undefined && p.stock > 0 && p.stock <= 5).length;
  // Nous n'utilisons pas healthyStock pour le moment, donc nous le supprimons pour éviter l'erreur ESLint
  // const healthyStock = productsWithStock.filter(p => p.stock !== undefined && p.stock > 5).length;

  // Regrouper par catégorie
  const categorySummary: {[category: string]: number} = {};
  productsWithStock.forEach(product => {
    const category = product.category || 'Non catégorisé';
    categorySummary[category] = (categorySummary[category] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-700">Produits en stock</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{totalProducts}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-700">Ruptures de stock</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">{outOfStock}</p>
          <p className="text-sm text-gray-500 mt-1">
            {((outOfStock / totalProducts) * 100).toFixed(1)}% des produits
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-700">Stock faible</h3>
          <p className="text-3xl font-bold text-amber-500 mt-2">{lowStock}</p>
          <p className="text-sm text-gray-500 mt-1">
            {((lowStock / totalProducts) * 100).toFixed(1)}% des produits
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Produits par catégorie</h3>
        <div className="space-y-2">
          {Object.entries(categorySummary)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([category, count]) => (
              <div key={category} className="flex items-center">
                <div className="w-32 mr-4 text-sm text-gray-600 truncate">{category}</div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: `${(count / totalProducts) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="ml-4 text-sm font-medium text-gray-700">{count}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};