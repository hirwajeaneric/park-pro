"use client";

import Link from "next/link";
import Logo from "./Logo";
import { useAuth } from "@/hooks/useAuth";

export default function Header() {
  const { 
    isAuthenticated, 
    isLoading, 
    logout 
  } = useAuth();

  const handleProtectedLink = (e: React.MouseEvent, path: string) => {
    if (!isAuthenticated) {
      e.preventDefault();
      // You might want to redirect to login here
      // or show a modal, etc.
      window.location.href = `/auth/signin?redirect=${encodeURIComponent(path)}`;
    }
  };

  if (isLoading) {
    return null; // or a loading spinner
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Left Menu Items */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/" className="text-gray-600 hover:text-primary transition-colors">
            Home
          </Link>
          <Link 
            href="/book-tour" 
            onClick={(e) => handleProtectedLink(e, '/book-tour')}
            className="text-gray-600 hover:text-primary transition-colors"
          >
            Book Tour
          </Link>
          <Link 
            href="/provide-services" 
            onClick={(e) => handleProtectedLink(e, '/provide-services')}
            className="text-gray-600 hover:text-primary transition-colors"
          >
            Provide Services
          </Link>
        </div>

        {/* Center Logo */}
        <Link href="/" className="flex-1 md:flex-none flex items-center justify-center">
          <Logo />
        </Link>

        {/* Right Menu Items */}
        <div className="flex items-center space-x-4">
          <Link 
            href="/donate" 
            onClick={(e) => handleProtectedLink(e, '/donate')}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Donate
          </Link>
          {isAuthenticated ? (
            <>
              <Link href="/account" className="px-4 py-2 border border-primary cursor-pointer text-primary rounded-md hover:bg-primary/10 transition-colors">
                Profile
              </Link>
              <button
                onClick={logout}
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
  );
}