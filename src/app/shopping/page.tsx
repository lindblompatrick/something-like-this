"use client";

import { useState, useEffect } from "react";
import {
  ShoppingCart,
  Plus,
  Trash2,
  RefreshCw,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { ShoppingItem, Ingredient } from "@/types";
import {
  getShoppingList,
  saveShoppingList,
  getWeeklyPlan,
  getMonday,
  getWeekDates,
  saveWeeklyPlan,
  formatShortDate,
} from "@/lib/storage";
import { getRecipeById, recipes } from "@/data/recipes";

const categoryOrder = ["protein", "seafood", "vegetable", "dairy", "sauce", "pantry"] as const;
const categoryLabels: Record<string, string> = {
  protein: "🥩 Meat & Poultry",
  seafood: "🐟 Seafood",
  vegetable: "🥦 Vegetables & Herbs",
  dairy: "🥚 Dairy & Eggs",
  sauce: "🧂 Sauces & Condiments",
  pantry: "🫙 Pantry",
};

function buildShoppingList(recipeIds: string[]): ShoppingItem[] {
  const map = new Map<string, ShoppingItem>();
  for (const rid of recipeIds) {
    const recipe = getRecipeById(rid);
    if (!recipe) continue;
    for (const ing of recipe.ingredients) {
      const key = ing.name.toLowerCase();
      if (map.has(key)) {
        const existing = map.get(key)!;
        if (!existing.recipeIds.includes(rid)) existing.recipeIds.push(rid);
      } else {
        map.set(key, {
          ingredient: ing,
          recipeIds: [rid],
          checked: false,
          totalAmount: `${ing.amount} ${ing.unit}`,
        });
      }
    }
  }
  return Array.from(map.values());
}

export default function ShoppingPage() {
  const today = new Date().toISOString().split("T")[0];
  const weekStart = getMonday(new Date());
  const weekDates = getWeekDates(weekStart);

  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [weekPlan, setWeekPlan] = useState<Record<string, Record<string, string>>>({});
  const [showPlanner, setShowPlanner] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    const saved = getShoppingList();
    setItems(saved.length ? saved : []);
    const plan = getWeeklyPlan(weekStart);
    if (plan) setWeekPlan(plan.days as Record<string, Record<string, string>>);
  }, [weekStart]);

  const save = (updated: ShoppingItem[]) => {
    setItems(updated);
    saveShoppingList(updated);
  };

  const generateFromPlan = () => {
    const recipeIds: string[] = [];
    for (const day of Object.values(weekPlan)) {
      for (const rid of Object.values(day)) {
        if (rid && !recipeIds.includes(rid)) recipeIds.push(rid);
      }
    }
    const generated = buildShoppingList(recipeIds);
    save(generated);
  };

  const toggleItem = (index: number) => {
    const updated = [...items];
    updated[index] = { ...updated[index], checked: !updated[index].checked };
    save(updated);
  };

  const removeItem = (index: number) => {
    save(items.filter((_, i) => i !== index));
  };

  const clearChecked = () => {
    save(items.filter((i) => !i.checked));
  };

  const toggleCategory = (cat: string) => {
    const next = new Set(collapsedCategories);
    if (next.has(cat)) next.delete(cat);
    else next.add(cat);
    setCollapsedCategories(next);
  };

  const updatePlan = (date: string, mealType: string, recipeId: string) => {
    const updated = {
      ...weekPlan,
      [date]: { ...(weekPlan[date] ?? {}), [mealType]: recipeId },
    };
    setWeekPlan(updated);
    saveWeeklyPlan({ weekStart, days: updated });
  };

  const grouped = categoryOrder.reduce(
    (acc, cat) => {
      const catItems = items.filter((i) => i.ingredient.category === cat);
      if (catItems.length) acc[cat] = catItems;
      return acc;
    },
    {} as Record<string, ShoppingItem[]>
  );

  const checkedCount = items.filter((i) => i.checked).length;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-100 flex items-center gap-2">
            <ShoppingCart size={22} />
            Shopping List
          </h1>
          <p className="text-stone-400 text-sm mt-1">
            Week of {formatShortDate(weekStart)}
          </p>
        </div>
        {checkedCount > 0 && (
          <button
            onClick={clearChecked}
            className="text-xs text-stone-400 hover:text-red-400 flex items-center gap-1 transition-colors"
          >
            <Trash2 size={12} />
            Clear done ({checkedCount})
          </button>
        )}
      </div>

      {/* Weekly planner */}
      <div className="bg-stone-800 border border-stone-700 rounded-xl mb-5 overflow-hidden">
        <button
          onClick={() => setShowPlanner(!showPlanner)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-stone-200 hover:bg-stone-750 transition-colors"
        >
          <span>Weekly Meal Planner</span>
          {showPlanner ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showPlanner && (
          <div className="border-t border-stone-700 p-4">
            <div className="space-y-2 mb-3">
              {weekDates.map((date) => (
                <div key={date} className="flex items-center gap-2">
                  <span
                    className={`text-xs w-16 flex-shrink-0 ${
                      date === today ? "text-red-400 font-semibold" : "text-stone-500"
                    }`}
                  >
                    {formatShortDate(date).split(",")[0]}
                  </span>
                  <select
                    value={weekPlan[date]?.dinner ?? ""}
                    onChange={(e) => updatePlan(date, "dinner", e.target.value)}
                    className="flex-1 bg-stone-900 border border-stone-700 text-stone-300 text-xs rounded px-2 py-1.5 focus:outline-none focus:border-red-700"
                  >
                    <option value="">— dinner —</option>
                    {recipes.filter(r => r.category === "dinner" || r.category === "soup").map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={weekPlan[date]?.lunch ?? ""}
                    onChange={(e) => updatePlan(date, "lunch", e.target.value)}
                    className="flex-1 bg-stone-900 border border-stone-700 text-stone-300 text-xs rounded px-2 py-1.5 focus:outline-none focus:border-red-700"
                  >
                    <option value="">— lunch —</option>
                    {recipes.filter(r => r.category === "lunch" || r.category === "snack").map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <button
              onClick={generateFromPlan}
              className="w-full flex items-center justify-center gap-2 bg-red-800 hover:bg-red-700 text-red-100 text-sm font-medium py-2 rounded-lg transition-colors"
            >
              <RefreshCw size={13} />
              Generate Shopping List
            </button>
          </div>
        )}
      </div>

      {/* Shopping list */}
      {items.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingCart size={40} className="text-stone-700 mx-auto mb-3" />
          <p className="text-stone-400 font-medium mb-1">No items yet</p>
          <p className="text-stone-600 text-sm">
            Plan your week above and generate a list, or add items manually.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {categoryOrder.map((cat) => {
            const catItems = grouped[cat];
            if (!catItems) return null;
            const collapsed = collapsedCategories.has(cat);
            const checkedInCat = catItems.filter((i) => i.checked).length;

            return (
              <div
                key={cat}
                className="bg-stone-800 border border-stone-700 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => toggleCategory(cat)}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-stone-750 transition-colors"
                >
                  <span className="text-sm font-semibold text-stone-200">
                    {categoryLabels[cat]}
                  </span>
                  <div className="flex items-center gap-2">
                    {checkedInCat > 0 && (
                      <span className="text-xs text-stone-500">
                        {checkedInCat}/{catItems.length}
                      </span>
                    )}
                    {collapsed ? (
                      <ChevronDown size={13} className="text-stone-500" />
                    ) : (
                      <ChevronUp size={13} className="text-stone-500" />
                    )}
                  </div>
                </button>

                {!collapsed && (
                  <div className="border-t border-stone-700">
                    {catItems.map((item, i) => {
                      const globalIndex = items.indexOf(item);
                      return (
                        <div
                          key={i}
                          className={`flex items-center gap-3 px-4 py-2.5 border-b border-stone-700/50 last:border-0 ${
                            item.checked ? "opacity-50" : ""
                          }`}
                        >
                          <button
                            onClick={() => toggleItem(globalIndex)}
                            className="text-stone-400 hover:text-green-400 transition-colors flex-shrink-0"
                          >
                            {item.checked ? (
                              <CheckSquare size={16} className="text-green-500" />
                            ) : (
                              <Square size={16} />
                            )}
                          </button>
                          <span
                            className={`flex-1 text-sm ${
                              item.checked
                                ? "line-through text-stone-500"
                                : "text-stone-200"
                            }`}
                          >
                            {item.ingredient.name}
                          </span>
                          <span className="text-xs text-stone-500">
                            {item.totalAmount}
                          </span>
                          <button
                            onClick={() => removeItem(globalIndex)}
                            className="text-stone-700 hover:text-red-500 transition-colors flex-shrink-0"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Progress */}
      {items.length > 0 && (
        <div className="mt-5 bg-stone-800 border border-stone-700 rounded-xl p-4">
          <div className="flex justify-between text-sm text-stone-400 mb-2">
            <span>Shopping progress</span>
            <span className="text-stone-200 font-medium">
              {checkedCount} / {items.length} items
            </span>
          </div>
          <div className="h-2 bg-stone-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{
                width: `${items.length ? (checkedCount / items.length) * 100 : 0}%`,
              }}
            />
          </div>
          {checkedCount === items.length && items.length > 0 && (
            <p className="text-green-400 text-sm text-center mt-2 font-medium">
              All done! Happy cooking 🍱
            </p>
          )}
        </div>
      )}
    </div>
  );
}
