'use client';

import type * as React from 'react';
import {
  Home,
  LucideIcon,
  Map,
  PieChart,
  User as UserIcon,
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

const data: {
  navMain: NavItem[];
  secondaryMenu: SecondaryMenu[];
} = {
  navMain: [
    {
      title: 'Overview',
      url: '/government',
      icon: Home,
    },
    {
      title: 'Budgets',
      url: '/government/budgets',
      icon: PieChart,
    },
    {
      title: 'Requests',
      url: '/government/requests/extra-funds',
      icon: Map,
      items: [
        {
          title: 'Extra Funds',
          url: '/government/requests/extra-funds',
        },
        {
          title: 'Emergency Funds',
          url: '/government/requests/emergency-funds',
        },
      ],
    },
  ],
  secondaryMenu: [
    {
      name: 'Profile',
      url: '/government/profile',
      icon: UserIcon,
    },
  ],
};

export function GovernmentAppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
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
        <NavMain items={data.navMain.map(item => ({
          ...item,
          icon: item.icon as LucideIcon
        }))} />
        <SecondaryMenu items={data.secondaryMenu.map(item => ({
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