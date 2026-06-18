"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Activity,
  TrendingUp,
  Target,
  Lightbulb,
  ChevronRight,
  Scale,
} from "lucide-react";
import { getJournalDates, getJournalEntry, saveJournalEntry } from "@/lib/storage";
import { getRecipeById } from "@/data/recipes";
import { Macros } from "@/types";

const DAILY_TARGETS = {
  calories: 1800,
  protein: 150,
  fat: 130,
  carbs: 25,
  water: 8,
};

const ketoTips = [
  {
    title: "Electrolytes are key",
    body: "On keto you excrete more sodium, potassium, and magnesium. Add pink salt to water and eat avocados, leafy greens, and fatty fish to stay balanced.",
  },
  {
    title: "Net carbs, not total",
    body: "Count net carbs (total carbs minus fiber). Most Japanese vegetables like daikon, bok choy, and shiitake are naturally low net carb.",
  },
  {
    title: "Dashi is your best friend",
    body: "Dashi (kombu + katsuobushi) is virtually zero-carb and adds deep umami to everything. Keep a batch in the fridge at all times.",
  },
  {
    title: "Prioritise protein at breakfast",
    body: "Getting 30–40g protein at breakfast suppresses hunger hormones (ghrelin) for 4–6 hours. Try miso soup with extra tofu or a tamago roll.",
  },
  {
    title: "Shirataki noodles are a game changer",
    body: "Made from konjac, they're essentially zero-carb and zero-calorie. Use them instead of udon or soba in any noodle dish.",
  },
  {
    title: "Mirin in moderation",
    body: "Traditional mirin contains sugar. Use erythritol or monk fruit sweetener in sauces, or use dry sake with a tiny amount of sweetener instead.",
  },
  {
    title: "Fatty fish for brain fuel",
    body: "Salmon, mackerel, and yellowtail (hamachi) are high in omega-3s and fat — perfect keto fuel that also reduces inflammation.",
  },
  {
    title: "Fermented foods support the gut",
    body: "Kimchi, miso, and tsukemono (Japanese pickles) feed your gut microbiome. Aim for at least one fermented food per day.",
  },
];

