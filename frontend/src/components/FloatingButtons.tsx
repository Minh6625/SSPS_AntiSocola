'use client';

import { useState, useRef, useEffect } from 'react';
import { chatbotService } from '@/services/chatbotService';

interface Message {
  id: number;
  type: 'bot' | 'user';
  content: string;
  options?: string[];
  isLoading?: boolean;
}

interface FloatingButtonsProps {
  zaloLink?: string;
  messengerLink?: string;
  phoneNumber?: string;
}

export default function FloatingButtons({ 
  zaloLink = 'https://zalo.me/0937833154',
  messengerLink = 'https://www.messenger.com/e2ee/t/8489567564474582',
  phoneNumber = '0937833154'
}: FloatingButtonsProps) {
  const [showChatbot, setShowChatbot] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [showButtons, setShowButtons] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Drag state
  const [position, setPosition] = useState({ x: 24, y: 24 }); // bottom-right offset
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const quickOptions = ['Kiểm tra số dư', 'Trạng thái máy in', 'Cách in tài liệu', 'Mua thêm trang', 'Liên hệ hỗ trợ'];

  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showChatbot && messages.length === 0) {
      setMessages([{
        id: 1,
        type: 'bot',
        content: '👋 Xin chào! Tôi là AI Assistant của SPSS SIU.\n\nTôi có thể giúp bạn:\n• Kiểm tra số dư trang in\n• Xem trạng thái máy in\n• Hướng dẫn sử dụng\n\nBạn cần hỗ trợ gì?',
        options: quickOptions
      }]);
    }
  }, [showChatbot, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (showChatbot) return; // Không cho kéo khi đang mở chatbot
    setIsDragging(true);
    setDragStart({
      x: e.clientX + position.x,
      y: e.clientY + position.y
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (showChatbot) return;
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({
      x: touch.clientX + position.x,
      y: touch.clientY + position.y
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newX = dragStart.x - e.clientX;
      const newY = dragStart.y - e.clientY;
      
      // Giới hạn trong viewport
      const maxX = window.innerWidth - 80;
      const maxY = window.innerHeight - 80;
      
      setPosition({
        x: Math.max(10, Math.min(maxX, newX)),
        y: Math.max(10, Math.min(maxY, newY))
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      const newX = dragStart.x - touch.clientX;
      const newY = dragStart.y - touch.clientY;
      
      const maxX = window.innerWidth - 80;
      const maxY = window.innerHeight - 80;
      
      setPosition({
        x: Math.max(10, Math.min(maxX, newX)),
        y: Math.max(10, Math.min(maxY, newY))
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    setMessages(prev => [...prev, { id: Date.now(), type: 'user', content: text }]);
    setInputValue('');
    setIsTyping(true);

    const loadingId = Date.now() + 1;
    setMessages(prev => [...prev, { id: loadingId, type: 'bot', content: '', isLoading: true }]);

    const response = await chatbotService.chat(text);

    setMessages(prev => prev.map(m => 
      m.id === loadingId ? { ...m, content: response, isLoading: false, options: quickOptions } : m
    ));
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSendMessage(inputValue);
  };

  const handleButtonClick = () => {
    if (!isDragging) {
      setShowButtons(!showButtons);
      setShowTooltip(false);
    }
  };

  return (
    <>
      {/* Floating Buttons */}
      <div 
        ref={containerRef}
        className="fixed z-50 flex flex-col items-end gap-3"
        style={{ 
          right: `${position.x}px`, 
          bottom: `${position.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      >
        
        {/* Tooltip bubble */}
        {showTooltip && !showChatbot && !showButtons && (
          <div className="relative bg-white rounded-2xl shadow-xl p-4 mb-2 max-w-[200px] animate-fade-in">
            <p className="text-gray-800 text-sm font-medium">Bạn cần SIU hỗ trợ thông tin gì?</p>
            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white transform rotate-45 shadow-lg"></div>
          </div>
        )}

        {/* Expandable buttons */}
        <div className={`flex flex-col items-end gap-3 transition-all duration-300 overflow-hidden ${showButtons ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          {/* Logo SIU - AI Chat */}
          <button onClick={() => { setShowChatbot(true); setShowTooltip(false); setShowButtons(false); }} className="relative group">
            <div className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center overflow-hidden border-2 border-gray-100 hover:border-blue-400 transition-all hover:scale-105">
              <img src="/logosiu.png" alt="SIU" className="w-12 h-12 object-cover rounded-full" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></span>
          </button>

          {/* Phone */}
          <a href={`tel:${phoneNumber}`} className="w-14 h-14 bg-green-500 rounded-2xl shadow-lg flex items-center justify-center hover:bg-green-600 hover:scale-105 transition-all">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </a>

          {/* Zalo */}
          <a href={zaloLink} target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center hover:scale-105 transition-all border border-gray-100">
            <span className="text-[#0068FF] font-bold text-lg">Zalo</span>
          </a>

          {/* Messenger */}
          <a href={messengerLink} target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-gradient-to-br from-[#00B2FF] to-[#006AFF] rounded-2xl shadow-lg flex items-center justify-center hover:scale-105 transition-all">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.44 3.14 7.17.16.13.26.35.27.57l.05 1.78c.02.63.63 1.04 1.21.82l1.98-.78c.17-.07.36-.09.54-.05.91.25 1.87.38 2.81.38 5.64 0 10-4.13 10-9.7C22 6.13 17.64 2 12 2zm5.89 7.58l-2.89 4.58c-.46.73-1.44.92-2.13.42l-2.3-1.72a.6.6 0 00-.72 0l-3.1 2.35c-.41.31-.95-.17-.68-.61l2.89-4.58c.46-.73 1.44-.92 2.13-.42l2.3 1.72a.6.6 0 00.72 0l3.1-2.35c.41-.31.95.17.68.61z"/>
            </svg>
          </a>
        </div>

        {/* Toggle Button - Nút chính có thể kéo */}
        <button 
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onClick={handleButtonClick}
          className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105 select-none ${
            showButtons 
              ? 'bg-gray-500 hover:bg-gray-600' 
              : 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
          } ${isDragging ? 'scale-110 shadow-2xl' : ''}`}
        >
          <svg 
            className={`w-7 h-7 text-white transition-transform duration-300 ${showButtons ? 'rotate-45' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            {showButtons ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            )}
          </svg>
        </button>
      </div>

      {/* Chatbot Modal */}
      {showChatbot && (
        <div 
          className="fixed z-50 w-[380px] max-w-[calc(100vw-3rem)] bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200"
          style={{ right: `${position.x}px`, bottom: `${position.y}px` }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/30 bg-white">
                  <img src="/logosiu.png" alt="SIU Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">SIU Assistant</h3>
                  <div className="flex items-center gap-2 text-sm text-blue-100">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Đang hoạt động
                  </div>
                </div>
              </div>
              <button onClick={() => setShowChatbot(false)} className="w-10 h-10 rounded-xl hover:bg-white/20 flex items-center justify-center transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
                {message.type === 'bot' && (
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-gray-200 bg-white">
                    <img src="/logosiu.png" alt="SIU" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="max-w-[80%]">
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-sm' 
                      : 'bg-white text-gray-700 shadow-sm border border-gray-100 rounded-bl-sm'
                  }`}>
                    {message.isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                          <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                          <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                        </div>
                        <span className="text-gray-400 text-xs">Đang xử lý...</span>
                      </div>
                    ) : (
                      <p className="whitespace-pre-line">{message.content}</p>
                    )}
                  </div>
                  {message.options && !message.isLoading && message.type === 'bot' && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.options.map((option, idx) => (
                        <button key={idx} onClick={() => handleSendMessage(option)} disabled={isTyping}
                          className="text-xs px-3 py-1.5 bg-white border border-blue-200 text-blue-700 rounded-full hover:bg-blue-50 hover:border-blue-400 transition-all shadow-sm disabled:opacity-50">
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-100 bg-white">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Hỏi về số dư, máy in..."
                disabled={isTyping}
                className="flex-1 px-4 py-3 bg-gray-100 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              <button onClick={() => handleSendMessage(inputValue)} disabled={isTyping || !inputValue.trim()}
                className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center hover:shadow-lg transition-all disabled:opacity-50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
      `}</style>
    </>
  );
}
