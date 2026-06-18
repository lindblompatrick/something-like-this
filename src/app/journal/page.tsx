"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Droplets,
  Plus,
  Trash2,
  SmilePlus,
} from "lucide-react";
import { JournalEntry, JournalMeal, Macros } from "@/types";
import { getJournalEntry, saveJournalEntry, formatDate } from "@/lib/storage";
import { getRecipeById, recipes } from "@/data/recipes";
import MacroBadge from "@/components/MacroBadge";

const moods = [
  { value: "great", label: "Great", emoji: "😄" },
  { value: "good", label: "Good", emoji: "🙂" },
  { value: "okay", label: "Okay", emoji: "😐" },
  { value: "bad", label: "Bad", emoji: "😔" },
] as const;

function sumMacros(meals: JournalMeal[]): Macros {
  return meals.reduce(
    (acc, meal) => {
      const recipe = getRecipeById(meal.recipeId);
      if (!recipe) return acc;
      const s = meal.servings;
      return {
        calories: acc.calories + Math.round(recipe.macros.calories * s),
        protein: acc.protein + Math.round(recipe.macros.protein * s),
        fat: acc.fat + Math.round(recipe.macros.fat * s),
        carbs: acc.carbs + Math.round(recipe.macros.carbs * s),
        fiber: acc.fiber + Math.round(recipe.macros.fiber * s),
      };
    },
    { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 }
  );
}

