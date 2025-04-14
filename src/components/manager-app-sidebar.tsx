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
      url: '/manager',
      icon: Home,
      items: [
        {
          title: 'Dashboard',
          url: '/manager',
        }
      ],
    },
    {
      title: 'Expenses',
      url: '/manager/expense',
      icon: PieChart,
      items: [
        {
          title: 'View expenses',
          url: '/manager/expense',
        },
        {
          title: 'Create expense',
          url: '/manager/expense/new',
        },
      ],
    },
    {
      title: 'Withdraw Request',
      url: '/manager/withdraw-request',
      icon: Map,
      items: [
        {
          title: 'List Requests',
          url: '/manager/withdraw-request',
        },
        {
          title: 'Send Request',
          url: '/manager/withdraw-request/new',
        },
      ],
    },
  ],
  secondaryMenu: [
    {
      name: 'Profile',
      url: '/manager/profile',
      icon: UserIcon,
    },
  ],
};

export function ManagerAppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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