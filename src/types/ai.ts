// Types liés aux interactions avec l'IA

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
  }
  
  export interface Conversation {
    id: string;
    messages: Message[];
    title?: string;
    createdAt: number;
    updatedAt: number;
  }
  
  export interface AIAnalysisRequest {
    query: string;
    conversationId: string;
    dateRange?: {
      start: string;
      end: string;
    };
  }
  
  export interface DataRecord {
    [key: string]: string | number | boolean | null;
  }
  
  export interface AIResponse {
    text: string;
    sql?: string;
    data?: DataRecord[];
    visualizationType?: 'bar' | 'line' | 'pie' | 'table' | 'metric';
    visualizationData?: DataRecord[];
  }