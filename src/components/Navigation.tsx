"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ShoppingCart, ChefHat, LayoutDashboard } from "lucide-react";

const navItems = [
  { href: "/", label: "Recipes", icon: ChefHat },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/shopping", label: "Shopping", icon: ShoppingCart },
  { href: "/dietist", label: "Dietist", icon: LayoutDashboard },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-stone-900 border-t border-stone-700 md:relative md:border-t-0 md:border-b md:border-stone-700">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-around md:justify-start md:gap-1 h-16">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                  active
                    ? "text-red-400 md:bg-stone-800"
                    : "text-stone-400 hover:text-stone-200"
                }`}
              >
                <Icon size={20} />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
