import ResetPasswordForm from "@/components/forms/ResetPasswordForm";
import { PageBanner } from "@/components/widget/PageBanner";
import SkeletonCardOne from "@/components/widget/SkeletonCardOne";
import { Suspense } from "react";

export default function page() {
  return (
    <>
      <PageBanner
        title="Change Password?"
        backgroundImage={"/Gabon_Loango_National_Park_Southern_Camping_Ground_bar_with_a_view.jpeg"}
      />
      <section className="py-8 bg-white mx-auto w-full flex flex-col items-center justify-center">
        <div className="container px-4 flex w-full items-center justify-center">
          <Suspense fallback={<SkeletonCardOne />}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </section>
    </>
  )
}