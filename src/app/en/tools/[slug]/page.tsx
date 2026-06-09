import type { Metadata } from "next";
import { redirect } from "next/navigation";

type LegacyEnToolPageProps = {
  params: Promise<{ slug: string }>;
};

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
};

export default async function LegacyEnToolPage({ params }: LegacyEnToolPageProps) {
  const { slug } = await params;
  redirect(`/amazon/${slug}`);
}
