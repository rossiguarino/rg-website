import { cn } from "@/lib/utils"

/** Props for the Spinner component. */
interface SpinnerProps {
  /** Additional CSS classes. */
  className?: string
  /** Size of the spinner. */
  size?: "sm" | "default" | "lg"
}

/**
 * Loading spinner component with configurable size.
 */
export function Spinner({ className, size = "default" }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-8 w-8",
    lg: "h-12 w-12",
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-gray-300 border-t-[#3D6B7E]",
          sizeClasses[size]
        )}
      />
    </div>
  )
}
