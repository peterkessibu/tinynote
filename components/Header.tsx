import { FileText } from "lucide-react";
import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b-4 border-purple-900/50 shadow-sm">
      <div className="flex h-14 items-center">
        <div className="flex flex-1">
          {/* Left section - empty for balance */}
        </div>

        {/* Center logo */}
        <div className="flex items-center justify-center">
          <Link href={"/"}>
            <div className="flex items-center space-x-2 text-white">
              <FileText className="size-8" />
              <span className="text-xl font-bold">tiny-Notes</span>
            </div>
          </Link>
        </div>

        <div className="flex flex-1">
          {/* Left section - empty for balance */}
        </div>
      </div>
    </header>
  );
}
