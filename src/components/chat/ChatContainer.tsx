"use client";

import { FC, useEffect } from 'react';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { useChat } from '@/hooks/useChat';

export const ChatContainer: FC = () => {
  const { messages, isLoading, sendMessage, clearMessages, error } = useChat();

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
              Erreur de connexion
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
      <MessageList messages={messages} isLoading={isLoading} />
      <ChatInput onSendMessage={sendMessage} disabled={isLoading} />
    </div>
  );
};