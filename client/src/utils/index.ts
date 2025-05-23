import { ChatSession, Message } from '../types';

// Generate unique ID for messages and chat sessions
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

// Get current chat session from localStorage
export const getCurrentSession = (): ChatSession | null => {
  const sessionData = localStorage.getItem('pdfChatSession');
  if (!sessionData) return null;
  
  try {
    return JSON.parse(sessionData);
  } catch (error) {
    console.error('Error parsing chat session:', error);
    return null;
  }
};

// Save chat session to localStorage
export const saveSession = (session: ChatSession): void => {
  localStorage.setItem('pdfChatSession', JSON.stringify(session));
};

// Create a new chat session
export const createNewSession = (pdfName: string): ChatSession => {
  const session: ChatSession = {
    id: generateId(),
    messages: [],
    pdfName,
    messageCount: 0
  };
  saveSession(session);
  return session;
};

// Add message to chat session
export const addMessage = (content: string, role: 'user' | 'assistant'): Message => {
  const session = getCurrentSession();
  if (!session) throw new Error('No active chat session');
  
  const message: Message = {
    id: generateId(),
    content,
    role,
    timestamp: Date.now()
  };
  
  session.messages.push(message);
  if (role === 'user') {
    session.messageCount += 1;
  }
  saveSession(session);
  
  return message;
};

// Check if user has reached message limit
export const hasReachedMessageLimit = (): boolean => {
  const session = getCurrentSession();
  return session ? session.messageCount >= 5 : false;
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' bytes';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

// Validate PDF file
export const validatePdfFile = (file: File): { valid: boolean; message: string } => {
  // Check file type
  if (file.type !== 'application/pdf') {
    return { valid: false, message: 'Only PDF files are allowed' };
  }
  
  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return { 
      valid: false, 
      message: `File size exceeds 5MB limit (${formatFileSize(file.size)})` 
    };
  }
  
  return { valid: true, message: 'File is valid' };
};

// Clear current session
export const clearCurrentSession = (): void => {
  localStorage.removeItem('pdfChatSession');
};