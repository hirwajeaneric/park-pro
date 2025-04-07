/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/BookingForm.tsx
// src/components/BookingForm.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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

// Dynamically import CheckoutForm with SSR disabled
const CheckoutForm = dynamic(() => import("./CheckoutForm"), { ssr: false });

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const BookingFormSchema = z.object({
  visitDate: z.string().min(1, "Please select a date")
    .refine(date => new Date(date) >= new Date(), {
      message: "Date must be in the future"
    }),
});

type BookingFormValues = z.infer<typeof BookingFormSchema>;

export default function BookingForm({ activityId, price }: { activityId: string; price: number }) {
  const { accessToken } = useAuth();
  const router = useRouter();
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(BookingFormSchema),
    defaultValues: {
      visitDate: "",
    },
  });

  const bookMutation = useMutation({
    mutationFn: ({ activityId, visitDate, paymentMethodId }: { activityId: string; visitDate: string; paymentMethodId: string }) =>
      bookTour({ activityId, visitDate, paymentMethodId, token: accessToken! }),
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
    const { visitDate } = form.getValues();
    bookMutation.mutate({ activityId, visitDate, paymentMethodId });
  };

  const onSubmit = (data: BookingFormValues) => {
    if (!accessToken) {
      toast.error("Please log in to book a tour.");
      return;
    }
    setIsPaymentDialogOpen(true);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          <Button type="submit" disabled={bookMutation.isPending} className="cursor-pointer">
            {bookMutation.isPending ? "Booking..." : `Book Tour (${price} XAF)`}
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
            <CheckoutForm onPaymentSuccess={handlePaymentSuccess} amount={price} onClose={() => setIsPaymentDialogOpen(false)}/>
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
            <p>Your booking with code <span className="font-semibold">{activityId}</span> has been confirmed.</p>
            <p>Amount: <span className="font-semibold">{price}</span> XAF</p>
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