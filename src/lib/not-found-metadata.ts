import type { Metadata } from "next";

export function getNotFoundMetadata(locale: "en" | "zh"): Metadata {
  if (locale === "zh") {
    return {
      title: "页面不存在",
      description: "这个页面暂时无法访问。",
      robots: {
        index: false,
        follow: false,
      },
      openGraph: {
        title: "页面不存在",
        description: "这个页面暂时无法访问。",
        type: "website",
        locale: "zh_CN",
      },
      twitter: {
        card: "summary_large_image",
        title: "页面不存在",
        description: "这个页面暂时无法访问。",
      },
      other: {
        "content-language": "zh",
      },
    };
  }

  return {
    title: "Page Not Found",
    description: "This page is not available.",
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      title: "Page Not Found",
      description: "This page is not available.",
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: "Page Not Found",
      description: "This page is not available.",
    },
    other: {
      "content-language": "en",
    },
  };
}