function offsetDate(base: string, days: number): string {
  const d = new Date(base + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

const TARGETS = { calories: 1800, protein: 150, fat: 130, carbs: 25 };

export default function JournalPage() {
  const today = new Date().toISOString().split("T")[0];
  const [currentDate, setCurrentDate] = useState(today);
  const [entry, setEntry] = useState<JournalEntry>({
    date: today,
    meals: [],
    notes: "",
    waterGlasses: 0,
    mood: "good",
  });
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState(recipes[0]?.id ?? "");
  const [mealType, setMealType] = useState<JournalMeal["mealType"]>("lunch");

  useEffect(() => {
    const saved = getJournalEntry(currentDate);
    if (saved) {
      setEntry(saved);
    } else {
      setEntry({
        date: currentDate,
        meals: [],
        notes: "",
        waterGlasses: 0,
        mood: "good",
      });
    }
  }, [currentDate]);

  const save = (updated: JournalEntry) => {
    setEntry(updated);
    saveJournalEntry(updated);
  };

  const addMeal = () => {
    if (!selectedRecipeId) return;
    const meal: JournalMeal = {
      recipeId: selectedRecipeId,
      servings: 1,
      time: new Date().toTimeString().slice(0, 5),
      mealType,
    };
    save({ ...entry, meals: [...entry.meals, meal] });
    setShowAddMeal(false);
  };

  const removeMeal = (index: number) => {
    const updated = entry.meals.filter((_, i) => i !== index);
    save({ ...entry, meals: updated });
  };

  const totals = sumMacros(entry.meals);

  const mealsByType = ["breakfast", "lunch", "dinner", "snack"] as const;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Date navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setCurrentDate(offsetDate(currentDate, -1))}
          className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="text-center">
          <h1 className="text-base font-bold text-stone-100">
            {formatDate(currentDate)}
          </h1>
          {currentDate === today && (
            <span className="text-xs text-red-400">Today</span>
          )}
        </div>
        <button
          onClick={() => setCurrentDate(offsetDate(currentDate, 1))}
          disabled={currentDate >= today}
          className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 transition-colors disabled:opacity-30"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Daily totals */}
      {entry.meals.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
            Daily Totals
          </h2>
          <MacroBadge macros={totals} />
          <div className="grid grid-cols-3 gap-2 mt-2">
            {(["calories", "protein", "carbs"] as const).map((key) => {
              const pct = Math.min(100, Math.round((totals[key] / TARGETS[key]) * 100));
              const color =
                key === "carbs"
                  ? pct > 100
                    ? "bg-red-500"
                    : "bg-green-500"
                  : pct >= 80
                  ? "bg-green-500"
                  : "bg-stone-600";
              return (
                <div key={key} className="bg-stone-800 rounded-lg p-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-stone-400 capitalize">{key}</span>
                    <span className="text-stone-300">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-stone-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-xs text-stone-500 mt-1">
                    {totals[key]} / {TARGETS[key]}
                    {key === "calories" ? " kcal" : "g"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Meals by type */}
      {mealsByType.map((type) => {
        const typeMeals = entry.meals
          .map((m, i) => ({ meal: m, index: i }))
          .filter(({ meal }) => meal.mealType === type);
        return (
          <div key={type} className="mb-4">
            <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2 capitalize">
              {type}
            </h2>
            {typeMeals.length === 0 ? (
              <div className="border border-dashed border-stone-700 rounded-lg p-3 text-stone-600 text-sm text-center">
                No {type} logged
              </div>
            ) : (
              <div className="space-y-2">
                {typeMeals.map(({ meal, index }) => {
                  const recipe = getRecipeById(meal.recipeId);
                  if (!recipe) return null;
                  return (
                    <div
                      key={index}
                      className="bg-stone-800 border border-stone-700 rounded-lg p-3 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-stone-200 text-sm font-medium">
                          {recipe.name}
                        </p>
                        <p className="text-stone-500 text-xs mt-0.5">
                          {meal.time} · {meal.servings} serving ·{" "}
                          {Math.round(recipe.macros.calories * meal.servings)} kcal ·{" "}
                          {Math.round(recipe.macros.protein * meal.servings)}g protein
                        </p>
                      </div>
                      <button
                        onClick={() => removeMeal(index)}
                        className="text-stone-600 hover:text-red-400 transition-colors p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Add meal */}
      {showAddMeal ? (
        <div className="bg-stone-800 border border-stone-700 rounded-xl p-4 mb-4">
          <h3 className="text-sm font-semibold text-stone-200 mb-3">
            Add a meal
          </h3>
          <div className="space-y-2">
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value as JournalMeal["mealType"])}
              className="w-full bg-stone-900 border border-stone-700 text-stone-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-700"
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
            <select
              value={selectedRecipeId}
              onChange={(e) => setSelectedRecipeId(e.target.value)}
              className="w-full bg-stone-900 border border-stone-700 text-stone-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-700"
            >
              {recipes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={addMeal}
                className="flex-1 bg-red-800 hover:bg-red-700 text-red-100 text-sm font-medium py-2 rounded-lg transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddMeal(false)}
                className="flex-1 bg-stone-700 hover:bg-stone-600 text-stone-200 text-sm font-medium py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddMeal(true)}
          className="w-full flex items-center justify-center gap-2 border border-dashed border-stone-700 hover:border-red-800 text-stone-500 hover:text-red-400 rounded-lg py-3 text-sm transition-colors mb-4"
        >
          <Plus size={14} />
          Add meal
        </button>
      )}

      {/* Water */}
      <div className="bg-stone-800 border border-stone-700 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Droplets size={16} className="text-blue-400" />
            <h3 className="text-sm font-semibold text-stone-200">Water</h3>
          </div>
          <span className="text-stone-400 text-sm">
            {entry.waterGlasses} / 8 glasses
          </span>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {Array.from({ length: 8 }).map((_, i) => (
            <button
              key={i}
              onClick={() => {
                const newCount = i < entry.waterGlasses ? i : i + 1;
                save({ ...entry, waterGlasses: newCount });
              }}
              className={`w-8 h-8 rounded-lg transition-colors text-sm ${
                i < entry.waterGlasses
                  ? "bg-blue-700 text-blue-100"
                  : "bg-stone-700 text-stone-500 hover:bg-stone-600"
              }`}
            >
              💧
            </button>
          ))}
        </div>
      </div>

      {/* Mood */}
      <div className="bg-stone-800 border border-stone-700 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <SmilePlus size={16} className="text-yellow-400" />
          <h3 className="text-sm font-semibold text-stone-200">Mood</h3>
        </div>
        <div className="flex gap-2">
          {moods.map(({ value, label, emoji }) => (
            <button
              key={value}
              onClick={() => save({ ...entry, mood: value })}
              className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg text-xs transition-colors ${
                entry.mood === value
                  ? "bg-stone-600 text-stone-100"
                  : "bg-stone-700 text-stone-400 hover:bg-stone-600"
              }`}
            >
              <span className="text-lg">{emoji}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="mb-6">
        <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-2">
          Notes
        </label>
        <textarea
          value={entry.notes}
          onChange={(e) => save({ ...entry, notes: e.target.value })}
          placeholder="How do you feel? Any cravings, energy levels, observations…"
          rows={3}
          className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2.5 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:border-red-700 resize-none"
        />
      </div>

      {/* Link to recipes */}
      <div className="text-center">
        <Link
          href="/"
          className="text-sm text-stone-500 hover:text-stone-300 transition-colors"
        >
          Browse recipes to add more meals →
        </Link>
      </div>
    </div>
  );
}
