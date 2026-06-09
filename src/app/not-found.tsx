import type { Metadata } from "next";
import { NotFoundPage } from "@/components/not-found-page";
import { getNotFoundMetadata } from "@/lib/not-found-metadata";

export const metadata: Metadata = getNotFoundMetadata("en");

export default function NotFound() {
  return <NotFoundPage locale="en" />;
}
