"use client";

import { useState } from "react";
import Topbar from "./top-bar";
import Sidebar from "./side-bar";
import { User } from "next-auth";
import { useLayoutEffect } from "react";

interface Props {
  user: User;
  children: React.ReactNode;
}

export default function ClientShell({ user, children }: Props) {
  const [open, setOpen] = useState(false); // mobile overlay
  const [mini, setMini] = useState(false); // desktop minimise

  useLayoutEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="min-h-[100%] flex flex-row bg-background p-2 gap-2">
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
          {/* backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setOpen(false)}
          />
          {/* drawer */}
          <div className="fixed inset-y-0 left-0 z-50 w-64 max-w-full">
            <Sidebar
              user={user}
              isMinimized={false}
              onMinimize={() => setOpen(false)}
            />
          </div>
        </>
      )}
    </div>
  );
}
