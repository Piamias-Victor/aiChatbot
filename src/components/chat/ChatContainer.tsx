"use client";

import { FC, useState } from 'react';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { MessageProps } from './Message';

export const ChatContainer: FC = () => {
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = (content: string) => {
    const newUserMessage: MessageProps = {
      content,
      isUser: true,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    // Simuler une réponse après 1 seconde
    setTimeout(() => {
      const botResponse: MessageProps = {
        content: "Je suis un assistant en cours de développement. Je ne peux pas encore répondre à vos questions.",
        isUser: false,
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full">
      <MessageList messages={messages} />
      <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
    </div>
  );
};