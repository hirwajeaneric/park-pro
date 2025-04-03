import Link from "next/link";
import Logo from "./Logo";

export default function Header(){
    const isAuthenticated = false;
    const handleLogout = () => {
        console.log("Logout");
    }

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b">
            <div className="container mx-auto flex items-center justify-between h-16 px-4">
                {/* Left Menu Items */}
                <div className="hidden md:flex items-center space-x-6">
                    <Link href="/" className="text-gray-600 hover:text-primary transition-colors">
                        Home
                    </Link>
                    <Link href="/book-tour" className="text-gray-600 hover:text-primary transition-colors">
                        Book Tour
                    </Link>
                    <Link href="/provide-services" className="text-gray-600 hover:text-primary transition-colors">
                        Provide Services
                    </Link>
                </div>

                {/* Center Logo */}
                <Link href="/" className="flex-1 md:flex-none flex items-center justify-center">
                    <Logo />
                </Link>

                {/* Right Menu Items */}
                <div className="flex items-center space-x-4">
                    <Link href="/donate" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
                        Donate
                    </Link>
                    {isAuthenticated ? (
                        <>
                            <Link href="/account" className="px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary/10 transition-colors">
                                Profile
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-600/10 transition-colors"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link href="/auth/signin" className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-600/10 transition-colors">
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    )
}