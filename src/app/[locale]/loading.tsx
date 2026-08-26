import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <div className="relative min-h-0 w-full flex-1">
      <div className="absolute inset-0">
        <Skeleton className="size-full" />
      </div>

      <div className="absolute bottom-4 left-4 top-4 z-10 hidden w-80 flex-col overflow-hidden rounded-2xl border border-border bg-background/40 p-4 backdrop-blur lg:flex">
        <Skeleton className="mb-3 h-4 w-32" />
        <Skeleton className="mb-4 h-5 w-40" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
