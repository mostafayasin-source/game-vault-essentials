import * as React from "react";
import { Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  /** Per-product cover artwork URL. */
  coverUrl?: string | null | undefined;
  title: string;
  platformName?: string | undefined;
  className?: string | undefined;
  priority?: boolean | undefined;
};

/**
 * Portrait cover frame (2:3, the standard key-art ratio) with lazy loading and a
 * polished fallback when the artwork cannot be loaded.
 */
export function CoverImage({ coverUrl, title, platformName, className, priority }: Props) {
  const [failed, setFailed] = React.useState(false);
  React.useEffect(() => setFailed(false), [coverUrl]);
  const showFallback = !coverUrl || failed;

  return (
    <div
      className={cn(
        "relative aspect-2/3 w-full overflow-hidden rounded-lg bg-surface-2",
        className,
      )}
    >
      {showFallback ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 surface-panel px-3 text-center text-muted-foreground">
          <Gamepad2 className="size-8 opacity-70" aria-hidden="true" />
          <span className="text-xs font-medium text-foreground">{title}</span>
          <span className="text-[11px]">Cover artwork unavailable</span>
        </div>
      ) : (
        <img
          src={coverUrl}
          alt={
            platformName
              ? `${title} cover artwork — ${platformName} listing`
              : `${title} cover artwork`
          }
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover transition-transform duration-500 motion-reduce:transition-none group-hover:scale-105"
        />
      )}
    </div>
  );
}
