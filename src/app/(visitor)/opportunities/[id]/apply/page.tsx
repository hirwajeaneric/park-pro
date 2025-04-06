import { Metadata } from 'next';
import { getOpportunityDetails } from '@/lib/api';
import ApplicationForm from '@/components/forms/OpportunityApplicaitonForm';
import { PageBanner } from '@/components/widget/PageBanner';
import ProtectedRoute from '@/lib/ProtectedRoute';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const opportunity = await getOpportunityDetails(params.id);
  return {
    title: `Apply for ${opportunity.title}`,
    description: `Application page for ${opportunity.title} position`,
  };
}

export default async function page({ params }: { params: { id: string } }) {
  const opportunity = await getOpportunityDetails(params.id);

  return (
    <ProtectedRoute>
      <PageBanner 
        title={`Apply for ${opportunity.title}`} 
        backgroundImage='/1280px-Gabon_Loango_National_Park_Southern_Camping_Ground_Panoramic.jpeg'
      />
      <ApplicationForm opportunity={opportunity} />
    </ProtectedRoute>
  );
}