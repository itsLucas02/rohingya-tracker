import { Skeleton } from "@/components/ui/skeleton";

// Server-safe skeleton for the sticky header. Renders instantly while the
// data-fetching <Header /> streams in via Suspense.
export function HeaderSkeleton() {
  return (
    <header className="glass sticky top-0 z-50 h-14 w-full">
      <div className="mx-auto flex h-full items-center gap-3 px-4">
        <div className="flex shrink-0 items-center gap-2">
          <Skeleton className="size-5 rounded-md" />
          <Skeleton className="hidden h-4 w-20 sm:block" />
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <Skeleton className="size-9 rounded-md" />
          <Skeleton className="size-9 rounded-md" />
          <Skeleton className="size-9 rounded-full" />
        </div>
      </div>
    </header>
  );
}
