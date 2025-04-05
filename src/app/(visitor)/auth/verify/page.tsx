import VerifyAccountForm from "@/components/forms/VerifyAccountForm";
import { PageBanner } from "@/components/widget/PageBanner";
import SkeletonCardOne from "@/components/widget/SkeletonCardOne";
import { Suspense } from "react";

export default function page() {
  return (
    <>
      <PageBanner
        title="Verify Your Account"
        backgroundImage={"/Gabon_Loango_National_Park_Southern_Camping_Ground_bar_with_a_view.jpeg"}
      />
      <section className="py-8 bg-white mx-auto w-full flex flex-col items-center justify-center">
        <p className="mb-5 font-semibold">Confirm your account by entering your verification code.</p>
        <div className="container px-4 flex w-full items-center justify-center flex-col">
          <Suspense fallback={<SkeletonCardOne />}>
            <VerifyAccountForm />
          </Suspense>
        </div>
      </section>
    </>
  )
}