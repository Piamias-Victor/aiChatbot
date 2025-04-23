"use client";

import { FC, ReactNode } from 'react';

interface VisualizationPanelProps {
  children?: ReactNode;
  isVisible: boolean;
}

export const VisualizationPanel: FC<VisualizationPanelProps> = ({ children, isVisible }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="w-full md:w-2/3 h-1/2 md:h-full border-t md:border-t-0 md:border-l border-gray-200 overflow-auto p-4 bg-white">
      <div className="h-full flex flex-col">
        {children || (
          <div className="flex items-center justify-center h-full text-gray-400 text-center">
            <div>
              <p className="mb-2">Aucune visualisation disponible</p>
              <p className="text-sm">Posez une question analytique pour voir des données ici</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};