import { useState, useRef, useEffect } from 'react';
import { FaComments, FaTimes, FaPaperPlane } from 'react-icons/fa';
import './ChatWidget.css';

const botResponses = [
  { keywords: ['жеткізу', 'доставка', 'delivery'], response: 'Жеткізу 1-3 жұмыс күні ішінде жүзеге асырылады. 100,000 ₸ жоғары тапсырыстарға тегін жеткізу.' },
  { keywords: ['қайтару', 'возврат', 'return'], response: 'Тауарды алған күннен бастап 14 күн ішінде қайтара аласыз. Бізге email жазыңыз.' },
  { keywords: ['төлем', 'оплата', 'payment'], response: 'Біз PayPal, банк карталары арқылы төлемді қабылдаймыз.' },
  { keywords: ['тапсырыс', 'заказ', 'order'], response: 'Тапсырыс статусын профиліңізден "Менің тапсырыстарым" бөлімінен тексере аласыз.' },
  { keywords: ['баға', 'цена', 'price'], response: 'Барлық бағалар ₸ теңгемен көрсетілген және ҚДС қосылған.' },
  { keywords: ['сәлем', 'привет', 'hello', 'hi'], response: 'Сәлем! JustShop қолдау қызметіне қош келдіңіз! Қалай көмектесе аламын?' },
  { keywords: ['рахмет', 'спасибо', 'thank'], response: 'Рахмет! Басқа сұрақтарыңыз болса хабарласыңыз 😊' },
  { keywords: ['гарантия', 'кепілдік', 'warranty'], response: 'Барлық өнімдерге 1 жыл кепілдік берілді. Ақаулы өнімді ауыстырып береміз.' },
  { keywords: ['жұмыс', 'график', 'кезек', 'hours', 'schedule'], response: 'Біздің қолдау қызметі Дүйсенбі-Жұма 9:00-18:00 жұмыс істейді.' },
  { keywords: ['сақтау', 'қойма', 'stock'], response: 'Өнімдердің барлық ассортименті қоймада қолжетімді.' },
  { keywords: ['скидка', 'жеңілдік', 'discount', 'sale'], response: 'Акциялар мен жеңілдіктер туралы ақпаратты басты беттен қараңыз.' },
  { keywords: ['email', 'почта', 'mail'], response: 'Біздің email: support@justshop.kz' },
  { keywords: ['телефон', 'phone', 'номер'], response: 'Бізге +7 (700) 123-45-67 нөмірі бойынша хабарласа аласыз.' },
];

const getBotResponse = (userMessage) => {
  const lowerMessage = userMessage.toLowerCase();
  
  for (const item of botResponses) {
    if (item.keywords.some(keyword => lowerMessage.includes(keyword))) {
      return item.response;
    }
  }
  
  return 'Кешіріңіз, сұрағыңызды түсінбедім. Бізге support@justshop.kz поштасына жазыңыз.';
};

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Сәлем! JustShop қолдау қызметіне қош келдіңіз! Қалай көмектесе аламын?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSend = () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput) return;

    // Add user message
    const newMessages = [...messages, { type: 'user', text: trimmedInput }];
    setMessages(newMessages);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot thinking and responding
    setTimeout(() => {
      const botResponse = getBotResponse(trimmedInput);
      setMessages([...newMessages, { type: 'bot', text: botResponse }]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-widget-container">
      {/* Floating Button */}
      <button 
        className={`chat-floating-btn ${isOpen ? 'hidden' : ''}`}
        onClick={toggleChat}
        aria-label="Қолдау чатын ашу"
      >
        <FaComments size={24} />
      </button>

      {/* Chat Window */}
      <div className={`chat-window ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-title">
            <div className="bot-avatar-small">J</div>
            <span>JustShop Қолдау</span>
          </div>
          <button 
            className="chat-close-btn"
            onClick={toggleChat}
            aria-label="Чатты жабу"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`chat-message ${msg.type === 'user' ? 'user-message' : 'bot-message'}`}
            >
              {msg.type === 'bot' && (
                <div className="bot-avatar">J</div>
              )}
              <div className="message-bubble">
                {msg.text}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="chat-message bot-message">
              <div className="bot-avatar">J</div>
              <div className="message-bubble typing-bubble">
                <span className="typing-indicator">Жазып жатыр</span>
                <span className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="chat-input-area">
          <input
            ref={inputRef}
            type="text"
            className="chat-input"
            placeholder="Хабарлама жазыңыз..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button 
            className="chat-send-btn"
            onClick={handleSend}
            disabled={!inputValue.trim()}
            aria-label="Жіберу"
          >
            <FaPaperPlane size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;
