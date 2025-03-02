"use client";

import { FileText, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Add this import
import { useEffect, useState } from "react";
import { auth } from "@/app/firebase";
import {
  onAuthStateChanged,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function SiteHeader() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // Add router

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/"); // Redirect to homepage after logout
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Rest of the component remains the same
  return (
    <header className="sticky top-0 z-50 w-full border-b-4 border-purple-900/50 bg-black/80 shadow-sm backdrop-blur-sm">
      <div className="flex h-14 items-center px-4">
        <div className="flex flex-1 justify-start">
          {/* Left section - empty */}
        </div>

        {/* Center logo */}
        <div className="flex items-center justify-center">
          <Link href={"/"}>
            <div className="flex items-center space-x-2 text-white">
              <FileText className="size-8" />
              <span className="font-mono text-xl font-extrabold">
                tiny-Notes
              </span>
            </div>
          </Link>
        </div>

        <div className="mr-8 flex flex-1 justify-end">
          {/* Right section - user profile or empty */}
          {!loading && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative flex size-9 overflow-hidden rounded-full ring-2 ring-purple-500 transition-all hover:ring-4">
                  {user.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt="Profile"
                      width={36}
                      height={36}
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-purple-700 text-sm font-bold text-white">
                      {user.displayName
                        ? user.displayName[0].toUpperCase()
                        : "U"}
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-lg p-4">
                <div className="px-2 py-1.5 text-sm font-medium text-white">
                  {user.displayName || user.email}
                </div>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-500"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
