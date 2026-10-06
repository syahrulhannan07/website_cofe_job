import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import chatbotIcon from '../../aset/Icon Chatbot.png';
import { kirimPesan } from '../../layanan/layananChatBot';
import LoadingKopi from './LoadingKopi';

const FloatingChatbot = ({ isLoggedIn, userRole }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Halo! Saya **CafeBot** 🤖, asisten AI dari C.A.F.E. Job Portal.\n\nSaya bisa membantu kamu:\n- 🔍 Mencari lowongan pekerjaan cafe\n- 💡 Tips karir dan wawancara\n- ❓ Menjawab pertanyaan seputar platform\n\nAda yang bisa saya bantu?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const location = useLocation();

  const allowedPaths = ['/', '/lowongan', '/perusahaan', '/status-lamaran', '/profil'];
  const isAllowedPath = allowedPaths.some(path =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
  );

  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isAllowedPath) {
      setShowTooltip(true);
      const timer = setTimeout(() => setShowTooltip(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [isOpen]);

  const kirim = async () => {
    const teks = input.trim();
    if (!teks || loading) return;

    setInput('');
    setError(null);

    const pesanUser = { role: 'user', content: teks };
    const riwayat = [...messages, pesanUser];
    setMessages(riwayat);
    setLoading(true);

    try {
      const response = await kirimPesan(riwayat);
      setMessages((prev) => [...prev, response]);
    } catch (err) {
      setError('Gagal mengirim pesan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const teks = input.trim();
      if (!teks) {
        setError('Pertanyaan tidak boleh kosong');
        return;
      }
      kirim();
    }
  };

  const handleSendClick = () => {
    const teks = input.trim();
    if (!teks) {
      setError('Pertanyaan tidak boleh kosong');
      return;
    }
    kirim();
  };

  const formatPesan = (teks) => {
    return teks
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>')
      .replace(/•/g, '&bull;');
  };

  if (!isLoggedIn || userRole !== 'Pelamar' || !isAllowedPath) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Tooltip */}
      {showTooltip && !isOpen && (
        <div className="absolute bottom-14 right-0 w-auto max-w-xs mb-2 animate-fade-in">
          <div className="bg-[#4b2e2b] text-white text-sm font-poppins px-3 py-2 rounded-lg shadow-lg whitespace-nowrap flex items-center gap-2">
            <span>Bantuan AI - CafeBot</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </div>
        </div>
      )}

      {/* Floating Button - No circular background, just the icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none ${isOpen ? 'rotate-45' : ''}`}
        aria-label={isOpen ? 'Tutup bantuan AI' : 'Buka bantuan AI - CafeBot'}
        title="Bantuan AI - CafeBot"
      >
        <img
          src={chatbotIcon}
          alt="Chatbot AI"
          className="w-10 h-10 md:w-12 md:h-12 object-contain drop-shadow-lg"
        />
        {/* Pulse animation when closed */}
        {!isOpen && (
          <span className="absolute -inset-1 bg-[#c69c6d] rounded-full opacity-30 animate-ping" />
        )}
      </button>

      {/* Floating Chatbot Popup */}
      {isOpen && (
        <div className="fixed bottom-16 right-0 z-50 w-full max-w-sm md:max-w-md animate-slide-up">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[-1]"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Chatbot Window */}
          <div className="bg-white rounded-2xl shadow-2xl border border-[#e8d5c4] overflow-hidden flex flex-col h-[500px] md:h-[600px]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-[#4b2e2b] text-white border-b border-[#c69c6d]/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#c69c6d]/20 flex items-center justify-center">
                  <img src={chatbotIcon} alt="Chatbot" className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-poppins font-semibold text-sm">Bantuan AI - CafeBot</p>
                  <p className="text-xs opacity-80">Online • Biasanya balas dalam detik</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Tutup chatbot"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#faf7f3]">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#4b2e2b] text-white rounded-br-md'
                        : 'bg-white border border-[#e8d5c4] text-gray-800 rounded-bl-md shadow-sm'
                    }`}
                    dangerouslySetInnerHTML={{ __html: formatPesan(msg.content) }}
                  />
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-[#e8d5c4] rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#c69c6d] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-[#c69c6d] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-[#c69c6d] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-lg text-sm text-red-700">{error}</div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-[#e8d5c4] p-4 bg-white">
              <div className="flex gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ketik pesan di sini..."
                  rows={1}
                  className="flex-1 resize-none border border-[#d4c5b5] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c69c6d] focus:border-transparent"
                  disabled={loading}
                />
                <button
                  onClick={handleSendClick}
                  disabled={loading || !input.trim()}
                  className="bg-[#4b2e2b] text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-[#3d2421] disabled:opacity-50 disabled:cursor-not-allowed transition-colors self-end"
                >
                  {loading ? '...' : 'Kirim'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
        .animate-slide-up { animation: slide-up 0.25s ease-out; }
      `}</style>
    </div>
  );
};

export default FloatingChatbot;