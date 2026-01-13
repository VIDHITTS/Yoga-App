import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sun, Sparkles, User, Bot } from 'lucide-react';
import WarningBanner from './components/ui/WarningBanner';
import { askQuestion } from './services/api';
import './App.css';

function App() {
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', text: 'Namaste. I am your yoga wellness guide. Ask me anything about yoga!' }
  ]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    // Add User Message
    const newUserMsg = { id: Date.now(), sender: 'user', text: inputMessage };
    setMessages(prev => [...prev, newUserMsg]);
    const query = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      // Call real backend API
      const response = await askQuestion(query);
      
      // Add AI response
      const newAiMsg = { id: Date.now() + 1, sender: 'ai', text: response.answer };
      setMessages(prev => [...prev, newAiMsg]);

      // Show safety warning if query was unsafe
      if (response.safety && response.safety.isUnsafe) {
        setWarningMessage(response.safety.message || 'Please consult a healthcare professional for personalized guidance.');
        setShowWarning(true);
      }
    } catch (error) {
      const errorMsg = { id: Date.now() + 1, sender: 'ai', text: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-yoga-cream text-yoga-dark font-sans relative overflow-hidden selection:bg-yoga-sage/30">

      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vh] h-[50vh] rounded-full bg-yoga-sage/10 blur-[100px] pointer-events-none animate-float" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vh] h-[60vh] rounded-full bg-yoga-terra/10 blur-[120px] pointer-events-none animate-float" style={{ animationDelay: '-3s' }} />

      <WarningBanner
        isVisible={showWarning}
        message={warningMessage || "⚠️ This query involves health conditions. Please consult a healthcare provider."}
        onClose={() => setShowWarning(false)}
      />

      {/* Header */}
      <header className="flex-shrink-0 p-4 md:p-6 flex items-center justify-between z-10 bg-white/30 backdrop-blur-md border-b border-white/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-yoga-sage/20 text-yoga-sage">
            <Sun size={24} />
          </div>
          <div>
            <h1 className="font-display text-xl font-semibold tracking-wide text-yoga-dark">
              Yoga<span className="text-yoga-sage italic">Flow</span>
            </h1>
            <p className="text-xs text-yoga-dark/60">Wellness Assistant</p>
          </div>
        </div>

        {/* Subtle Status Indicator */}
        <div className="flex items-center gap-2 text-xs font-medium text-yoga-sage bg-yoga-sage/10 px-3 py-1 rounded-full">
          <Sparkles size={12} />
          <span>AI Active</span>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 z-10 scroll-smooth">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[85%] md:max-w-[70%] gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 shadow-sm ${msg.sender === 'user' ? 'bg-yoga-terra text-white' : 'bg-white text-yoga-sage'
                  }`}>
                  {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>

                {/* Bubble */}
                <div className={`p-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed ${msg.sender === 'user'
                    ? 'bg-yoga-sage text-white rounded-tr-none'
                    : 'bg-white/80 backdrop-blur-sm text-yoga-dark border border-white/50 rounded-tl-none'
                  }`}>
                  {msg.text}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <div className="flex-shrink-0 p-4 md:p-6 z-20">
        <form
          onSubmit={handleSendMessage}
          className="max-w-4xl mx-auto relative flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask about a pose, breathing, or your session..."
            className="w-full bg-white/60 backdrop-blur-md border border-white/60 focus:border-yoga-sage text-yoga-dark placeholder:text-yoga-dark/40 rounded-full py-4 pl-6 pr-14 shadow-sm focus:ring-2 focus:ring-yoga-sage/20 outline-none transition-all duration-300"
          />
          <button
            type="button"
            className="absolute right-2 p-3 bg-yoga-sage hover:bg-yoga-sage/90 text-white rounded-full shadow-md transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
          >
            <Send size={20} />
          </button>
        </form>
        <div className="text-center mt-2">
          <p className="text-[10px] text-yoga-dark/30">
            AI can make mistakes. Listen to your body first.
          </p>
        </div>
      </div>

    </div>
  );
}

export default App;
