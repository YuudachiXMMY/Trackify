import { useState, useRef, useEffect } from 'react';
import { Send, Leaf, AlertTriangle, X, Mic, Sparkles, Heart, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  time: string;
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

const AI_RESPONSES: Record<string, string> = {
  default:
    "Thanks for your question! 🌿 I'm here to help with:\n\n• Meal ideas and recipes\n• Nutrition advice and macros\n• Analyzing your eating patterns\n• Support with food-related concerns\n• Healthy eating tips\n\nWhat would you like to know more about?",
  breakfast:
    "Here are some nutrient-dense breakfast ideas for your goals:\n\n🥑 Avocado toast with 2 eggs (390 kcal, 22g protein)\n🍓 Greek yogurt parfait with berries & granola (280 kcal, 18g protein)\n🥣 Overnight oats with nut butter & banana (350 kcal, 14g protein)\n🫐 Protein smoothie with spinach & berries (300 kcal, 25g protein)\n\nWhich sounds most appealing? I can give you a full recipe!",
  lunch:
    "Here are some balanced lunch options:\n\n🥗 Mediterranean quinoa bowl with chickpeas & feta (420 kcal, 16g protein)\n🥙 Grilled chicken wrap with veggies & hummus (380 kcal, 28g protein)\n🍜 Asian noodle bowl with tofu & vegetables (360 kcal, 18g protein)\n🥪 Turkey & avocado sandwich on whole grain (400 kcal, 24g protein)\n\nAll easy to prep ahead! Want a specific recipe?",
  dinner:
    "Delicious dinner ideas for your goals:\n\n🍗 Baked salmon with roasted veggies (450 kcal, 35g protein)\n🍝 Whole grain pasta with chicken & marinara (520 kcal, 32g protein)\n🌮 Fish tacos with cabbage slaw (380 kcal, 28g protein)\n🍛 Chickpea curry with brown rice (440 kcal, 14g protein)\n\nWhich cuisine sounds good to you?",
  protein:
    "Based on your logs today, you've consumed about 27g of protein out of your 120g goal. You still need about 93g more! 💪\n\nHere's a quick plan to get there:\n• Grilled chicken breast at dinner (+31g)\n• Greek yogurt snack (+17g)\n• Handful of edamame (+11g)\n• Cottage cheese before bed (+14g)\n\nThat adds up to 73g — combined with what you've had, you'd hit your goal! You've got this! 🌿",
  calories:
    "Let's talk about calories! 🔥\n\nYour daily goal is 1,800 calories. Here's a balanced breakdown:\n\n• Breakfast: ~400-450 kcal\n• Lunch: ~500-550 kcal\n• Dinner: ~600-650 kcal\n• Snacks: ~200-250 kcal\n\nRemember: calories are energy your body needs to function. Eating enough is important for your metabolism, energy, and overall health!\n\nNeed help planning specific meals?",
  water:
    "Staying hydrated is so important! 💧\n\nYour goal is 8 glasses (64 oz) per day. Benefits include:\n\n✨ Better energy and focus\n✨ Clearer skin\n✨ Improved digestion\n✨ Better workout performance\n\nTips to drink more:\n• Keep a water bottle with you\n• Drink a glass with each meal\n• Add lemon or cucumber for flavor\n• Set hourly reminders\n\nHow many glasses have you had today?",
  hungry:
    "It's okay to have days like this. 💙 Sometimes low appetite is your body's way of communicating stress, fatigue, or emotional overload.\n\nTry starting with something small and gentle:\n• A warm smoothie (easy to sip, full of nutrients)\n• A handful of nuts — just something small\n• A piece of fruit like a banana\n• Even a cup of warm broth\n\nSomething is always better than nothing when it comes to nourishing yourself. Your body will thank you.\n\nHave you been drinking enough water today? Sometimes thirst can mask hunger signals.",
  snack:
    "Here are some quick, nutritious snacks that take under 2 minutes:\n\n🥜 Almond butter on apple slices (180 kcal, 4g protein)\n🧀 String cheese + whole grain crackers (160 kcal, 8g protein)\n🫐 Berries + a square of dark chocolate (140 kcal)\n🥚 Hard-boiled egg with salt & pepper (70 kcal, 6g protein)\n🌰 Trail mix with nuts & dried fruit (200 kcal, 5g protein)\n\nAll are great for sustained energy — no crash afterward!",
  recipe:
    "I'd love to share a recipe! 🍳\n\nHere's a quick & healthy favorite:\n\n**Protein Power Bowl**\n• 1 cup quinoa, cooked\n• 4 oz grilled chicken\n• 1/2 avocado, sliced\n• Cherry tomatoes\n• Cucumber, diced\n• Lemon tahini dressing\n\nTotal: 480 kcal, 35g protein\n\nPrep: Cook quinoa, grill chicken, chop veggies, mix dressing (tahini + lemon + water), and assemble!\n\nWant recipes for a specific meal or cuisine?",
  anxiety:
    "I hear you, and it takes real courage to reach out about this. 💙\n\nYour relationship with food is deeply personal, and healing takes time — there's absolutely no rush and zero judgment here. Every small step you take counts more than you know.\n\nA few gentle things that might help:\n✨ Take it one meal at a time — just the next one\n✨ Focus on how food makes you feel, not just numbers\n✨ Celebrate every small win, no matter how small\n✨ Remember: nourishing yourself is an act of love\n\nIf you'd ever like to speak with a professional, the NEDA Helpline is available 24/7: 1-800-931-2237. You absolutely deserve support. 🌿",
  healthy:
    "Great question about healthy eating! 🌿\n\nThe basics of a balanced diet:\n\n🥗 Plenty of vegetables & fruits\n🥜 Lean proteins (chicken, fish, beans, tofu)\n🌾 Whole grains (brown rice, quinoa, oats)\n🥑 Healthy fats (avocado, nuts, olive oil)\n💧 Lots of water\n\nFocus on:\n• Whole, minimally processed foods\n• Variety and color on your plate\n• Listening to your hunger cues\n• Enjoying what you eat!\n\nWhat specific area would you like to improve?",
  weight:
    "Let's talk about this thoughtfully. 💙\n\nHealthy, sustainable changes focus on:\n\n✨ Nourishing your body properly\n✨ Building healthy habits\n✨ Feeling energized and strong\n✨ Long-term wellness, not quick fixes\n\nInstead of restriction, try:\n• Adding more whole foods\n• Staying hydrated\n• Moving your body in ways you enjoy\n• Getting enough sleep\n• Managing stress\n\nYour worth isn't tied to a number. Focus on how you feel!\n\nWant specific nutrition advice?",
  analyze:
    "Here's your week at a glance 📊\n\n📅 Days logged: 6/7 — amazing consistency!\n🔥 Avg calories: 1,572 / 1,800 goal (87%)\n💪 Avg protein: 58g / 120g goal — needs attention!\n🌾 Avg carbs: 195g / 225g goal (87%)\n💧 Water: 5.2 / 8 glasses avg\n\n⭐ Biggest win: You've logged every breakfast this week!\n\n🎯 Focus for next week: Protein is your biggest gap. Try adding a protein-rich food to each meal — even small amounts add up significantly.\n\nKeep going — you're building a real habit! 🌿",
  vegetarian:
    "Awesome choice! 🌱 Here are great vegetarian protein sources:\n\n💪 High protein options:\n• Lentils (18g per cup)\n• Greek yogurt (17g per cup)\n• Chickpeas (15g per cup)\n• Tofu (20g per cup)\n• Eggs (6g each)\n• Quinoa (8g per cup)\n• Edamame (17g per cup)\n\nWant vegetarian meal ideas or specific recipes?",
  vegan:
    "Plant-based eating! 🌱\n\nGreat vegan protein sources:\n• Tofu & tempeh\n• Lentils & beans\n• Quinoa & farro\n• Nutritional yeast\n• Nuts & seeds\n• Pea protein powder\n\nMake sure you're getting:\n✅ B12 (supplement)\n✅ Iron (beans, spinach + vitamin C)\n✅ Omega-3s (flaxseed, chia, walnuts)\n✅ Protein (aim for variety)\n\nNeed vegan meal ideas?",
};

function getAIResponse(input: string): string {
  const lower = input.toLowerCase();

  // Greetings
  if (lower.match(/^(hi|hello|hey|good morning|good afternoon|good evening|greetings)/)) {
    return "Hi there! 🌿 How can I help you today? I can suggest meals, answer nutrition questions, or just chat about your wellness journey!";
  }

  // Meals
  if (lower.includes('breakfast') || lower.includes('morning') || lower.includes('brunch')) return AI_RESPONSES.breakfast;
  if (lower.includes('lunch') || lower.includes('midday')) return AI_RESPONSES.lunch;
  if (lower.includes('dinner') || lower.includes('supper') || lower.includes('evening meal')) return AI_RESPONSES.dinner;

  // Nutrients
  if (lower.includes('protein') || lower.includes('macro')) return AI_RESPONSES.protein;
  if (lower.includes('calorie') || lower.includes('kcal') || lower.includes('energy')) return AI_RESPONSES.calories;
  if (lower.includes('water') || lower.includes('hydrat') || lower.includes('drink')) return AI_RESPONSES.water;

  // Food types
  if (lower.includes('snack')) return AI_RESPONSES.snack;
  if (lower.includes('recipe') || lower.includes('how to make') || lower.includes('how do i cook')) return AI_RESPONSES.recipe;
  if (lower.includes('vegetarian')) return AI_RESPONSES.vegetarian;
  if (lower.includes('vegan') || lower.includes('plant-based')) return AI_RESPONSES.vegan;

  // General health
  if (lower.includes('healthy') || lower.includes('nutrition') || lower.includes('balanced')) return AI_RESPONSES.healthy;
  if (lower.includes('lose weight') || lower.includes('weight loss') || lower.includes('lose fat')) return AI_RESPONSES.weight;
  if (lower.includes('gain muscle') || lower.includes('build muscle') || lower.includes('bulk')) {
    return "Building muscle! 💪\n\nKey factors:\n\n1. **Protein**: Aim for 1.6-2.2g per kg body weight\n2. **Calories**: Slight surplus (200-300 kcal above maintenance)\n3. **Strength training**: Progressive overload\n4. **Rest**: Muscles grow during recovery!\n\nHigh-protein foods:\n• Chicken, fish, lean beef\n• Greek yogurt, cottage cheese\n• Eggs\n• Beans, lentils, tofu\n\nNeed a muscle-building meal plan?";
  }

  // Appetite/mood
  if (lower.includes('hungry') || lower.includes('appetite') || lower.includes('not hungry') || lower.includes('eat today'))
    return AI_RESPONSES.hungry;
  if (
    lower.includes('feel better') || lower.includes('scared') || lower.includes('afraid') ||
    lower.includes('anxiety') || lower.includes('anxious') || lower.includes('disorder') ||
    lower.includes('fear') || lower.includes('worried') || lower.includes('stress')
  )
    return AI_RESPONSES.anxiety;

  // Analytics
  if (lower.includes('analyze') || lower.includes('week') || lower.includes('progress') || lower.includes('stats') || lower.includes('goal'))
    return AI_RESPONSES.analyze;

  // Help/questions
  if (lower.includes('help') || lower.includes('what can you') || lower.includes('how do you')) {
    return "I'm your Nourish AI companion! 🌿 Here's how I can help:\n\n🍳 **Meal Planning** - Breakfast, lunch, dinner ideas\n💪 **Nutrition Advice** - Macros, calories, hydration\n📊 **Track Progress** - Analyze your eating patterns\n💙 **Supportive Guidance** - Non-judgmental, compassionate help\n🥗 **Recipes & Tips** - Healthy eating made easy\n\nWhat would you like help with today?";
  }

  // Specific foods
  if (lower.includes('chicken') || lower.includes('salmon') || lower.includes('fish') ||
      lower.includes('beef') || lower.includes('pork') || lower.includes('turkey')) {
    return `Great protein choice! 🍗\n\nHere are some healthy ways to prepare it:\n\n• Grilled with herbs & spices\n• Baked with vegetables\n• Stir-fried with veggies\n• Slow-cooked in healthy sauces\n\nAvoid deep frying - opt for grilling, baking, or sautéing with minimal oil.\n\nWant a specific recipe?`;
  }

  return AI_RESPONSES.default;
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
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: text.trim(), time: now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: getAIResponse(text),
        time: now(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1400 + Math.random() * 600);
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
            onClick={() => sendMessage(reply)}
            className="shrink-0 rounded-full px-3 py-1.5 border border-[#D8F3DC] bg-white whitespace-nowrap transition-all active:bg-[#D8F3DC]"
            style={{ fontSize: '11px', fontWeight: 700, color: '#2D6A4F' }}
          >
            {reply}
          </button>
        ))}
      </div>

      {/* ED Support banner (pinned at bottom occasionally) */}
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
            onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
            placeholder="Ask me anything about nutrition..."
            className="flex-1 bg-transparent outline-none"
            style={{ fontSize: '14px', fontWeight: 500, color: '#1B1B1B' }}
          />
          <button>
            <Mic size={15} color="#9CA3AF" />
          </button>
        </div>
        <motion.button
          onClick={() => sendMessage(input)}
          disabled={!input.trim()}
          whileTap={{ scale: 0.9 }}
          className="flex items-center justify-center rounded-2xl shrink-0 transition-all"
          style={{
            width: '44px',
            height: '44px',
            background: input.trim() ? 'linear-gradient(135deg, #2D6A4F, #52B788)' : '#E5E7EB',
            boxShadow: input.trim() ? '0 4px 14px rgba(45,106,79,0.35)' : 'none',
          }}
        >
          <Send size={17} color={input.trim() ? 'white' : '#9CA3AF'} />
        </motion.button>
      </div>
    </div>
  );
}
