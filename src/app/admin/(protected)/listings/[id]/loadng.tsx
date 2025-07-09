export default function ListingLoadingSkeleton() {
  return (
    <div className="max-w-5xl mx-auto p-6 animate-pulse space-y-4">
      <div className="h-8 bg-gray-300 rounded w-2/3"></div>
      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
      <div className="h-6 bg-gray-200 rounded w-1/4"></div>
      <div className="h-[300px] bg-gray-300 rounded"></div>
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
    </div>
  );
}
