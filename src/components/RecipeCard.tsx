import Link from "next/link";
import { Clock, Flame, Zap } from "lucide-react";
import { Recipe } from "@/types";

const cuisineEmoji: Record<Recipe["cuisine"], string> = {
  japanese: "🇯🇵",
  korean: "🇰🇷",
  fusion: "✨",
  chinese: "🐉",
};

const categoryColor: Record<Recipe["category"], string> = {
  breakfast: "bg-amber-900/60 text-amber-300",
  lunch: "bg-sky-900/60 text-sky-300",
  dinner: "bg-purple-900/60 text-purple-300",
  snack: "bg-green-900/60 text-green-300",
  soup: "bg-orange-900/60 text-orange-300",
};

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Link href={`/recipe/${recipe.id}`}>
      <article className="bg-stone-800 border border-stone-700 rounded-xl overflow-hidden hover:border-red-800 hover:bg-stone-750 transition-all group">
        <div className="bg-gradient-to-br from-stone-700 to-stone-800 h-32 flex items-center justify-center relative">
          <span className="text-5xl">{cuisineEmoji[recipe.cuisine]}</span>
          <div className="absolute top-2 right-2">
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${categoryColor[recipe.category]}`}
            >
              {recipe.category}
            </span>
          </div>
        </div>

        <div className="p-3">
          <div className="mb-1">
            <h3 className="text-stone-100 font-semibold text-sm leading-tight group-hover:text-red-300 transition-colors">
              {recipe.name}
            </h3>
            {recipe.nameJP && (
              <p className="text-stone-500 text-xs mt-0.5">{recipe.nameJP}</p>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-stone-400 mb-2">
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {recipe.prepTime + recipe.cookTime}m
            </span>
            <span className="flex items-center gap-1">
              <Flame size={11} className="text-orange-400" />
              {recipe.macros.calories} kcal
            </span>
            <span className="flex items-center gap-1">
              <Zap size={11} className="text-blue-400" />
              {recipe.macros.protein}g
            </span>
          </div>

          <div className="flex gap-1">
            <KetoStars score={recipe.ketoScore} />
          </div>
        </div>
      </article>
    </Link>
  );
}

function KetoStars({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-stone-500">Keto</span>
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full ${
              i < score ? "bg-green-400" : "bg-stone-600"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
