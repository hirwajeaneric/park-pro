import { Metadata } from 'next';
import { getOpportunityDetails } from '@/lib/api';
import { PageBanner } from '@/components/widget/PageBanner';
import OpportunityDetails from '@/components/widget/opportunities/OpportunityDetails';

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = params;
  const opportunity = await getOpportunityDetails(id);
  return {
    title: `${opportunity.title} - Wildlife Park Opportunity`,
    description: opportunity.description,
  };
}

export default async function page({ params }: Props) {
  const { id } = await params;
  const opportunity = await getOpportunityDetails(id);

  return (
    <>
      <PageBanner 
        title={opportunity.title} 
        backgroundImage={'/1280px-Gabon_Loango_National_Park_Southern_Camping_Ground_Panoramic.jpeg'}
      />
      <OpportunityDetails opportunity={opportunity} />
    </>
  );
}