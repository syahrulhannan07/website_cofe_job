import { useState, useRef, useEffect } from 'react';
import { kirimPesan } from '../../layanan/layananChatBot';
import LoadingKopi from '../../komponen/umum/LoadingKopi';

const PESAN_SELAMAT_DATANG = {
    role: 'assistant',
    content: 'Halo! Saya **CafeBot** 🤖, asisten AI dari C.A.F.E. Job Portal.\n\nSaya bisa membantu kamu:\n- 🔍 Mencari lowongan pekerjaan cafe\n- ⭐ Melihat rating & rekomendasi cafe\n- 💡 Tips karir dan wawancara\n- ❓ Menjawab pertanyaan seputar platform\n\nAda yang bisa saya bantu?',
};

const HalamanBantuanAi = () => {
    const [messages, setMessages] = useState([PESAN_SELAMAT_DATANG]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const chatEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        inputRef.current?.focus();
    }, [loading]);

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
            kirim();
        }
    };

    const formatPesan = (teks) => {
        return teks
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br/>')
            .replace(/•/g, '&bull;');
    };

    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[#4b2e2b]">Bantuan AI — CafeBot</h1>
                <p className="text-gray-600 mt-1">Tanya apa pun tentang lowongan cafe, rekomendasi tempat, atau tips karir</p>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-[#e8d5c4] overflow-hidden">
                <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-[#faf7f3]">
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
                            onClick={kirim}
                            disabled={loading || !input.trim()}
                            className="bg-[#4b2e2b] text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-[#3d2421] disabled:opacity-50 disabled:cursor-not-allowed transition-colors self-end"
                        >
                            {loading ? '...' : 'Kirim'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HalamanBantuanAi;
