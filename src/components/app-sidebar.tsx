'use client';

import type * as React from 'react';
import {
  BookOpen,
  Home,
  LucideIcon,
  MailIcon,
  Map,
  PieChart,
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
      url: '/finance',
      icon: Home,
    },
    {
      title: 'Income Streams',
      url: '/finance/bookings',
      icon: Wallet,
      items: [
        {
          title: 'Bookings',
          url: '/finance/bookings',
        },
        {
          title: 'Donations',
          url: '/finance/donations',
        },
        {
          title: 'Activities',
          url: '/finance/activities',
        },
      ],
    },
    {
      title: 'Budget',
      url: '/finance/budget',
      icon: PieChart,
      items: [
        {
          title: 'View Budgets',
          url: '/finance/budget',
        },
        {
          title: 'Create Budget',
          url: '/finance/budget/new',
        },
      ],
    },
    {
      title: 'Opportunities',
      url: '/finance/opportunities',
      icon: Map,
      items: [
        {
          title: 'Jobs',
          url: '/finance/opportunities?type=job',
        },
        {
          title: 'Applications',
          url: '/finance/applications',
        },
      ],
    },
    {
      title: 'Finance Movements',
      url: '/finance/withdraws',
      icon: BookOpen,
      items: [
        {
          title: 'Withdraw Requests',
          url: '/finance/withdraw-request',
        },
        {
          title: 'Expenses',
          url: '/finance/expense',
        },
      ],
    },
    {
      title: 'Funding Requests',
      url: '/finance/funding-requests',
      icon: MailIcon,
      items: [
        {
          title: 'All requests',
          url: '/finance/funding-requests',
        },
        {
          title: 'New Request',
          url: '/finance/funding-requests/new',
        },
      ],
    },
  ],
  secondaryMenu: [
    {
      name: 'Profile',
      url: '/finance/profile',
      icon: UserIcon,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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