import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  User, Target, Bell, Shield, ChevronRight, Edit2, Leaf,
  LogOut, Heart, Scale, Ruler, Calendar, Flame, Phone, ExternalLink, Camera,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './AuthContext';
import { api } from '../services/api';
import type { UserGoal } from '@trackify/shared';

// ── Static options ─────────────────────────────────────────────────────────────

const GOAL_OPTIONS = [
  { id: 'balanced', label: 'Balanced Eating', emoji: '🥗', color: '#52B788', bg: '#D8F3DC', apiType: 'BALANCED' },
  { id: 'loss',     label: 'Lose Weight',     emoji: '📉', color: '#F59E0B', bg: '#FEF3C7', apiType: 'LOSS'     },
  { id: 'gain',     label: 'Gain Muscle',     emoji: '💪', color: '#60A5FA', bg: '#DBEAFE', apiType: 'GAIN'     },
  { id: 'recovery', label: 'ED Recovery',     emoji: '💙', color: '#F87171', bg: '#FEE2E2', apiType: 'RECOVERY' },
];

const DIETARY_OPTIONS = ['None', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Halal', 'Kosher', 'Paleo'];

const ED_RESOURCES = [
  { name: 'NEDA Helpline',  detail: '1-800-931-2237 · 24/7',       color: '#DC2626', bg: '#FEF2F2', icon: '📞' },
  { name: 'Crisis Text Line', detail: 'Text "NEDA" to 741741',      color: '#7C3AED', bg: '#F5F3FF', icon: '💬' },
  { name: 'ANAD Helpline',  detail: '1-888-375-7767 · Mon–Fri',     color: '#0EA5E9', bg: '#F0F9FF', icon: '🩺' },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

interface ToggleRowProps {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  defaultOn?: boolean;
  accent?: string;
}

function ToggleRow({ icon, label, subtitle, defaultOn = false, accent }: ToggleRowProps) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center gap-3 py-3.5 border-b border-[#F3F4F6] last:border-0">
      <div
        className="flex items-center justify-center rounded-xl shrink-0"
        style={{ width: '36px', height: '36px', background: accent ? `${accent}20` : '#F3F4F6' }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p style={{ fontSize: '14px', fontWeight: 600, color: '#1B1B1B' }}>{label}</p>
        {subtitle && <p style={{ fontSize: '11px', fontWeight: 500, color: '#9CA3AF' }}>{subtitle}</p>}
      </div>
      <button
        onClick={() => setOn(!on)}
        className="relative rounded-full transition-colors duration-300 shrink-0"
        style={{ width: '46px', height: '26px', background: on ? '#2D6A4F' : '#D1D5DB' }}
      >
        <motion.div
          className="absolute top-[3px] rounded-full bg-white"
          style={{ width: '20px', height: '20px' }}
          animate={{ left: on ? '23px' : '3px' }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        />
      </button>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  editable?: boolean;
}

function StatCard({ icon, label, value, editable }: StatCardProps) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
  return (
    <div
      className="flex flex-col items-center rounded-2xl py-3 px-2"
      style={{ background: 'rgba(255,255,255,0.12)' }}
    >
      {icon}
      {editing ? (
        <input
          autoFocus
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={() => setEditing(false)}
          className="w-full text-center bg-transparent border-b border-white/40 outline-none mt-1"
          style={{ fontSize: '14px', fontWeight: 900, color: 'white', width: '60px' }}
        />
      ) : (
        <button onClick={() => editable && setEditing(true)}>
          <span style={{ fontSize: '14px', fontWeight: 900, color: 'white', marginTop: '2px', display: 'block' }}>{val}</span>
        </button>
      )}
      <span style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginTop: '1px' }}>{label}</span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function ProfileScreen() {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();

  // Display name: prefer locally edited name, fall back to auth user name
  const authName = user?.name ?? '';
  const [name, setName] = useState(localStorage.getItem('nourish_name') || authName || 'Alex');
  const [profilePicture, setProfilePicture] = useState(localStorage.getItem('nourish_profile_picture') || '');

  // Sync when auth user resolves (first load)
  useEffect(() => {
    if (authName && !localStorage.getItem('nourish_name')) {
      setName(authName);
    }
  }, [authName]);

  // Goals from API
  const [userGoal, setUserGoal] = useState<UserGoal | null>(null);
  const [selectedGoal, setSelectedGoal] = useState(localStorage.getItem('nourish_goal') || 'balanced');
  const [dailyTargets, setDailyTargets] = useState({
    calorieTarget: 1800,
    proteinTarget: 120,
    carbsTarget: 225,
    waterTarget: 8,
  });
  const [savingGoal, setSavingGoal] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;
    api
      .get<UserGoal>('/api/user-goals')
      .then((goals) => {
        setUserGoal(goals);
        const found = GOAL_OPTIONS.find((o) => o.apiType === goals.goalType);
        if (found) setSelectedGoal(found.id);
        setDailyTargets({
          calorieTarget: goals.calorieTarget || 1800,
          proteinTarget: goals.proteinTarget || 120,
          carbsTarget: goals.carbsTarget || 225,
          waterTarget: goals.waterTarget || 8,
        });
      })
      .catch(() => {
        // Fall back to defaults silently
      });
  }, [isLoggedIn]);

  const [dietary, setDietary] = useState('None');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editProfilePicture, setEditProfilePicture] = useState(profilePicture);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const goal = GOAL_OPTIONS.find((g) => g.id === selectedGoal) || GOAL_OPTIONS[0];
  const initials = name.substring(0, 2).toUpperCase();
  const [customDietaryOptions, setCustomDietaryOptions] = useState<string[]>([]);
  const [showDietaryInput, setShowDietaryInput] = useState(false);
  const [newDietaryOption, setNewDietaryOption] = useState('');

  // Persist goal to API and local state
  const handleGoalChange = async (id: string) => {
    setSelectedGoal(id);
    localStorage.setItem('nourish_goal', id);
    const option = GOAL_OPTIONS.find((o) => o.id === id);
    if (!option) return;
    setSavingGoal(true);
    try {
      const updated = await api.patch<UserGoal>('/api/user-goals', { goalType: option.apiType });
      setUserGoal(updated);
    } catch {
      // Local state already updated; silently ignore API error
    } finally {
      setSavingGoal(false);
    }
  };

  const handleReset = () => {
    localStorage.removeItem('nourish_onboarded');
    localStorage.removeItem('nourish_name');
    localStorage.removeItem('nourish_goal');
    localStorage.removeItem('nourish_profile_picture');
    window.location.reload();
  };

  // Uses AuthContext logout — clears token and redirects to /login
  const handleLogout = () => {
    logout();
  };

  const handleOpenEditDialog = () => {
    setEditName(name);
    setEditProfilePicture(profilePicture);
    setIsEditDialogOpen(true);
  };

  const handleSaveProfile = () => {
    setName(editName);
    setProfilePicture(editProfilePicture);
    localStorage.setItem('nourish_name', editName);
    localStorage.setItem('nourish_profile_picture', editProfilePicture);
    setIsEditDialogOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // ── Not logged in ────────────────────────────────────────────────────────────

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F8FAF9]">
        <div
          className="px-5 pt-8 pb-12"
          style={{ background: 'linear-gradient(160deg, #1B4332 0%, #2D6A4F 100%)' }}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <div
              className="flex items-center justify-center rounded-3xl mb-4"
              style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, #52B788, #B7E4C7)' }}
            >
              <Leaf size={40} color="#1B4332" />
            </div>
            <h1 style={{ color: 'white', fontSize: '28px', fontWeight: 900, letterSpacing: '-0.5px' }}>
              Your Profile
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontWeight: 500, marginTop: '6px' }}>
              Sign in to access your account
            </p>
          </motion.div>
        </div>

        <div className="flex-1 px-5 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <button
              onClick={() => navigate('/login')}
              className="w-full rounded-3xl py-5 transition-all active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #2D6A4F, #52B788)', boxShadow: '0 4px 16px rgba(45,106,79,0.3)' }}
            >
              <span style={{ color: 'white', fontSize: '16px', fontWeight: 800 }}>Log In</span>
            </button>

            <button
              onClick={() => navigate('/signup')}
              className="w-full rounded-3xl py-5 bg-white border-2 transition-all active:scale-[0.98]"
              style={{ borderColor: '#2D6A4F', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
            >
              <span style={{ color: '#2D6A4F', fontSize: '16px', fontWeight: 800 }}>Create Account</span>
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="rounded-3xl bg-white p-6 mt-8"
            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1B4332', marginBottom: '16px' }}>
              Why Sign In?
            </h3>
            <div className="space-y-4">
              {[
                { icon: <Target size={20} color="#2D6A4F" />, title: 'Track Your Progress', desc: 'Monitor your nutrition goals and achievements', bg: '#D8F3DC' },
                { icon: <Heart size={20} color="#F87171" />,  title: 'Personalized Support', desc: 'Get tailored recommendations for your wellness journey', bg: '#FEE2E2' },
                { icon: <Shield size={20} color="#A78BFA" />, title: 'Secure & Private',     desc: 'Your data is encrypted and protected', bg: '#F3E8FF' },
              ].map(({ icon, title, desc, bg }) => (
                <div key={title} className="flex items-start gap-3">
                  <div
                    className="flex items-center justify-center rounded-2xl shrink-0"
                    style={{ width: '48px', height: '48px', background: bg }}
                  >
                    {icon}
                  </div>
                  <div className="flex-1 pt-1">
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#1B4332', marginBottom: '2px' }}>{title}</p>
                    <p style={{ fontSize: '12px', fontWeight: 500, color: '#6B7280', lineHeight: 1.4 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl p-4 mt-6"
            style={{ background: 'linear-gradient(135deg, #F0F9FF, #E0F2FE)', border: '1.5px solid #BAE6FD' }}
          >
            <div className="flex items-start gap-3">
              <Heart size={18} color="#0EA5E9" className="shrink-0 mt-0.5" />
              <div>
                <p style={{ fontSize: '12px', fontWeight: 700, color: '#0369A1', marginBottom: '4px' }}>
                  Safe Space for Everyone
                </p>
                <p style={{ fontSize: '11px', fontWeight: 500, color: '#0C4A6E', lineHeight: 1.5 }}>
                  Nourish AI is designed with compassion for all wellness journeys, including eating disorder recovery.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── Logged in ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col bg-[#F8FAF9]">
      {/* Header */}
      <div
        className="px-5 pt-2 pb-6"
        style={{ background: 'linear-gradient(160deg, #1B4332 0%, #2D6A4F 100%)' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Leaf size={16} color="rgba(255,255,255,0.6)" />
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: 700 }}>Nourish</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div
            className="flex items-center justify-center rounded-3xl shrink-0 overflow-hidden"
            style={{
              width: '70px',
              height: '70px',
              background: 'linear-gradient(135deg, #52B788, #B7E4C7)',
              border: '3px solid rgba(255,255,255,0.25)',
            }}
          >
            {profilePicture ? (
              <img src={profilePicture} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span style={{ fontSize: '26px', fontWeight: 900, color: '#1B4332' }}>{initials}</span>
            )}
          </div>

          <div className="flex-1">
            {/* Real name from auth + local edit */}
            <h1 style={{ color: 'white', fontSize: '22px', fontWeight: 900, letterSpacing: '-0.4px' }}>
              {name}
            </h1>
            {/* Real email from auth user */}
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: 500 }}>
              {user?.email ?? 'Member'}
            </p>
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 mt-1.5"
              style={{ background: goal.bg }}
            >
              <span style={{ fontSize: '12px' }}>{goal.emoji}</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: goal.color }}>{goal.label}</span>
            </div>
          </div>

          <button
            onClick={handleOpenEditDialog}
            className="flex items-center justify-center rounded-2xl transition-all active:scale-95"
            style={{ width: '38px', height: '38px', background: 'rgba(255,255,255,0.15)' }}
          >
            <Edit2 size={16} color="white" />
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mt-5">
          <StatCard icon={<Scale size={13} color="#52B788" />}    label="Weight" value="67.1 kg" editable />
          <StatCard icon={<Ruler size={13} color="#60A5FA" />}    label="Height" value="168 cm"  editable />
          <StatCard icon={<Calendar size={13} color="#F59E0B" />} label="Age"    value="19"       editable />
        </div>
      </div>

      <div className="px-4 py-4">

        {/* Goal Section — reads from / writes to API */}
        <div className="rounded-3xl bg-white p-4 mb-3" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Target size={15} color="#2D6A4F" />
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#1B4332' }}>My Goal</h3>
            {savingGoal && (
              <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500, marginLeft: 'auto' }}>
                Saving…
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {GOAL_OPTIONS.map(({ id, label, emoji, color, bg }) => (
              <button
                key={id}
                onClick={() => handleGoalChange(id)}
                className="flex items-center gap-2.5 rounded-2xl px-3 py-3 border-2 transition-all"
                style={{
                  background: selectedGoal === id ? bg : 'white',
                  borderColor: selectedGoal === id ? color : '#E5E7EB',
                }}
              >
                <span style={{ fontSize: '20px' }}>{emoji}</span>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: selectedGoal === id ? color : '#6B7280',
                    textAlign: 'left',
                    lineHeight: 1.3,
                  }}
                >
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Daily Targets — reflects real API data */}
        <div className="rounded-3xl bg-white p-4 mb-3" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Flame size={15} color="#F59E0B" />
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#1B4332' }}>Daily Targets</h3>
          </div>
          {[
            { icon: <Flame size={16} color="#F59E0B" />,              label: 'Calorie Goal', value: `${dailyTargets.calorieTarget.toLocaleString()} kcal`, accent: '#F59E0B' },
            { icon: <span style={{ fontSize: '16px' }}>💪</span>,     label: 'Protein Goal', value: `${dailyTargets.proteinTarget}g`,                      accent: '#60A5FA' },
            { icon: <span style={{ fontSize: '16px' }}>🌾</span>,     label: 'Carbs Goal',   value: `${dailyTargets.carbsTarget}g`,                        accent: '#F59E0B' },
            { icon: <span style={{ fontSize: '16px' }}>💧</span>,     label: 'Water Goal',   value: `${dailyTargets.waterTarget} glasses`,                 accent: '#60A5FA' },
          ].map(({ icon, label, value, accent }) => (
            <button
              key={label}
              className="w-full flex items-center gap-3 py-3 border-b border-[#F3F4F6] last:border-0 text-left"
            >
              <div
                className="flex items-center justify-center rounded-xl shrink-0"
                style={{ width: '36px', height: '36px', background: `${accent}20` }}
              >
                {icon}
              </div>
              <div className="flex-1">
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#1B1B1B' }}>{label}</span>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#9CA3AF', marginRight: '4px' }}>{value}</span>
            </button>
          ))}
        </div>

        {/* Dietary Preferences (local UI state — MVP) */}
        <div className="rounded-3xl bg-white p-4 mb-3" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Leaf size={15} color="#2D6A4F" />
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#1B4332' }}>Dietary Preferences</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {DIETARY_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setDietary(opt)}
                className="rounded-full px-3 py-1.5 border-2 transition-all"
                style={{
                  background: dietary === opt ? '#2D6A4F' : 'white',
                  borderColor: dietary === opt ? '#2D6A4F' : '#E5E7EB',
                  color: dietary === opt ? 'white' : '#6B7280',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                {opt}
              </button>
            ))}
            {customDietaryOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setDietary(opt)}
                className="rounded-full px-3 py-1.5 border-2 transition-all"
                style={{
                  background: dietary === opt ? '#2D6A4F' : 'white',
                  borderColor: dietary === opt ? '#2D6A4F' : '#E5E7EB',
                  color: dietary === opt ? 'white' : '#6B7280',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                {opt}
              </button>
            ))}
            {showDietaryInput ? (
              <input
                value={newDietaryOption}
                onChange={(e) => setNewDietaryOption(e.target.value)}
                className="rounded-full px-3 py-1.5 border-2 transition-all"
                style={{ background: 'white', borderColor: '#E5E7EB', color: '#6B7280', fontSize: '12px', fontWeight: 700 }}
                placeholder="Add new option"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setCustomDietaryOptions([...customDietaryOptions, newDietaryOption]);
                    setNewDietaryOption('');
                    setShowDietaryInput(false);
                  }
                }}
              />
            ) : (
              <button
                onClick={() => setShowDietaryInput(true)}
                className="rounded-full px-3 py-1.5 border-2 transition-all"
                style={{ background: 'white', borderColor: '#E5E7EB', color: '#6B7280', fontSize: '12px', fontWeight: 700 }}
              >
                + Add
              </button>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-3xl bg-white p-4 mb-3" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2 mb-1">
            <Bell size={15} color="#60A5FA" />
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#1B4332' }}>Notifications</h3>
          </div>
          <ToggleRow icon={<Bell size={16} color="#60A5FA" />}   label="Meal Reminders"    subtitle="Breakfast, lunch & dinner alerts"        defaultOn={true}  accent="#60A5FA" />
          <ToggleRow icon={<Heart size={16} color="#F87171" />}  label="Wellness Check-ins" subtitle="Daily mood & energy check"              defaultOn={true}  accent="#F87171" />
          <ToggleRow icon={<Target size={16} color="#52B788" />} label="Goal Alerts"        subtitle="Notify when close to or over goal"      defaultOn={false} accent="#52B788" />
          <ToggleRow icon={<Flame size={16} color="#F59E0B" />}  label="Streak Reminders"  subtitle="Don't break your streak!"               defaultOn={true}  accent="#F59E0B" />
        </div>

        {/* Privacy & Safety */}
        <div className="rounded-3xl bg-white p-4 mb-3" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2 mb-1">
            <Shield size={15} color="#A78BFA" />
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#1B4332' }}>Privacy & Safety</h3>
          </div>
          <ToggleRow icon={<Shield size={16} color="#A78BFA" />} label="Local Data Only"   subtitle="Your data stays on this device"         defaultOn={true}  accent="#A78BFA" />
          <ToggleRow icon={<User size={16} color="#6B7280" />}   label="Anonymous Mode"    subtitle="Remove personal identifiers"            defaultOn={false} accent="#6B7280" />
          {[
            { icon: <Shield size={16} color="#A78BFA" />,      label: 'Privacy Policy',    accent: '#A78BFA' },
            { icon: <ExternalLink size={16} color="#6B7280" />, label: 'Terms of Service',  accent: '#6B7280' },
          ].map(({ icon, label, accent }) => (
            <button
              key={label}
              className="w-full flex items-center gap-3 py-3.5 border-b border-[#F3F4F6] last:border-0 text-left"
            >
              <div
                className="flex items-center justify-center rounded-xl shrink-0"
                style={{ width: '36px', height: '36px', background: `${accent}20` }}
              >
                {icon}
              </div>
              <div className="flex-1">
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#1B1B1B' }}>{label}</span>
              </div>
              <ChevronRight size={15} color="#D1D5DB" />
            </button>
          ))}
        </div>

        {/* Eating Disorder Support Card */}
        <div
          className="rounded-3xl p-4 mb-3"
          style={{ background: 'linear-gradient(135deg, #F0F9FF, #E0F2FE)', border: '1.5px solid #BAE6FD' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Heart size={16} color="#0EA5E9" />
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0369A1' }}>💙 Support Resources</h3>
          </div>
          <p style={{ fontSize: '12px', color: '#0C4A6E', fontWeight: 500, lineHeight: 1.6, marginBottom: '12px' }}>
            Recovery is possible. You deserve support, compassion, and care. These resources are here for you anytime:
          </p>
          <div className="flex flex-col gap-2">
            {ED_RESOURCES.map(({ name: resourceName, detail, color, bg, icon }) => (
              <div
                key={resourceName}
                className="flex items-center gap-3 rounded-2xl p-3"
                style={{ background: bg, border: `1px solid ${color}30` }}
              >
                <span style={{ fontSize: '18px' }}>{icon}</span>
                <div className="flex-1">
                  <p style={{ fontSize: '12px', fontWeight: 800, color }}>{resourceName}</p>
                  <p style={{ fontSize: '11px', color: '#6B7280', fontWeight: 500 }}>{detail}</p>
                </div>
                <Phone size={14} color={color} />
              </div>
            ))}
          </div>
        </div>

        {/* App version */}
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center gap-1.5">
            <Leaf size={12} color="#9CA3AF" />
            <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 600 }}>Nourish AI v1.0.0 · Built with care 🌿</span>
          </div>
        </div>

        {/* Sign out + Reset */}
        <div className="space-y-3 mb-8">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 border-2 border-[#E0E7FF] bg-white transition-all active:bg-[#EEF2FF]"
          >
            <LogOut size={16} color="#6366F1" />
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#6366F1' }}>Log Out</span>
          </button>

          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 border-2 border-[#FEE2E2] bg-white transition-all active:bg-[#FEF2F2]"
          >
            <LogOut size={16} color="#F87171" />
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#F87171' }}>Reset & Start Over</span>
          </button>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <AnimatePresence>
        {isEditDialogOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditDialogOpen(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white rounded-3xl p-6 z-50 max-w-md mx-auto"
              style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#1B4332' }}>Edit Profile</h2>
                <button
                  onClick={() => setIsEditDialogOpen(false)}
                  className="flex items-center justify-center rounded-full transition-all active:scale-95"
                  style={{ width: '32px', height: '32px', background: '#F3F4F6' }}
                >
                  <span style={{ fontSize: '18px', color: '#6B7280' }}>×</span>
                </button>
              </div>

              {/* Profile Picture */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <div
                    className="flex items-center justify-center rounded-3xl overflow-hidden"
                    style={{
                      width: '100px',
                      height: '100px',
                      background: 'linear-gradient(135deg, #52B788, #B7E4C7)',
                      border: '3px solid #E5E7EB',
                    }}
                  >
                    {editProfilePicture ? (
                      <img src={editProfilePicture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span style={{ fontSize: '40px', fontWeight: 900, color: '#1B4332' }}>
                        {editName.substring(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 flex items-center justify-center rounded-full transition-all active:scale-95"
                    style={{ width: '36px', height: '36px', background: '#2D6A4F', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                  >
                    <Camera size={16} color="white" />
                  </button>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                {editProfilePicture && (
                  <button
                    onClick={() => setEditProfilePicture('')}
                    className="mt-3 px-3 py-1.5 rounded-full transition-all active:scale-95"
                    style={{ background: '#FEE2E2', fontSize: '12px', fontWeight: 700, color: '#DC2626' }}
                  >
                    Remove Photo
                  </button>
                )}
              </div>

              {/* Name Input */}
              <div className="mb-6">
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#6B7280', display: 'block', marginBottom: '8px' }}>
                  Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-2xl px-4 py-3 border-2 border-[#E5E7EB] outline-none transition-all focus:border-[#2D6A4F]"
                  style={{ fontSize: '14px', fontWeight: 600, color: '#1B1B1B' }}
                  placeholder="Enter your name"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditDialogOpen(false)}
                  className="flex-1 rounded-2xl py-3.5 border-2 border-[#E5E7EB] bg-white transition-all active:bg-[#F9FAFB]"
                  style={{ fontSize: '14px', fontWeight: 800, color: '#6B7280' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 rounded-2xl py-3.5 transition-all active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, #2D6A4F, #52B788)',
                    fontSize: '14px',
                    fontWeight: 800,
                    color: 'white',
                    boxShadow: '0 4px 16px rgba(45,106,79,0.3)',
                  }}
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
