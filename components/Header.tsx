import { Button } from "@/components/ui/button";
import { StickyNote } from "lucide-react";
import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex flex-1">
          {/* Left section - empty for balance */}
        </div>

        {/* Center logo */}
        <div className="flex flex-1 items-center justify-center">
          <Link href={"/"}>
            <div className="flex items-center space-x-2 text-white">
              <StickyNote className="h-6 w-6" />
              <span className="font-bold text-xl hidden sm:inline-block">
                NoteFlow
              </span>
            </div>
          </Link>
        </div>

        {/* Right section - auth button */}
        <div className="flex flex-1 items-center justify-end">
          <Button>Sign In</Button>
        </div>
      </div>
    </header>
  );
}
