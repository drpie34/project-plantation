/**
 * Consistent loading spinner used throughout the application
 */
export const LoadingSpinner = ({ size = "default", className = "" }) => {
  const sizeClasses = {
    small: "w-4 h-4",
    default: "w-8 h-8",
    large: "w-12 h-12"
  };
  
  const sizeClass = sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.default;
  
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className={`animate-spin rounded-full border-t-2 border-b-2 border-primary ${sizeClass}`}></div>
    </div>
  );
};