import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  Bell,
  Plus,
  Droplets,
  Flame,
  Zap,
  Award,
  ChevronRight,
  Leaf,
  Heart,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { api } from "../services/api";
import { useAuth } from "./AuthContext";

const AI_TIPS = [
  "You're 93g short of your protein goal today. Try a Greek yogurt or a handful of almonds — quick, nutrient-dense options!",
  "Great job logging 3 meals! Consistent tracking helps our AI learn your patterns and give better advice.",
  "Tip: Adding colorful vegetables to dinner can boost your fiber and vitamin intake significantly.",
  "You've been hitting your water goal 5 days this week — hydration is key for energy and metabolism! 💧",
];

interface Meal {
  id: string;
  label: string;
  time: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image: string;
  logged: boolean;
}

interface NutritionSummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  water: number;
}

interface UserGoals {
  calorieTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
  waterTarget: number;
  goalType?: string;
}

interface CalorieRingProps {
  consumed: number;
  goal: number;
}

function CalorieRing({ consumed, goal }: CalorieRingProps) {
  const pct = Math.min(consumed / goal, 1);
  const size = 164;
  const stroke = 13;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;
  const gap = circ - dash;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ringGradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${gap}`}
          initial={{ strokeDasharray: `0 ${circ}` }}
          animate={{ strokeDasharray: `${dash} ${gap}` }}
          transition={{
            duration: 1.2,
            ease: "easeOut",
            delay: 0.3,
          }}
        />
        <defs>
          <linearGradient
            id="ringGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#95D5B2" />
            <stop offset="100%" stopColor="#52B788" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          style={{
            fontSize: "11px",
            color: "rgba(255,255,255,0.7)",
            fontWeight: 700,
            letterSpacing: "0.5px",
          }}
        >
          CALORIES
        </span>
        <span
          style={{
            fontSize: "28px",
            fontWeight: 900,
            color: "white",
            lineHeight: 1.1,
          }}
        >
          {consumed.toLocaleString()}
        </span>
        <span
          style={{
            fontSize: "12px",
            color: "rgba(255,255,255,0.6)",
            fontWeight: 600,
          }}
        >
          of {goal.toLocaleString()} kcal
        </span>
        <div
          className="mt-1 rounded-full px-2 py-0.5"
          style={{ background: "rgba(255,255,255,0.15)" }}
        >
          <span
            style={{
              fontSize: "10px",
              color: "white",
              fontWeight: 700,
            }}
          >
            {Math.round(pct * 100)}% of goal
          </span>
        </div>
      </div>
    </div>
  );
}

interface MacroBarProps {
  label: string;
  consumed: number;
  goal: number;
  color: string;
  emoji: string;
}

function MacroBar({
  label,
  consumed,
  goal,
  color,
  emoji,
}: MacroBarProps) {
  const pct = Math.min((consumed / goal) * 100, 100);
  return (
    <div className="flex-1">
      <div className="flex items-center gap-1 mb-1">
        <span style={{ fontSize: "12px" }}>{emoji}</span>
        <span
          style={{
            fontSize: "10px",
            fontWeight: 700,
            color: "rgba(255,255,255,0.85)",
          }}
        >
          {label}
        </span>
      </div>
      <div
        className="rounded-full overflow-hidden"
        style={{
          height: "5px",
          background: "rgba(255,255,255,0.2)",
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{
            duration: 1,
            ease: "easeOut",
            delay: 0.5,
          }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
      <span
        style={{
          fontSize: "10px",
          color: "rgba(255,255,255,0.6)",
          fontWeight: 600,
          marginTop: "2px",
          display: "block",
        }}
      >
        {consumed}g / {goal}g
      </span>
    </div>
  );
}

export function HomeScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [meals, setMeals] = useState<Meal[]>([]);
  const [nutritionSummary, setNutritionSummary] = useState<NutritionSummary>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    water: 0,
  });
  const [userGoals, setUserGoals] = useState<UserGoals>({
    calorieTarget: 1800,
    proteinTarget: 120,
    carbsTarget: 225,
    fatTarget: 60,
    waterTarget: 8,
    goalType: "balanced",
  });
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [tipIndex] = useState(0);
  const [showWellness, setShowWellness] = useState(true);
  const [hasUnreadNotifications, setHasUnreadNotifications] =
    useState(false);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      api.get<Meal[]>(`/api/meals?date=${todayStr}`),
      api.get<NutritionSummary>(`/api/nutrition/summary?date=${todayStr}`),
      api.get<UserGoals>("/api/user-goals"),
      api.get<{ glasses: number }>(`/api/water-logs?date=${todayStr}`),
    ])
      .then(([mealsData, summaryData, goalsData, waterData]) => {
        if (cancelled) return;
        setMeals(mealsData);
        setNutritionSummary({ ...summaryData, water: waterData.glasses });
        setWaterGlasses(waterData.glasses);
        setUserGoals(goalsData);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setFetchError('数据加载失败，请下拉刷新重试');
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [todayStr]);

  const handleWaterClick = (index: number) => {
    const newCount = index < waterGlasses ? index : index + 1;
    const prevCount = waterGlasses;
    setWaterGlasses(newCount);
    api
      .post("/api/water-logs", { glasses: newCount, date: todayStr })
      .catch(() => {
        setWaterGlasses(prevCount);
      });
  };

  const name = user?.name || "Friend";
  const goal = userGoals.goalType || "balanced";

  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? "Good Morning"
      : hour < 17
        ? "Good Afternoon"
        : "Good Evening";
  const greetingEmoji = hour < 12 ? "🌅" : hour < 17 ? "☀️" : "🌙";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const caloriesLeft = Math.max(
    userGoals.calorieTarget - nutritionSummary.calories,
    0,
  );
  const proteinShortfall = Math.max(
    userGoals.proteinTarget - nutritionSummary.protein,
    0,
  );
  const goalPct = Math.min(
    Math.round(
      (nutritionSummary.calories / userGoals.calorieTarget) * 100,
    ),
    100,
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAF9] gap-3">
        <div
          className="rounded-full"
          style={{
            width: "48px",
            height: "48px",
            background: "linear-gradient(135deg, #1B4332, #52B788)",
            opacity: 0.7,
          }}
        />
        <span style={{ fontSize: "13px", color: "#6B7280", fontWeight: 600 }}>
          Loading your day...
        </span>
        {fetchError && (
          <span style={{ fontSize: "12px", color: "#EF4444", fontWeight: 600, textAlign: "center", maxWidth: "240px" }}>
            {fetchError}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-[#F8FAF9]">
      {/* Header */}
      <div
        className="px-5 pt-2 pb-5"
        style={{
          background:
            "linear-gradient(160deg, #1B4332 0%, #2D6A4F 100%)",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <img
              src="/src/import-1/Trackify.png"
              alt="Trackify"
              style={{
                height: "48px",
                maxWidth: "160px",
                objectFit: "contain",
                borderRadius: "12px",
                padding: "4px 8px",
              }}
            />
            <span
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              {today}
            </span>
          </div>
          <button
            className="relative flex items-center justify-center rounded-full"
            style={{
              width: "38px",
              height: "38px",
              background: "rgba(255,255,255,0.15)",
            }}
            onClick={() => setHasUnreadNotifications(false)}
          >
            <Bell size={18} color="white" />
            {hasUnreadNotifications && (
              <div
                className="absolute top-1.5 right-1.5 rounded-full"
                style={{
                  width: "8px",
                  height: "8px",
                  background: "#F4A261",
                  border: "1.5px solid #2D6A4F",
                }}
              />
            )}
          </button>
        </div>

        <h1
          style={{
            color: "white",
            fontSize: "21px",
            fontWeight: 900,
            letterSpacing: "-0.4px",
          }}
        >
          {greeting}, {name} {greetingEmoji}
        </h1>
        <p
          style={{
            color: "rgba(255,255,255,0.65)",
            fontSize: "13px",
            fontWeight: 500,
            marginTop: "2px",
          }}
        >
          {goal === "recovery"
            ? "Every meal is a step toward healing 💙"
            : goal === "gain"
              ? "Fuel your muscles — you're doing great! 💪"
              : goal === "loss"
                ? "Stay consistent, progress is happening! 📉"
                : "Keep nourishing yourself — you're thriving!"}
        </p>

        {/* Calorie ring + macros card */}
        <div
          className="mt-4 rounded-3xl p-4"
          style={{
            background: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <div className="flex items-center gap-4">
            <CalorieRing
              consumed={nutritionSummary.calories}
              goal={userGoals.calorieTarget}
            />
            <div className="flex-1">
              <div className="flex flex-col gap-3">
                <MacroBar
                  label="Protein"
                  consumed={nutritionSummary.protein}
                  goal={userGoals.proteinTarget}
                  color="#93C5FD"
                  emoji="💪"
                />
                <MacroBar
                  label="Carbs"
                  consumed={nutritionSummary.carbs}
                  goal={userGoals.carbsTarget}
                  color="#FCD34D"
                  emoji="🌾"
                />
                <MacroBar
                  label="Fat"
                  consumed={nutritionSummary.fat}
                  goal={userGoals.fatTarget}
                  color="#FCA5A5"
                  emoji="🫒"
                />
              </div>
              <div
                className="mt-3 rounded-xl px-2 py-1.5"
                style={{ background: "rgba(255,255,255,0.12)" }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.8)",
                    fontWeight: 600,
                  }}
                >
                  🔥 {caloriesLeft} kcal remaining today
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="px-4 mt-3 mb-3">
        <div className="grid grid-cols-3 gap-2">
          {[
            {
              icon: Flame,
              label: "Streak",
              value: "12 days",
              color: "#F59E0B",
              bg: "#FEF3C7",
            },
            {
              icon: Zap,
              label: "Energy",
              value: "Great",
              color: "#60A5FA",
              bg: "#DBEAFE",
            },
            {
              icon: Award,
              label: "Goal",
              value: `${goalPct}%`,
              color: "#52B788",
              bg: "#D8F3DC",
            },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <motion.div
              key={label}
              whileTap={{ scale: 0.96 }}
              className="rounded-2xl px-3 py-3 flex flex-col items-center bg-white"
              style={{
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}
            >
              <div
                className="flex items-center justify-center rounded-xl mb-1.5"
                style={{
                  width: "34px",
                  height: "34px",
                  background: bg,
                }}
              >
                <Icon size={17} color={color} />
              </div>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  color: "#9CA3AF",
                }}
              >
                {label}
              </span>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 800,
                  color: "#1B4332",
                }}
              >
                {value}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Water Tracker */}
      <div
        className="mx-4 mb-3 rounded-2xl px-4 py-3 bg-white"
        style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Droplets size={16} color="#60A5FA" />
            <span
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#1B4332",
              }}
            >
              Water Intake
            </span>
          </div>
          <span
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color:
                waterGlasses >= userGoals.waterTarget
                  ? "#52B788"
                  : "#6B7280",
            }}
          >
            {waterGlasses}/{userGoals.waterTarget} glasses{" "}
            {waterGlasses >= userGoals.waterTarget ? "✅" : ""}
          </span>
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: userGoals.waterTarget }).map((_, i) => (
            <button
              key={i}
              onClick={() => handleWaterClick(i)}
              className="flex-1 rounded-full transition-all duration-200"
              style={{
                height: "8px",
                background:
                  i < waterGlasses ? "#60A5FA" : "#E5E7EB",
              }}
            />
          ))}
        </div>
      </div>

      {/* Wellness Check-in (ED Recovery mode) */}
      <AnimatePresence>
        {goal === "recovery" && showWellness && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-4 mb-3 rounded-2xl p-4 overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, #F0F9FF, #E0F2FE)",
              border: "1.5px solid #BAE6FD",
            }}
          >
            <div className="flex items-start gap-3">
              <Heart
                size={20}
                color="#0EA5E9"
                style={{ flexShrink: 0, marginTop: "2px" }}
              />
              <div className="flex-1">
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: 800,
                    color: "#0369A1",
                    marginBottom: "4px",
                  }}
                >
                  💙 Daily Wellness Check-in
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#0C4A6E",
                    lineHeight: 1.5,
                    fontWeight: 500,
                  }}
                >
                  How are you feeling about food today? Remember
                  — every small step counts, and you're not
                  alone.
                </p>
                <div className="flex gap-2 mt-3">
                  {["😊 Good", "😐 Okay", "😔 Hard day"].map(
                    (mood) => (
                      <button
                        key={mood}
                        className="rounded-full px-3 py-1 border border-[#BAE6FD] bg-white"
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#0369A1",
                        }}
                      >
                        {mood}
                      </button>
                    ),
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowWellness(false)}
                style={{
                  color: "#9CA3AF",
                  fontSize: "16px",
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Today's Meals */}
      <div className="px-4 mb-3">
        <div className="flex items-center justify-between mb-3">
          <h2
            style={{
              fontSize: "16px",
              fontWeight: 800,
              color: "#1B4332",
            }}
          >
            Today's Meals
          </h2>
          <button
            onClick={() => navigate("/scan")}
            className="flex items-center gap-1 rounded-full px-3 py-1.5"
            style={{
              background:
                "linear-gradient(135deg, #2D6A4F, #52B788)",
              color: "white",
              fontSize: "12px",
              fontWeight: 700,
            }}
          >
            <Plus size={13} strokeWidth={3} />
            Log Food
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          {meals.length === 0 ? (
            ["Breakfast", "Lunch", "Snack", "Dinner"].map((label) => (
              <motion.button
                key={label}
                onClick={() => navigate("/scan")}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 rounded-2xl p-3 border-2 border-dashed border-[#D8F3DC] bg-white/80 transition-all duration-200 text-left"
              >
                <div
                  className="flex items-center justify-center rounded-xl shrink-0"
                  style={{
                    width: "58px",
                    height: "58px",
                    background: "#F8FAF9",
                  }}
                >
                  <Plus size={22} color="#D1D5DB" />
                </div>
                <div>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#52B788",
                    }}
                  >
                    {label}
                  </span>
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#9CA3AF",
                    }}
                  >
                    Tap to scan or log your meal
                  </p>
                </div>
              </motion.button>
            ))
          ) : (
            meals.map((meal) =>
              meal.logged ? (
                <motion.div
                  key={meal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 rounded-2xl p-3 bg-white"
                  style={{
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  }}
                >
                  {meal.image ? (
                    <img
                      src={meal.image}
                      alt={meal.name}
                      className="rounded-xl object-cover shrink-0"
                      style={{ width: "58px", height: "58px" }}
                    />
                  ) : (
                    <div
                      className="flex items-center justify-center rounded-xl shrink-0"
                      style={{
                        width: "58px",
                        height: "58px",
                        background: "#F8FAF9",
                      }}
                    >
                      <Leaf size={22} color="#D1D5DB" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#52B788",
                        }}
                      >
                        {meal.label}
                      </span>
                      <span
                        style={{
                          fontSize: "10px",
                          color: "#9CA3AF",
                          fontWeight: 500,
                        }}
                      >
                        {meal.time}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: 800,
                        color: "#1B4332",
                        marginTop: "1px",
                      }}
                    >
                      {meal.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#F59E0B",
                        }}
                      >
                        🔥 {meal.calories} kcal
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          color: "#60A5FA",
                          fontWeight: 600,
                        }}
                      >
                        P: {meal.protein}g
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          color: "#F59E0B",
                          fontWeight: 600,
                        }}
                      >
                        C: {meal.carbs}g
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          color: "#F87171",
                          fontWeight: 600,
                        }}
                      >
                        F: {meal.fat}g
                      </span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.button
                  key={meal.id}
                  onClick={() => navigate("/scan")}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-3 rounded-2xl p-3 border-2 border-dashed border-[#D8F3DC] bg-white/80 transition-all duration-200 text-left"
                >
                  <div
                    className="flex items-center justify-center rounded-xl shrink-0"
                    style={{
                      width: "58px",
                      height: "58px",
                      background: "#F8FAF9",
                    }}
                  >
                    <Plus size={22} color="#D1D5DB" />
                  </div>
                  <div>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#52B788",
                      }}
                    >
                      {meal.label}
                    </span>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#9CA3AF",
                      }}
                    >
                      Tap to scan or log your meal
                    </p>
                  </div>
                </motion.button>
              ),
            )
          )}
        </div>
      </div>

      {/* Nutrient Alert */}
      {proteinShortfall > 0 && (
        <div
          className="mx-4 mb-3 rounded-2xl p-3"
          style={{
            background: "#FFFBEB",
            border: "1.5px solid #FDE68A",
          }}
        >
          <div className="flex items-center gap-2">
            <span style={{ fontSize: "16px" }}>⚠️</span>
            <div>
              <p
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#92400E",
                }}
              >
                Protein Alert
              </p>
              <p
                style={{
                  fontSize: "11px",
                  color: "#78350F",
                  fontWeight: 500,
                  lineHeight: 1.4,
                }}
              >
                You need{" "}
                <strong>{proteinShortfall}g more protein</strong> today.
                Add grilled chicken, eggs, or Greek yogurt to dinner.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AI Tip Card */}
      <div
        className="mx-4 mb-3 rounded-3xl p-4"
        style={{
          background:
            "linear-gradient(135deg, #1B4332 0%, #40916C 100%)",
          boxShadow: "0 8px 24px rgba(27,67,50,0.25)",
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="shrink-0 flex items-center justify-center rounded-2xl"
            style={{
              width: "40px",
              height: "40px",
              background: "rgba(255,255,255,0.15)",
            }}
          >
            <Sparkles size={20} color="#95D5B2" />
          </div>
          <div className="flex-1">
            <p
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#95D5B2",
                marginBottom: "4px",
                letterSpacing: "0.5px",
              }}
            >
              NOURISH AI TIP
            </p>
            <p
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "white",
                lineHeight: 1.6,
              }}
            >
              {AI_TIPS[tipIndex]}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/chat")}
          className="mt-3 flex items-center gap-1"
          style={{
            color: "#95D5B2",
            fontSize: "12px",
            fontWeight: 700,
          }}
        >
          Ask AI for personalized advice{" "}
          <ChevronRight size={14} strokeWidth={3} />
        </button>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mb-6">
        <h2
          style={{
            fontSize: "15px",
            fontWeight: 800,
            color: "#1B4332",
            marginBottom: "10px",
          }}
        >
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-2.5">
          {[
            {
              label: "AI Nutrition Chat",
              emoji: "🤖",
              desc: "Ask anything about food",
              path: "/chat",
              color: "#2D6A4F",
              bg: "#D8F3DC",
            },
            {
              label: "Track Progress",
              emoji: "📊",
              desc: "View your weekly stats",
              path: "/progress",
              color: "#2563EB",
              bg: "#DBEAFE",
            },
            {
              label: "Meal Planner",
              emoji: "🗓️",
              desc: "Plan healthy meals",
              path: "/chat",
              color: "#7C3AED",
              bg: "#EDE9FE",
            },
            {
              label: "ED Support",
              emoji: "💙",
              desc: "Safe space resources",
              path: "/chat",
              color: "#DC2626",
              bg: "#FEE2E2",
            },
          ].map(({ label, emoji, desc, path, color, bg }) => (
            <motion.button
              key={label}
              onClick={() => navigate(path)}
              whileTap={{ scale: 0.96 }}
              className="flex flex-col items-start p-3 rounded-2xl bg-white text-left"
              style={{
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}
            >
              <div
                className="flex items-center justify-center rounded-xl mb-2"
                style={{
                  width: "36px",
                  height: "36px",
                  background: bg,
                }}
              >
                <span style={{ fontSize: "18px" }}>{emoji}</span>
              </div>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 800,
                  color: "#1B4332",
                  lineHeight: 1.3,
                }}
              >
                {label}
              </span>
              <span
                style={{
                  fontSize: "10px",
                  color: "#9CA3AF",
                  fontWeight: 500,
                  marginTop: "2px",
                }}
              >
                {desc}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
