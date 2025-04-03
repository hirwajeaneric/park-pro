import Link from "next/link";
import { Button } from "../ui/button";

const bannerBackground = {
    backgroundImage: "url(https://stujarvis.com/wp-content/uploads/2018/05/Loango-Elephants-2-3689278012-1527543194904-1440x918.jpg)",
    backgroundSize: "cover",
    backgroundPosition: "center",
}

export default function HeroSection() {
    return (
        <section className="relative h-screen flex items-center justify-center text-center text-white">
            <div
                className="absolute inset-0 z-0"
                style={bannerBackground}
            >
                <div className="absolute inset-0 bg-black/40" />
            </div>

            <div className="relative z-10 container mx-auto px-4">
                <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
                    Welcome to Loango National Park
                </h1>
                <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto animate-slide-in">
                    Experience the last Eden of Africa, where pristine beaches meet lush rainforests,
                    and incredible wildlife roams freely.
                </p>
                <Link href="/book-tour">
                    <Button className="bg-green-700 hover:bg-green-600 text-white px-8 py-4 text-lg rounded-md">
                        Book Your Tour Today
                    </Button>
                </Link>
            </div>
        </section>
    )
}