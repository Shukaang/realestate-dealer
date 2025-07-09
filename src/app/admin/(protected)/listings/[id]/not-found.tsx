export default function NotFound() {
  return (
    <div className="text-center py-20">
      <h1 className="text-3xl font-bold text-red-600 mb-2">
        Listing Not Found
      </h1>
      <p className="text-gray-500">
        The listing you're looking for doesn't exist or has been removed.
      </p>
    </div>
  );
}
