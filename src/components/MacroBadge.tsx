import { Macros } from "@/types";

interface MacroBadgeProps {
  macros: Macros;
  compact?: boolean;
}

export default function MacroBadge({ macros, compact = false }: MacroBadgeProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="text-orange-400 font-semibold">{macros.calories} kcal</span>
        <span className="text-blue-400">{macros.protein}g P</span>
        <span className="text-yellow-400">{macros.fat}g F</span>
        <span className="text-green-400">{macros.carbs}g C</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2">
      <MacroCell label="Calories" value={macros.calories} unit="kcal" color="orange" />
      <MacroCell label="Protein" value={macros.protein} unit="g" color="blue" />
      <MacroCell label="Fat" value={macros.fat} unit="g" color="yellow" />
      <MacroCell label="Net Carbs" value={macros.carbs} unit="g" color="green" />
    </div>
  );
}

function MacroCell({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    orange: "text-orange-400 bg-orange-950/40 border-orange-900/50",
    blue: "text-blue-400 bg-blue-950/40 border-blue-900/50",
    yellow: "text-yellow-400 bg-yellow-950/40 border-yellow-900/50",
    green: "text-green-400 bg-green-950/40 border-green-900/50",
  };

  return (
    <div className={`rounded-lg border p-2 text-center ${colorMap[color]}`}>
      <div className="text-lg font-bold leading-tight">
        {value}
        <span className="text-xs font-normal ml-0.5">{unit}</span>
      </div>
      <div className="text-xs opacity-70 mt-0.5">{label}</div>
    </div>
  );
}
