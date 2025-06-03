import { Facebook, Linkedin, Youtube, Instagram } from "lucide-react";
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-blue-500 text-white py-12">
            <div className="container mx-auto px-4">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2">Loango National Park</h2>
                    <p>©{new Date().getFullYear()} Loango National Park</p>
                </div>

                <div className="flex justify-center space-x-8 mb-8">
                    <Link href="/" className="hover:underline">
                        Home
                    </Link>
                    <Link href="/donate" className="hover:underline">
                        Donate
                    </Link>
                    <Link href="/book-tour" className="hover:underline">
                        Book Tour
                    </Link>
                    <Link href="/services" className="hover:underline">
                        Provide Services
                    </Link>
                </div>

                <div className="flex justify-center space-x-6">
                    <Link href={`#`} className="hover:opacity-80">
                        <Facebook />
                    </Link>
                    <Link href={`#`} className="hover:opacity-80">
                        <Linkedin />
                    </Link>
                    <Link href={`#`} className="hover:opacity-80">
                        <Youtube />
                    </Link>
                    <Link href={`#`} className="hover:opacity-80">
                        <Instagram />
                    </Link>
                </div>
            </div>
        </footer>
    )
}