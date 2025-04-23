"use client";

import { useState, useEffect } from 'react';

interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook pour récupérer des données depuis une API
 * 
 * @param url URL de l'API à appeler
 * @returns État de la requête (données, chargement, erreur)
 */
export function useApiData<T>(url: string | null): ApiState<T> {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    if (!url) return;

    const fetchData = async () => {
      setState(prev => ({ ...prev, isLoading: true }));
      
      try {
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Erreur lors de la requête: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.status === 'error') {
          throw new Error(result.message || 'Erreur inconnue');
        }
        
        setState({
          data: result.data,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        setState({
          data: null,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue',
        });
      }
    };

    fetchData();
  }, [url]);

  return state;
}