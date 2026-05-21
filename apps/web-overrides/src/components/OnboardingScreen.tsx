import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Leaf, Heart, Check, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface OnboardingScreenProps {
  onComplete?: (name: string, goal: string) => void;
}

const slides = [
  {
    id: 0,
    title: 'Welcome to\nNourish AI',
    subtitle:
      'Your personal AI-powered nutrition companion — built to help you eat well, feel great, and build a truly healthy relationship with food.',
    image: 'https://images.unsplash.com/photo-1661257711676-79a0fc533569?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    badge: '🌿 AI-Powered',
  },
  {
    id: 1,
    title: 'Snap. Analyze.\nKnow.',
    subtitle:
      'Take a photo of any meal and our AI instantly breaks down calories, macros, vitamins, and proteins — tailored to your unique body and goals.',
    image: 'https://images.unsplash.com/photo-1731338789516-bffadd074e0a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    badge: '📸 Food Scanner',
  },
  {
    id: 2,
    title: 'A Safe Space\nFor Your Journey',
    subtitle:
      "Whether you're recovering from an eating disorder, managing weight, or simply eating healthier — Nourish meets you exactly where you are, without judgment.",
    image: 'https://images.unsplash.com/photo-1675354358496-53598b43040f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    badge: '💙 Safe & Supportive',
  },
];

function TrendDown({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
      <polyline points="16 17 22 17 22 11" />
    </svg>
  );
}

