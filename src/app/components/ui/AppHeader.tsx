import { Mail, Phone, CircleUser, ChevronDown, Settings, LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";

interface AppHeaderProps {
  onOpenComposer: () => void;
  onOpenDialer: () => void;
}

export function AppHeader({ onOpenComposer, onOpenDialer }: AppHeaderProps) {
  return (
    <header className="flex items-center h-12 px-4 bg-white border-b border-gray-200 shrink-0 z-10">
      <div className="flex items-center gap-1 ml-auto">
        <button
          onClick={onOpenComposer}
          title="Compose Email"
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
        >
          <Mail className="w-4.5 h-4.5" />
        </button>
        <button
          onClick={onOpenDialer}
          title="Open Dialer"
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
        >
          <Phone className="w-4.5 h-4.5" />
        </button>
        <div className="w-px h-5 bg-gray-200 mx-2" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
              <CircleUser className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium">Alex Johnson</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-medium">Alex Johnson</p>
              <p className="text-xs text-muted-foreground">alex@loanbud.com</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600 focus:text-red-600">
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
