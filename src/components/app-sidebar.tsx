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
      items: [
        {
          title: 'Dashboard',
          url: '/finance',
        },
        {
          title: 'Revenue Streams',
          url: '/finance/revenue',
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
      title: 'Requests for Extra-funds',
      url: '/finance/extra-funds',
      icon: MailIcon,
      items: [
        {
          title: 'All requests',
          url: '/finance/extra-funds',
        },
        {
          title: 'New Request',
          url: '/finance/extra-funds/new',
        },
      ],
    },
    {
      title: 'Requests for Emergency',
      url: '/finance/emergency-relief',
      icon: MailIcon,
      items: [
        {
          title: 'All requests',
          url: '/finance/emergency-relief',
        },
        {
          title: 'New Request',
          url: '/finance/emergency-relief/new',
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