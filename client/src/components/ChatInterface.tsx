import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  User,
  Bot,
  AlertCircle,
  RefreshCw,
  FileText,
} from "lucide-react";
import { Message, ChatSession } from "../types";
import {
  getCurrentSession,
  addMessage,
  hasReachedMessageLimit,
  generateId,
} from "../utils";
import { sendChatMessage } from "../api";

interface ChatInterfaceProps {
  onResetChat: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onResetChat }) => {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<ChatSession | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load session from localStorage on component mount
  useEffect(() => {
    const currentSession = getCurrentSession();
    if (currentSession) {
      setSession(currentSession);
      setMessages(currentSession.messages);
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input after messages load
  useEffect(() => {
    if (messages.length > 0 && inputRef.current) {
      inputRef.current.focus();
    }
  }, [messages.length]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() || !session) return;
    if (hasReachedMessageLimit()) {
      setError("You have reached the chat limit (5 messages) for this PDF");
      return;
    }

    const userMessage = addMessage(inputValue.trim(), "user");
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setError(null);
    setIsLoading(true);

    try {
      const response = await sendChatMessage(inputValue.trim());

      const assistantMessage: Message = {
        id: response.id || generateId(),
        content: response.message,
        role: "assistant",
        timestamp: Date.now(),
      };

      // Add assistant message to state and localStorage
      const updatedSession = getCurrentSession();
      if (updatedSession) {
        updatedSession.messages.push(assistantMessage);
        localStorage.setItem("pdfChatSession", JSON.stringify(updatedSession));
        setSession(updatedSession);
        setMessages(updatedSession.messages);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setError(
        error instanceof Error ? error.message : "Failed to send message"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    onResetChat();
  };

  const remainingMessages = session ? 5 - session.messageCount : 5;

  return (
    <div className="h-full flex flex-col bg-gray-900 rounded-lg border border-gray-800 shadow-xl overflow-hidden">
      <div className="p-4 border-b border-gray-800 bg-gray-900 flex items-center justify-between">
        <div className="flex items-center">
          <FileText className="h-5 w-5 text-purple-500 mr-2" />
          <h3 className="font-medium text-white">Chat with PDF</h3>
        </div>
        <div className="text-sm text-gray-400 flex items-center">
          <span
            className={`inline-block w-2 h-2 rounded-full mr-2 ${
              remainingMessages > 2
                ? "bg-green-500"
                : remainingMessages > 0
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
          ></span>
          {session
            ? `${remainingMessages} message${
                remainingMessages !== 1 ? "s" : ""
              } remaining`
            : "5 messages available"}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8 text-gray-500">
            <Bot className="h-16 w-16 mx-auto mb-4 text-purple-500 opacity-70" />
            <p className="text-gray-400 text-lg">
              Start chatting to ask questions about your PDF
            </p>
            <p className="text-gray-600 text-sm mt-2">
              Premium features include unlimited documents and AI-powered
              insights
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              } animate-fadeIn`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 shadow-md ${
                  message.role === "user"
                    ? "bg-purple-700 text-white"
                    : "bg-gray-800 text-gray-200 border border-gray-700"
                }`}
              >
                <div className="flex items-start">
                  {message.role === "assistant" && (
                    <Bot className="h-5 w-5 mr-2 mt-1 text-purple-400" />
                  )}
                  {message.role === "user" && (
                    <User className="h-5 w-5 mr-2 mt-1 text-purple-300" />
                  )}
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 text-gray-200 rounded-2xl p-4 border border-gray-700 shadow-md">
              <div className="flex items-center space-x-3">
                <Bot className="h-5 w-5 text-purple-400" />
                <div className="flex space-x-2">
                  <div
                    className="h-3 w-3 bg-purple-500 rounded-full animate-pulse"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="h-3 w-3 bg-purple-500 rounded-full animate-pulse"
                    style={{ animationDelay: "200ms" }}
                  ></div>
                  <div
                    className="h-3 w-3 bg-purple-500 rounded-full animate-pulse"
                    style={{ animationDelay: "400ms" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-900/30 border border-red-800 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="text-sm text-red-400">{error}</p>
              {error.includes("chat limit") && (
                <button
                  onClick={handleReset}
                  className="mt-2 text-sm text-purple-400 hover:text-purple-300"
                >
                  Upload a new PDF to start a new chat
                </button>
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-800 bg-gray-900">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Ask a question about your PDF..."
            className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500"
            disabled={!session || hasReachedMessageLimit() || isLoading}
            ref={inputRef}
          />
          <button
            type="submit"
            className={`p-3 rounded-lg ${
              !session ||
              hasReachedMessageLimit() ||
              isLoading ||
              !inputValue.trim()
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-purple-600 text-white hover:bg-purple-700 transition-colors"
            }`}
            disabled={
              !session ||
              hasReachedMessageLimit() ||
              isLoading ||
              !inputValue.trim()
            }
          >
            <Send className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-3 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
            title="Upload a new PDF"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </form>

        {session && hasReachedMessageLimit() && (
          <div className="mt-3 text-center p-3 bg-gray-800/50 rounded-lg">
            <p className="text-sm text-gray-400">
              You've reached the chat limit for this PDF.
            </p>
            <button
              onClick={handleReset}
              className="mt-2 text-sm font-medium text-purple-400 hover:text-purple-300"
            >
              Upload a new PDF to start a new chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
