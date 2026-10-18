
export default function Loading() {
  return (
    <main
      className="flex min-h-[50vh] items-center justify-center bg-background text-foreground"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3">
        <div
          className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary"
          aria-hidden="true"
        />
        <p className="text-sm text-text-muted">
          Loading Mandipro...
        </p>
      </div>
    </main>
  );
}
