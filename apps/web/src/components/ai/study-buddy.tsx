'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Minimize2, Maximize2 } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface Message { role: 'user' | 'assistant'; content: string; }

interface Props {
  courseId:  string;
  lessonId?: string;
  courseName?: string;
}

export function AiStudyBuddy({ courseId, lessonId, courseName }: Props) {
  const { data: session } = useSession();
  const [open,      setOpen]      = useState(false);
  const [messages,  setMessages]  = useState<Message[]>([
    { role: 'assistant', content: `Namaste! 👋 Main hoon aapka AI Study Buddy. ${courseName ? `"${courseName}"` : 'Is course'} ke baare mein koi bhi sawaal poochho — Hindi ya English mein!` },
  ]);
  const [input,     setInput]     = useState('');
  const [streaming, setStreaming] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && !minimized) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open, minimized]);

  useEffect(() => {
    if (open && !minimized) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open, minimized]);

  const send = async () => {
    if (!input.trim() || streaming || !session) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setStreaming(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
    const token  = localStorage.getItem('lxt_token') ?? '';

    try {
      const res = await fetch(`${apiUrl}/api/v1/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          courseId, lessonId,
          messages: [...messages, { role: 'user', content: userMsg }].slice(-10),
        }),
      });

      if (!res.ok || !res.body) throw new Error('Stream failed');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantMsg = '';
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        const lines = text.split('\n').filter(l => l.startsWith('data: '));
        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.delta) {
              assistantMsg += data.delta;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: assistantMsg };
                return updated;
              });
            }
          } catch {}
        }
      }
    } catch {
      // Fallback for demo / when API not running
      const demoReply = `Main samajh gaya! "${userMsg}" ek bahut achha sawaal hai. Is concept ko detail mein explain karne ke liye: yeh course ke ${courseName ?? 'current'} section se directly related hai. Kya aap chahte hain ki main step-by-step explain karun?`;
      setMessages(prev => [...prev, { role: 'assistant', content: demoReply }]);
    } finally {
      setStreaming(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-40 w-14 h-14 rounded-full bg-brand-orange shadow-orange-lg flex items-center justify-center animate-glow-pulse"
          >
            <Sparkles size={22} className="text-white" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-brand-green rounded-full border-2 border-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-40 w-[calc(100vw-2rem)] md:w-[360px]"
          >
            <div className={`bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] border border-gray-100 flex flex-col overflow-hidden transition-all ${minimized ? 'h-14' : 'h-[500px] md:h-[520px]'}`}>

              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-brand-blue to-purple-700 flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-brand-orange flex items-center justify-center">
                  <Sparkles size={14} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold text-sm">AI Study Buddy</div>
                  <div className="flex items-center gap-1 text-white/60 text-[10px]">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-green" />
                    Online · Hindi + English
                  </div>
                </div>
                <button onClick={() => setMinimized(p => !p)} className="text-white/70 hover:text-white p-1 transition-colors">
                  {minimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                </button>
                <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white p-1 transition-colors">
                  <X size={14} />
                </button>
              </div>

              {!minimized && (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 no-scrollbar">
                    {messages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
                        {msg.role === 'assistant' && (
                          <div className="w-6 h-6 rounded-full bg-brand-orange flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Sparkles size={11} className="text-white" />
                          </div>
                        )}
                        <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-brand-blue text-white rounded-tr-sm'
                            : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                        }`}>
                          {msg.content}
                          {msg.role === 'assistant' && streaming && i === messages.length - 1 && !msg.content && (
                            <div className="flex gap-1 py-1">
                              {[0, 0.2, 0.4].map((d, j) => (
                                <motion.div key={j} animate={{ y: [0,-4,0] }} transition={{ duration: 0.6, repeat: Infinity, delay: d }}
                                  className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="px-3 py-3 border-t border-gray-100 flex-shrink-0">
                    {!session && (
                      <p className="text-xs text-gray-400 text-center mb-2">
                        Please <a href="/auth" className="text-brand-orange font-semibold">log in</a> to use AI Study Buddy
                      </p>
                    )}
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-brand-orange focus-within:ring-2 focus-within:ring-brand-orange/20 transition-all">
                      <input
                        ref={inputRef}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                        disabled={streaming || !session}
                        placeholder={session ? 'Apna sawaal likhein...' : 'Login required'}
                        className="flex-1 bg-transparent text-sm outline-none text-gray-800 placeholder:text-gray-400 disabled:opacity-50"
                      />
                      <motion.button whileTap={{ scale: 0.9 }}
                        onClick={send} disabled={streaming || !input.trim() || !session}
                        className="w-7 h-7 rounded-lg bg-brand-orange flex items-center justify-center disabled:opacity-40 transition-opacity flex-shrink-0">
                        <Send size={12} className="text-white" />
                      </motion.button>
                    </div>
                    <p className="text-[10px] text-gray-400 text-center mt-1.5">
                      20 messages/day free · Powered by OpenAI
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
