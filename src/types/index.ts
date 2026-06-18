export interface Macros {
  calories: number;
  protein: number; // grams
  fat: number; // grams
  carbs: number; // grams (net)
  fiber: number; // grams
}

export interface Ingredient {
  name: string;
  amount: string;
  unit: string;
  category: "protein" | "vegetable" | "sauce" | "pantry" | "dairy" | "seafood";
}

export interface Recipe {
  id: string;
  name: string;
  nameJP?: string;
  description: string;
  category: "breakfast" | "lunch" | "dinner" | "snack" | "soup";
  cuisine: "japanese" | "korean" | "fusion" | "chinese";
  tags: string[];
  prepTime: number; // minutes
  cookTime: number; // minutes
  servings: number;
  difficulty: "easy" | "medium" | "hard";
  macros: Macros;
  ingredients: Ingredient[];
  steps: string[];
  ketoScore: number; // 1-5 (5 = strict keto)
  proteinScore: number; // 1-5 (5 = very high protein)
  image?: string;
}

export interface JournalMeal {
  recipeId: string;
  servings: number;
  time: string; // HH:MM
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
}

export interface JournalEntry {
  date: string; // YYYY-MM-DD
  meals: JournalMeal[];
  notes: string;
  waterGlasses: number;
  mood: "great" | "good" | "okay" | "bad";
  weight?: number; // kg
}

export interface ShoppingItem {
  ingredient: Ingredient;
  recipeIds: string[];
  checked: boolean;
  totalAmount: string;
}

export interface WeeklyPlan {
  weekStart: string; // YYYY-MM-DD (Monday)
  days: {
    [date: string]: {
      breakfast?: string; // recipeId
      lunch?: string;
      dinner?: string;
      snack?: string;
    };
  };
}
