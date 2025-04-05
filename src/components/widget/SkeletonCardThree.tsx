import { Skeleton } from "@/components/ui/skeleton"

export default function SkeletonCardThree() {
    return (
        <section className="pb-16 bg-white">
            <div className="container mx-auto px-4 w-full">
                <div className="flex flex-col space-y-3 w-full">
                    <Skeleton className="h-[250px] w-full rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                </div>
            </div>
        </section >
    )
}
