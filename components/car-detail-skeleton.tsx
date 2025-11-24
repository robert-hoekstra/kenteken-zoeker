import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function CarDetailSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-6 w-48" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Skeleton className="h-6 w-32 mb-3" />
            <div className="space-y-2">
              {[...Array(6)].map((_, idx) => (
                <div key={idx} className="flex justify-between py-2 border-b">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <Skeleton className="h-6 w-40 mb-3" />
            <div className="space-y-2">
              {[...Array(8)].map((_, idx) => (
                <div key={idx} className="flex justify-between py-2 border-b">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3 md:col-span-2">
            <Skeleton className="h-6 w-32 mb-3" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, idx) => (
                <div key={idx} className="flex justify-between py-2 border-b">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

