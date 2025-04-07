import { Metadata } from 'next';
import { getOpportunityDetails } from '@/lib/api';
import { PageBanner } from '@/components/widget/PageBanner';
import ProtectedRoute from '@/lib/ProtectedRoute';
import OpportunityDetails from '@/components/widget/opportunities/OpportunityDetails';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { id } = await params;
  const opportunity = await getOpportunityDetails(id);
  return {
    title: `${opportunity.title} - Wildlife Park Opportunity`,
    description: opportunity.description,
  };
}

export default async function page({ params }: { params: { id: string } }) {
  const { id } = await params;
  const opportunity = await getOpportunityDetails(id);

  return (
    <ProtectedRoute>
      <PageBanner 
        title={opportunity.title} 
        backgroundImage={'/1280px-Gabon_Loango_National_Park_Southern_Camping_Ground_Panoramic.jpeg'}
      />
      <OpportunityDetails opportunity={opportunity} />
    </ProtectedRoute>
  );
}