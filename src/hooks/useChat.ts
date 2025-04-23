"use client";

import { useState, useCallback, useEffect } from 'react';
import { generateId } from '@/lib/utils';
import { ChatMessage } from '@/types';
import { AIMessage } from '@/types/ai-client';

interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  error: string | null;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

  // Restaurer les messages depuis le localStorage au chargement
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    const savedConversationId = localStorage.getItem('conversationId');
    
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error('Erreur lors de la restauration des messages:', e);
      }
    }
    
    if (savedConversationId) {
      setConversationId(savedConversationId);
    } else {
      // Générer un nouvel ID de conversation si aucun n'est trouvé
      const newId = generateId();
      setConversationId(newId);
      localStorage.setItem('conversationId', newId);
    }
  }, []);

  // Sauvegarder les messages dans le localStorage à chaque modification
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages]);

  // Convertir les messages du format ChatMessage vers AIMessage pour l'API
  const convertMessagesToAIFormat = (chatMessages: ChatMessage[]): AIMessage[] => {
    return chatMessages.map(msg => ({
      role: msg.isUser ? 'user' : 'assistant',
      content: msg.content
    }));
  };

  const sendMessage = useCallback(async (content: string) => {
    // Validation de base
    if (!content.trim()) return;
    
    try {
      setError(null);
      setIsLoading(true);
      
      // Ajouter le message de l'utilisateur
      const userMessage: ChatMessage = {
        id: generateId(),
        content,
        isUser: true,
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Préparer l'historique des messages pour l'API
      const messageHistory = convertMessagesToAIFormat([...messages, userMessage]);
      
      // Appeler l'API de chat
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          conversationId,
          messageHistory
        }),
      });
      
      // Gérer les erreurs de l'API
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erreur API: ${errorData.error?.message || 'Erreur inconnue'}`);
      }
      
      // Traiter la réponse
      const data = await response.json();
      
      // Mettre à jour l'ID de conversation si nécessaire
      if (data.conversationId && data.conversationId !== conversationId) {
        setConversationId(data.conversationId);
        localStorage.setItem('conversationId', data.conversationId);
      }
      
      // Ajouter la réponse de l'assistant
      const assistantMessage: ChatMessage = {
        id: generateId(),
        content: data.answer,
        isUser: false,
        timestamp: data.timestamp || Date.now(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (err) {
      console.error('Erreur lors de l\'envoi du message:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      
      // Ajouter un message d'erreur dans le chat
      const errorMessage: ChatMessage = {
        id: generateId(),
        content: "Désolé, je n'ai pas pu traiter votre demande. Veuillez réessayer ultérieurement.",
        isUser: false,
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, conversationId]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    localStorage.removeItem('chatMessages');
    
    // Générer un nouvel ID de conversation
    const newId = generateId();
    setConversationId(newId);
    localStorage.setItem('conversationId', newId);
    
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    error
  };
}