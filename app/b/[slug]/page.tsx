import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { InquiryForm } from "./InquiryForm";

export default async function BusinessPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const business = await prisma.business.findUnique({ where: { slug } });

  if (!business) notFound();

  const verb = business.vertical === "SHORTLET" ? "Reserve your" : "Find your";
  const accent = business.vertical === "SHORTLET" ? "stay" : "home";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[432px] flex-col gap-8 px-5 py-12">
      <header className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-moon">
          {business.name}
        </p>
        <h1 className="mt-2 font-display text-3xl text-ink">
          {verb} <span className="italic text-dusk">{accent}</span>
        </h1>
        <p className="mt-3 text-sm text-moon">
          {business.vertical === "SHORTLET"
            ? "Tell us about your stay and we'll get back to you on WhatsApp."
            : "Tell us what you're looking for and we'll get back to you on WhatsApp."}
        </p>
      </header>
      <InquiryForm slug={business.slug} businessName={business.name} vertical={business.vertical} />
    </main>
  );
}
