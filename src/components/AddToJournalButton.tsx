"use client";

import { useState } from "react";
import { PlusCircle, Check } from "lucide-react";
import { Recipe } from "@/types";
import { getJournalEntry, saveJournalEntry } from "@/lib/storage";

export default function AddToJournalButton({ recipe }: { recipe: Recipe }) {
  const [added, setAdded] = useState(false);
  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack">(
    recipe.category === "breakfast"
      ? "breakfast"
      : recipe.category === "lunch"
      ? "lunch"
      : recipe.category === "dinner"
      ? "dinner"
      : "snack"
  );

  const handleAdd = () => {
    const today = new Date().toISOString().split("T")[0];
    const existing = getJournalEntry(today) ?? {
      date: today,
      meals: [],
      notes: "",
      waterGlasses: 0,
      mood: "good" as const,
    };

    existing.meals.push({
      recipeId: recipe.id,
      servings: 1,
      time: new Date().toTimeString().slice(0, 5),
      mealType,
    });

    saveJournalEntry(existing);
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  return (
    <div className="flex items-center gap-2 mb-5">
      <select
        value={mealType}
        onChange={(e) => setMealType(e.target.value as typeof mealType)}
        className="bg-stone-800 border border-stone-700 text-stone-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-700"
      >
        <option value="breakfast">Breakfast</option>
        <option value="lunch">Lunch</option>
        <option value="dinner">Dinner</option>
        <option value="snack">Snack</option>
      </select>
      <button
        onClick={handleAdd}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          added
            ? "bg-green-800 text-green-100"
            : "bg-red-800 hover:bg-red-700 text-red-100"
        }`}
      >
        {added ? (
          <>
            <Check size={14} /> Added to Journal
          </>
        ) : (
          <>
            <PlusCircle size={14} /> Add to Today&apos;s Journal
          </>
        )}
      </button>
    </div>
  );
}
