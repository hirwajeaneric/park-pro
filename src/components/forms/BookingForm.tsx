/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { bookTour } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Dynamically import CheckoutForm with SSR disabled
const CheckoutForm = dynamic(() => import("./CheckoutForm"), { ssr: false });

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const BookingFormSchema = z.object({
  visitDate: z.string().min(1, "Please select a date")
    .refine(date => new Date(date) >= new Date(), {
      message: "Date must be in the future"
    }),
  numberOfTickets: z.number().min(1, "At least one ticket is required"),
  bookingType: z.enum(["single", "group"]),
  groupMembers: z.array(
    z.object({
      guestName: z.string().optional(),
      guestEmail: z.string().email().optional(),
    })
  ).optional(),
}).refine(data => {
  if (data.bookingType === "group" && (!data.groupMembers || data.groupMembers.length !== data.numberOfTickets - 1)) {
    return false;
  }
  return true;
}, {
  message: "Number of group members must match number of tickets minus one",
  path: ["groupMembers"],
});

type BookingFormValues = z.infer<typeof BookingFormSchema>;

export default function BookingForm({ activityId, activityName, price }: { activityId: string; activityName: string; price: number }) {
  const { accessToken } = useAuth();
  const router = useRouter();
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(BookingFormSchema),
    defaultValues: {
      visitDate: "",
      numberOfTickets: 1,
      bookingType: "single",
      groupMembers: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "groupMembers",
  });

  const bookMutation = useMutation({
    mutationFn: ({ activityId, visitDate, numberOfTickets, groupMembers, paymentMethodId }: { activityId: string; visitDate: string; numberOfTickets: number; groupMembers: any[]; paymentMethodId: string }) =>
      bookTour({ activityId, visitDate, numberOfTickets, groupMembers, paymentMethodId }),
    onSuccess: () => {
      setIsPaymentDialogOpen(false);
      setIsSuccessDialogOpen(true);
      toast.success("Booking created successfully!");
      form.reset();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create booking.");
    },
  });

  const handlePaymentSuccess = (paymentMethodId: string) => {
    const { visitDate, numberOfTickets, groupMembers } = form.getValues();
    bookMutation.mutate({ activityId, visitDate, numberOfTickets, groupMembers: groupMembers || [], paymentMethodId });
  };

  const onSubmit = (data: BookingFormValues) => {
    if (!accessToken) {
      toast.error("Please log in to book a tour.");
      return;
    }
    setIsPaymentDialogOpen(true);
  };

  const handleBookingTypeChange = (value: string) => {
    form.setValue("bookingType", value as "single" | "group");
    if (value === "single") {
      form.setValue("numberOfTickets", 1);
      form.setValue("groupMembers", []);
      while (fields.length > 0) {
        remove(0);
      }
    }
  };

  const handleNumberOfTicketsChange = (value: string) => {
    const numTickets = parseInt(value);
    form.setValue("numberOfTickets", numTickets);
    const currentMembers = form.getValues("groupMembers") || [];
    if (numTickets - 1 > currentMembers.length) {
      for (let i = currentMembers.length; i < numTickets - 1; i++) {
        append({ guestName: "", guestEmail: "" });
      }
    } else if (numTickets - 1 < currentMembers.length) {
      for (let i = currentMembers.length - 1; i >= numTickets - 1; i--) {
        remove(i);
      }
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="bookingType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Booking Type</FormLabel>
                <Select onValueChange={handleBookingTypeChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select booking type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="single">Single Booking</SelectItem>
                    <SelectItem value="group">Group Booking</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {form.watch("bookingType") === "group" && (
            <FormField
              control={form.control}
              name="numberOfTickets"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Tickets</FormLabel>
                  <Select onValueChange={handleNumberOfTicketsChange} defaultValue={field.value.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select number of tickets" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="visitDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Visit Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {form.watch("bookingType") === "group" && fields.map((field, index) => (
            <div key={field.id} className="space-y-2 border p-4 rounded">
              <h4 className="font-semibold">Group Member {index + 1}</h4>
              <FormField
                control={form.control}
                name={`groupMembers.${index}.guestName`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`groupMembers.${index}.guestEmail`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="Enter email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
          <Button type="submit" disabled={bookMutation.isPending} className="cursor-pointer">
            {bookMutation.isPending ? "Booking..." : `Book Tour (${form.watch("numberOfTickets") * price} XAF)`}
          </Button>
        </form>
      </Form>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
          </DialogHeader>
          <Elements stripe={stripePromise}>
            <CheckoutForm onPaymentSuccess={handlePaymentSuccess} amount={form.watch("numberOfTickets") * price} onClose={() => setIsPaymentDialogOpen(false)}/>
          </Elements>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking Confirmed!</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p>Your booking for <span className="font-semibold">{activityName}</span> has been confirmed.</p>
            <p>We&apos;ve sent the details to your email.</p>
          </div>
          <Button
            onClick={() => {
              setIsSuccessDialogOpen(false);
              router.push('/account/bookings'); // Redirect to bookings page
            }}
            className="mt-4"
          >
            View My Bookings
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}