import { redirect } from "next/navigation";

export const dynamicParams = true;

type Props = {
    params: { id: string };
    searchParams: { [key: string]: string | string[] | undefined };
}

export default async function page({ params }: Props) {
    const { id } = await params;
    redirect(`/finance/budget/${id}`);
}