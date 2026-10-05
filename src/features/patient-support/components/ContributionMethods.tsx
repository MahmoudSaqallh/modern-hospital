import Image from "next/image";
import type { ReactNode } from "react";
import { Info } from "lucide-react";
import { hasDonationChannel, safeDonationUrl, supportPrograms } from "@/data/patientSupport";
import type { PatientSupportProgram } from "@/features/patient-support/types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/ar";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ButtonLink, ForwardArrow } from "@/components/ui/Button";
import { CopyButton } from "./CopyButton";
import { PendingValue } from "./ProgramParts";
import { ProgramIcon } from "./ProgramIcon";

/**
 * Ways to contribute, per program. The project number always has a row
 * (with an honest "to be added" until it exists). Bank account, IBAN, bank,
 * donation link and QR code appear only once real, approved values are set
 * in data/patientSupport.ts — until then the section says plainly how to
 * contribute: contact the society.
 */
export function ContributionMethods({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const copy = dict.patientSupport.contribute;
  const anyPending = supportPrograms.some((p) => !hasDonationChannel(p.donation));

  return (
    <Reveal as="section" id="contribute" aria-labelledby="contribute-title" className="relative scroll-mt-20 py-20 lg:py-28">
      <div className="container-site">
        <SectionHeader id="contribute-title" index="03" eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />

        <div className="mt-12 grid gap-px border border-line bg-line lg:grid-cols-2">
          {supportPrograms.map((program) => (
            <ProgramLedger key={program.id} program={program} locale={locale} dict={dict} />
          ))}
        </div>

        {anyPending && (
          <div
            data-reveal
            className="mt-8 flex flex-col gap-6 border-s-2 border-care-deep bg-care-tint/50 p-6 sm:p-8 md:flex-row md:items-center md:justify-between"
          >
            <div className="flex gap-4">
              <Info aria-hidden strokeWidth={1.5} className="mt-1 size-5 shrink-0 text-care-deep" />
              <div>
                <p className="font-display text-[1.3rem] leading-snug text-ink">{copy.pendingTitle}</p>
                <p className="mt-2 max-w-[60ch] text-[0.9375rem] leading-7 text-muted">{copy.pendingText}</p>
              </div>
            </div>
            <ButtonLink href="#support-contact" variant="primary" arrow className="shrink-0 self-start md:self-center">
              {dict.patientSupport.program.inquire}
            </ButtonLink>
          </div>
        )}
      </div>
    </Reveal>
  );
}

function ProgramLedger({ program, locale, dict }: { program: PatientSupportProgram; locale: Locale; dict: Dictionary }) {
  const fields = dict.patientSupport.contribute.fields;
  const actions = dict.patientSupport.actions;
  const { donation } = program;
  const donationUrl = safeDonationUrl(donation.donationUrl);

  const copyable = (label: string, value: string) => (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <bdi dir="ltr" className="select-all break-all font-mono text-[1rem] tabular text-ink">
        {value}
      </bdi>
      <CopyButton
        value={value}
        label={actions.copy}
        copiedText={actions.copied}
        failedText={actions.copyFailed}
        announcement={`${actions.copied}: ${label}`}
        className="w-auto"
      />
    </div>
  );

  return (
    <div id={`contribute-${program.id}`} data-reveal className="scroll-mt-28 bg-paper p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <span aria-hidden className="flex size-10 items-center justify-center rounded-full bg-care-tint/70 text-care-deep">
          <ProgramIcon icon={program.icon} size={20} />
        </span>
        <h3 className="font-display text-[1.35rem] leading-snug text-ink">{program.title[locale]}</h3>
      </div>
      <dl className="mt-6 border-t border-ink/15">
        <LedgerRow label={fields.projectNumber}>
          {donation.projectNumber ? copyable(fields.projectNumber, donation.projectNumber) : <PendingValue dict={dict} />}
        </LedgerRow>
        {donation.accountNumber && <LedgerRow label={fields.accountNumber}>{copyable(fields.accountNumber, donation.accountNumber)}</LedgerRow>}
        {donation.iban && <LedgerRow label={fields.iban}>{copyable(fields.iban, donation.iban)}</LedgerRow>}
        {donation.bankName && <LedgerRow label={fields.bankName}>{donation.bankName[locale]}</LedgerRow>}
        {donationUrl && (
          <LedgerRow label={fields.donationUrl}>
            <a
              href={donationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group/btn inline-flex min-h-11 items-center gap-2 font-medium text-care-deep underline-offset-4 hover:underline"
            >
              {dict.patientSupport.contribute.openLink}
              <ForwardArrow />
              <span className="visually-hidden"> ({dict.a11y.opensExternal})</span>
            </a>
          </LedgerRow>
        )}
        {donation.qrCode && (
          <LedgerRow label={fields.qrCode}>
            <Image
              src={donation.qrCode.src}
              alt={donation.qrCode.alt[locale]}
              width={160}
              height={160}
              className="border border-line bg-white p-2"
            />
          </LedgerRow>
        )}
      </dl>
    </div>
  );
}

function LedgerRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1.5 border-b border-line py-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-center sm:gap-6">
      <dt className="text-meta">{label}</dt>
      <dd className="text-[1rem] text-ink">{children}</dd>
    </div>
  );
}
