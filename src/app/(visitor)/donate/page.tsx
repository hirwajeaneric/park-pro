import { Button } from "@/components/ui/button";
import { PageBanner } from "@/components/widget/PageBanner";
import { Services } from "@/data/data";

export default function page() {
  return (
    <div>
      <PageBanner title="Donate to Conservation Efforts" backgroundImage={Services[2].image} />
      <section className="pb-16">
        <div className="container mx-auto px-4">
          <p className="text-center text-lg mb-10 max-w-3xl mx-auto">
            Your donation helps us preserve one of Africa&apos;s most pristine ecosystems. 
            Every contribution, regardless of size, makes a difference in our conservation efforts.
          </p>
          
          <div className="max-w-4xl mx-auto mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div
                  className="h-48 bg-cover bg-center"
                  style={{
                    backgroundImage: "url(https://stujarvis.com/wp-content/uploads/2018/05/Loango-Elephants-2-3689278012-1527543194904-1440x918.jpg)"
                  }}
                ></div>
                <div className="p-6">
                  <h2 className="text-2xl font-semibold mb-4">Wildlife Conservation</h2>
                  <p className="text-gray-600 mb-6">
                    Support our efforts to protect endangered species like forest elephants, gorillas, and sea turtles. 
                    Your donation funds anti-poaching patrols, wildlife monitoring, and habitat restoration.
                  </p>
                  <Button variant="outline" className="w-full">Donate to Wildlife Conservation</Button>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div
                  className="h-48 bg-cover bg-center"
                  style={{
                    backgroundImage: "url(https://journeysbydesign.com/wp-content/uploads/2022/08/Kyle-de-Nobrega-Gabon-Loango-22-of-81-2.jpg)"
                  }}
                ></div>
                <div className="p-6">
                  <h2 className="text-2xl font-semibold mb-4">Community Development</h2>
                  <p className="text-gray-600 mb-6">
                    Help us empower local communities through education, sustainable livelihoods, and healthcare initiatives.
                    Strong communities are essential partners in conservation.
                  </p>
                  <Button variant="outline" className="w-full">Donate to Community Programs</Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">Make a Donation</h2>
            
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">Donation Amount</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {["$25", "$50", "$100", "$250"].map((amount) => (
                  <button
                    key={amount}
                    className="bg-gray-100 hover:bg-primary hover:text-white transition-colors rounded-md py-3 font-medium"
                  >
                    {amount}
                  </button>
                ))}
              </div>
              <div className="flex items-center">
                <span className="mr-2">Custom amount:</span>
                <input
                  type="number"
                  className="w-32 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="$0.00"
                  min="1"
                />
              </div>
            </div>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="johndoe@example.com"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Card Information</label>
                  <input 
                    type="text" 
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Card number"
                  />
                </div>
                <div>
                  <input 
                    type="text" 
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="MM/YY"
                  />
                </div>
                <div>
                  <input 
                    type="text" 
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="CVC"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-700">Make this a monthly recurring donation</span>
                  </label>
                </div>
              </div>
              
              <div className="flex justify-center mt-8">
                <Button className="px-8 py-3 text-lg">
                  Complete Donation
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}