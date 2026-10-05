import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { DoctorsDirectory } from "@/features/doctors/components/DoctorsDirectory";

export async function generateMetadata({ params }: PageProps<"/[lang]/doctors">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.doctorsPage.title, description: dict.doctorsPage.description };
}

function DirectorySkeleton() {
  return (
    <div className="container-site pb-24" aria-busy="true">
      <Skeleton className="h-28 w-full" />
      <div className="mt-8 space-y-px">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    </div>
  );
}

export default async function DoctorsPage({ params }: PageProps<"/[lang]/doctors">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <div className="relative bg-paper/80">
      <PageHeader eyebrow={dict.nav.doctors} title={dict.doctorsPage.title} description={dict.doctorsPage.description} />
      <Suspense fallback={<DirectorySkeleton />}>
        <DoctorsDirectory />
      </Suspense>
    </div>
  );
}
