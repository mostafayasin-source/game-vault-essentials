import * as React from "react";
import { Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { coverFor } from "@/lib/catalogue";

type Props = {
  imageKey: string;
  title: string;
  className?: string;
  priority?: boolean;
};

/** Cover art with a 3:4 frame and a polished fallback when the image cannot load. */
export function CoverImage({ imageKey, title, className, priority }: Props) {
  const src = coverFor(imageKey);
  const [failed, setFailed] = React.useState(false);
  const showFallback = !src || failed;

  return (
    <div
      className={cn(
        "relative aspect-3/4 w-full overflow-hidden rounded-lg bg-surface-2",
        className,
      )}
    >
      {showFallback ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 surface-panel text-muted-foreground">
          <Gamepad2 className="size-8 opacity-70" aria-hidden="true" />
          <span className="px-3 text-center text-xs">{title}</span>
        </div>
      ) : (
        <img
          src={src}
          alt={`Demo cover artwork for ${title}`}
          loading={priority ? "eager" : "lazy"}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover transition-transform duration-500 motion-reduce:transition-none group-hover:scale-105"
        />
      )}
    </div>
  );
}
