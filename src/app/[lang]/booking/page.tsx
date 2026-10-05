import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { BookingFlow } from "@/features/booking/components/BookingFlow";

export async function generateMetadata({ params }: PageProps<"/[lang]/booking">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.booking.pageTitle, description: dict.booking.pageDescription };
}

function BookingSkeleton({ label }: { label: string }) {
  return (
    <div className="container-site pb-24" aria-busy="true">
      <p role="status" className="visually-hidden">
        {label}
      </p>
      <div className="hidden grid-cols-5 gap-4 border-t border-line pt-4 md:grid">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-7" />
        ))}
      </div>
      <Skeleton className="h-2 md:hidden" />
      <div className="mt-10 grid gap-12 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-9 w-72" />
          <Skeleton className="mt-6 h-13 w-full" />
          <div className="grid gap-px sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        </div>
        <Skeleton className="hidden h-80 lg:col-span-4 lg:block" />
      </div>
    </div>
  );
}

export default async function BookingPage({ params }: PageProps<"/[lang]/booking">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <div className="relative bg-paper/80">
      <PageHeader eyebrow={dict.nav.booking} title={dict.booking.pageTitle} description={dict.booking.pageDescription} compact />
      <Suspense fallback={<BookingSkeleton label={dict.common.loading} />}>
        <BookingFlow />
      </Suspense>
    </div>
  );
}
