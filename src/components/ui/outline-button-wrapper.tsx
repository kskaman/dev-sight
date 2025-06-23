"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // if you have this; otherwise use clsx or raw class merge

interface OutlineButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
  onClick?: () => void;
}

export function OutlineButton({
  variant = "outline",
  className,
  onClick = () => {},
  ...props
}: OutlineButtonProps) {
  return (
    <Button
      onClick={onClick}
      variant={variant}
      className={cn(
        "w-full rounded-full px-4 py-2 text-sm font-normal cursor-pointer flex items-center justify-center",

        className
      )}
      {...props}
    />
  );
}