function getRandomTips(n: number) {
  const shuffled = [...ketoTips].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function sumMacros(date: string): Macros {
  const entry = getJournalEntry(date);
  if (!entry) return { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 };
  return entry.meals.reduce(
    (acc, meal) => {
      const r = getRecipeById(meal.recipeId);
      if (!r) return acc;
      const s = meal.servings;
      return {
        calories: acc.calories + Math.round(r.macros.calories * s),
        protein: acc.protein + Math.round(r.macros.protein * s),
        fat: acc.fat + Math.round(r.macros.fat * s),
        carbs: acc.carbs + Math.round(r.macros.carbs * s),
        fiber: acc.fiber + Math.round(r.macros.fiber * s),
      };
    },
    { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 }
  );
}

export default function DietistPage() {
  const today = new Date().toISOString().split("T")[0];
  const [todayMacros, setTodayMacros] = useState<Macros>({
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    fiber: 0,
  });
  const [weekAvg, setWeekAvg] = useState<Macros>({
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    fiber: 0,
  });
  const [streak, setStreak] = useState(0);
  const [tips] = useState(() => getRandomTips(3));
  const [weight, setWeight] = useState("");

  useEffect(() => {
    const t = sumMacros(today);
    setTodayMacros(t);

    const dates = getJournalDates();
    const last7 = dates.slice(0, 7);
    if (last7.length > 0) {
      const totals = last7.reduce(
        (acc, d) => {
          const m = sumMacros(d);
          return {
            calories: acc.calories + m.calories,
            protein: acc.protein + m.protein,
            fat: acc.fat + m.fat,
            carbs: acc.carbs + m.carbs,
            fiber: acc.fiber + m.fiber,
          };
        },
        { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 }
      );
      const n = last7.length;
      setWeekAvg({
        calories: Math.round(totals.calories / n),
        protein: Math.round(totals.protein / n),
        fat: Math.round(totals.fat / n),
        carbs: Math.round(totals.carbs / n),
        fiber: Math.round(totals.fiber / n),
      });
    }

    // Streak: consecutive days with logged meals
    let s = 0;
    const d = new Date(today + "T00:00:00");
    while (true) {
      const ds = d.toISOString().split("T")[0];
      const entry = getJournalEntry(ds);
      if (entry && entry.meals.length > 0) {
        s++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    setStreak(s);
  }, [today]);

  const todayCalPct = Math.min(
    100,
    Math.round((todayMacros.calories / DAILY_TARGETS.calories) * 100)
  );
  const todayProtPct = Math.min(
    100,
    Math.round((todayMacros.protein / DAILY_TARGETS.protein) * 100)
  );
  const todayCarbPct = Math.round(
    (todayMacros.carbs / DAILY_TARGETS.carbs) * 100
  );

  const carbStatus =
    todayCarbPct > 120
      ? { color: "text-red-400", label: "Over limit — ketosis at risk" }
      : todayCarbPct > 100
      ? { color: "text-orange-400", label: "At limit" }
      : { color: "text-green-400", label: "In ketosis range" };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-100 flex items-center gap-2">
          <Activity size={22} className="text-red-400" />
          Your Dietist
        </h1>
        <p className="text-stone-400 text-sm mt-1">
          Personalised insights for your keto journey
        </p>
      </div>

      {/* Streak */}
      {streak > 0 && (
        <div className="bg-gradient-to-r from-red-900/40 to-orange-900/30 border border-red-800/40 rounded-xl p-4 mb-5 flex items-center gap-3">
          <span className="text-3xl">🔥</span>
          <div>
            <p className="text-stone-200 font-bold">
              {streak}-day logging streak!
            </p>
            <p className="text-stone-400 text-sm">
              Consistency is the foundation of success. Keep it up.
            </p>
          </div>
        </div>
      )}

      {/* Today's Status */}
      <div className="bg-stone-800 border border-stone-700 rounded-xl p-4 mb-5">
        <h2 className="text-sm font-semibold text-stone-300 mb-3 flex items-center gap-2">
          <Target size={14} className="text-red-400" />
          Today&apos;s Progress
        </h2>

        <div className="space-y-3">
          {[
            {
              label: "Calories",
              value: todayMacros.calories,
              target: DAILY_TARGETS.calories,
              pct: todayCalPct,
              unit: "kcal",
              color: "bg-orange-500",
            },
            {
              label: "Protein",
              value: todayMacros.protein,
              target: DAILY_TARGETS.protein,
              pct: todayProtPct,
              unit: "g",
              color: "bg-blue-500",
            },
          ].map(({ label, value, target, pct, unit, color }) => (
            <div key={label}>
              <div className="flex justify-between text-xs text-stone-400 mb-1">
                <span>{label}</span>
                <span>
                  <span className="text-stone-200 font-medium">{value}</span> /{" "}
                  {target} {unit}
                </span>
              </div>
              <div className="h-2 bg-stone-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${color}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          ))}

          <div className="bg-stone-900/60 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-stone-400">Net Carbs</span>
              <span className={`text-xs font-semibold ${carbStatus.color}`}>
                {carbStatus.label}
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-bold text-stone-200">
                {todayMacros.carbs}
              </span>
              <span className="text-stone-500 text-xs">
                / {DAILY_TARGETS.carbs}g
              </span>
            </div>
          </div>
        </div>

        {todayMacros.calories === 0 && (
          <div className="text-center mt-3">
            <Link
              href="/journal"
              className="text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              Log today&apos;s meals →
            </Link>
          </div>
        )}
      </div>

      {/* 7-day average */}
      {weekAvg.calories > 0 && (
        <div className="bg-stone-800 border border-stone-700 rounded-xl p-4 mb-5">
          <h2 className="text-sm font-semibold text-stone-300 mb-3 flex items-center gap-2">
            <TrendingUp size={14} className="text-green-400" />
            7-Day Average
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              {
                label: "Calories",
                value: weekAvg.calories,
                target: DAILY_TARGETS.calories,
                unit: "kcal",
                color: "text-orange-400",
              },
              {
                label: "Protein",
                value: weekAvg.protein,
                target: DAILY_TARGETS.protein,
                unit: "g",
                color: "text-blue-400",
              },
              {
                label: "Fat",
                value: weekAvg.fat,
                target: DAILY_TARGETS.fat,
                unit: "g",
                color: "text-yellow-400",
              },
              {
                label: "Net Carbs",
                value: weekAvg.carbs,
                target: DAILY_TARGETS.carbs,
                unit: "g",
                color: "text-green-400",
              },
            ].map(({ label, value, target, unit, color }) => (
              <div
                key={label}
                className="bg-stone-900/60 rounded-lg p-3 text-center"
              >
                <div className={`text-lg font-bold ${color}`}>
                  {value}
                  <span className="text-xs text-stone-500 font-normal ml-0.5">
                    {unit}
                  </span>
                </div>
                <div className="text-xs text-stone-500">{label}</div>
                <div
                  className={`text-xs mt-0.5 ${
                    label === "Net Carbs"
                      ? value <= target
                        ? "text-green-500"
                        : "text-red-400"
                      : value >= target * 0.8
                      ? "text-green-500"
                      : "text-orange-400"
                  }`}
                >
                  target: {target}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weight tracker */}
      <div className="bg-stone-800 border border-stone-700 rounded-xl p-4 mb-5">
        <h2 className="text-sm font-semibold text-stone-300 mb-3 flex items-center gap-2">
          <Scale size={14} className="text-purple-400" />
          Weight Log
        </h2>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Today's weight (kg)"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="flex-1 bg-stone-900 border border-stone-700 text-stone-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-700"
          />
          <button
            onClick={() => {
              if (!weight) return;
              const entry = getJournalEntry(today) ?? {
                date: today,
                meals: [],
                notes: "",
                waterGlasses: 0,
                mood: "good" as const,
              };
              entry.weight = parseFloat(weight);
              saveJournalEntry(entry);
              setWeight("");
            }}
            className="bg-red-800 hover:bg-red-700 text-red-100 text-sm px-4 py-2 rounded-lg transition-colors"
          >
            Save
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-stone-300 mb-3 flex items-center gap-2">
          <Lightbulb size={14} className="text-yellow-400" />
          Dietist Tips
        </h2>
        <div className="space-y-2">
          {tips.map((tip, i) => (
            <div
              key={i}
              className="bg-stone-800 border border-stone-700 rounded-xl p-4"
            >
              <p className="text-stone-200 text-sm font-semibold mb-1">
                {tip.title}
              </p>
              <p className="text-stone-400 text-sm leading-relaxed">{tip.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Macro targets info */}
      <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-4 mb-6">
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
          Your Daily Targets
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {Object.entries(DAILY_TARGETS).map(([key, value]) => (
            <div key={key} className="flex justify-between text-stone-400">
              <span className="capitalize">{key}</span>
              <span className="text-stone-300 font-medium">
                {value}
                {key === "water" ? " glasses" : key === "calories" ? " kcal" : "g"}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-stone-600 mt-2">
          Targets based on moderate-activity keto protocol: ~20–25g net carbs,
          high protein, moderate fat.
        </p>
      </div>

      {/* Quick links */}
      <div className="space-y-2">
        {[
          { href: "/journal", label: "Open daily journal", icon: "📔" },
          { href: "/", label: "Browse high-protein recipes", icon: "🍱" },
          { href: "/shopping", label: "Plan this week's meals", icon: "🛒" },
        ].map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center justify-between bg-stone-800 border border-stone-700 hover:border-red-800 rounded-xl p-3 transition-colors group"
          >
            <span className="flex items-center gap-3 text-sm text-stone-300 group-hover:text-stone-100">
              <span>{icon}</span>
              {label}
            </span>
            <ChevronRight
              size={14}
              className="text-stone-600 group-hover:text-stone-400"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
