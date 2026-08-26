import { cn } from "@/lib/utils";

/**
 * Reusable glass container. `elevated` uses the higher-opacity surface for
 * panels that sit above other glass (popups, floating controls).
 */
export function GlassPanel({
  children,
  className,
  elevated = false,
  ...props
}: React.ComponentProps<"div"> & { elevated?: boolean }) {
  return (
    <div
      className={cn(
        elevated ? "glass-elevated" : "glass",
        "rounded-xl shadow-sm",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
