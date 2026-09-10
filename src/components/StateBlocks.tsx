import { AlertTriangle, Loader2 } from "lucide-react";

export function LoadingBlock({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-24 text-muted-foreground" role="status">
      <Loader2 className="size-6 animate-spin" aria-hidden="true" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function ErrorBlock({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-xl surface-panel px-6 py-16 text-center"
    >
      <AlertTriangle className="size-8 text-destructive" aria-hidden="true" />
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="max-w-md text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
