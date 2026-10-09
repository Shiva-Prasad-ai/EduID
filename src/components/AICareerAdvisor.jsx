import React, { useState, useRef, useEffect } from 'react';
import { Brain, Send, RefreshCw, User, ChevronRight } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const cardClass = "bg-white/90 backdrop-blur-xl rounded-[24px] shadow-premium border border-white/80 transition-all duration-500 ease-out p-6 md:p-8 flex flex-col h-[calc(100vh-200px)] min-h-[500px]";

export default function AICareerAdvisor({ profileContext }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I am Jade, your AI Career Advisor. How can I help with your career path, skills development, certificate recommendations, or EduID platform support today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const candidateData = profileContext || {
    name: "Ananya Raj",
    eduId: "EUKA2026001",
    university: "Visvesvaraya Technological University",
    degree: "B.E. Computer Science & Engineering",
    cgpa: "8.72 / 10",
    skills: ["React", "Node.js", "JavaScript", "Python", "Data Structures", "SQL", "Tailwind CSS"],
    certificates: ["Full-Stack Web Development (Coursera)", "AWS Certified Cloud Practitioner", "Python for Data Science"],
    projects: ["EduID Verification Portal", "AI Attendance Tracker with OpenCV"],
    internships: ["Web Developer Intern at TechCorp (3 months)"],
    attendance: "94%"
  };

  const systemPrompt = `You are Jade, an AI Career Advisor for EduID. Help students with career guidance, skill development, certificate recommendations, and EduID platform support. Current user: ${candidateData.name} (EduID: ${candidateData.eduId || 'EUKA2026001'}). When the user expresses interest in or asks about a skill, start by warmly acknowledging it before providing clear, actionable advice and next steps. Keep your responses helpful, clear, concise, and direct. Do not use emojis.`;

  const handleSend = async (customPrompt) => {
    const query = customPrompt || input;
    if (!query.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!customPrompt) setInput('');
    setIsLoading(true);

    try {
      const cacheKey = `eduid_jade_cache_${query.toLowerCase().trim()}`;
      let cachedReply = null;

      try {
        cachedReply = sessionStorage.getItem(cacheKey);
      } catch (e) {
        // sessionStorage restricted
      }

      if (cachedReply) {
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              role: 'assistant',
              content: cachedReply,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
          setIsLoading(false);
        }, 300);
        return;
      }

      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...messages
          .filter(m => m.role === 'user' || m.role === 'assistant')
          .map(m => ({
            role: m.role,
            content: m.content
          })),
        { role: 'user', content: query.trim() }
      ];

      // Proxied call to backend - zero credentials exposed to browser inspect!
      const res = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: apiMessages
        })
      });

      let replyContent = null;

      if (res.ok) {
        const data = await res.json();
        if (data.content) {
          replyContent = data.content;
        }
      }

      if (!replyContent) {
        replyContent = "I am Jade, your EduID AI Career Advisor. I am ready to assist with your career guidance, recommended skills, certificates, and EduID platform queries.";
      }

      // Save successful response to cache
      try {
        sessionStorage.setItem(cacheKey, replyContent);
      } catch (e) {
        // Storage full or unavailable
      }

      const aiMsg = {
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error("AI service error:", err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "We couldn't connect to Jade AI right now. Please check your connection or backend server status.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    { label: "Skill recommendations", text: "Recommend new skills I should learn based on my profile." },
    { label: "Certificate suggestions", text: "What certificates should I get next for my career?" },
    { label: "Career path advice", text: "Give me career advice based on my current projects and skills." },
    { label: "EduID Platform Help", text: "How does EduID verify my credentials?" }
  ];

  const renderFormattedText = (text) => {
    return text.split('\n').map((line, i) => {
      let formattedLine = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
      return (
        <span 
          key={i} 
          className="block mb-1 text-sm leading-relaxed" 
          dangerouslySetInnerHTML={{ __html: formattedLine }} 
        />
      );
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500 max-w-7xl mx-auto pb-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-50/80 via-white to-indigo-50/50 backdrop-blur-xl rounded-[28px] p-6 md:p-8 border border-white/80 shadow-premium flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shrink-0">
        <div className="flex items-start gap-5 z-10">
          <div className="w-16 h-16 rounded-2xl bg-mint/10 border border-mint/20 flex items-center justify-center text-mint shrink-0 shadow-sm">
            <Brain className="w-8 h-8 text-teal-600" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Jade AI</h1>
              <span className="bg-teal-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                Career Engine
              </span>
            </div>
            <p className="text-slate-500 text-sm max-w-2xl font-medium">
              Ask Jade AI for personalized career guidance, recommended skills, certificate roadmaps, and EduID platform assistance.
            </p>
          </div>
        </div>

        {/* Clear Chat Action Button */}
        <button
          type="button"
          onClick={() => setMessages([{
            role: 'assistant',
            content: "Chat cleared! How can Jade assist with your career or EduID platform today?",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }])}
          className="px-5 py-2.5 bg-white border border-gray-200/80 hover:bg-gray-50 text-slate-700 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer z-10"
        >
          <RefreshCw className="w-4 h-4 text-slate-500" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Main Chat Interface Card */}
      <div className={cardClass}>
        
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar">
          {messages.map((msg, index) => (
            <div 
              key={index}
              className={`flex items-start gap-3 max-w-[85%] md:max-w-[75%] ${
                msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs shrink-0 shadow-xs ${
                msg.role === 'user' 
                  ? 'bg-teal-600 text-white' 
                  : 'bg-teal-50 border border-teal-100 text-teal-600'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Brain className="w-4 h-4 text-teal-600" />}
              </div>

              <div className={`rounded-2xl p-4 shadow-xs ${
                msg.role === 'user'
                  ? 'bg-teal-600 text-white rounded-tr-none'
                  : 'bg-slate-50/80 border border-slate-200/60 text-slate-800 rounded-tl-none'
              }`}>
                <div>{renderFormattedText(msg.content)}</div>
                <span className={`text-[10px] block mt-1.5 text-right ${
                  msg.role === 'user' ? 'text-teal-200' : 'text-slate-400'
                }`}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {/* Skeleton Loading Card for AI Response */}
          {isLoading && (
            <div className="flex items-start gap-3 max-w-[80%] mr-auto animate-pulse">
              <div className="w-9 h-9 rounded-2xl bg-teal-100 border border-teal-200 flex items-center justify-center shrink-0">
                <Brain className="w-4 h-4 text-teal-600 animate-pulse" />
              </div>
              <div className="bg-slate-100/90 border border-slate-200 rounded-2xl rounded-tl-none p-4 w-72 space-y-2.5">
                <div className="h-3.5 bg-slate-200 rounded-full w-3/4"></div>
                <div className="h-3.5 bg-slate-200 rounded-full w-full"></div>
                <div className="h-3.5 bg-slate-200 rounded-full w-5/6"></div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="pt-3 pb-2 border-t border-gray-100 shrink-0">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Quick Guidance Topics</p>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                onClick={() => handleSend(qp.text)}
                disabled={isLoading}
                className="text-xs bg-slate-50 hover:bg-teal-50 hover:text-teal-700 text-slate-700 px-3 py-2 rounded-xl border border-slate-200/80 transition-all flex items-center gap-1.5 font-medium disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <span>{qp.label}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Input Controls */}
        <div className="pt-3 border-t border-gray-200/80 shrink-0">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Jade about your skills, certificates, career advice, or EduID support..."
              disabled={isLoading}
              className="flex-1 bg-slate-50 border border-gray-200 rounded-xl px-5 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all placeholder:text-gray-400 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 shadow-sm cursor-pointer shrink-0"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
