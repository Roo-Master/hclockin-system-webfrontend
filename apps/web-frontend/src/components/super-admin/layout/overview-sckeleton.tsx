function SkeletonBlock({ className }: { className: string }) {
    return <div className={`animate-pulse rounded-lg bg-gray-800 ${className}`} />;
  }
  
  export function OverviewSkeleton() {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <SkeletonBlock className="h-3 w-20" />
                <SkeletonBlock className="h-4 w-4 rounded-full" />
              </div>
              <SkeletonBlock className="h-8 w-24" />
            </div>
          ))}
        </div>
  
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
            <SkeletonBlock className="h-4 w-32" />
            <div className="flex items-center gap-3">
              <SkeletonBlock className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <SkeletonBlock className="h-4 w-40" />
                <SkeletonBlock className="h-3 w-52" />
              </div>
            </div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <SkeletonBlock className="h-3 w-20" />
                  <SkeletonBlock className="h-3 w-28" />
                </div>
              ))}
            </div>
          </div>
  
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
            <SkeletonBlock className="h-4 w-28" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <SkeletonBlock className="h-3 w-16" />
                  <SkeletonBlock className="h-3 w-24" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }