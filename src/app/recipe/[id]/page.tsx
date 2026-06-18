import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Users,
  ChefHat,
  CheckCircle,
  ShoppingCart,
} from "lucide-react";
import { getRecipeById } from "@/data/recipes";
import MacroBadge from "@/components/MacroBadge";
import AddToJournalButton from "@/components/AddToJournalButton";

const cuisineEmoji: Record<string, string> = {
  japanese: "🇯🇵",
  korean: "🇰🇷",
  fusion: "✨",
  chinese: "🐉",
};

const difficultyColor: Record<string, string> = {
  easy: "text-green-400",
  medium: "text-yellow-400",
  hard: "text-red-400",
};

const categoryColor: Record<string, string> = {
  protein: "bg-blue-900/40 border-blue-800/40",
  vegetable: "bg-green-900/40 border-green-800/40",
  sauce: "bg-red-900/40 border-red-800/40",
  pantry: "bg-stone-800/80 border-stone-700/40",
  dairy: "bg-yellow-900/40 border-yellow-800/40",
  seafood: "bg-cyan-900/40 border-cyan-800/40",
};

export async function generateStaticParams() {
  const { recipes } = await import("@/data/recipes");
  return recipes.map((r) => ({ id: r.id }));
}

export default async function RecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = getRecipeById(id);
  if (!recipe) notFound();

  const totalTime = recipe.prepTime + recipe.cookTime;

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-stone-400 hover:text-stone-200 text-sm mb-4 transition-colors"
      >
        <ArrowLeft size={14} />
        Back to recipes
      </Link>

      {/* Hero */}
      <div className="bg-gradient-to-br from-stone-700 via-stone-800 to-stone-900 rounded-xl p-8 mb-5 flex items-center justify-center relative">
        <span className="text-7xl">{cuisineEmoji[recipe.cuisine]}</span>
        <div className="absolute top-3 right-3 flex gap-2">
          {recipe.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-stone-900/70 text-stone-300 px-2 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-stone-100">{recipe.name}</h1>
        {recipe.nameJP && (
          <p className="text-stone-400 text-sm mt-0.5">{recipe.nameJP}</p>
        )}
        <p className="text-stone-400 text-sm mt-2 leading-relaxed">
          {recipe.description}
        </p>
      </div>

      {/* Meta */}
      <div className="flex gap-4 text-sm text-stone-400 mb-5">
        <span className="flex items-center gap-1.5">
          <Clock size={14} />
          {totalTime} min
        </span>
        <span className="flex items-center gap-1.5">
          <Users size={14} />
          {recipe.servings} serving{recipe.servings !== 1 ? "s" : ""}
        </span>
        <span className={`flex items-center gap-1.5 ${difficultyColor[recipe.difficulty]}`}>
          <ChefHat size={14} />
          {recipe.difficulty}
        </span>
      </div>

      {/* Macros */}
      <div className="mb-5">
        <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
          Macros per serving
        </h2>
        <MacroBadge macros={recipe.macros} />
        {recipe.macros.fiber > 0 && (
          <p className="text-xs text-stone-500 mt-1.5">
            + {recipe.macros.fiber}g fiber &nbsp;·&nbsp; Total carbs:{" "}
            {recipe.macros.carbs + recipe.macros.fiber}g
          </p>
        )}
      </div>

      {/* Keto & Protein scores */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <ScoreCard label="Keto Score" score={recipe.ketoScore} color="green" />
        <ScoreCard label="Protein Score" score={recipe.proteinScore} color="blue" />
      </div>

      {/* Add to journal */}
      <AddToJournalButton recipe={recipe} />

      {/* Ingredients */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-stone-100">Ingredients</h2>
          <Link
            href="/shopping"
            className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-200 transition-colors"
          >
            <ShoppingCart size={12} />
            Add to shopping
          </Link>
        </div>
        <div className="space-y-2">
          {recipe.ingredients.map((ing, i) => (
            <div
              key={i}
              className={`flex items-center justify-between p-2.5 rounded-lg border ${categoryColor[ing.category]}`}
            >
              <span className="text-stone-200 text-sm">{ing.name}</span>
              <span className="text-stone-400 text-sm font-medium">
                {ing.amount} {ing.unit}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-stone-100 mb-3">Method</h2>
        <ol className="space-y-3">
          {recipe.steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-red-900/60 border border-red-800/50 text-red-300 text-xs font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <p className="text-stone-300 text-sm leading-relaxed pt-1">{step}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Tip */}
      <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-4 mb-8">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle size={14} className="text-green-400" />
          <span className="text-sm font-semibold text-stone-200">Dietist Note</span>
        </div>
        <p className="text-stone-400 text-sm">
          This recipe provides{" "}
          <span className="text-blue-400 font-medium">{recipe.macros.protein}g protein</span> and
          only{" "}
          <span className="text-green-400 font-medium">{recipe.macros.carbs}g net carbs</span>{" "}
          per serving — ideal for maintaining ketosis. Track it in your daily
          journal to stay on target.
        </p>
      </div>
    </div>
  );
}

function ScoreCard({
  label,
  score,
  color,
}: {
  label: string;
  score: number;
  color: "green" | "blue";
}) {
  const colorMap = {
    green: { filled: "bg-green-400", empty: "bg-stone-600", label: "text-green-400" },
    blue: { filled: "bg-blue-400", empty: "bg-stone-600", label: "text-blue-400" },
  };
  const c = colorMap[color];
  return (
    <div className="bg-stone-800 border border-stone-700 rounded-lg p-3">
      <p className={`text-xs font-medium mb-1.5 ${c.label}`}>{label}</p>
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full ${i < score ? c.filled : c.empty}`}
          />
        ))}
      </div>
    </div>
  );
}
