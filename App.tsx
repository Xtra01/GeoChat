import React, { useState, useEffect, useRef } from 'react';
import { Send, MapPin, Navigation, Loader2, Bot } from 'lucide-react';
import { Message, Role, GeoLocation } from './types';
import { sendMessageToGemini } from './services/geminiService';
import MessageBubble from './components/MessageBubble';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [locStatus, setLocStatus] = useState<'prompt' | 'granted' | 'denied' | 'fetching'>('prompt');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Initial Location Fetch
  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocStatus('denied');
      return;
    }

    setLocStatus('fetching');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocStatus('granted');
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocStatus('denied');
      }
    );
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue.trim();
    setInputValue('');
    
    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      text: userText,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Prepare history for the API
      // We convert our internal message format to Gemini's expected content format
      // Filter out errors and empty texts
      const history = messages
        .filter(m => !m.isError)
        .map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }));

      const result = await sendMessageToGemini(userText, location, history);

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.MODEL,
        text: result.text,
        timestamp: new Date(),
        groundingMetadata: result.groundingMetadata
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.MODEL,
        text: "I'm sorry, I encountered an error while trying to connect to Gemini. Please check your connection or API key.",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-100 p-2 rounded-lg">
            <MapPin className="text-emerald-600" size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-800">GeoChat</h1>
            <p className="text-xs text-slate-500 font-medium">Powered by Gemini 2.5 & Google Maps</p>
          </div>
        </div>

        <button 
          onClick={getLocation}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
            locStatus === 'granted' 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default' 
              : locStatus === 'fetching'
                ? 'bg-blue-50 text-blue-700 border-blue-200 cursor-wait'
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
          }`}
          disabled={locStatus === 'granted' || locStatus === 'fetching'}
          title={locStatus === 'granted' ? "Location Active" : "Enable Location"}
        >
          <Navigation size={12} className={locStatus === 'granted' ? 'fill-current' : ''} />
          {locStatus === 'granted' ? 'Location Active' : locStatus === 'fetching' ? 'Locating...' : 'Enable Location'}
        </button>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center mt-12 md:mt-20 space-y-4 opacity-0 animate-[fadeIn_0.5s_ease-in_forwards]">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center mb-4">
                <MapPin size={32} />
              </div>
              <h2 className="text-2xl font-semibold text-slate-800">Explore the world around you</h2>
              <p className="text-slate-500 max-w-md mx-auto">
                Ask about local restaurants, find directions, check traffic, or search for places nearby. 
                I use real-time Google Maps data to help you.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg mx-auto mt-8 text-left">
                <button 
                  onClick={() => { setInputValue("Find top rated coffee shops near me"); }}
                  className="p-3 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50 transition-all text-sm text-slate-700"
                >
                  "Find top rated coffee shops near me"
                </button>
                <button 
                  onClick={() => { setInputValue("What are some interesting tourist spots in Tokyo?"); }}
                  className="p-3 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50 transition-all text-sm text-slate-700"
                >
                   "Tourist spots in Tokyo?"
                </button>
                <button 
                  onClick={() => { setInputValue("How far is the nearest gas station?"); }}
                  className="p-3 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50 transition-all text-sm text-slate-700"
                >
                   "Nearest gas station?"
                </button>
                <button 
                  onClick={() => { setInputValue("Find an Italian restaurant nearby with good reviews"); }}
                  className="p-3 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50 transition-all text-sm text-slate-700"
                >
                   "Good Italian food nearby"
                </button>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              
              {isLoading && (
                <div className="flex justify-start w-full mb-6 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white">
                      <Bot size={18} />
                    </div>
                    <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm border border-slate-100 flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin text-emerald-600" />
                      <span className="text-slate-500 text-sm font-medium">Consulting Maps...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </main>

      {/* Input Area */}
      <footer className="bg-white border-t border-slate-200 p-4 sticky bottom-0">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={location ? "Ask about places, directions, or search..." : "Ask something (enable location for local results)..."}
              className="w-full bg-slate-50 text-slate-800 border border-slate-300 rounded-full py-3.5 pl-5 pr-12 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <Send size={18} />
            </button>
          </form>
          <p className="text-center text-[10px] text-slate-400 mt-2">
            Gemini may display inaccurate info, including about people, so double-check its responses.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;