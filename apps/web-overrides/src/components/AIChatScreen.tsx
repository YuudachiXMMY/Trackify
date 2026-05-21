import { useState, useRef, useEffect } from 'react';
import { Send, Leaf, AlertTriangle, X, Mic, Sparkles, Heart, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { api } from '../services/api';

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  time: string;
}

interface ApiMessage {
  role: 'user' | 'assistant';
  content: string;
}

const now = () => {
  const d = new Date();
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'ai',
    text: "Hi there! 🌿 I'm your Nourish AI companion. I'm here to help you understand your nutrition, find healthy meal ideas, and build a positive relationship with food — all at your own pace.\n\nHow are you feeling today?",
    time: '9:41 AM',
  },
  {
    id: '2',
    role: 'user',
    text: "I've been feeling low energy lately, even though I'm eating okay.",
    time: '9:42 AM',
  },
  {
    id: '3',
    role: 'ai',
    text: "I understand — that can be really frustrating. Based on your logs, you've been averaging around 28g of protein daily, but your goal is 120g. 💡\n\nLow protein is one of the most common causes of fatigue because your body uses it to repair cells and regulate energy. Some easy additions:\n\n• Greek yogurt (~17g protein)\n• A handful of almonds + a slice of cheese\n• Eggs on your avocado toast (+6g each)\n• A glass of chocolate milk after exercise\n\nWould you like me to build a personalized high-protein meal plan?",
    time: '9:42 AM',
  },
  {
    id: '4',
    role: 'user',
    text: "Yes please! Also I'm scared to eat too much.",
    time: '9:43 AM',
  },
  {
    id: '5',
    role: 'ai',
    text: "That's a really honest thing to share, and I want you to know that feeling is completely valid. 💙\n\nFood isn't something to fear — it's the fuel that lets you live, laugh, and feel your best. Your body is beautifully designed to need it.\n\nLet's focus on small, nourishing steps rather than big changes. Eating enough is an act of self-care, not something to feel guilty about.\n\nI'm always here for you, no judgment — ever. 🌿",
    time: '9:43 AM',
  },
];

const QUICK_REPLIES = [
  '🍳 Breakfast ideas?',
  '🥗 Lunch suggestions',
  '💪 Protein tips',
  '🥜 Quick snacks',
  '💧 Hydration help',
  '📊 Analyze my week',
];

// Convert display messages to the API format expected by the backend
function buildApiHistory(messages: Message[]): ApiMessage[] {
  return messages.map((msg) => ({
    role: msg.role === 'ai' ? 'assistant' : 'user',
    content: msg.text,
  }));
}

