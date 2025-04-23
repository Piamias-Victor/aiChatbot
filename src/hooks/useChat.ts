// src/hooks/useChat.ts
"use client";

import { useState, useCallback, useEffect } from 'react';
import { generateId } from '@/lib/utils';
import { ChatMessage } from '@/types';
import { AIMessage } from '@/types/ai-client';

// Interface pour le type de message avec analyse
interface EnhancedChatMessage extends ChatMessage {
  analysis?: {
    sql?: string;
    explanation?: string;
    result?: any;
    visualizationType?: string;
    visualizationData?: any;
  };
}

interface UseChatReturn {
  messages: EnhancedChatMessage[];
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  error: string | null;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<EnhancedChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string | null>(null);

  // Restaurer les messages depuis le localStorage au chargement
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    const savedConversationId = localStorage.getItem('conversationId');
    const savedPharmacyId = localStorage.getItem('selectedPharmacyId');
    
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

    if (savedPharmacyId) {
      setSelectedPharmacyId(savedPharmacyId);
    } else {
      // Utiliser l'ID de pharmacie réel
      const defaultPharmacyId = "0764559c-6c21-4d25-a6aa-6f4c411181b1";
      setSelectedPharmacyId(defaultPharmacyId);
      localStorage.setItem('selectedPharmacyId', defaultPharmacyId);
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

  // Détermine si une question est liée à l'analyse de données
  const isAnalyticalQuestion = (question: string): boolean => {
    const analyticalKeywords = [
      'vente', 'stock', 'marge', 'produit', 'ca ', 'chiffre', 'affaire',
      'analyse', 'tendance', 'statistique', 'comparer', 'evolution',
      'meilleur', 'pire', 'rentable', 'pharmacie', 'catégorie', 'laboratoire'
    ];
    
    const lowerQuestion = question.toLowerCase();
    return analyticalKeywords.some(keyword => lowerQuestion.includes(keyword));
  };

  const sendMessage = useCallback(async (content: string) => {
    // Validation de base
    if (!content.trim()) return;
    
    try {
      setError(null);
      setIsLoading(true);
      
      // Ajouter le message de l'utilisateur
      const userMessage: EnhancedChatMessage = {
        id: generateId(),
        content,
        isUser: true,
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Préparer l'historique des messages pour l'API
      const messageHistory = convertMessagesToAIFormat([...messages, userMessage]);
      
      // Déterminer si la question est analytique ou conversationnelle
      const isAnalytical = isAnalyticalQuestion(content);
      
      if (isAnalytical && selectedPharmacyId) {
        // Utiliser l'API d'analyse pour les questions analytiques
        const response = await fetch('/api/ai/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: content,
            pharmacyId: selectedPharmacyId,
            dateRange: {
              startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 jours en arrière
              endDate: new Date().toISOString().split('T')[0] // Aujourd'hui
            },
            conversationHistory: messageHistory.slice(-5) // Limiter l'historique aux 5 derniers messages
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Erreur API Analyse: ${errorData.error?.message || 'Erreur inconnue'}`);
        }
        
        const data = await response.json();
        
        // Créer un message assistante avec les données d'analyse
        const assistantMessage: EnhancedChatMessage = {
          id: generateId(),
          content: data.data.analysis || "Voici les résultats de votre requête.",
          isUser: false,
          timestamp: Date.now(),
          analysis: {
            sql: data.data.sql,
            explanation: data.data.explanation,
            result: data.data.result,
            visualizationType: data.data.visualizationType,
            visualizationData: data.data.visualizationData
          }
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Utiliser l'API de chat standard pour les questions conversationnelles
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
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Erreur API Chat: ${errorData.error?.message || 'Erreur inconnue'}`);
        }
        
        const data = await response.json();
        
        // Mettre à jour l'ID de conversation si nécessaire
        if (data.conversationId && data.conversationId !== conversationId) {
          setConversationId(data.conversationId);
          localStorage.setItem('conversationId', data.conversationId);
        }
        
        // Ajouter la réponse de l'assistant
        const assistantMessage: EnhancedChatMessage = {
          id: generateId(),
          content: data.answer,
          isUser: false,
          timestamp: data.timestamp || Date.now(),
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      }
      
    } catch (err) {
      console.error('Erreur lors de l\'envoi du message:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      
      // Ajouter un message d'erreur dans le chat
      const errorMessage: EnhancedChatMessage = {
        id: generateId(),
        content: "Désolé, je n'ai pas pu traiter votre demande. Veuillez réessayer ultérieurement.",
        isUser: false,
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, conversationId, selectedPharmacyId]);

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