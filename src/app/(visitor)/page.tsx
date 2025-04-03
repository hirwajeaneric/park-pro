import Image from "next/image"
import HeroSection from "@/components/widget/HeroSection"
import Link from "next/link";
import { Services } from "@/data/data";

export default function Home() {
  const Images = {
    descriptionImage: "/Kyle-de-Nobrega-Gabon-Loango-22-of-81-2.jpg",
    panoramicImageSection: '/1280px-Gabon_Loango_National_Park_Southern_Camping_Ground_Panoramic.jpeg'
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <HeroSection />

      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">The Last Eden of Africa</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <p className="text-gray-700 mb-4">
                The first formal protected area was established in 1956, but it wasn&apos;t until 2002 that the park itself
                was established, along with 13 others that together comprise approximately 10% of Gabon&apos;s entire
                landmass. Loango National Park is one of the most pristine stretches of coastline left on virtually all
                the world&apos;s tropical coastlines, having avoided the fate so far of the mass tourism industry and its
                associated environmental impacts.
              </p>
              <p className="text-gray-700 mb-4">
                All the major wildlife is fully protected, and tourism is carefully managed along recognized
                conservation principles.
              </p>
              <p className="text-gray-700">
                The range of wildlife in Loango - terrestrial, avian, marine - is extraordinary. Famously, the park
                offers the opportunity to observe wildlife including forest elephants and chimpanzees, but there are
                also gorillas, red river hogs, forest buffalo and elephants that surf. Loango has more than 100 miles of
                unspoiled beaches and their associated inland forests and savannas, and a number of other large mammals
                too.
              </p>
            </div>
            <div>
              <Image
                src={Images.descriptionImage ? Images.descriptionImage : "/placeholder.svg?height=600&width=400"}
                alt="Wildlife in Loango"
                width={400}
                height={600}
                className="rounded-lg object-cover h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">We Are At Your Service</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {Services.map((service, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <Image
                  src={service.image ? service.image : "/placeholder.svg?height=300&width=400"}
                  alt="Service"
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6 flex flex-col justify-between ">
                  <h3 className="text-xl font-semibold mb-2">
                    {service.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {service.description}
                  </p>
                  <Link href={service.slug} className="w-full border flex text-center items-center justify-center font-semibold text-nowrap text-sm rounded-md py-2">
                    {service.name}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full h-150" style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${Images.panoramicImageSection})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}>
      </section>

      {/* Donor Recognition */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Donor Recognition</h2>
          <p className="text-center text-gray-600 mb-8">Thank you for your support</p>
          <div className="max-w-3xl mx-auto">
            {[
              { name: "Jane Doe", title: "XYZ Corporation", position: "Managing Director" },
              { name: "Mark Manson", title: "Mark Manson", position: "" },
              { name: "Aimee Jackson", title: "Water Access International", position: "Director" },
              { name: "Larry Page", title: "Microsoft CO", position: "Co-Founder" },
              { name: "Karimo Mbaku", title: "Company/Organization name", position: "Company/Organization name" },
              { name: "Uwera Alice", title: "Company/Organization name", position: "Company/Organization name" },
              { name: "Stanley Laurent", title: "Company/Organization name", position: "Company/Organization name" },
              { name: "Umuhozi Maria Bernadette", title: "Marine Org", position: "Company/Organization name" },
            ].map((donor, i) => (
              <div key={i} className="border-b py-4 grid grid-cols-2">
                <div className="font-medium">{donor.name}</div>
                <div>
                  <div>{donor.title}</div>
                  <div className="text-sm text-gray-500">{donor.position}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Opportunities */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Open Positions & Investment Opportunities</h2>

          <div className="mb-12">
            <h3 className="text-xl font-semibold mb-6">Investment Opportunities</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {["Hotel", "Boat Tours", "Tourist Transportation", "Restaurant", "Guest House"].map((opp, i) => (
                <div key={i} className="text-center">
                  <div className="rounded-full overflow-hidden w-24 h-24 mx-auto mb-2">
                    <Image
                      src="/placeholder.svg?height=100&width=100"
                      alt={opp}
                      width={100}
                      height={100}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="font-medium">{opp}</div>
                  <div className="text-sm text-gray-500">{i + 1} spots available</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-6">Opening Positions</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {["Tour Guide", "Accountant", "Receptionist"].map((pos, i) => (
                <div key={i} className="border rounded-lg p-4 flex items-center">
                  <Image
                    src="/placeholder.svg?height=80&width=80"
                    alt={pos}
                    width={80}
                    height={80}
                    className="rounded mr-4"
                  />
                  <div>
                    <div className="font-medium">{pos}</div>
                    <div className="text-sm text-gray-500">{i + 1} spots available</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

