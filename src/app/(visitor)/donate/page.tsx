import { PageBanner } from "@/components/widget/PageBanner";
import ProtectedRoute from "@/lib/ProtectedRoute";
import { Metadata } from "next";
import { Services } from "@/data/data";
import DonationForm from "@/components/forms/DonationForm";

export const metadata: Metadata = {
  title: "Support Our Park - Make a Donation",
  description: "Contribute to wildlife conservation and park maintenance through your generous donations.",
};

export default function page() {
  return (
    <ProtectedRoute>
      <PageBanner 
        title="Support Conservation Efforts" 
        backgroundImage={Services[0].image}
        description="Your donation makes a difference"
      />
      <DonationForm />
    </ProtectedRoute>
  );
}