import { Loader2 } from "lucide-react"

interface LoaderProps {
  size?: number
  className?: string
}

export function Loader({ size = 24, className = "" }: LoaderProps) {
  return (
    <div className={`flex h-full w-full items-center justify-center ${className}`}>
      <Loader2 className={`h-${size} w-${size} animate-spin text-primary`} />
    </div>
  )
}
