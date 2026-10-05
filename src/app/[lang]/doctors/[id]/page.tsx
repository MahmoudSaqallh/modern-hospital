import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { getClinic } from "@/data/clinics";
import { doctors, getDoctor } from "@/data/doctors";
import { intlLocale, isLocale, localePath, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import { DoctorAvailabilityPanel } from "@/features/doctors/components/DoctorAvailabilityPanel";
import { PageIntro } from "@/components/motion/PageIntro";
import { Portrait } from "@/components/ui/Portrait";
import { MedicalIcon } from "@/components/icons/MedicalIcon";

export const dynamicParams = false;

export function generateStaticParams() {
  return doctors.map((doctor) => ({ id: doctor.id }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/doctors/[id]">): Promise<Metadata> {
  const { lang, id } = await params;
  const doctor = getDoctor(id);
  if (!isLocale(lang) || !doctor) return {};
  return { title: doctor.name[lang], description: `${doctor.title[lang]} — ${doctor.bio[lang]}` };
}

/** Week ordered from Saturday, as clinics schedule it. */
const WEEK_ORDER = [6, 0, 1, 2, 3, 4, 5];

function weekdayName(index: number, locale: Locale): string {
  // 7 Jan 2024 was a Sunday (index 0).
  return new Intl.DateTimeFormat(intlLocale[locale], { weekday: "long" }).format(new Date(2024, 0, 7 + index));
}

export default async function DoctorProfilePage({ params }: PageProps<"/[lang]/doctors/[id]">) {
  const { lang, id } = await params;
  const doctor = getDoctor(id);
  if (!isLocale(lang) || !doctor) notFound();
  const dict = await getDictionary(lang);
  const copy = dict.doctorProfile;
  const department = getClinic(doctor.clinicId);

  return (
    <div className="relative bg-paper/85 pb-24 pt-[calc(76px+2rem)] lg:pt-[calc(88px+3rem)]">
      <div className="container-site">
        <Link
          href={localePath(lang, "/doctors")}
          className="group/btn inline-flex min-h-10 items-center gap-2 text-[0.9375rem] text-ink-2 hover:text-ink"
        >
          <ArrowLeft
            aria-hidden
            strokeWidth={1.75}
            className="size-4 transition-transform duration-300 group-hover/btn:-translate-x-1 rtl:-scale-x-100 rtl:group-hover/btn:translate-x-1"
          />
          {copy.back}
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:gap-14">
          <PageIntro className="lg:col-span-7">
            <div className="grid gap-8 sm:grid-cols-[13rem_minmax(0,1fr)]">
              <div data-intro>
                <Portrait name={doctor.name[lang]} photo={doctor.photo} className="aspect-[4/5] w-40 sm:w-full" priority sizes="(min-width: 640px) 13rem, 10rem" />
              </div>
              <div className="flex flex-col justify-end">
                {department && (
                  <p data-intro className="text-eyebrow flex items-center gap-2.5">
                    <MedicalIcon name={department.icon} size={16} className="text-care-deep" />
                    {department.name[lang]}
                  </p>
                )}
                <h1 data-intro className="text-h1 mt-3 text-ink">
                  {doctor.name[lang]}
                </h1>
                <p data-intro className="text-lead mt-2 text-ink-2">
                  {doctor.title[lang]}
                </p>
                <dl data-intro className="mt-6 grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
                  <div>
                    <dt className="text-meta">{copy.workingDays}</dt>
                    <dd className="mt-1 text-[0.9375rem] text-ink">
                      {WEEK_ORDER.filter((d) => (doctor.workingDays as number[]).includes(d))
                        .map((d) => weekdayName(d, lang))
                        .join(lang === "ar" ? "، " : ", ")}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-meta">{copy.sessions}</dt>
                    <dd className="mt-1 space-y-0.5 text-[0.9375rem] text-ink tabular">
                      {doctor.sessions.map((s) => (
                        <span key={s} className="block">
                          {s === "morning" ? copy.morningSession : copy.eveningSession}
                        </span>
                      ))}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </PageIntro>

          <div className="lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1">
            <div className="lg:sticky lg:top-28">
              <DoctorAvailabilityPanel doctor={doctor} />
            </div>
          </div>

          <div className="space-y-12 lg:col-span-7">
            <section aria-labelledby="bio-title">
              <h2 id="bio-title" className="text-eyebrow">
                {copy.about}
              </h2>
              <p className="mt-3 max-w-[60ch] text-[1.0625rem] leading-9 text-ink-2">{doctor.bio[lang]}</p>
            </section>

            <section aria-labelledby="qualification-title" className="border-t border-line pt-8">
              <h2 id="qualification-title" className="text-eyebrow">
                {copy.qualification}
              </h2>
              <p className="mt-3 text-[1rem] text-ink">{doctor.qualification[lang]}</p>
            </section>

            <section aria-labelledby="services-title" className="border-t border-line pt-8">
              <h2 id="services-title" className="text-eyebrow">
                {copy.services}
              </h2>
              <ul className="mt-4 grid gap-x-8 sm:grid-cols-2">
                {doctor.services.map((service) => (
                  <li key={service.en} className="flex items-center gap-3 border-b border-line py-3.5 text-[0.9375rem] text-ink">
                    <Check aria-hidden strokeWidth={2} className="size-4 shrink-0 text-care-deep" />
                    {service[lang]}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
