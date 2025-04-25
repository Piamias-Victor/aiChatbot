// src/components/chat/ChatContainer.tsx
"use client";

import { FC, useEffect, useRef } from 'react';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { useChat } from '@/hooks/useChat';

export const ChatContainer: FC = () => {
  const { messages, isLoading, sendMessage, clearMessages, error, reportSQLError } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fonction pour faire défiler vers le bas après chaque nouveau message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Faire défiler vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Afficher les erreurs dans la console
  useEffect(() => {
    if (error) {
      console.error('Erreur de chat:', error);
    }
  }, [error]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
        <div className="text-sm text-gray-500">
          {messages.length > 0 ? `${messages.length} messages` : 'Nouvelle conversation'}
        </div>
        <div className="flex items-center">
          {error && (
            <span className="text-xs text-red-500 mr-4">
              {error}
            </span>
          )}
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Effacer la conversation
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <MessageList 
          messages={messages.map(msg => ({
            ...msg,
            messageId: msg.id,
            onReportSQLError: reportSQLError
          }))} 
          isLoading={isLoading} 
        />
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSendMessage={sendMessage} disabled={isLoading} />
    </div>
  );
};