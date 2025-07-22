"use client";

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  text?: string;
}

export default function LoadingSpinner({
  fullScreen = false,
  text = "Loading...",
}: LoadingSpinnerProps) {
  return (
    <div
      className={`flex items-center justify-center ${
        fullScreen ? "h-screen w-screen" : "h-full w-full"
      }`}
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
        {text && <p className="text-gray-600">{text}</p>}
      </div>
    </div>
  );
}
