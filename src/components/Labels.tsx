import { Disc3, Download } from "lucide-react";
import { getPlatform, type PlatformId } from "@/config/store";
import type { ProductFormat } from "@/lib/catalogue";
import { cn } from "@/lib/utils";

export function PlatformLabel({
  platform,
  className,
}: {
  platform: PlatformId | string;
  className?: string;
}) {
  const info = getPlatform(platform);
  if (!info) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        info.chipClass,
        className,
      )}
    >
      {info.name}
    </span>
  );
}

export function FormatLabel({
  format,
  className,
}: {
  format: ProductFormat | string;
  className?: string;
}) {
  const physical = format === "physical";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground",
        className,
      )}
    >
      {physical ? (
        <Disc3 className="size-3.5" aria-hidden="true" />
      ) : (
        <Download className="size-3.5" aria-hidden="true" />
      )}
      {physical ? "Physical disc" : "Digital code"}
    </span>
  );
}
