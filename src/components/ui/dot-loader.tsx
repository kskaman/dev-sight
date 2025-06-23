// components/ui/dot-loader.tsx
export function DotLoader() {
  return (
    <span className="flex h-5 items-end gap-0.5">
      {/* three bouncing dots with staggered delay */}
      <span className="block w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.2s]" />
      <span className="block w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.1s]" />
      <span className="block w-1.5 h-1.5 rounded-full bg-current animate-bounce" />
    </span>
  );
}
