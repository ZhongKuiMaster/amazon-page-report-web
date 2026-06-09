import Link from "next/link";

type NotFoundPageProps = {
  locale?: "en" | "zh";
};

const copy = {
  en: {
    eyebrow: "Page not found",
    title: "This page is not available.",
    body: "Return to the homepage or continue from the available platform pages.",
    cta: "Return home",
    href: "/",
  },
  zh: {
    eyebrow: "页面不存在",
    title: "这个页面暂时无法访问。",
    body: "你可以返回首页，或从当前可访问的平台页面继续浏览。",
    cta: "返回首页",
    href: "/zh",
  },
} as const;

export function NotFoundPage({ locale = "en" }: NotFoundPageProps) {
  const content = copy[locale];

  return (
    <main className="page-shell flex min-h-[70dvh] flex-col justify-center py-20">
      <p className="eyebrow">{content.eyebrow}</p>
      <h1 className="mt-4 text-5xl font-semibold text-slate-950">{content.title}</h1>
      <p className="prose-copy mt-5 max-w-2xl text-lg">{content.body}</p>
      <div className="mt-8">
        <Link
          href={content.href}
          className="inline-flex min-h-13 items-center rounded-full bg-teal-700 px-6 text-sm font-semibold text-white transition hover:bg-teal-800"
        >
          {content.cta}
        </Link>
      </div>
    </main>
  );
}
