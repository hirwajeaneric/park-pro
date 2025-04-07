import { Metadata } from 'next';
import { getOpportunityDetails } from '@/lib/api';
import ApplicationForm from '@/components/forms/OpportunityApplicaitonForm';
import { PageBanner } from '@/components/widget/PageBanner';
import ProtectedRoute from '@/lib/ProtectedRoute';

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = params;
  const opportunity = await getOpportunityDetails(id);
  return {
    title: `Apply for ${opportunity.title}`,
    description: `Application page for ${opportunity.title} position`,
  };
}

export default async function page({ params }: Props) {
  const { id } = await params;
  const opportunity = await getOpportunityDetails(id);

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