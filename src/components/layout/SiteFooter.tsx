import Image from "next/image";
import Link from "next/link";
import { organization } from "@/config/organization";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/ar";
import { bookableDepartments } from "@/data/departments";
import { NAV_ITEMS } from "@/components/navigation/navItems";

/** Three-colour rule echoing the emblem ring: green · red · ink(white on dark). */
function EmblemRule() {
  return (
    <div aria-hidden className="flex h-[3px] gap-1.5">
      <span className="flex-[3] bg-care" />
      <span className="flex-[3] bg-medical" />
      <span className="flex-[2] bg-white/80" />
    </div>
  );
}

export function SiteFooter({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const year = new Date().getFullYear();
  return (
    <footer className="relative z-10 bg-ink text-white/75">
      <EmblemRule />
      <div className="container-site grid gap-12 py-16 md:grid-cols-12 lg:py-20">
        <div className="md:col-span-5 lg:col-span-4">
          <div className="flex items-center gap-3.5">
            <span className="rounded-full bg-white p-1">
              <Image src={organization.logo} alt={dict.a11y.logoAlt} width={56} height={56} className="size-14" />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="font-display text-lg text-white">{organization.name.ar}</span>
              <span lang="en" dir="ltr" className="mt-1 text-[0.6875rem] uppercase tracking-[0.14em] text-white/55">
                {organization.name.en}
              </span>
            </span>
          </div>
          <p className="mt-6 max-w-[34ch] text-[0.9375rem] leading-7">{dict.footer.tagline}</p>
        </div>

        <nav aria-label={dict.a11y.footerNav} className="md:col-span-3 lg:col-span-2">
          <h2 className="text-[0.8125rem] font-medium text-white">{dict.footer.navTitle}</h2>
          <ul className="mt-4 space-y-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.key}>
                <Link
                  href={localePath(locale, item.path)}
                  className="inline-block py-1.5 text-[0.9375rem] transition-colors hover:text-white"
                >
                  {dict.nav[item.key]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-4 lg:col-span-3">
          <h2 className="text-[0.8125rem] font-medium text-white">{dict.footer.bookingTitle}</h2>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 md:grid-cols-1">
            {bookableDepartments.slice(0, 6).map((department) => (
              <li key={department.id}>
                <Link
                  href={`${localePath(locale, "/booking")}?department=${department.id}`}
                  className="inline-block py-1.5 text-[0.9375rem] transition-colors hover:text-white"
                >
                  {department.name[locale]}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-12 lg:col-span-3">
          <h2 className="text-[0.8125rem] font-medium text-white">{dict.footer.hoursTitle}</h2>
          <dl className="mt-4 space-y-3">
            {organization.workingHours.map((row) => (
              <div key={row.label.en}>
                <dt className="text-[0.875rem] text-white/55">{row.label[locale]}</dt>
                <dd className="text-[0.9375rem] text-white tabular">{row.hours[locale]}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-site flex flex-col gap-2 py-6 text-[0.8125rem] text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {organization.name[locale]}. {dict.footer.rights}
          </p>
          <p>{dict.footer.privacy}</p>
        </div>
      </div>
    </footer>
  );
}
