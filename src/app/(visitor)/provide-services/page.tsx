import { Button } from "@/components/ui/button";
import { PageBanner } from "@/components/widget/PageBanner";
import { Services } from "@/data/data";

export default function page() {
  return (
    <div>
      <PageBanner title="Provide Services" backgroundImage={Services[1].image} />
      <section className="pb-16">
        <div className="container mx-auto px-4">
          <p className="text-center text-lg mb-10 max-w-3xl mx-auto">
            Join&apos;re looking for qualified individuals and companies to enhance visitor experiences.
          </p>
          
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">Service Provider Application</h2>
            <p className="mb-6 text-gray-600">
              Please fill out the form below to apply as a service provider. Our team will review your application and contact you.
            </p>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name / Company Name</label>
                  <input 
                    type="text" 
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="John Doe / ABC Company"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="contact@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input 
                    type="tel" 
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                  <select className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="">Select a service</option>
                    <option value="guide">Tour Guide</option>
                    <option value="transportation">Transportation</option>
                    <option value="accommodation">Accommodation</option>
                    <option value="food">Food Services</option>
                    <option value="retail">Retail/Souvenirs</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                  <input 
                    type="number" 
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="5"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website (if applicable)</label>
                  <input 
                    type="url" 
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://example.com"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Description</label>
                  <textarea 
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary h-32"
                    placeholder="Please describe the services you provide and why you would be a good fit for Loango National Park."
                  ></textarea>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Documentation (CV, Certificates, etc.)</label>
                  <input 
                    type="file" 
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    multiple
                  />
                </div>
              </div>
              
              <div className="flex justify-center mt-8">
                <Button className="px-8 py-3 text-lg">
                  Submit Application
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}