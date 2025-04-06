// src/components/CheckoutForm.tsx
"use client";

import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CheckoutFormProps {
  onPaymentSuccess: (paymentMethodId: string) => void;
  amount: number;
}

export default function CheckoutForm({ onPaymentSuccess, amount }: CheckoutFormProps) {
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

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setErrorMessage("Card element not found.");
      setIsLoading(false);
      return;
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
    });

    if (error) {
      setErrorMessage(error.message || "An error occurred during payment.");
      setIsLoading(false);
    } else if (paymentMethod) {
      onPaymentSuccess(paymentMethod.id);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
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
      {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
      <Button type="submit" disabled={!stripe || isLoading} className="mt-4 w-full">
        {isLoading ? "Processing..." : `Pay ${amount} XAF`}
      </Button>
    </form>
  );
}