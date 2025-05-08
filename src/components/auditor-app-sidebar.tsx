'use client';

import type * as React from 'react';
import {
  Home,
  LucideIcon,
  User as UserIcon,
  Wallet,
} from 'lucide-react';
import { NavMain } from './nav-main';
import { SecondaryMenu } from './secondary-menu';
import { NavUser } from './nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import LogoComponent from './widget/LogoComponent';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { getParks } from '@/lib/api';
import { Park } from '@/types';

interface NavItem {
  title: string;
  url: string;
  icon?: React.ComponentType<{ className?: string }>;
  items?: { title: string; url: string }[];
}

interface SecondaryMenu {
  name: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

type PaginatedParks = {
  content: Park[];
  totalPages: number;
  totalElements: number;
  pageNumber: number;
  pageSize: number;
};

type NavParks = {
  title: string;
  url: string;
}[]

export function AuditorAppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();

  const { data, isLoading } = useQuery<PaginatedParks>({
    queryKey: ['parks'],
    queryFn: () => getParks(),
  });

  let listOfParks: NavParks = [];
  if (isLoading) {
    listOfParks = [{ title: "All parks", url: "/auditor/parks" }, { title: "loading other parks...", url: "" }]
  } else {
    listOfParks.push({ title: "All parks", url: "/auditor/park" });
    data?.content.forEach(park => {
      listOfParks.push({
        title: park.name,
        url: '/auditor/park/' + park.id
      })
    });
  }


  const menus: { navMain: NavItem[]; secondaryMenu: SecondaryMenu[]; } = {
    navMain: [
      {
        title: 'Overview',
        url: '/auditor',
        icon: Home,
      },
      {
        title: 'Parks',
        url: '/auditor/park',
        icon: Wallet,
        items: listOfParks,
      },
    ],
    secondaryMenu: [
      {
        name: 'Profile',
        url: '/auditor/profile',
        icon: UserIcon,
      },
    ],
  };

  const navUser = user
    ? {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    }
    : {
      firstName: 'Guest',
      lastName: '',
      email: 'guest@example.com',
    };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="p-2">
          <LogoComponent />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={menus.navMain.map(item => ({
          ...item,
          icon: item.icon as LucideIcon
        }))} />
        <SecondaryMenu items={menus.secondaryMenu.map(item => ({
          ...item,
          icon: item.icon as LucideIcon
        }))} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={navUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}