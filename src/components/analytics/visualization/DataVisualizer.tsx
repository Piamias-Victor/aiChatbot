// src/components/analytics/visualization/DataVisualizer.tsx
"use client";

import { FC } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Sector
} from 'recharts';

// Types pour les props de visualisation
interface VisualizationProps {
  type: string;
  data: any;
  title?: string;
}

// Composant de visualisation de données
export const DataVisualizer: FC<VisualizationProps> = ({ type, data, title }) => {
  // Couleurs pour les graphiques
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
  
  // Formater un nombre avec séparateur de milliers et 2 décimales max
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: 2
    }).format(num);
  };
  
  // Vérifier si les données sont valides
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          <p>Aucune donnée disponible pour la visualisation</p>
        </div>
      </div>
    );
  }
  
  // Rendu selon le type de visualisation
  const renderVisualization = () => {
    switch (type) {
      case 'bar':
        return renderBarChart();
      case 'line':
        return renderLineChart();
      case 'pie':
        return renderPieChart();
      case 'table':
        return renderTable();
      case 'metric':
        return renderMetric();
      default:
        return renderTable(); // Par défaut, afficher un tableau
    }
  };
  
  // Rendu d'un graphique à barres
  const renderBarChart = () => {
    // S'assurer que les données sont au bon format
    if (!Array.isArray(data)) return <p>Format de données incorrect pour un graphique à barres</p>;
    
    // Déterminer les colonnes pour X et Y
    const allKeys = Object.keys(data[0] || {});
    const xAxisKey = allKeys[0]; // Premier champ pour l'axe X
    const dataKeys = allKeys.slice(1); // Autres champs pour les barres
    
    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey={xAxisKey} 
            angle={-45} 
            textAnchor="end" 
            height={80} 
            tick={{ fontSize: 12 }}
          />
          <YAxis />
          <Tooltip formatter={(value) => formatNumber(Number(value))} />
          <Legend />
          {dataKeys.map((key, index) => (
            <Bar 
              key={key} 
              dataKey={key} 
              fill={COLORS[index % COLORS.length]} 
              name={key} 
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  };
  
  // Rendu d'un graphique linéaire
  const renderLineChart = () => {
    // S'assurer que les données sont au bon format
    if (!Array.isArray(data)) return <p>Format de données incorrect pour un graphique linéaire</p>;
    
    // Déterminer les colonnes pour X et Y
    const allKeys = Object.keys(data[0] || {});
    const xAxisKey = allKeys[0]; // Premier champ pour l'axe X
    const dataKeys = allKeys.slice(1); // Autres champs pour les lignes
    
    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey={xAxisKey} 
            angle={-45} 
            textAnchor="end" 
            height={80} 
            tick={{ fontSize: 12 }}
          />
          <YAxis />
          <Tooltip formatter={(value) => formatNumber(Number(value))} />
          <Legend />
          {dataKeys.map((key, index) => (
            <Line 
              key={key} 
              type="monotone" 
              dataKey={key} 
              stroke={COLORS[index % COLORS.length]} 
              activeDot={{ r: 8 }} 
              name={key} 
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  };
  
  // Rendu d'un graphique en camembert
  const renderPieChart = () => {
    // S'assurer que les données sont au bon format
    if (!Array.isArray(data) || !data[0]?.name || !data[0]?.value) {
      return <p>Format de données incorrect pour un graphique en camembert</p>;
    }
    
    return (
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={true}
            outerRadius={150}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatNumber(Number(value))} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };
  
  // Rendu d'un tableau de données
  const renderTable = () => {
    // S'assurer que les données sont au bon format
    if (!Array.isArray(data)) return <p>Format de données incorrect pour un tableau</p>;
    
    // Extraire les colonnes
    const columns = Object.keys(data[0] || {});
    
    return (
      <div className="overflow-x-auto mt-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th 
                  key={column} 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td key={`${rowIndex}-${column}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {typeof row[column] === 'number' 
                      ? formatNumber(row[column]) 
                      : (row[column] || 'N/A')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  // Rendu d'une métrique simple
  const renderMetric = () => {
    const value = data.value || 0;
    const label = data.label || 'Valeur';
    
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-3xl font-bold text-blue-600">
          {typeof value === 'number' ? formatNumber(value) : value}
        </div>
        <div className="text-lg text-gray-500 mt-2">
          {label}
        </div>
      </div>
    );
  };
  
  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-medium text-gray-700 mb-4 text-center">
          {title}
        </h3>
      )}
      {renderVisualization()}
    </div>
  );
};