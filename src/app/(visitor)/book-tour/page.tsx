import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageBanner } from "@/components/widget/PageBanner";
import { Services } from "@/data/data";

export default function page() {

    return (
        <div>
            <PageBanner title="Book Tour" backgroundImage={Services[0].image} />
            <section className="py-8 bg-white">
                <div className="container mx-auto px-4">
                    <p className="text-xl text-center">Experience the wonders of Loango National Park with our professionally guided tours. Choose from a variety of packages to suit your interests and schedule.</p>
                </div>
            </section>
            <div className="flex-1 bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <p className="text-lg mb-6">Fill out the form below to book for a tour in Loango National Park</p>

            <div className="mb-8">
              <RadioGroup defaultValue="foreigner" className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="foreigner" id="foreigner" />
                  <Label htmlFor="foreigner">Foreigner</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="citizen" id="citizen" />
                  <Label htmlFor="citizen">Citizen</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName">First name</Label>
                    <Input id="firstName" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email address</Label>
                    <Input id="email" type="email" placeholder="example@gmail.com" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Marital Status</Label>
                    <RadioGroup defaultValue="married" className="flex space-x-6 mt-1">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="single" id="single" />
                        <Label htmlFor="single">Single</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="married" id="married" />
                        <Label htmlFor="married">Married</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="divorced" id="divorced" />
                        <Label htmlFor="divorced">Divorced</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input id="age" type="number" className="mt-1" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Contact and Identification</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="nationality">Nationality</Label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Choose country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                        <SelectItem value="au">Australia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="+1" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="passport">Passport Number</Label>
                    <Input id="passport" placeholder="19GA562793" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="visaType">Visa type</Label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="visit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="visit">Visit</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="work">Work</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Details of Your Tour</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="tourType">Type</Label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Choose tour type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wildlife">Wildlife Safari</SelectItem>
                        <SelectItem value="hiking">Hiking</SelectItem>
                        <SelectItem value="beach">Beach Tour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration</Label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Full day" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="half">Half Day</SelectItem>
                        <SelectItem value="full">Full Day</SelectItem>
                        <SelectItem value="multi">Multi-Day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="services">Other Services</Label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Hotel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hotel">Hotel</SelectItem>
                        <SelectItem value="transport">Transportation</SelectItem>
                        <SelectItem value="guide">Private Guide</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div>
                <Button className="bg-gray-900 hover:bg-gray-800">Proceed to Payment</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
        </div>
    )
}