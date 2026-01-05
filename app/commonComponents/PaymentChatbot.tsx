"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, MessageCircle, X, Minimize2, Maximize2 } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export default function PaymentChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! 👋 I'm your payment assistant. Ask me anything about payments, loan restructuring, or how your payments work!",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: input,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get response from AI");
      }

      const data = await response.json();
      const botResponse =
        data.reply ||
        "I'm having trouble understanding. Could you rephrase that?";

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat error:", error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble responding. Please try again!",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 right-4 z-50 bg-red-600 hover:bg-red-700 text-white rounded-full p-3 shadow-lg transition-all"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <h3 className="font-semibold">Payment Assistant</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 hover:bg-red-500 rounded transition-colors"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 hover:bg-red-500 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                msg.sender === "user"
                  ? "bg-red-600 text-white rounded-br-none"
                  : "bg-white text-gray-900 border border-gray-200 rounded-bl-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-900 border border-gray-200 px-4 py-2 rounded-lg rounded-bl-none">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about payments..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg p-2 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
