"use client";

import { Menu } from "lucide-react";
import Image from "next/image";
import logoSrc from "../../../../public/logo.png";

export default function Topbar({ onToggle }: { onToggle: () => void }) {
  return (
    <header
      className="relative w-full border border-gray-300 rounded-xl py-2
          bg-white flex items-center justify-center"
    >
      <div className="lg:hidden flex items-center absolute left-4">
        {/* menu icon only on < md */}
        <button onClick={onToggle} className="mr-2 cursor-pointer">
          <Menu size={20} />
        </button>
      </div>
      <div>
        <Image src={logoSrc} alt={"devSight logo"} width={40} />
      </div>
      <h1 className="text-lg font-semibold">devSight</h1>
    </header>
  );
}
