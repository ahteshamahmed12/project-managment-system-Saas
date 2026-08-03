import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Search, ChevronDown } from "lucide-react";

export default function Navbar() {
  return (
    <header className="flex items-center justify-between px-8 py-6">
      <h1 className="text-3xl font-bold text-black">Dashboard</h1>

      <div className="relative mx-8 flex-1 max-w-xl">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search for anything..."
          className="rounded-full border-0 bg-white pl-11 shadow-sm"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
          <Bell className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 rounded-full bg-white px-3 py-2 shadow-sm">
          <Avatar className="h-9 w-9">
            <AvatarImage src="https://i.pravatar.cc/100?img=12" />
            <AvatarFallback>AM</AvatarFallback>
          </Avatar>
          <div className="text-left">
            <p className="text-sm font-semibold">Alex meian</p>
            <p className="text-xs text-gray-500">Product manager</p>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </header>
  );
}
