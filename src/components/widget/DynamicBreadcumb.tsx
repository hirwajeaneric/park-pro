'use client';

import { usePathname } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import React from 'react';

// Map base paths to display names
const baseLabels: Record<string, string> = {
  finance: 'Finance',
  manager: 'Manager',
  government: 'Government',
  auditor: 'Auditor',
};

// Map known segments to display names (extend as needed)
const segmentLabels: Record<string, string> = {
  profile: 'Profile',
  budget: 'Budget',
  category: 'Category',
  revenue: 'Revenue',
  opportunities: 'Opportunities',
  withdraws: 'Withdraws',
  expenses: 'Expenses',
  'extra-funds': 'Extra Funds',
  'emergency-relief': 'Emergency Relief',
  'budget-categories': 'Budget Categories',
};

// Check if a string is a UUID
const isUUID = (segment: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment);

export function DynamicBreadcrumb() {
  const pathname = usePathname();
  
  // Split pathname into segments, filter empty
  const segments = pathname.split('/').filter(Boolean);

  // Generate breadcrumb items
  const items = segments.map((segment, index) => {
    // Construct URL up to this segment
    const url = `/${segments.slice(0, index + 1).join('/')}`;
    
    // Determine label
    let label: string;
    if (index === 0 && baseLabels[segment]) {
      // Base segment (finance, manager, etc.)
      label = baseLabels[segment];
    } else if (isUUID(segment)) {
      // UUIDs as "Details"
      label = 'Details';
    } else if (segment === 'new') {
      // "new" as "Create"
      label = 'Create';
    } else {
      // Known segments or fallback to title case
      label = segmentLabels[segment] || 
        segment
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
    }

    return { label, url, isLast: index === segments.length - 1 };
  });

  // If no items (e.g., root "/"), show default base
  if (!items.length) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item) => (
          <React.Fragment key={item.url}>
            <BreadcrumbItem className={item.isLast ? '' : 'hidden md:block'}>
              {item.isLast ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={item.url}>{item.label}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {!item.isLast && (
              <BreadcrumbSeparator className="hidden md:block" />
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}