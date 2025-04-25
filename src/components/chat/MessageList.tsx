// src/components/chat/MessageList.tsx
import { FC } from 'react';
import { Message, MessageProps } from './Message';

interface MessageListProps {
  messages: MessageProps[];
  isLoading?: boolean;
}

export const MessageList: FC<MessageListProps> = ({ messages, isLoading = false }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
          <p className="mb-2">Bienvenue dans votre assistant analytique</p>
          <p className="text-sm">Posez des questions sur vos données de pharmacie</p>
          <p className="text-xs mt-4 max-w-md">
            Exemples: &quot;Quels sont mes produits les plus rentables?&quot;, &quot;Comment évoluent mes ventes ce mois-ci?&quot;, &quot;Quels produits risquent une rupture de stock?&quot;
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message, index) => (
            <Message
              key={index}
              content={message.content}
              isUser={message.isUser}
              timestamp={message.timestamp}
              messageId={message.messageId}
              analysis={message.analysis}
              onReportSQLError={message.onReportSQLError}
            />
          ))}
          
          {isLoading && (
            <div className="flex items-center space-x-2 text-gray-500 animate-pulse">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span className="text-sm">En train de répondre...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};