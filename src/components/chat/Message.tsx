// src/components/chat/Message.tsx
import { FC } from 'react';
import ReactMarkdown from 'react-markdown';
import { DataVisualizer } from '../analytics/visualization/DataVisualizer';

export interface MessageProps {
  content: string;
  isUser: boolean;
  timestamp?: number;
  analysis?: {
    sql?: string;
    explanation?: string;
    result?: any;
    visualizationType?: string;
    visualizationData?: any;
  };
}

export const Message: FC<MessageProps> = ({ content, isUser, timestamp, analysis }) => {
  const formattedTime = timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  // Détermine si le message contient une analyse
  const hasAnalysis = !!analysis && (!!analysis.visualizationType || !!analysis.sql);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] ${hasAnalysis ? 'w-full' : ''} rounded-lg px-4 py-2 ${isUser ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{content}</p>
        ) : (
          <div className="text-sm markdown-content prose prose-sm max-w-none">
            <ReactMarkdown>
              {content}
            </ReactMarkdown>
            
            {/* Section d'analyse si disponible */}
            {hasAnalysis && (
              <div className="mt-4 pt-4 border-t border-gray-300">
                {/* Visualisation des données */}
                {analysis.visualizationData && analysis.visualizationType && (
                  <div className="mb-4 p-2 bg-white rounded-lg">
                    <DataVisualizer 
                      type={analysis.visualizationType}
                      data={analysis.visualizationData}
                      title="Visualisation des données"
                    />
                  </div>
                )}
                
                {/* SQL utilisé (optionnel, dépliable) */}
                {analysis.sql && (
                  <details className="mt-2 text-xs">
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                      Voir la requête SQL
                    </summary>
                    <div className="mt-1 p-2 bg-gray-100 rounded overflow-x-auto">
                      <pre>{analysis.sql}</pre>
                    </div>
                  </details>
                )}
              </div>
            )}
          </div>
        )}
        
        {timestamp && (
          <div className={`text-xs mt-1 ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
            {formattedTime}
          </div>
        )}
      </div>
    </div>
  );
};