function TrendUp({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

const goals = [
  { id: 'balanced', icon: Leaf, label: 'Balanced Eating', desc: 'Eat well every day', color: '#52B788', bg: '#D8F3DC' },
  { id: 'loss', icon: TrendDown, label: 'Lose Weight', desc: 'Healthy fat loss', color: '#F59E0B', bg: '#FEF3C7' },
  { id: 'gain', icon: TrendUp, label: 'Gain Muscle', desc: 'Build strength', color: '#60A5FA', bg: '#DBEAFE' },
  { id: 'recovery', icon: Heart, label: 'ED Recovery', desc: 'Heal your relationship with food', color: '#F87171', bg: '#FEE2E2' },
];

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('balanced');
  const [direction, setDirection] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isLastSlide = step === slides.length - 1;
  const isSetupStep = step === slides.length;

  const goNext = () => {
    if (isLastSlide) {
      setDirection(1);
      setStep(slides.length);
    } else {
      setDirection(1);
      setStep((s) => s + 1);
    }
  };

  const goPrev = () => {
    setDirection(-1);
    setStep((s) => Math.max(0, s - 1));
  };

  const isFormValid =
    name.trim() !== '' &&
    email.trim() !== '' &&
    password.trim() !== '' &&
    password === confirmPassword;

  const handleComplete = async () => {
    if (!isFormValid) return;
    setError('');
    setIsLoading(true);

    try {
      await signup(name.trim(), email.trim(), password);

      // Save goal preferences — best-effort, non-blocking on failure
      try {
        await api.post('/api/user-goals', {
          goalType: selectedGoal,
          ...(age.trim() ? { age: parseInt(age.trim(), 10) } : {}),
        });
      } catch {
        // Non-critical — proceed regardless
      }

      if (onComplete) {
        onComplete(name.trim(), selectedGoal);
      } else {
        navigate('/');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSetupStep) {
    return (
      <div className="flex flex-col h-full bg-[#F8FAF9]" style={{ minHeight: 'calc(100dvh - 116px)' }}>
        {/* Header */}
        <div
          className="shrink-0 px-6 pt-4 pb-6"
          style={{ background: 'linear-gradient(160deg, #1B4332 0%, #2D6A4F 100%)' }}
        >
          <button onClick={goPrev} className="text-white/70 mb-4 flex items-center gap-1" style={{ fontSize: '14px' }}>
            ← Back
          </button>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center justify-center rounded-xl" style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.15)' }}>
              <Sparkles size={16} color="white" />
            </div>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 700 }}>Almost there!</span>
          </div>
          <h1 className="text-white" style={{ fontSize: '26px', fontWeight: 800, lineHeight: 1.2 }}>
            Personalize your{'\n'}experience
          </h1>
          <p className="text-white/70 mt-2" style={{ fontSize: '14px' }}>
            This helps our AI give you the most accurate recommendations.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl p-3 mb-4"
              style={{ background: '#FEE2E2', border: '1px solid #FCA5A5' }}
            >
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#DC2626', textAlign: 'center' }}>
                {error}
              </p>
            </motion.div>
          )}

          {/* Name Input */}
          <div className="mb-4">
            <label className="block mb-2 text-[#1B4332]" style={{ fontSize: '14px', fontWeight: 700 }}>
              What should we call you?
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name or nickname"
              className="w-full rounded-2xl border-2 border-[#D8F3DC] bg-white px-4 py-3 text-[#1B1B1B] outline-none focus:border-[#52B788] transition-colors"
              style={{ fontSize: '16px', fontWeight: 500 }}
              disabled={isLoading}
            />
          </div>

          {/* Email Input */}
          <div className="mb-4">
            <label className="block mb-2 text-[#1B4332]" style={{ fontSize: '14px', fontWeight: 700 }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-2xl border-2 border-[#D8F3DC] bg-white px-4 py-3 text-[#1B1B1B] outline-none focus:border-[#52B788] transition-colors"
              style={{ fontSize: '16px', fontWeight: 500 }}
              disabled={isLoading}
            />
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <label className="block mb-2 text-[#1B4332]" style={{ fontSize: '14px', fontWeight: 700 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a secure password"
              className="w-full rounded-2xl border-2 border-[#D8F3DC] bg-white px-4 py-3 text-[#1B1B1B] outline-none focus:border-[#52B788] transition-colors"
              style={{ fontSize: '16px', fontWeight: 500 }}
              disabled={isLoading}
            />
          </div>

          {/* Confirm Password Input */}
          <div className="mb-4">
            <label className="block mb-2 text-[#1B4332]" style={{ fontSize: '14px', fontWeight: 700 }}>
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className="w-full rounded-2xl border-2 border-[#D8F3DC] bg-white px-4 py-3 text-[#1B1B1B] outline-none focus:border-[#52B788] transition-colors"
              style={{ fontSize: '16px', fontWeight: 500 }}
              disabled={isLoading}
            />
            {confirmPassword && password !== confirmPassword && (
              <p style={{ fontSize: '12px', color: '#EF4444', marginTop: '6px', fontWeight: 600 }}>
                Passwords do not match
              </p>
            )}
          </div>

          {/* Age Input */}
          <div className="mb-6">
            <label className="block mb-2 text-[#1B4332]" style={{ fontSize: '14px', fontWeight: 700 }}>
              Age (Optional)
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Your age"
              className="w-full rounded-2xl border-2 border-[#D8F3DC] bg-white px-4 py-3 text-[#1B1B1B] outline-none focus:border-[#52B788] transition-colors"
              style={{ fontSize: '16px', fontWeight: 500 }}
              disabled={isLoading}
            />
          </div>

          {/* Goal Selection */}
          <div className="mb-8">
            <label className="block mb-3 text-[#1B4332]" style={{ fontSize: '14px', fontWeight: 700 }}>
              What's your primary goal?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {goals.map(({ id, icon: Icon, label, desc, color, bg }) => (
                <button
                  key={id}
                  onClick={() => setSelectedGoal(id)}
                  className="relative flex flex-col items-center gap-2 rounded-3xl p-4 border-2 transition-all duration-200 text-left"
                  style={{
                    background: selectedGoal === id ? bg : 'white',
                    borderColor: selectedGoal === id ? color : '#E8F4ED',
                  }}
                  disabled={isLoading}
                >
                  {selectedGoal === id && (
                    <div
                      className="absolute top-2 right-2 rounded-full flex items-center justify-center"
                      style={{ width: '20px', height: '20px', background: color }}
                    >
                      <Check size={12} color="white" strokeWidth={3} />
                    </div>
                  )}
                  <div
                    className="flex items-center justify-center rounded-2xl self-start"
                    style={{ width: '44px', height: '44px', background: selectedGoal === id ? color + '30' : '#F3F4F6' }}
                  >
                    <Icon size={22} color={selectedGoal === id ? color : '#9CA3AF'} />
                  </div>
                  <div className="self-start">
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: selectedGoal === id ? color : '#374151',
                        display: 'block',
                        lineHeight: 1.3,
                      }}
                    >
                      {label}
                    </span>
                    <span style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 500 }}>{desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Safety notice for ED recovery */}
          {selectedGoal === 'recovery' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-2xl p-4"
              style={{ background: '#F0F9FF', border: '1px solid #BAE6FD' }}
            >
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#0369A1' }}>
                💙 You're brave for being here
              </p>
              <p style={{ fontSize: '12px', color: '#0C4A6E', marginTop: '6px', lineHeight: 1.6 }}>
                Nourish provides gentle, compassionate, and non-judgmental support for your recovery journey. For clinical care, please also connect with a medical professional or the <strong>NEDA Helpline: 1-800-931-2237</strong>.
              </p>
            </motion.div>
          )}

          {/* CTA */}
          <motion.button
            onClick={handleComplete}
            disabled={!isFormValid || isLoading}
            whileTap={{ scale: 0.97 }}
            className="w-full rounded-full py-4 transition-all duration-200"
            style={{
              background: isFormValid && !isLoading ? 'linear-gradient(135deg, #2D6A4F, #52B788)' : '#D1D5DB',
              color: 'white',
              fontSize: '16px',
              fontWeight: 800,
              letterSpacing: '-0.2px',
              opacity: isFormValid && !isLoading ? 1 : 0.6,
              boxShadow: isFormValid && !isLoading ? '0 8px 24px rgba(45,106,79,0.4)' : 'none',
              cursor: isFormValid && !isLoading ? 'pointer' : 'not-allowed',
            }}
          >
            {isLoading ? 'Creating your account…' : 'Start My Journey 🚀'}
          </motion.button>
          <p style={{ fontSize: '11px', color: '#9CA3AF', textAlign: 'center', marginTop: '12px', lineHeight: 1.5 }}>
            Your privacy matters — data is encrypted and stored securely
          </p>
        </div>
      </div>
    );
  }

  const slide = slides[step];

  return (
    <div className="flex flex-col h-full relative overflow-hidden" style={{ minHeight: 'calc(100dvh - 116px)' }}>
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          initial={{ opacity: 0, x: direction * 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -direction * 60 }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0 flex flex-col"
        >
          {/* Hero Image */}
          <div className="relative flex-1 min-h-0">
            <img
              src={slide.image}
              alt="Nourish"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 25%, rgba(27,67,50,0.6) 60%, rgba(27,67,50,0.98) 100%)',
              }}
            />

            {/* Logo + Badge */}
            <div className="absolute top-4 left-6 right-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src="/src/import-1/Trackify.png"
                  alt="Trackify"
                  style={{ height: '36px', maxWidth: '150px', objectFit: 'contain' }}
                />
              </div>
              <div
                className="rounded-full px-3 py-1"
                style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}
              >
                <span style={{ color: 'white', fontSize: '11px', fontWeight: 700 }}>{slide.badge}</span>
              </div>
            </div>

            {/* Text content */}
            <div className="absolute bottom-0 left-0 right-0 px-6 pb-8">
              <h1
                style={{
                  color: 'white',
                  fontSize: '32px',
                  fontWeight: 900,
                  lineHeight: 1.15,
                  letterSpacing: '-0.8px',
                  whiteSpace: 'pre-line',
                  marginBottom: '12px',
                }}
              >
                {slide.title}
              </h1>
              <p
                style={{
                  color: 'rgba(255,255,255,0.85)',
                  fontSize: '14px',
                  lineHeight: 1.7,
                  fontWeight: 500,
                }}
              >
                {slide.subtitle}
              </p>
            </div>
          </div>

          {/* Bottom controls */}
          <div
            className="shrink-0 flex items-center justify-between px-6 py-5"
            style={{ background: '#1B4332' }}
          >
            {/* Dots */}
            <div className="flex items-center gap-2">
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className="cursor-pointer"
                  style={{ padding: 0, border: 'none', background: 'transparent' }}
                >
                  <motion.div
                    className="rounded-full"
                    animate={{
                      width: i === step ? 24 : 8,
                      background: i === step ? '#52B788' : 'rgba(255,255,255,0.3)',
                    }}
                    transition={{ duration: 0.3 }}
                    style={{ height: '8px' }}
                  />
                </button>
              ))}
            </div>

            {/* Next button */}
            <motion.button
              onClick={goNext}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 rounded-full px-6 py-3 transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #52B788, #40916C)',
                color: 'white',
                fontSize: '15px',
                fontWeight: 800,
                boxShadow: '0 4px 16px rgba(82,183,136,0.4)',
              }}
            >
              {isLastSlide ? 'Get Started' : 'Next'}
              <ChevronRight size={18} strokeWidth={3} />
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