function MessageBubble({ msg }: { msg: Message }) {
  const isAI = msg.role === 'ai';
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex mb-3 ${isAI ? 'justify-start' : 'justify-end'}`}
    >
      <div style={{ maxWidth: '86%' }}>
        {isAI && (
          <div className="flex items-center gap-1.5 mb-1.5">
            <div
              className="flex items-center justify-center rounded-full shrink-0"
              style={{ width: '20px', height: '20px', background: 'linear-gradient(135deg, #2D6A4F, #52B788)' }}
            >
              <Leaf size={10} color="white" />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#52B788' }}>Nourish AI</span>
          </div>
        )}
        <div
          className="rounded-3xl px-4 py-3"
          style={{
            background: isAI ? 'white' : 'linear-gradient(135deg, #2D6A4F, #52B788)',
            boxShadow: isAI ? '0 2px 12px rgba(0,0,0,0.07)' : '0 4px 16px rgba(45,106,79,0.3)',
            borderRadius: isAI ? '4px 20px 20px 20px' : '20px 20px 4px 20px',
          }}
        >
          <p
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: isAI ? '#1B1B1B' : 'white',
              lineHeight: 1.7,
              whiteSpace: 'pre-line',
            }}
          >
            {msg.text}
          </p>
        </div>
        <span
          style={{
            fontSize: '10px',
            color: '#9CA3AF',
            fontWeight: 500,
            marginTop: '4px',
            display: 'block',
            textAlign: isAI ? 'left' : 'right',
            paddingLeft: isAI ? '4px' : '0',
            paddingRight: isAI ? '0' : '4px',
          }}
        >
          {msg.time}
        </span>
      </div>
    </motion.div>
  );
}

export function AIChatScreen() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
      time: now(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);
    setError(null);

    try {
      const history = buildApiHistory(updatedMessages);
      const response = await api.post<{ reply: string }>('/api/ai/chat', {
        messages: history,
      });

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: response.reply,
        time: now(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get a response. Please try again.');
      // Restore messages so the user can retry
      setMessages(updatedMessages);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div
      className="flex flex-col bg-[#F8FAF9]"
      style={{ height: 'calc(100dvh - 116px)', maxHeight: 'calc(900px - 116px)' }}
    >
      {/* Header */}
      <div
        className="shrink-0 px-5 pt-2 pb-4"
        style={{ background: 'linear-gradient(160deg, #1B4332 0%, #2D6A4F 100%)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="relative flex items-center justify-center rounded-2xl shrink-0"
            style={{ width: '46px', height: '46px', background: 'rgba(255,255,255,0.15)' }}
          >
            <Leaf size={22} color="white" />
            <div
              className="absolute bottom-0 right-0 rounded-full border-2 border-[#2D6A4F]"
              style={{ width: '12px', height: '12px', background: '#4ADE80' }}
            />
          </div>
          <div className="flex-1">
            <h1 style={{ color: 'white', fontSize: '18px', fontWeight: 900, letterSpacing: '-0.3px' }}>
              Nourish AI
            </h1>
            <div className="flex items-center gap-1.5">
              <Sparkles size={11} color="rgba(255,255,255,0.6)" />
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: 600 }}>
                Always here · Non-judgmental
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate('/scan')}
            className="flex items-center justify-center rounded-xl"
            style={{ width: '38px', height: '38px', background: 'rgba(255,255,255,0.15)' }}
          >
            <Camera size={18} color="white" />
          </button>
        </div>
      </div>

      {/* Safety banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0, padding: 0 }}
            className="shrink-0 flex items-start gap-2 px-4 py-2.5 overflow-hidden"
            style={{ background: '#FFFBEB', borderBottom: '1px solid #FDE68A' }}
          >
            <AlertTriangle size={13} color="#D97706" style={{ marginTop: '1px', flexShrink: 0 }} />
            <p style={{ fontSize: '11px', color: '#92400E', fontWeight: 600, flex: 1, lineHeight: 1.5 }}>
              In a crisis? NEDA Helpline: <strong>1-800-931-2237</strong> · Available 24/7
            </p>
            <button onClick={() => setShowBanner(false)}>
              <X size={13} color="#D97706" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0, padding: 0 }}
            className="shrink-0 flex items-start gap-2 px-4 py-2.5 overflow-hidden"
            style={{ background: '#FEF2F2', borderBottom: '1px solid #FECACA' }}
          >
            <X size={13} color="#EF4444" style={{ marginTop: '1px', flexShrink: 0 }} />
            <p style={{ fontSize: '11px', color: '#B91C1C', fontWeight: 600, flex: 1, lineHeight: 1.5 }}>
              {error}
            </p>
            <button onClick={() => setError(null)}>
              <X size={13} color="#EF4444" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3" style={{ scrollbarWidth: 'none' }}>
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="flex items-center gap-2 mb-3"
            >
              <div
                className="flex items-center justify-center rounded-full shrink-0"
                style={{ width: '20px', height: '20px', background: 'linear-gradient(135deg, #2D6A4F, #52B788)' }}
              >
                <Leaf size={10} color="white" />
              </div>
              <div
                className="rounded-2xl px-4 py-3 flex items-center gap-1.5"
                style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="rounded-full"
                    style={{ width: '7px', height: '7px', background: '#52B788' }}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Quick replies */}
      <div className="shrink-0 px-4 py-2 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {QUICK_REPLIES.map((reply) => (
          <button
            key={reply}
            onClick={() => void sendMessage(reply)}
            disabled={isTyping}
            className="shrink-0 rounded-full px-3 py-1.5 border border-[#D8F3DC] bg-white whitespace-nowrap transition-all active:bg-[#D8F3DC] disabled:opacity-50"
            style={{ fontSize: '11px', fontWeight: 700, color: '#2D6A4F' }}
          >
            {reply}
          </button>
        ))}
      </div>

      {/* ED Support banner (pinned at bottom) */}
      <div
        className="shrink-0 flex items-center gap-2 px-4 py-2 mx-0"
        style={{ background: '#F0F9FF', borderTop: '1px solid #E0F2FE' }}
      >
        <Heart size={12} color="#0EA5E9" />
        <p style={{ fontSize: '10px', color: '#0369A1', fontWeight: 600, flex: 1 }}>
          Remember: food is nourishment, not punishment. You're doing amazing. 💙
        </p>
      </div>

      {/* Input bar */}
      <div className="shrink-0 flex items-center gap-2 px-4 py-3 bg-white border-t border-[#E8F4ED]">
        <div
          className="flex-1 flex items-center rounded-2xl px-3 py-2.5 gap-2"
          style={{ background: '#F3F4F6' }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void sendMessage(input);
            }}
            placeholder="Ask me anything about nutrition..."
            className="flex-1 bg-transparent outline-none"
            style={{ fontSize: '14px', fontWeight: 500, color: '#1B1B1B' }}
            disabled={isTyping}
          />
          <button>
            <Mic size={15} color="#9CA3AF" />
          </button>
        </div>
        <motion.button
          onClick={() => void sendMessage(input)}
          disabled={!input.trim() || isTyping}
          whileTap={{ scale: 0.9 }}
          className="flex items-center justify-center rounded-2xl shrink-0 transition-all"
          style={{
            width: '44px',
            height: '44px',
            background: input.trim() && !isTyping ? 'linear-gradient(135deg, #2D6A4F, #52B788)' : '#E5E7EB',
            boxShadow: input.trim() && !isTyping ? '0 4px 14px rgba(45,106,79,0.35)' : 'none',
          }}
        >
          <Send size={17} color={input.trim() && !isTyping ? 'white' : '#9CA3AF'} />
        </motion.button>
      </div>
    </div>
  );
}
