// Types communs réutilisés dans l'application

export type Status = 'idle' | 'loading' | 'success' | 'error';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: Status;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

// Nouveaux types pour le chat
export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: number;
}

export interface ChatConversation {
  id: string;
  messages: ChatMessage[];
  title?: string;
  createdAt: number;
  updatedAt: number;
}