import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, PieChart, Pie, Tooltip,
  LineChart, Line, CartesianGrid, AreaChart, Area, ComposedChart,
} from 'recharts';
import { Flame, Award, TrendingUp, Leaf, ChevronRight, Heart, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { api } from '../services/api';
import type { DailyNutrition } from '@trackify/shared';

// ── Mock-only data (MVP: not yet integrated with API) ──────────────────────────

const MACRO_DATA = [
  { name: 'Protein', value: 22, color: '#60A5FA', fill: '#DBEAFE' },
  { name: 'Carbs', value: 51, color: '#F59E0B', fill: '#FEF3C7' },
  { name: 'Fat', value: 27, color: '#F87171', fill: '#FEE2E2' },
];

const WEIGHT_DATA = [
  { week: 'W1', weight: 68.2 },
  { week: 'W2', weight: 67.8 },
  { week: 'W3', weight: 67.5 },
  { week: 'W4', weight: 67.1 },
  { week: 'W5', weight: 66.9 },
  { week: 'W6', weight: 66.6 },
];

const MOOD_DATA = [
  { day: 'Mon', score: 7 },
  { day: 'Tue', score: 8 },
  { day: 'Wed', score: 5 },
  { day: 'Thu', score: 8 },
  { day: 'Fri', score: 9 },
  { day: 'Sat', score: 7 },
  { day: 'Sun', score: 6 },
];

const GOALS_PROGRESS = [
  { label: 'Daily Logging', current: 6, target: 7, unit: 'days', color: '#52B788', emoji: '📝' },
  { label: 'Protein Goal', current: 76, target: 100, unit: '%', color: '#60A5FA', emoji: '💪' },
  { label: 'Water Intake', current: 5, target: 8, unit: 'glasses', color: '#34D399', emoji: '💧' },
  { label: 'Fiber Goal', current: 65, target: 100, unit: '%', color: '#A78BFA', emoji: '🥦' },
];

const ACHIEVEMENTS = [
  { icon: '🔥', title: '12-Day Streak', desc: 'Logged meals 12 days in a row', earned: true },
  { icon: '💧', title: 'Hydration Hero', desc: 'Hit water goal 5 days this week', earned: true },
  { icon: '🥗', title: 'Veggie Warrior', desc: 'Log 7 veggie-rich meals', earned: false, progress: 5, total: 7 },
  { icon: '💪', title: 'Protein Pro', desc: 'Hit protein goal 3 days running', earned: false, progress: 1, total: 3 },
];

const TABS = ['Week', 'Month', 'All Time'];

// ── Helpers ────────────────────────────────────────────────────────────────────

const SHORT_DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface ChartPoint {
  day: string;
  value: number;
  goal: number;
}

interface WeeklyPoint {
  day: string;
  calories: number;
  goal: number;
  protein: number;
}

/**
 * Maps DailyNutrition[] from the API to the calories chart format.
 * Uses the day-of-week abbreviation derived from the ISO date string.
 */
function mapToCaloriesData(days: DailyNutrition[], calorieGoal: number): ChartPoint[] {
  return days.map((d) => ({
    day: SHORT_DAY_NAMES[new Date(d.date).getDay()],
    value: d.calories,
    goal: calorieGoal,
  }));
}

function mapToProteinData(days: DailyNutrition[], proteinGoal: number): ChartPoint[] {
  return days.map((d) => ({
    day: SHORT_DAY_NAMES[new Date(d.date).getDay()],
    value: d.protein,
    goal: proteinGoal,
  }));
}

function mapToWeeklyData(days: DailyNutrition[], calorieGoal: number): WeeklyPoint[] {
  return days.map((d) => ({
    day: SHORT_DAY_NAMES[new Date(d.date).getDay()],
    calories: d.calories,
    goal: calorieGoal,
    protein: d.protein,
  }));
}

// ── Component ──────────────────────────────────────────────────────────────────

export function ProgressScreen() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [chartView, setChartView] = useState<'calories' | 'protein'>('calories');

  // Real data from API
  const [dailyData, setDailyData] = useState<DailyNutrition[]>([]);
  const [calorieGoal, setCalorieGoal] = useState(1800);
  const [proteinGoal, setProteinGoal] = useState(120);
  const [loadingStats, setLoadingStats] = useState(true);

  // Derived period from active tab (All Time treated as month for now)
  const period: 'week' | 'month' = activeTab === 1 ? 'month' : 'week';

  useEffect(() => {
    let cancelled = false;
    setLoadingStats(true);

    Promise.all([
      api.get<{ data: DailyNutrition[]; period: string }>(
        `/api/nutrition/statistics?period=${period}`
      ),
      api.get<{
        calorieTarget: number;
        proteinTarget: number;
        carbsTarget?: number;
        fatTarget?: number;
        waterTarget?: number;
        id?: string;
        userId?: string;
        goalType?: string;
        createdAt?: string;
        updatedAt?: string;
      }>('/api/user-goals'),
    ])
      .then(([stats, goals]) => {
        if (cancelled) return;
        setDailyData(stats.data);
        if (goals.calorieTarget > 0) setCalorieGoal(goals.calorieTarget);
        if (goals.proteinTarget > 0) setProteinGoal(goals.proteinTarget);
      })
      .catch(() => {
        // Silently fall back to defaults — charts remain empty until data loads
      })
      .finally(() => {
        if (!cancelled) setLoadingStats(false);
      });

    return () => {
      cancelled = true;
    };
  }, [period]);

  // Derive chart arrays from real API data
  const caloriesData = mapToCaloriesData(dailyData, calorieGoal);
  const proteinData = mapToProteinData(dailyData, proteinGoal);
  const weeklyData = mapToWeeklyData(dailyData, calorieGoal);

  // Days logged = days where at least one calorie was recorded
  const daysLogged = dailyData.filter((d) => d.calories > 0).length;

  const avgCalories =
    weeklyData.length > 0
      ? Math.round(weeklyData.reduce((s, d) => s + d.calories, 0) / weeklyData.length)
      : 0;

  const avgProtein =
    weeklyData.length > 0
      ? Math.round(weeklyData.reduce((s, d) => s + d.protein, 0) / weeklyData.length)
      : 0;

  return (
    <div className="flex flex-col bg-[#F8FAF9]">
      {/* Header */}
      <div
        className="px-5 pt-2 pb-5"
        style={{ background: 'linear-gradient(160deg, #1B4332 0%, #2D6A4F 100%)' }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Leaf size={16} color="rgba(255,255,255,0.6)" />
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: 700 }}>Nourish</span>
        </div>
        <h1 style={{ color: 'white', fontSize: '22px', fontWeight: 900, letterSpacing: '-0.4px' }}>
          Your Progress 📊
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', fontWeight: 500, marginTop: '2px' }}>
          Every meal logged is a step forward
        </p>

        {/* Real stats summary */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { icon: '📅', label: 'Days Logged', value: daysLogged.toString(), unit: 'this period' },
            { icon: '🍽️', label: 'Avg Cal', value: avgCalories.toString(), unit: 'kcal/day' },
            { icon: '💪', label: 'Avg Protein', value: `${avgProtein}g`, unit: 'per day' },
          ].map(({ icon, label, value, unit }) => (
            <div
              key={label}
              className="flex flex-col items-center rounded-2xl py-3"
              style={{ background: 'rgba(255,255,255,0.12)' }}
            >
              <span style={{ fontSize: '18px', marginBottom: '2px' }}>{icon}</span>
              <span style={{ fontSize: '16px', fontWeight: 900, color: 'white', lineHeight: 1 }}>{value}</span>
              <span style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>{unit}</span>
              <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginTop: '1px' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Time range tabs — connected to API period param */}
        <div className="flex gap-2 mb-4 rounded-2xl p-1 bg-white" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className="flex-1 rounded-xl py-2 transition-all duration-200"
              style={{
                background: activeTab === i ? 'linear-gradient(135deg, #2D6A4F, #52B788)' : 'transparent',
                color: activeTab === i ? 'white' : '#6B7280',
                fontSize: '13px',
                fontWeight: 700,
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Chart Toggle */}
        <div className="flex gap-2 mb-3">
          {[
            { key: 'calories', label: '🔥 Calories' },
            { key: 'protein', label: '💪 Protein' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setChartView(key as 'calories' | 'protein')}
              className="flex-1 rounded-xl py-2 border transition-all duration-200"
              style={{
                background: chartView === key ? '#1B4332' : 'white',
                borderColor: chartView === key ? '#1B4332' : '#E5E7EB',
                color: chartView === key ? 'white' : '#6B7280',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Weekly Bar Chart — real API data */}
        <div className="rounded-3xl bg-white p-4 mb-4" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#1B4332' }}>
                {chartView === 'calories' ? 'Calorie Intake' : 'Protein Intake'}
              </h3>
              <p style={{ fontSize: '11px', color: '#6B7280', fontWeight: 500 }}>
                {chartView === 'calories'
                  ? `Goal: ${calorieGoal.toLocaleString()} kcal/day`
                  : `Goal: ${proteinGoal}g/day`}
              </p>
            </div>
            <div
              className="flex items-center gap-1 rounded-full px-2.5 py-1"
              style={{ background: '#D8F3DC' }}
            >
              <TrendingUp size={12} color="#2D6A4F" />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#2D6A4F' }}>
                {loadingStats ? 'Loading…' : 'On track'}
              </span>
            </div>
          </div>

          {chartView === 'calories' ? (
            <div key="calories-chart">
              <ResponsiveContainer width="100%" height={140}>
                <ComposedChart data={caloriesData} barCategoryGap="30%">
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fontWeight: 600, fill: '#9CA3AF' }}
                  />
                  <YAxis hide domain={[0, calorieGoal * 1.25]} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                    formatter={(val: number) => [`${val} kcal`, 'Calories']}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {caloriesData.map((entry, index) => {
                      const isToday = index === caloriesData.length - 1;
                      const overGoal = entry.value > entry.goal;
                      return (
                        <Cell
                          key={`cal-cell-${index}`}
                          fill={isToday ? '#B7E4C7' : overGoal ? '#F59E0B' : '#2D6A4F'}
                        />
                      );
                    })}
                  </Bar>
                  <Line
                    key="calories-goal-line"
                    dataKey="goal"
                    stroke="#1B4332"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    activeDot={false}
                    legendType="none"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div key="protein-chart">
              <ResponsiveContainer width="100%" height={140}>
                <ComposedChart data={proteinData} barCategoryGap="30%">
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fontWeight: 600, fill: '#9CA3AF' }}
                  />
                  <YAxis hide domain={[0, proteinGoal * 1.25]} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                    formatter={(val: number) => [`${val}g protein`, 'Protein']}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {proteinData.map((entry, index) => {
                      const isToday = index === proteinData.length - 1;
                      const overGoal = entry.value > entry.goal;
                      return (
                        <Cell
                          key={`prot-cell-${index}`}
                          fill={isToday ? '#B7E4C7' : overGoal ? '#F59E0B' : '#2D6A4F'}
                        />
                      );
                    })}
                  </Bar>
                  <Line
                    key="protein-goal-line"
                    dataKey="goal"
                    stroke="#1B4332"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    activeDot={false}
                    legendType="none"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="flex items-center gap-4 mt-1">
            {[
              { color: '#2D6A4F', label: 'Under goal' },
              { color: '#F59E0B', label: 'Over goal' },
              { color: '#B7E4C7', label: 'Today' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="rounded-full" style={{ width: '10px', height: '10px', background: color }} />
                <span style={{ fontSize: '10px', fontWeight: 600, color: '#6B7280' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Macro Breakdown (mock MVP) */}
        <div className="rounded-3xl bg-white p-4 mb-4" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#1B4332', marginBottom: '12px' }}>
            Macro Distribution
          </h3>
          <div className="flex items-center">
            <div style={{ width: '120px', height: '120px', flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={MACRO_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={36}
                    outerRadius={54}
                    paddingAngle={3}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {MACRO_DATA.map((entry) => (
                      <Cell key={`pie-${entry.name}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 pl-4">
              {MACRO_DATA.map(({ name, value, color }) => (
                <div key={name} className="flex items-center gap-2 mb-3">
                  <div className="rounded-lg" style={{ width: '10px', height: '10px', background: color, flexShrink: 0 }} />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151' }}>{name}</span>
                      <span style={{ fontSize: '12px', fontWeight: 800, color }}>{value}%</span>
                    </div>
                    <div className="rounded-full overflow-hidden mt-1" style={{ height: '5px', background: '#F3F4F6' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                        className="h-full rounded-full"
                        style={{ background: color }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <p style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 500, marginTop: '4px' }}>
                ⚠️ Protein could be higher
              </p>
            </div>
          </div>
        </div>

        {/* Wellness Mood Trend (mock MVP) */}
        <div className="rounded-3xl bg-white p-4 mb-4" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#1B4332' }}>Wellness & Mood</h3>
              <p style={{ fontSize: '11px', color: '#6B7280', fontWeight: 500 }}>How food makes you feel</p>
            </div>
            <Heart size={16} color="#F87171" />
          </div>
          <ResponsiveContainer width="100%" height={90}>
            <AreaChart data={MOOD_DATA}>
              <defs>
                <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F87171" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#F87171" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#9CA3AF' }} />
              <YAxis hide domain={[0, 10]} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                formatter={(val: number) => [`${val}/10`, 'Mood score']}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#F87171"
                strokeWidth={2.5}
                fill="url(#moodGradient)"
                dot={{ fill: '#F87171', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#DC2626' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Weight Trend (mock MVP) */}
        <div className="rounded-3xl bg-white p-4 mb-4" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#1B4332' }}>Weight Trend</h3>
              <p style={{ fontSize: '11px', color: '#6B7280', fontWeight: 500 }}>Gradual, healthy progress</p>
            </div>
            <div
              className="flex items-center gap-1 rounded-full px-2.5 py-1"
              style={{ background: '#FEF3C7' }}
            >
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#D97706' }}>−1.6 kg</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={WEIGHT_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#9CA3AF' }} />
              <YAxis hide domain={['dataMin - 0.5', 'dataMax + 0.5']} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                formatter={(val: number) => [`${val} kg`, 'Weight']}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#52B788"
                strokeWidth={2.5}
                dot={{ fill: '#2D6A4F', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#2D6A4F' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Goals Progress (mock MVP) */}
        <div className="rounded-3xl bg-white p-4 mb-4" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#1B4332', marginBottom: '12px' }}>
            Weekly Goals
          </h3>
          {GOALS_PROGRESS.map(({ label, current, target, unit, color, emoji }) => {
            const pct = Math.round((current / target) * 100);
            return (
              <div key={label} className="mb-4 last:mb-0">
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span style={{ fontSize: '14px' }}>{emoji}</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>{label}</span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color }}>
                    {current}/{target} {unit}
                  </span>
                </div>
                <div className="rounded-full overflow-hidden" style={{ height: '8px', background: '#F3F4F6' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                    className="h-full rounded-full"
                    style={{ background: color }}
                  />
                </div>
                <span style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 500, marginTop: '2px', display: 'block' }}>
                  {pct}% complete
                </span>
              </div>
            );
          })}
        </div>

        {/* Achievements (mock MVP) */}
        <div className="rounded-3xl bg-white p-4 mb-4" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Award size={15} color="#F59E0B" />
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#1B4332' }}>Achievements</h3>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {ACHIEVEMENTS.map(({ icon, title, desc, earned, progress, total }) => (
              <div
                key={title}
                className="rounded-2xl p-3"
                style={{
                  background: earned ? 'linear-gradient(135deg, #FFFBEB, #FEF3C7)' : '#F8FAF9',
                  border: `1.5px solid ${earned ? '#FDE68A' : '#E5E7EB'}`,
                  opacity: earned ? 1 : 0.85,
                }}
              >
                <div className="text-2xl mb-1.5" style={{ filter: earned ? 'none' : 'grayscale(1) opacity(0.5)' }}>
                  {icon}
                </div>
                <p style={{ fontSize: '12px', fontWeight: 800, color: earned ? '#92400E' : '#374151', lineHeight: 1.2 }}>
                  {title}
                </p>
                <p style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 500, marginTop: '3px', lineHeight: 1.4 }}>
                  {desc}
                </p>
                {!earned && progress !== undefined && total !== undefined && (
                  <div className="mt-2 rounded-full overflow-hidden" style={{ height: '4px', background: '#E5E7EB' }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(progress / total) * 100}%`, background: '#D1D5DB' }}
                    />
                  </div>
                )}
                {!earned && (
                  <span style={{ fontSize: '9px', color: '#9CA3AF', fontWeight: 600, marginTop: '2px', display: 'block' }}>
                    {progress}/{total} complete
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights Banner — uses real avg protein vs goal */}
        <div
          className="rounded-3xl p-4 mb-2 flex items-start gap-3"
          style={{
            background: 'linear-gradient(135deg, #1B4332 0%, #40916C 100%)',
            boxShadow: '0 8px 24px rgba(27,67,50,0.25)',
          }}
        >
          <div
            className="flex items-center justify-center rounded-2xl shrink-0"
            style={{ width: '44px', height: '44px', background: 'rgba(255,255,255,0.15)' }}
          >
            <Sparkles size={22} color="#95D5B2" />
          </div>
          <div className="flex-1">
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#95D5B2', marginBottom: '3px' }}>AI WEEKLY SUMMARY</p>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'white', lineHeight: 1.5 }}>
              {avgProtein > 0
                ? avgProtein < proteinGoal
                  ? `You're averaging ${avgProtein}g protein/day vs. your ${proteinGoal}g goal. Boosting this one metric could significantly improve your energy and progress!`
                  : `You're hitting your ${proteinGoal}g protein goal with an average of ${avgProtein}g/day. Great work!`
                : "You're averaging only 58g protein/day vs. your 120g goal. Boosting this one metric could significantly improve your energy and progress!"}
            </p>
            <button
              onClick={() => navigate('/chat')}
              className="mt-2 flex items-center gap-1"
              style={{ color: '#95D5B2', fontSize: '12px', fontWeight: 700 }}
            >
              Get personalized AI plan <ChevronRight size={14} strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
