export default function NavbarSkeleton() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm h-16">
      <div className="container mx-auto px-4 h-full flex justify-between items-center">
        {/* Logo Skeleton */}
        <div className="flex items-center space-x-2">
          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse hidden sm:block"></div>
        </div>

        {/* Desktop Nav Skeleton */}
        <div className="hidden md:flex space-x-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-6 w-16 bg-gray-200 rounded animate-pulse"
            ></div>
          ))}
        </div>

        {/* Desktop Buttons Skeleton */}
        <div className="hidden md:flex space-x-4">
          <div className="h-9 w-24 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-9 w-28 bg-blue-200 rounded animate-pulse"></div>
        </div>

        {/* Mobile Hamburger Skeleton */}
        <div className="md:hidden">
          <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </header>
  );
}
