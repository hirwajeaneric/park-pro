import { Skeleton } from "@/components/ui/skeleton"

export default function SkeletonCardTwo() {
    return (
        <div className="flex flex-col space-y-3 w-full">
            <Skeleton className="h-[125px] w-full rounded-xl" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
            </div>
        </div>
    )
}
