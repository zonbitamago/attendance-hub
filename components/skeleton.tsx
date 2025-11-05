export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}

export function SkeletonAttendanceItem() {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg animate-pulse">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-8 h-8 bg-gray-200 rounded"></div>
        <div className="h-5 bg-gray-200 rounded w-24"></div>
      </div>
      <div className="h-3 bg-gray-200 rounded w-32"></div>
    </div>
  );
}
