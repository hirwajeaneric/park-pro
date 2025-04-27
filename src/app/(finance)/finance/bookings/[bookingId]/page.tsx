/* eslint-disable @typescript-eslint/no-unused-vars */
import BookingDetailsCard from "@/components/widget/BookingDetailsCard";
import { getBookingById } from "@/lib/api";
import ProtectedRoute from "@/lib/ProtectedRoute";
import { BookingResponse } from "@/types";
import { Metadata } from "next";
import { cookies } from "next/headers";

export const dynamicParams = true;

type Props = {
  params: { bookingId: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { bookingId } = await params;

  try {
    const booking = await getBookingById(bookingId);
    return {
      title: `Booking ${booking.id.slice(0, 8)}... - Government Dashboard`,
      description: `Details for booking ${booking.id}`,
    };
  } catch (error) {
    return {
      title: "Booking Not Found",
      description: "Booking details not available",
    };
  }
}

export default async function BookingDetailsPage({ params }: Props) {
  const { bookingId } = await params;

  let booking: BookingResponse;
  try {
    booking = await getBookingById(bookingId);
  } catch (error) {
    return (
      <ProtectedRoute>
        <div className="w-full bg-white">
          <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-18 py-6">
            <h1 className="font-bold text-3xl text-destructive">Booking Not Found</h1>
            <p className="mt-2 text-muted-foreground">
              Unable to load booking details. Please try again.
            </p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <h1 className="text-2xl font-bold">Booking Details</h1>
        <BookingDetailsCard booking={booking} />
      </div>
    </ProtectedRoute>
  );
}