import type { Metadata } from "next";
import { NotFoundPage } from "@/components/not-found-page";
import { getNotFoundMetadata } from "@/lib/not-found-metadata";

export const metadata: Metadata = getNotFoundMetadata("zh");

export default function ZhNotFound() {
  return <NotFoundPage locale="zh" />;
}
