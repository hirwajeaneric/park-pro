import { Metadata } from 'next';
import { PageBanner } from '@/components/widget/PageBanner';
import { Services } from '@/data/data';
import ProtectedRoute from '@/lib/ProtectedRoute';
import OpportunitiesList from '@/components/widget/opportunities/OpportunitiesList';

export const metadata: Metadata = {
  title: 'Opportunities - Join Our Conservation Efforts',
  description: 'Explore job openings, volunteer positions, and investment opportunities at our wildlife park.',
  keywords: ['wildlife jobs', 'park volunteer', 'conservation opportunities', 'park investments'],
  openGraph: {
    title: 'Opportunities at Wildlife Park',
    description: 'Join our team or support our conservation efforts',
    url: 'https://yourpark.com/opportunities',
    siteName: 'Wildlife Park',
    images: [
      {
        url: 'https://yourpark.com/images/opportunities-og.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default function page() {
  return (
    <ProtectedRoute>
      <PageBanner 
        title="Join Our Team" 
        backgroundImage={Services[1].image}
        description="Explore opportunities to work with us or support our mission"
      />
      <OpportunitiesList />
    </ProtectedRoute>
  );
}