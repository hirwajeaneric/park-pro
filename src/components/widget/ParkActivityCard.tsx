import Link from "next/link";
import { Button } from "../ui/button";

export type ParkActivityCardProps = {
    id: string;
    name: string;
    parkId: string;
    price: number;
    description: string;
    picture: string | null; // Allow null
    capacityPerDay: number; // Change to number
    createdAt?: string;
    updatedAt?: string;
}

export default function ParkActivityCard({ activity }: { activity: ParkActivityCardProps }) {
    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div
                className="h-48 bg-cover bg-center"
                style={{
                    backgroundImage: activity.picture ? `url(${activity.picture})`: "url(/placeholder.svg?height=600&width=400)"
                }}
            ></div>
            <div className="p-4">
                <h2 className="text-2xl font-semibold mb-4">{activity.name}</h2>
                <p className="text-gray-600 mb-4">
                    {activity.description}
                </p>
                <span className="text-blue-500 font-semibold text-sm">XAF {activity.price}</span>
                <Button variant="outline" className="w-full mt-4">
                    <Link href={`/book-tour/${activity.id}`}>Book Now</Link>
                </Button>
            </div>
        </div>
    )
}