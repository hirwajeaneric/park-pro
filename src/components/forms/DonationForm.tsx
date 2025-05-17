"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { createDonation } from "@/lib/api";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";
import dynamic from "next/dynamic";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Elements } from "@stripe/react-stripe-js";

const DonationCheckoutForm = dynamic(() => import("./DonationCheckoutForm"), { ssr: false });

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const donationOptions = [
  {
    id: "wildlife",
    title: "Wildlife Conservation",
    amount: 50,
    description: "Support our efforts to protect endangered species"
  },
  {
    id: "education",
    title: "Education Programs",
    amount: 30,
    description: "Fund educational initiatives for local communities"
  },
  {
    id: "maintenance",
    title: "Park Maintenance",
    amount: 25,
    description: "Help maintain trails and facilities"
  },
  {
    id: "research",
    title: "Scientific Research",
    amount: 75,
    description: "Support ongoing wildlife research projects"
  }
];

export default function DonationForm() {
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [motive, setMotive] = useState("");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);

  const donationMutation = useMutation({
    mutationFn: ({ amount, motive, paymentMethodId }: { 
      amount: string; 
      motive: string; 
      paymentMethodId: string 
    }) => createDonation({
      parkId: process.env.NEXT_PUBLIC_PARK_ID!,
      amount,
      motiveForDonation: motive,
    }, paymentMethodId),
    onSuccess: () => {
      setIsPaymentDialogOpen(false);
      setIsSuccessDialogOpen(true);
      toast.success("Donation successful! Thank you for your support.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Donation failed. Please try again.");
    }
  });

  const handleDonationOptionClick = (optionAmount: number, optionDescription: string) => {
    setAmount(optionAmount);
    setMotive(optionDescription);
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setCustomAmount(value);
      setAmount(value ? Number(value) : null);
    }
  };

  const handleSubmit = () => {
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid donation amount");
      return;
    }
    if (!motive) {
      toast.error("Please provide a motive for your donation");
      return;
    }
    setIsPaymentDialogOpen(true);
  };

  const handlePaymentSuccess = (paymentMethodId: string) => {
    donationMutation.mutate({
      amount: amount!.toFixed(2),
      motive,
      paymentMethodId
    });
  };

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Make a Difference</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Your generous donation helps us protect wildlife, maintain our park, 
                and support local communities. Choose from our suggested donation 
                options or specify your own amount.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {donationOptions.map((option) => (
                  <Card 
                    key={option.id}
                    className={`cursor-pointer transition-all ${amount === option.amount ? 'border-primary border-2' : 'hover:shadow-md'}`}
                    onClick={() => handleDonationOptionClick(option.amount, option.description)}
                  >
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg">{option.title}</h3>
                      <p className="text-primary font-bold text-xl">${option.amount}</p>
                      <p className="text-gray-600 text-sm mt-2">{option.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="customAmount">Or enter custom amount (XAF)</Label>
                  <Input
                    id="customAmount"
                    type="number"
                    placeholder="Enter amount"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="motive">Motive for donation</Label>
                  <Textarea
                    id="motive"
                    placeholder="Why are you making this donation?"
                    value={motive}
                    onChange={(e) => setMotive(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="mt-6">
                {amount && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <p className="font-semibold">Donation Summary</p>
                    <p>Amount: <span className="font-bold">{amount} XAF</span></p>
                    <p>Purpose: <span className="text-gray-600">{motive}</span></p>
                  </div>
                )}
                <Button 
                  onClick={handleSubmit}
                  disabled={!amount || !motive}
                  className="w-full"
                >
                  Proceed to Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Dialog */}
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Complete Your Donation</DialogTitle>
            </DialogHeader>
            <Elements stripe={stripePromise}>
              <DonationCheckoutForm 
                onPaymentSuccess={handlePaymentSuccess} 
                amount={amount!}
                description={`Donation: ${motive}`}
                onClose={() => setIsPaymentDialogOpen(false)}
              />
            </Elements>
          </DialogContent>
        </Dialog>

        {/* Success Dialog */}
        <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thank You for Your Donation!</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>Your generous contribution of {amount} XAF will help us {motive.toLowerCase()}.</p>
              <p>We&apos;ve sent a receipt to your email address.</p>
              <Button 
                onClick={() => {
                  setIsSuccessDialogOpen(false);
                  setAmount(null);
                  setCustomAmount("");
                  setMotive("");
                }}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}