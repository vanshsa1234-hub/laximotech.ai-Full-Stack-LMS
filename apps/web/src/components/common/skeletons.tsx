// Reusable skeleton loader components

export function CourseCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
      <div className="skeleton h-44 w-full" />
      <div className="p-5 space-y-3">
        <div className="skeleton h-5 w-3/4 rounded-lg" />
        <div className="skeleton h-4 w-full rounded-lg" />
        <div className="skeleton h-4 w-2/3 rounded-lg" />
        <div className="flex gap-3 pt-2">
          <div className="skeleton h-4 w-16 rounded-lg" />
          <div className="skeleton h-4 w-16 rounded-lg" />
          <div className="skeleton h-4 w-16 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function CourseGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => <CourseCardSkeleton key={i} />)}
    </div>
  );
}

export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
          <div className="skeleton w-10 h-10 rounded-xl mb-3" />
          <div className="skeleton h-7 w-16 rounded-lg mb-1" />
          <div className="skeleton h-4 w-24 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`skeleton h-4 rounded-lg ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  );
}

export function PageLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-brand-ice animate-pulse">
      <div className="h-20 bg-white border-b border-gray-100" />
      <div className="h-64 bg-gradient-to-br from-brand-blue/20 to-brand-orange/10" />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="skeleton h-8 w-64 rounded-xl mb-8" />
        <CourseGridSkeleton />
      </div>
    </div>
  );
}
