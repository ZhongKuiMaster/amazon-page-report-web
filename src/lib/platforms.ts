import { platformRoadmap } from "@/lib/site-structure";

export function getPlatformBySlug(platformSlug: string) {
  return platformRoadmap.find((platform) => platform.slug === platformSlug);
}
