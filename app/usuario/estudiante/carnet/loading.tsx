import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function CarnetLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="text-center mb-6">
        <Skeleton className="h-8 w-64 mx-auto mb-2" />
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>

      <div className="flex justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <Skeleton className="h-6 w-48 mx-auto mb-2" />
              <Skeleton className="h-4 w-32 mx-auto" />
            </div>

            <div className="flex items-start gap-4 mb-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>

            <div className="flex justify-center mb-4">
              <Skeleton className="h-16 w-16" />
            </div>

            <div className="text-center space-y-1">
              <Skeleton className="h-3 w-32 mx-auto" />
              <Skeleton className="h-3 w-40 mx-auto" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
