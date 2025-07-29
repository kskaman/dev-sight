"use client";

import { Menu } from "lucide-react";

export default function Topbar({ onToggle }: { onToggle: () => void }) {
  return (
    <header
      className="relative w-full py-4
          bg-card flex items-center border-b-[2px]
          border-border"
    >
      <div className="items-center absolute left-4">
        {/* menu icon only on < md */}
        <button
          onClick={onToggle}
          className="mr-2 cursor-pointer text-foreground hover:text-foreground/80 transition-colors"
        >
          <Menu size={20} />
        </button>
      </div>
    </header>
  );
}
