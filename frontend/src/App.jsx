import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sun, Sparkles, User, Bot, ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';
import WarningBanner from './components/ui/WarningBanner';
import { askQuestion, submitFeedback } from './services/api';
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

      // Add AI response with sources and queryId for feedback
      const newAiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: response.answer,
        sources: response.sources || [],
        queryId: response.queryId,
        feedbackGiven: null // null = not given, true = helpful, false = not helpful
      };
      setMessages(prev => [...prev, newAiMsg]);

      // Show safety warning if query was unsafe
      console.log('Safety response:', response.safety); // DEBUG
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

  const handleFeedback = async (messageId, queryId, helpful) => {
    try {
      await submitFeedback(queryId, helpful);
      // Update message to show feedback was given
      setMessages(prev => prev.map(msg =>
        msg.id === messageId ? { ...msg, feedbackGiven: helpful } : msg
      ));
    } catch (error) {
      console.error('Failed to submit feedback:', error);
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
        autoClose={15000}
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

                {/* Bubble + Sources + Feedback */}
                <div className={`flex flex-col gap-2 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  {/* Message Bubble */}
                  <div className={`p-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed ${msg.sender === 'user'
                    ? 'bg-yoga-sage text-white rounded-tr-none'
                    : 'bg-white/80 backdrop-blur-sm text-yoga-dark border border-white/50 rounded-tl-none'
                    }`}>
                    {msg.text}
                  </div>

                  {/* Sources Section - Only for AI messages with sources */}
                  {msg.sender === 'ai' && msg.sources && msg.sources.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="bg-white/50 border border-white/60 p-3 rounded-xl text-xs w-full"
                    >
                      <p className="font-semibold text-yoga-sage mb-2 flex items-center gap-1">
                        <Sparkles size={10} /> Sources Used:
                      </p>
                      <div className="space-y-1.5">
                        {msg.sources.map((source, idx) => (
                          <div key={idx} className="flex flex-col gap-0.5 pl-2 border-l-2 border-yoga-sage/30">
                            <span className="font-medium text-yoga-dark/80">{source.title}</span>
                            <span className="text-[10px] text-yoga-dark/50">Source: {source.source}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Feedback Section - Only for AI messages with queryId */}
                  {msg.sender === 'ai' && msg.queryId && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center gap-2 text-xs"
                    >
                      <span className="text-yoga-dark/50">Was this helpful?</span>
                      {msg.feedbackGiven === null ? (
                        <>
                          <button
                            onClick={() => handleFeedback(msg.id, msg.queryId, true)}
                            className="p-1.5 rounded-full hover:bg-green-100 text-yoga-dark/40 hover:text-green-600 transition-colors"
                            title="Helpful"
                          >
                            <ThumbsUp size={14} />
                          </button>
                          <button
                            onClick={() => handleFeedback(msg.id, msg.queryId, false)}
                            className="p-1.5 rounded-full hover:bg-red-100 text-yoga-dark/40 hover:text-red-500 transition-colors"
                            title="Not helpful"
                          >
                            <ThumbsDown size={14} />
                          </button>
                        </>
                      ) : (
                        <span className={`text-xs font-medium ${msg.feedbackGiven ? 'text-green-600' : 'text-red-500'}`}>
                          {msg.feedbackGiven ? '👍 Thanks!' : '👎 Sorry about that'}
                        </span>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading Indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex max-w-[85%] md:max-w-[70%] gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 shadow-sm bg-white text-yoga-sage">
                <Bot size={16} />
              </div>
              <div className="p-4 rounded-2xl rounded-tl-none bg-white/80 backdrop-blur-sm text-yoga-dark border border-white/50 flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-yoga-sage" />
                <span className="text-sm text-yoga-dark/60">Thinking...</span>
              </div>
            </div>
          </motion.div>
        )}

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
            disabled={isLoading}
          />
          <button
            type="submit"
            className="absolute right-2 p-3 bg-yoga-sage hover:bg-yoga-sage/90 text-white rounded-full shadow-md transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
            disabled={!inputMessage.trim() || isLoading}
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
