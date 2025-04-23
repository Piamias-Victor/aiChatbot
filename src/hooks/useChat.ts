"use client";

import { useState, useCallback, useEffect } from 'react';
import { MessageProps } from '@/components/chat/Message';
import { chatResponses } from '@/data/chatResponses';

interface UseChatReturn {
  messages: MessageProps[];
  isLoading: boolean;
  sendMessage: (content: string) => void;
  clearMessages: () => void;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Restaurer les messages depuis le localStorage au chargement
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error('Erreur lors de la restauration des messages:', e);
      }
    }
  }, []);

  // Sauvegarder les messages dans le localStorage à chaque modification
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages]);

  const findMatchingResponse = (content: string): string => {
    // Convertir le contenu en minuscules pour une comparaison insensible à la casse
    const contentLower = content.toLowerCase();
    
    // Chercher une réponse correspondante
    for (const response of chatResponses) {
      if (response.keywords.some(keyword => contentLower.includes(keyword))) {
        return response.response;
      }
    }
    
    // Réponse par défaut si aucune correspondance n'est trouvée
    return "Je suis un assistant en cours de développement. Je pourrai bientôt analyser vos données de pharmacie pour vous fournir des insights précieux.";
  };

  const sendMessage = useCallback((content: string) => {
    // Ajouter le message de l'utilisateur
    const userMessage: MessageProps = {
      content,
      isUser: true,
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    // Simuler un délai de traitement variable pour paraître plus naturel
    const responseTime = 800 + Math.random() * 1200;
    
    setTimeout(() => {
      // Trouver une réponse appropriée
      const responseText = findMatchingResponse(content);
      
      const botMessage: MessageProps = {
        content: responseText,
        isUser: false,
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, responseTime);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    localStorage.removeItem('chatMessages');
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages
  };
}