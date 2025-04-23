"use client";

import { FC, ReactNode, useState } from 'react';
import { VisualizationPanel } from './VisualizationPanel';

interface ChatLayoutProps {
  chatPanel: ReactNode;
  visualizationPanel?: ReactNode;
}

export const ChatLayout: FC<ChatLayoutProps> = ({ chatPanel, visualizationPanel }) => {
  const [showVisualization, setShowVisualization] = useState(true);

  const toggleVisualization = () => {
    setShowVisualization(prev => !prev);
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)]">
      {/* Chat Panel */}
      <div className={`h-1/2 md:h-full ${showVisualization ? 'md:w-1/3' : 'md:w-full'} flex flex-col`}>
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
          <h2 className="font-medium">Chat Analytique</h2>
          <button 
            onClick={toggleVisualization}
            className="text-blue-500 text-sm hover:text-blue-700"
          >
            {showVisualization ? 'Masquer visualisation' : 'Afficher visualisation'}
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          {chatPanel}
        </div>
      </div>

      {/* Visualization Panel */}
      <VisualizationPanel isVisible={showVisualization}>
        {visualizationPanel}
      </VisualizationPanel>
    </div>
  );
};