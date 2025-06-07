"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserProfileForm from "@/components/forms/UserProfileForm";
import BookingForm from "./BookingForm";
import { ParkActivityCardProps } from "../widget/ParkActivityCard";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

export default function ActivityDetails({ activity }: { activity: ParkActivityCardProps }) {
    const [activeTab, setActiveTab] = useState("details");
    const router = useRouter();

    return (
        <section className="py-8 bg-white">
            <div className="container mx-auto px-4">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-4"
                >
                    ← Back to Activities
                </Button>
                <div className="container mx-auto px-4">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="details" className="cursor-pointer">
                                <span className="font-semibold">Step 1: </span>
                                Activity Details and personal information
                            </TabsTrigger>
                            <TabsTrigger value="book" className="cursor-pointer">
                                <span className="font-semibold">Step 2: </span>
                                Book Now
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="details">
                            <Card>
                                <CardHeader>
                                    <CardTitle>{activity.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <p className="text-gray-600">{activity.description}</p>
                                        <p className="font-semibold">Price: XAF {Number(activity.price).toFixed(2)}</p>
                                        <p>Capacity per day: {activity.capacityPerDay} people</p>

                                        <div className="mt-8">
                                            <h3 className="text-lg font-semibold mb-4">Your Profile Information</h3>
                                            <UserProfileForm />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="book">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Book {activity.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <BookingForm activityId={activity.id} activityName={activity.name} price={activity.price} />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </section>
    );
}