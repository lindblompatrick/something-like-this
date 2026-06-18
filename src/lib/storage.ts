"use client";

import { JournalEntry, WeeklyPlan, ShoppingItem } from "@/types";

const JOURNAL_KEY = "keto_journal";
const WEEKLY_PLAN_KEY = "keto_weekly_plan";
const SHOPPING_KEY = "keto_shopping";

export function getJournalEntry(date: string): JournalEntry | null {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(`${JOURNAL_KEY}_${date}`);
  return data ? JSON.parse(data) : null;
}

export function saveJournalEntry(entry: JournalEntry): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${JOURNAL_KEY}_${entry.date}`, JSON.stringify(entry));
}

export function getJournalDates(): string[] {
  if (typeof window === "undefined") return [];
  const dates: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(JOURNAL_KEY + "_")) {
      dates.push(key.replace(JOURNAL_KEY + "_", ""));
    }
  }
  return dates.sort().reverse();
}

export function getWeeklyPlan(weekStart: string): WeeklyPlan | null {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(`${WEEKLY_PLAN_KEY}_${weekStart}`);
  return data ? JSON.parse(data) : null;
}

export function saveWeeklyPlan(plan: WeeklyPlan): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    `${WEEKLY_PLAN_KEY}_${plan.weekStart}`,
    JSON.stringify(plan)
  );
}

export function getShoppingList(): ShoppingItem[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(SHOPPING_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveShoppingList(items: ShoppingItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SHOPPING_KEY, JSON.stringify(items));
}

export function getMonday(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function getWeekDates(weekStart: string): string[] {
  const dates: string[] = [];
  const start = new Date(weekStart + "T00:00:00");
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}
