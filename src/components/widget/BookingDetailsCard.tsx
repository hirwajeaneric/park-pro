/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
// import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { cancelBooking } from "@/lib/api";
import { BookingResponse } from "@/types";
import { format } from "date-fns";
// import { toast } from "sonner";

interface BookingDetailsCardProps {
  booking: BookingResponse;
  activityName: string;
}

export default function BookingDetailsCard({ booking, activityName }: BookingDetailsCardProps) {
  // const queryClient = useQueryClient();
  const [status, setStatus] = useState(booking.status);

  let badgeVariant: "default" | "success" | "destructive" = "default";
  switch (status) {
    case "CONFIRMED":
      badgeVariant = "success";
      break;
    case "CANCELLED":
      badgeVariant = "destructive";
      break;
    case "PENDING":
      badgeVariant = "default";
      break;
  }

  // const cancelMutation = useMutation({
  //   mutationFn: () => cancelBooking(booking.id),
  //   onSuccess: (data) => {
  //     setStatus(data.status);
  //     queryClient.invalidateQueries({ queryKey: ["bookings", booking.id] });
  //     queryClient.invalidateQueries({ queryKey: ["bookings"] });
  //     toast.success("Booking cancelled successfully");
  //   },
  //   onError: (error: Error) => {
  //     toast.error(error.message || "Failed to cancel booking");
  //   },
  // });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking for {activityName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 p-2 rounded bg-slate-100 border">
          <p>
            <strong>Status:</strong>{" "}
            <Badge variant={badgeVariant}>{status}</Badge>
          </p>
          <p>
            <strong>Booking ID:</strong> {booking.id}
          </p>
          <p>
            <strong>Visitor ID:</strong> {booking.visitorId}
          </p>
          <p>
            <strong>Park ID:</strong> {booking.parkId}
          </p>
          <p>
            <strong>Amount:</strong> {booking.amount} {booking.currency}
          </p>
          <p>
            <strong>Visit Date:</strong> {format(new Date(booking.visitDate), "MMM dd, yyyy")}
          </p>
          <p>
            <strong>Payment Reference:</strong> {booking.paymentReference}
          </p>
          <p>
            <strong>Confirmed At:</strong>{" "}
            {booking.confirmedAt ? format(new Date(booking.confirmedAt), "MMM dd, yyyy, HH:mm") : "N/A"}
          </p>
          <p>
            <strong>Created At:</strong> {format(new Date(booking.createdAt), "MMM dd, yyyy, HH:mm")}
          </p>
          <p>
            <strong>Updated At:</strong> {format(new Date(booking.updatedAt), "MMM dd, yyyy, HH:mm")}
          </p>
          <p>
            <strong>Number of Tickets:</strong> {booking.numberOfTickets}
          </p>
          {booking.numberOfTickets > 1 && (
            <div>
              <strong>Group Members:</strong>
              <ul className="list-disc pl-5 mt-1">
                {booking.groupMembers.map((member, index) => (
                  <li key={index}>
                    {member.guestName || `Guest ${index + 1}`}
                    {member.guestEmail && ` (${member.guestEmail})`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
      {/* {(status === "PENDING" || status === "CONFIRMED") && (
        <div className="px-4 py-5 sm:px-6">
          <Button
            variant="destructive"
            onClick={() => cancelMutation.mutate()}
            disabled={cancelMutation.isPending}
          >
            Cancel Booking
          </Button>
        </div>
      )} */}
    </Card>
  );
}