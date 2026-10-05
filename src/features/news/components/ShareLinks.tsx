"use client";

import { useState } from "react";
import { Check, Link2, MessageCircle } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * Share actions that need no third-party scripts: copy the link, or open
 * WhatsApp with the title and URL. Uses the native share sheet when available.
 */
export function ShareLinks({ title }: { title: string }) {
  const { dict } = useI18n();
  const copy = dict.news;
  const [copied, setCopied] = useState(false);

  const currentUrl = () => window.location.href.split("#")[0];

  const copyLink = async () => {
    const url = currentUrl();
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      /* the visitor dismissed the share sheet or clipboard access was denied — nothing to do */
    }
  };

  const shareWhatsapp = () => {
    const text = encodeURIComponent(`${title}\n${currentUrl()}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-meta me-2">{copy.share}</span>
      <button
        type="button"
        onClick={copyLink}
        className="inline-flex min-h-10 items-center gap-2 border border-line-strong px-3.5 text-[0.875rem] text-ink-2 transition-colors hover:border-ink/40 hover:text-ink"
      >
        {copied ? <Check aria-hidden strokeWidth={1.75} className="size-4 text-care-deep" /> : <Link2 aria-hidden strokeWidth={1.5} className="size-4" />}
        {copied ? copy.copied : copy.copyLink}
      </button>
      <button
        type="button"
        onClick={shareWhatsapp}
        className="inline-flex min-h-10 items-center gap-2 border border-line-strong px-3.5 text-[0.875rem] text-ink-2 transition-colors hover:border-ink/40 hover:text-ink"
      >
        <MessageCircle aria-hidden strokeWidth={1.5} className="size-4" />
        {copy.shareWhatsapp}
        <span className="visually-hidden"> ({dict.a11y.opensExternal})</span>
      </button>
      <span role="status" className="visually-hidden">
        {copied ? copy.copied : ""}
      </span>
    </div>
  );
}
