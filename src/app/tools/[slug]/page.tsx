import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { isVisibleToolSlug } from "@/lib/page-visible-tools";

type ToolRedirectProps = {
  params: Promise<{ slug: string }>;
};

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
};

export default async function ToolRedirectPage({ params }: ToolRedirectProps) {
  const { slug } = await params;

  if (!isVisibleToolSlug(slug)) {
    notFound();
  }

  redirect(`/amazon/${slug}`);
}
