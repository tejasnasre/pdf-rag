export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
}

export interface ChatSession {
  id: string;
  messages: Message[];
  pdfName: string;
  messageCount: number;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  fileId?: string;
  fileName?: string;
}

export interface ChatResponse {
  message: string;
  id: string;
}