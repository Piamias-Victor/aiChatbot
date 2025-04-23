"use client";

import { FC } from 'react';

interface Sale {
  id: string;
  date: string;
  product_name: string;
  quantity: number;
  price_with_tax?: number;
  total_price?: number;
  category?: string;
}

interface SalesTableProps {
  sales: Sale[];
  isLoading?: boolean;
}

export const SalesTable: FC<SalesTableProps> = ({ sales, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
          <p className="text-gray-500">Chargement des ventes...</p>
        </div>
      </div>
    );
  }

  if (!sales || sales.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucune vente trouvée.
      </div>
    );
  }

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantité</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix unitaire</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sales.map((sale) => (
            <tr key={sale.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(sale.date)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sale.product_name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sale.category || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sale.quantity}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {sale.price_with_tax !== undefined ? 
                  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(sale.price_with_tax) 
                  : 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {sale.total_price !== undefined ? 
                  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(sale.total_price) 
                  : 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};