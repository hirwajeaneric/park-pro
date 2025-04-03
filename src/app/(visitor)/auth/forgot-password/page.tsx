import ForgotPasswordForm from "@/components/forms/ForgotPasswordForm";
import { PageBanner } from "@/components/widget/PageBanner";

export default function page() {
  return (
    <>
      <PageBanner 
        title="Forgot Password?" 
        description="Enter email to reset"
        backgroundImage={"/Gabon_Loango_National_Park_Southern_Camping_Ground_bar_with_a_view.jpeg"} 
      />
      <section className="py-8 bg-white mx-auto w-full flex flex-col items-center justify-center">
        <p className="mb-5 font-semibold">An email containing a reset link will be sent to you.</p>
        <div className="container px-4 flex w-full items-center justify-center">
          <ForgotPasswordForm />
        </div>
      </section>
    </>
  )
}