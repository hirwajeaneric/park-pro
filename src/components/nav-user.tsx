'use client';

import {
  BadgeCheck,
  ChevronsUpDown,
  LogOut,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useRouter } from 'next/navigation';

interface NavUserProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  userRole?: string
}

// Generate initials from firstName and lastName (e.g., "John Doe" → "JD")
const getInitials = (firstName: string, lastName: string): string => {
  const first = firstName ? firstName[0]?.toUpperCase() : '';
  const last = lastName ? lastName[0]?.toUpperCase() : '';
  return `${first}${last}`.trim() || 'G'; // Fallback to 'G' for Guest/empty
};

export const deleteCookie = async () => await fetch('/api/logout', { method: 'POST' });

export function NavUser({ user, userRole }: NavUserProps) {
  const { isMobile } = useSidebar();
  const router = useRouter();

  let username = "";
  switch (userRole) {
    case "ADMIN":
      username = "admin";
      break;
    case "FINANCE_OFFICER":
      username = "finance";
      break;
    case "PARK_MANAGER":
      username = "manager";
      break;
    case "GOVERNMENT_OFFICER":
      username = "government";
      break;
    default:
      username = "auditor"
      break;
  }

  const customLogout = () => {
    deleteCookie();
    localStorage.removeItem('access-token');
    localStorage.removeItem('user-profile');
    router.push(`/auth/${username}`);
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg">
                  {getInitials(user.firstName, user.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.firstName}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg">
                    {getInitials(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.firstName}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck onClick={() => router.push(`/${username}/profile`)} className="mr-2 h-4 w-4" />
                Account
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={customLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}