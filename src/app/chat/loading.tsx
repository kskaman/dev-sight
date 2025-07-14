export default function ChatRouteLoading() {
  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
      <p className="mt-4 text-sm text-muted-foreground">Loading chat…</p>
    </div>
  );
}
