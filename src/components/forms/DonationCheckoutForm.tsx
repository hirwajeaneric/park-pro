"use client";

import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CheckoutFormProps {
  onPaymentSuccess: (paymentMethodId: string) => void;
  amount: number;
  description: string;
  onClose: () => void;
}

export default function DonationCheckoutForm({ 
  onPaymentSuccess, 
  amount,
  description,
  onClose
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: elements.getElement(CardElement)!,
    });

    if (error) {
      setErrorMessage(error.message || "Payment failed");
      setIsLoading(false);
    } else if (paymentMethod) {
      onPaymentSuccess(paymentMethod.id);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <p className="font-semibold">Amount: {amount} XAF</p>
        <p className="text-gray-600">{description}</p>
      </div>

      <div className="border rounded-md p-4">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": {
                  color: "#aab7c4",
                },
              },
              invalid: {
                color: "#9e2146",
              },
            },
          }}
        />
      </div>

      {errorMessage && <p className="text-red-500">{errorMessage}</p>}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isLoading}
          className="flex-1"
        >
          {isLoading ? "Processing..." : `Donate ${amount} XAF`}
        </Button>
      </div>
    </form>
  );
}