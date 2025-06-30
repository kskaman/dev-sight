"use client";

import { useState } from "react";
import Topbar from "./top-bar";
import Sidebar from "./sidebar";
import { User } from "next-auth";

interface Props {
  user: User;
  children: React.ReactNode;
}

export default function ClientShell({ user, children }: Props) {
  const [open, setOpen] = useState(false); // mobile overlay
  const [mini, setMini] = useState(false); // desktop minimise

  return (
    <div className="h-screen flex flex-row bg-slate-50 p-2 gap-2">
      {/* sidebar – desktop */}
      <div className="hidden lg:flex">
        <Sidebar
          user={user}
          isMinimized={mini}
          onMinimize={() => setMini((p) => !p)}
        />
      </div>

      <div className="flex flex-col flex-1">
        {/* top navigation always visible */}
        <Topbar onToggle={() => setOpen(true)} />

        {/* main route content */}
        <main className="h-full py-3">{children}</main>
      </div>

      {/* sidebar – mobile overlay */}
      {open && (
        <>
          <div className="fixed inset-0 z-50 flex">
            <Sidebar
              user={user}
              isMinimized={false}
              onMinimize={() => setOpen(false)}
            />
          </div>
          <div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setOpen(false)}
          />
        </>
      )}
    </div>
  );
}
