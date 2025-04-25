// src/components/chat/Message.tsx
import { FC, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { DataVisualizer } from '../analytics/visualization/DataVisualizer';

export interface MessageProps {
  content: string;
  isUser: boolean;
  timestamp?: number;
  messageId?: string;
  analysis?: {
    sql?: string;
    explanation?: string;
    result?: any;
    visualizationType?: string;
    visualizationData?: any;
  };
  onReportSQLError?: (messageId: string, sql: string) => Promise<void>;
}

export const Message: FC<MessageProps> = ({ 
  content, 
  isUser, 
  timestamp, 
  messageId,
  analysis,
  onReportSQLError 
}) => {
  const [sqlDetailsOpen, setSqlDetailsOpen] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  
  const formattedTime = timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  // Détermine si le message contient une analyse
  const hasAnalysis = !!analysis && (!!analysis.visualizationType || !!analysis.sql);

  // Fonction pour signaler une erreur SQL
  const handleReportSQLError = async () => {
    if (!messageId || !analysis?.sql || !onReportSQLError) return;
    
    setIsReporting(true);
    
    try {
      await onReportSQLError(messageId, analysis.sql);
      setReportSent(true);
    } catch (error) {
      console.error('Erreur lors du signalement:', error);
    } finally {
      setIsReporting(false);
    }
  };

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
                  <details 
                    className="mt-2 text-xs"
                    open={sqlDetailsOpen}
                    onToggle={() => setSqlDetailsOpen(!sqlDetailsOpen)}
                  >
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800 flex items-center justify-between">
                      <span>Voir la requête SQL</span>
                      {onReportSQLError && !reportSent && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleReportSQLError();
                          }}
                          disabled={isReporting}
                          className="text-xs text-red-500 hover:text-red-700 ml-2"
                        >
                          {isReporting ? 'Signalement...' : 'Signaler une erreur SQL'}
                        </button>
                      )}
                      {reportSent && (
                        <span className="text-xs text-green-600 ml-2">
                          Signalement envoyé
                        </span>
                      )}
                    </summary>
                    <div className="mt-1 p-2 bg-gray-100 rounded overflow-x-auto">
                      <pre>{analysis.sql}</pre>
                    </div>
                    {analysis.explanation && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                        <strong>Explication:</strong> {analysis.explanation}
                      </div>
                    )}
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