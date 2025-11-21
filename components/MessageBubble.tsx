import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, Role } from '../types';
import { User, Bot, AlertCircle } from 'lucide-react';
import GroundingSources from './GroundingSources';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === Role.USER;
  const isError = message.isError;

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-blue-600 text-white' : isError ? 'bg-red-100 text-red-500' : 'bg-emerald-600 text-white'}`}>
          {isUser ? <User size={18} /> : isError ? <AlertCircle size={18} /> : <Bot size={18} />}
        </div>

        {/* Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div
            className={`px-4 py-3 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed overflow-hidden
              ${isUser 
                ? 'bg-blue-600 text-white rounded-tr-sm' 
                : isError 
                  ? 'bg-red-50 border border-red-200 text-red-800 rounded-tl-sm'
                  : 'bg-white border border-slate-100 text-slate-800 rounded-tl-sm'
              }
            `}
          >
            {isUser ? (
              <p className="whitespace-pre-wrap">{message.text}</p>
            ) : (
              <div className="prose prose-sm max-w-none prose-slate prose-p:my-1 prose-ul:my-1 prose-headings:text-slate-800 prose-a:text-blue-600 hover:prose-a:text-blue-800">
                <ReactMarkdown>{message.text}</ReactMarkdown>
              </div>
            )}
          </div>

          {/* Grounding Sources (Only for model) */}
          {!isUser && !isError && message.groundingMetadata && (
            <div className="w-full max-w-xl">
              <GroundingSources metadata={message.groundingMetadata} />
            </div>
          )}
          
          <span className="text-[10px] text-slate-400 mt-1 px-1">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
