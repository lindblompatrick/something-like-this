"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import RecipeCard from "@/components/RecipeCard";
import { recipes } from "@/data/recipes";
import { Recipe } from "@/types";

type FilterTag =
  | "all"
  | "keto"
  | "high-protein"
  | "quick"
  | "breakfast"
  | "lunch"
  | "dinner"
  | "soup"
  | "japanese"
  | "fusion";

const filters: { label: string; value: FilterTag }[] = [
  { label: "All", value: "all" },
  { label: "Strict Keto", value: "keto" },
  { label: "High Protein", value: "high-protein" },
  { label: "Quick (<20m)", value: "quick" },
  { label: "Breakfast", value: "breakfast" },
  { label: "Lunch", value: "lunch" },
  { label: "Dinner", value: "dinner" },
  { label: "Soup", value: "soup" },
  { label: "Japanese", value: "japanese" },
  { label: "Fusion", value: "fusion" },
];

function matchesFilter(recipe: Recipe, filter: FilterTag): boolean {
  switch (filter) {
    case "all":
      return true;
    case "keto":
      return recipe.ketoScore >= 5;
    case "high-protein":
      return recipe.proteinScore >= 5;
    case "quick":
      return recipe.prepTime + recipe.cookTime <= 20;
    case "breakfast":
    case "lunch":
    case "dinner":
    case "soup":
      return recipe.category === filter;
    case "japanese":
      return recipe.cuisine === "japanese";
    case "fusion":
      return recipe.cuisine === "fusion" || recipe.cuisine === "korean";
    default:
      return true;
  }
}

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterTag>("all");

  const filtered = recipes.filter((r) => {
    const q = query.toLowerCase();
    const matchesQuery =
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.tags.some((t) => t.includes(q));
    return matchesQuery && matchesFilter(r, activeFilter);
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-100">Recipe Library</h1>
        <p className="text-stone-400 text-sm mt-1">
          {recipes.length} Japanese & Asian fusion keto recipes
        </p>
      </div>

      <div className="relative mb-4">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
        />
        <input
          type="text"
          placeholder="Search recipes…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-stone-800 border border-stone-700 rounded-lg pl-9 pr-9 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-red-700 focus:ring-1 focus:ring-red-900"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        <SlidersHorizontal
          size={14}
          className="text-stone-500 mt-2 flex-shrink-0"
        />
        {filters.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setActiveFilter(value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeFilter === value
                ? "bg-red-800 text-red-100"
                : "bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-stone-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-stone-500">
          <p className="text-lg mb-2">No recipes found</p>
          <p className="text-sm">Try a different search or filter</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-stone-500 mb-3">
            {filtered.length} recipe{filtered.length !== 1 ? "s" : ""}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filtered.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
