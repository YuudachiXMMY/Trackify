import { useState } from 'react';
import { Camera, Upload, X, CheckCircle, RotateCcw, Info, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const AVOCADO_TOAST = 'https://images.unsplash.com/photo-1623691751811-25db777cb59a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600';
const SALMON = 'https://images.unsplash.com/photo-1773969423899-01812e1537f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600';
const SMOOTHIE = 'https://images.unsplash.com/photo-1601091566377-17adfa2fa02e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200';

type ScanState = 'idle' | 'scanning' | 'result' | 'logged';

const MOCK_RESULTS = [
  {
    name: 'Avocado Toast',
    confidence: 98,
    image: AVOCADO_TOAST,
    calories: 320,
    protein: 12,
    carbs: 38,
    fat: 14,
    fiber: 8,
    servingSize: '1 slice (180g)',
    healthScore: 87,
    nutrients: [
      { name: 'Calories', value: '320', unit: 'kcal', daily: 16, color: '#F59E0B' },
      { name: 'Protein', value: '12', unit: 'g', daily: 24, color: '#60A5FA' },
      { name: 'Carbohydrates', value: '38', unit: 'g', daily: 13, color: '#F59E0B' },
      { name: 'Fat', value: '14', unit: 'g', daily: 18, color: '#F87171' },
      { name: 'Fiber', value: '8', unit: 'g', daily: 29, color: '#34D399' },
      { name: 'Vitamin E', value: '4.2', unit: 'mg', daily: 28, color: '#A78BFA' },
      { name: 'Potassium', value: '487', unit: 'mg', daily: 10, color: '#F472B6' },
      { name: 'Iron', value: '2.1', unit: 'mg', daily: 12, color: '#FB923C' },
    ],
    tags: ['High Fiber', 'Healthy Fats', 'Plant-Based'],
    aiNote: 'Excellent choice! This meal provides heart-healthy monounsaturated fats from avocado and complex carbs. Consider adding an egg for an extra 6g of protein.',
  },
];

const MOCK_RESULT = MOCK_RESULTS[0];

const SCAN_STEPS = [
  { icon: '🔍', text: 'Identifying food item...' },
  { icon: '🧬', text: 'Analyzing ingredients...' },
  { icon: '📊', text: 'Calculating macros & micros...' },
  { icon: '✅', text: 'Generating AI insights...' },
];

export function ScanScreen() {
  const [state, setState] = useState<ScanState>('idle');
  const [selectedMeal, setSelectedMeal] = useState('lunch');
  const [showAllergenInfo, setShowAllergenInfo] = useState(false);
  const [expandNutrients, setExpandNutrients] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const handleScan = () => {
    setState('scanning');
    setCurrentStep(0);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setCurrentStep(step);
      if (step >= SCAN_STEPS.length - 1) {
        clearInterval(interval);
        setTimeout(() => setState('result'), 600);
      }
    }, 650);
  };

  const handleLog = () => {
    setState('logged');
    setTimeout(() => setState('idle'), 3200);
  };

  const handleReset = () => {
    setState('idle');
    setExpandNutrients(false);
  };

  const healthColor = MOCK_RESULT.healthScore >= 80 ? '#52B788' : MOCK_RESULT.healthScore >= 60 ? '#F59E0B' : '#F87171';

  return (
    <div className="flex flex-col bg-[#F8FAF9] min-h-full">
      {/* Header */}
      <div
        className="px-5 pt-2 pb-4"
        style={{ background: 'linear-gradient(160deg, #1B4332 0%, #2D6A4F 100%)' }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={16} color="rgba(255,255,255,0.7)" />
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: 700 }}>AI Food Scanner</span>
        </div>
        <h1 style={{ color: 'white', fontSize: '22px', fontWeight: 900, letterSpacing: '-0.4px' }}>
          Scan Your Food 📸
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', fontWeight: 500, marginTop: '2px' }}>
          Take or upload a photo — our AI analyzes everything instantly
        </p>
      </div>

      <div className="flex-1 px-4 py-4">
        <AnimatePresence mode="wait">

          {/* IDLE STATE */}
          {state === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              {/* Camera Viewfinder */}
              <div
                className="relative rounded-3xl overflow-hidden mb-4 flex items-center justify-center"
                style={{
                  height: '220px',
                  background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)',
                }}
              >
                {/* Corner brackets */}
                {[
                  'top-5 left-5 border-t-[3px] border-l-[3px]',
                  'top-5 right-5 border-t-[3px] border-r-[3px]',
                  'bottom-5 left-5 border-b-[3px] border-l-[3px]',
                  'bottom-5 right-5 border-b-[3px] border-r-[3px]',
                ].map((cls, i) => (
                  <div
                    key={i}
                    className={`absolute ${cls} border-white/70`}
                    style={{ width: '28px', height: '28px', borderRadius: '4px' }}
                  />
                ))}

                {/* Grid overlay */}
                <div className="absolute inset-0 opacity-10">
                  {[1, 2].map((i) => (
                    <div
                      key={`h${i}`}
                      className="absolute left-0 right-0 border-t border-white"
                      style={{ top: `${(i / 3) * 100}%` }}
                    />
                  ))}
                  {[1, 2].map((i) => (
                    <div
                      key={`v${i}`}
                      className="absolute top-0 bottom-0 border-l border-white"
                      style={{ left: `${(i / 3) * 100}%` }}
                    />
                  ))}
                </div>

                <div className="flex flex-col items-center gap-2 z-10">
                  <div
                    className="flex items-center justify-center rounded-full"
                    style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.12)', border: '2px dashed rgba(255,255,255,0.4)' }}
                  >
                    <Camera size={28} color="rgba(255,255,255,0.8)" />
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, textAlign: 'center' }}>
                    Point camera at your food
                  </p>
                </div>

                {/* Scan line animation */}
                <motion.div
                  className="absolute left-10 right-10"
                  style={{ height: '2px', background: 'linear-gradient(90deg, transparent, #52B788, transparent)' }}
                  animate={{ top: ['15%', '85%', '15%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* AI badge */}
                <div
                  className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full px-2 py-1"
                  style={{ background: 'rgba(82,183,136,0.25)', backdropFilter: 'blur(8px)', border: '1px solid rgba(82,183,136,0.4)' }}
                >
                  <Sparkles size={10} color="#95D5B2" />
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#95D5B2' }}>AI Ready</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <motion.button
                  onClick={handleScan}
                  whileTap={{ scale: 0.96 }}
                  className="flex flex-col items-center gap-2 rounded-3xl py-5 transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #2D6A4F, #52B788)',
                    boxShadow: '0 6px 20px rgba(45,106,79,0.35)',
                  }}
                >
                  <Camera size={26} color="white" />
                  <span style={{ color: 'white', fontSize: '14px', fontWeight: 800 }}>Take Photo</span>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px', fontWeight: 600 }}>Best accuracy</span>
                </motion.button>
                <motion.button
                  onClick={handleScan}
                  whileTap={{ scale: 0.96 }}
                  className="flex flex-col items-center gap-2 rounded-3xl py-5 border-2 border-[#D8F3DC] bg-white transition-all"
                >
                  <Upload size={26} color="#2D6A4F" />
                  <span style={{ color: '#2D6A4F', fontSize: '14px', fontWeight: 800 }}>Upload Photo</span>
                  <span style={{ color: '#9CA3AF', fontSize: '10px', fontWeight: 600 }}>From gallery</span>
                </motion.button>
              </div>

              {/* AI capabilities */}
              <div className="rounded-2xl bg-white p-3 mb-4" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <p style={{ fontSize: '12px', fontWeight: 800, color: '#1B4332', marginBottom: '8px' }}>🤖 AI Detects</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: '🔥', label: 'Calories' },
                    { icon: '💪', label: 'Protein' },
                    { icon: '🌾', label: 'Carbs' },
                    { icon: '🫒', label: 'Healthy Fats' },
                    { icon: '🥦', label: 'Vitamins' },
                    { icon: '⚡', label: 'Minerals' },
                  ].map(({ icon, label }) => (
                    <div
                      key={label}
                      className="flex items-center gap-1.5 rounded-xl px-2 py-1.5"
                      style={{ background: '#F8FAF9' }}
                    >
                      <span style={{ fontSize: '13px' }}>{icon}</span>
                      <span style={{ fontSize: '10px', fontWeight: 600, color: '#374151' }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent scans */}
              <div>
                <p style={{ fontSize: '14px', fontWeight: 800, color: '#1B4332', marginBottom: '10px' }}>
                  Recent Scans
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { name: 'Avocado Toast', cal: 320, img: AVOCADO_TOAST },
                    { name: 'Grilled Salmon', cal: 420, img: SALMON },
                    { name: 'Smoothie Bowl', cal: 280, img: SMOOTHIE },
                  ].map((item) => (
                    <motion.button
                      key={item.name}
                      whileTap={{ scale: 0.95 }}
                      className="relative rounded-2xl overflow-hidden transition-all"
                      style={{ height: '88px' }}
                    >
                      <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute bottom-1.5 left-1.5 right-1.5">
                        <p style={{ fontSize: '9px', fontWeight: 700, color: 'white', lineHeight: 1.2 }}>{item.name}</p>
                        <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{item.cal} kcal</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* SCANNING STATE */}
          {state === 'scanning' && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center"
              style={{ minHeight: '400px' }}
            >
              {/* Animated rings */}
              <div className="relative flex items-center justify-center mb-8" style={{ width: '160px', height: '160px' }}>
                <motion.div
                  className="absolute rounded-full border-4 border-transparent"
                  style={{ width: '160px', height: '160px', borderTopColor: '#52B788', borderRightColor: '#52B788' }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div
                  className="absolute rounded-full border-4 border-transparent"
                  style={{ width: '120px', height: '120px', borderTopColor: '#B7E4C7', borderLeftColor: '#B7E4C7' }}
                  animate={{ rotate: -360 }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div
                  className="absolute rounded-full"
                  style={{ width: '88px', height: '88px', background: 'linear-gradient(135deg, #1B4332, #2D6A4F)' }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="relative" style={{ fontSize: '36px' }}>🔍</span>
              </div>

              <motion.h2
                style={{ fontSize: '20px', fontWeight: 900, color: '#1B4332', marginBottom: '6px' }}
                animate={{ opacity: [1, 0.7, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Analyzing your food...
              </motion.h2>
              <p style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500, marginBottom: '28px' }}>
                AI is scanning ingredients & nutrients
              </p>

              <div className="w-full max-w-xs">
                {SCAN_STEPS.map((step, i) => (
                  <motion.div
                    key={step.text}
                    className="flex items-center gap-3 mb-3"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: i <= currentStep ? 1 : 0.3, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <motion.div
                      className="flex items-center justify-center rounded-full shrink-0"
                      style={{
                        width: '28px',
                        height: '28px',
                        background: i <= currentStep ? '#D8F3DC' : '#F3F4F6',
                      }}
                      animate={i <= currentStep ? { scale: [1, 1.15, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      {i <= currentStep ? (
                        <CheckCircle size={15} color="#52B788" />
                      ) : (
                        <span style={{ fontSize: '13px' }}>{step.icon}</span>
                      )}
                    </motion.div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: i <= currentStep ? '#1B4332' : '#9CA3AF' }}>
                      {step.text}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* RESULT STATE */}
          {state === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Food card */}
              <div className="rounded-3xl overflow-hidden bg-white mb-3" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                <div className="relative" style={{ height: '170px' }}>
                  <img src={MOCK_RESULT.image} alt={MOCK_RESULT.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full px-3 py-1" style={{ background: '#D8F3DC' }}>
                    <CheckCircle size={11} color="#2D6A4F" />
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#2D6A4F' }}>{MOCK_RESULT.confidence}% match</span>
                  </div>
                  <div
                    className="absolute top-3 right-3 flex items-center gap-1 rounded-full px-2 py-1"
                    style={{ background: healthColor + '25', border: `1px solid ${healthColor}50` }}
                  >
                    <span style={{ fontSize: '10px', fontWeight: 800, color: healthColor }}>Health Score</span>
                    <span style={{ fontSize: '12px', fontWeight: 900, color: healthColor }}>{MOCK_RESULT.healthScore}</span>
                  </div>
                  <button
                    onClick={handleReset}
                    className="absolute bottom-3 right-3 flex items-center justify-center rounded-full"
                    style={{ width: '28px', height: '28px', background: 'rgba(0,0,0,0.5)' }}
                  >
                    <X size={14} color="white" />
                  </button>
                  <div className="absolute bottom-3 left-4">
                    <h2 style={{ color: 'white', fontSize: '20px', fontWeight: 900 }}>{MOCK_RESULT.name}</h2>
                    <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', fontWeight: 600 }}>
                      Serving: {MOCK_RESULT.servingSize}
                    </p>
                  </div>
                </div>

                {/* Tags */}
                <div className="px-4 pt-3 pb-2 flex gap-2 flex-wrap">
                  {MOCK_RESULT.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full px-3 py-1"
                      style={{ background: '#D8F3DC', color: '#2D6A4F', fontSize: '11px', fontWeight: 700 }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Macro summary row */}
                <div className="grid grid-cols-4 gap-0 px-4 py-3 border-t border-[#F3F4F6]">
                  {[
                    { label: 'Calories', value: MOCK_RESULT.calories, unit: '', color: '#F59E0B', bg: '#FEF3C7', emoji: '🔥' },
                    { label: 'Protein', value: MOCK_RESULT.protein, unit: 'g', color: '#60A5FA', bg: '#DBEAFE', emoji: '💪' },
                    { label: 'Carbs', value: MOCK_RESULT.carbs, unit: 'g', color: '#F59E0B', bg: '#FEF3C7', emoji: '🌾' },
                    { label: 'Fat', value: MOCK_RESULT.fat, unit: 'g', color: '#F87171', bg: '#FEE2E2', emoji: '🫒' },
                  ].map(({ label, value, unit, color, bg, emoji }) => (
                    <div key={label} className="flex flex-col items-center">
                      <div
                        className="flex items-center justify-center rounded-2xl mb-1"
                        style={{ width: '44px', height: '44px', background: bg }}
                      >
                        <span style={{ fontSize: '18px' }}>{emoji}</span>
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: 900, color }}>{value}{unit}</span>
                      <span style={{ fontSize: '9px', fontWeight: 600, color: '#9CA3AF' }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Insight */}
              <div
                className="rounded-2xl p-3 mb-3 flex items-start gap-3"
                style={{ background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', border: '1.5px solid #BBF7D0' }}
              >
                <Sparkles size={16} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 800, color: '#15803D', marginBottom: '3px' }}>AI INSIGHT</p>
                  <p style={{ fontSize: '12px', color: '#14532D', fontWeight: 500, lineHeight: 1.5 }}>
                    {MOCK_RESULT.aiNote}
                  </p>
                </div>
              </div>

              {/* Nutrition breakdown */}
              <div className="rounded-3xl bg-white mb-3 overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <button
                  className="w-full flex items-center justify-between p-4"
                  onClick={() => setExpandNutrients(!expandNutrients)}
                >
                  <div className="flex items-center gap-2">
                    <Info size={15} color="#2D6A4F" />
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#1B4332' }}>Full Nutrition Facts</span>
                  </div>
                  {expandNutrients ? (
                    <ChevronUp size={16} color="#9CA3AF" />
                  ) : (
                    <ChevronDown size={16} color="#9CA3AF" />
                  )}
                </button>
                <AnimatePresence>
                  {expandNutrients && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4">
                        {MOCK_RESULT.nutrients.map(({ name, value, unit, daily, color }) => (
                          <div key={name} className="mb-3">
                            <div className="flex justify-between mb-1">
                              <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>{name}</span>
                              <span style={{ fontSize: '12px', fontWeight: 700, color: '#1B4332' }}>
                                {value}{unit} <span style={{ color: '#9CA3AF', fontWeight: 500 }}>({daily}% DV)</span>
                              </span>
                            </div>
                            <div className="rounded-full overflow-hidden" style={{ height: '5px', background: '#F3F4F6' }}>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${daily}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                className="h-full rounded-full"
                                style={{ background: color }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Meal timing selector */}
              <div className="rounded-2xl bg-white p-4 mb-4" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#1B4332', marginBottom: '10px' }}>
                  Add to meal
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {['breakfast', 'lunch', 'dinner', 'snack'].map((m) => (
                    <button
                      key={m}
                      onClick={() => setSelectedMeal(m)}
                      className="rounded-xl py-2 capitalize transition-all"
                      style={{
                        background: selectedMeal === m ? 'linear-gradient(135deg, #2D6A4F, #52B788)' : '#F3F4F6',
                        color: selectedMeal === m ? 'white' : '#6B7280',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <motion.button
                  onClick={handleReset}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 rounded-2xl py-4 flex items-center justify-center gap-2 border-2 border-[#D8F3DC] bg-white"
                >
                  <RotateCcw size={15} color="#2D6A4F" />
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#2D6A4F' }}>Scan Again</span>
                </motion.button>
                <motion.button
                  onClick={handleLog}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 rounded-2xl py-4 flex items-center justify-center gap-2 transition-all"
                  style={{ background: 'linear-gradient(135deg, #2D6A4F, #52B788)', boxShadow: '0 6px 20px rgba(45,106,79,0.35)' }}
                >
                  <CheckCircle size={15} color="white" />
                  <span style={{ fontSize: '14px', fontWeight: 800, color: 'white' }}>Log Meal</span>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* LOGGED SUCCESS STATE */}
          {state === 'logged' && (
            <motion.div
              key="logged"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center text-center"
              style={{ minHeight: '400px' }}
            >
              <motion.div
                className="flex items-center justify-center rounded-full mb-5"
                style={{ width: '100px', height: '100px', background: 'linear-gradient(135deg, #D8F3DC, #B7E4C7)' }}
                animate={{ scale: [0.8, 1.1, 1] }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                <CheckCircle size={52} color="#2D6A4F" strokeWidth={2} />
              </motion.div>
              <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#1B4332', marginBottom: '8px' }}>
                Meal Logged! 🎉
              </h2>
              <p style={{ fontSize: '14px', color: '#6B7280', fontWeight: 500, maxWidth: '260px', lineHeight: 1.5 }}>
                {MOCK_RESULT.name} has been added to your{' '}
                <span style={{ fontWeight: 800, color: '#2D6A4F' }}>{selectedMeal}</span>.
              </p>
              <div
                className="mt-5 rounded-2xl px-5 py-4"
                style={{ background: '#F0FFF4', border: '1.5px solid #BBF7D0' }}
              >
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#15803D' }}>
                  +{MOCK_RESULT.calories} kcal · +{MOCK_RESULT.protein}g protein
                </p>
                <p style={{ fontSize: '11px', color: '#16A34A', fontWeight: 500, marginTop: '2px' }}>
                  Your daily totals have been updated
                </p>
              </div>
              <div
                className="mt-4 rounded-2xl p-3 flex items-center gap-2"
                style={{ background: '#F8FAF9', border: '1px solid #E8F4ED', maxWidth: '280px' }}
              >
                <Sparkles size={14} color="#52B788" />
                <p style={{ fontSize: '12px', color: '#2D6A4F', fontWeight: 600, lineHeight: 1.4 }}>
                  AI tip: Try adding a side of steamed broccoli to boost your fiber and vitamin C intake!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
