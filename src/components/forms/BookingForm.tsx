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

// Dynamically import CheckoutForm with SSR disabled
const CheckoutForm = dynamic(() => import("./CheckoutForm"), { ssr: false });

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const BookingFormSchema = z.object({
  visitDate: z.string().min(1, "Please select a date"),
});

type BookingFormValues = z.infer<typeof BookingFormSchema>;

export default function BookingForm({ activityId, price }: { activityId: string; price: number }) {
  const { accessToken } = useAuth();
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
          <Button type="submit" disabled={bookMutation.isPending}>
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
            <CheckoutForm onPaymentSuccess={handlePaymentSuccess} amount={price} />
          </Elements>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking Confirmed!</DialogTitle>
          </DialogHeader>
          <p>Your booking has been successfully created and payment processed.</p>
          <Button onClick={() => setIsSuccessDialogOpen(false)}>Close</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}