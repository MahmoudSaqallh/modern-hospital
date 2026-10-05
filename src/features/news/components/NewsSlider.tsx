"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { gsap, ScrollTrigger, useGSAP } from "@/animations/gsap";
import { MEDIA } from "@/animations/motion";
import { useReducedMotion } from "@/animations/useReducedMotion";
import type { NewsArticle } from "@/features/news/types";
import { useI18n } from "@/i18n/I18nProvider";
import { cn, format } from "@/lib/localized";
import { buttonClasses, ForwardArrow } from "@/components/ui/Button";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { articleHref, NewsMeta } from "./NewsCard";

const SLIDE_MS = 6500;
const SWIPE_PX = 48;

/**
 * Featured news — an editorial split: a large image with an overlapping
 * content panel. Slides change with a clip-path reveal from the reading
 * start, the headline rises in, and a segmented progress bar tracks the
 * auto-advance. Fully usable without motion: buttons, segment links,
 * arrow keys and swipe; auto-advance pauses on hover/focus and is off for
 * reduced motion.
 */
export function NewsSlider({ articles }: { articles: NewsArticle[] }) {
  const { locale, dir, dict } = useI18n();
  const copy = dict.news;
  const root = useRef<HTMLElement>(null);
  const previous = useRef<number | null>(null);
  const timer = useRef<gsap.core.Tween | null>(null);
  const swipeStart = useRef<number | null>(null);
  const [index, setIndex] = useState(0);
  const [userPlaying, setUserPlaying] = useState(true);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(true);
  const reducedMotion = useReducedMotion();
  const count = articles.length;
  const autoplay = userPlaying && !paused && inView && !reducedMotion && count > 1;

  const go = useCallback(
    (next: number) => {
      const target = (next + count) % count;
      setIndex((current) => {
        if (current !== target) previous.current = current;
        return target;
      });
    },
    [count],
  );

  // Visibility + gentle parallax on the image.
  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      ScrollTrigger.create({ trigger: el, start: "top bottom", end: "bottom top", onToggle: (s) => setInView(s.isActive) });
      const mm = gsap.matchMedia();
      mm.add(MEDIA.motionOk, () => {
        gsap.fromTo(
          "[data-parallax]",
          { yPercent: -3 },
          { yPercent: 3, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
        );
      });
    },
    { scope: root },
  );

  // Slide change choreography.
  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const incoming = el.querySelector<HTMLElement>(`[data-slide-image="${index}"]`);
      const outgoingIndex = previous.current;
      el.querySelectorAll<HTMLElement>("[data-slide-image]").forEach((node) => {
        const i = Number(node.dataset.slideImage);
        node.style.visibility = i === index || i === outgoingIndex ? "visible" : "hidden";
        node.style.zIndex = i === index ? "2" : "1";
      });
      if (outgoingIndex === null || !incoming || reducedMotion) return;

      const from = dir === "rtl" ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)";
      gsap
        .timeline({
          onComplete: () => {
            const old = el.querySelector<HTMLElement>(`[data-slide-image="${outgoingIndex}"]`);
            if (old) old.style.visibility = "hidden";
          },
        })
        .fromTo(incoming, { clipPath: from }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.05, ease: "expo.inOut", clearProps: "clipPath" })
        .fromTo(incoming.querySelector("[data-slide-zoom]"), { scale: 1.08 }, { scale: 1, duration: 1.4, ease: "power3.out" }, 0)
        .fromTo("[data-slide-text]", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.07, ease: "power3.out" }, 0.25);
    },
    { scope: root, dependencies: [index, reducedMotion] },
  );

  // Auto-advance with a visible progress segment.
  useEffect(() => {
    timer.current?.kill();
    const bar = root.current?.querySelector<HTMLElement>(`[data-progress="${index}"]`);
    root.current?.querySelectorAll<HTMLElement>("[data-progress]").forEach((b) => {
      if (b !== bar) gsap.set(b, { scaleX: Number(b.dataset.progress) < index ? 1 : 0 });
    });
    if (!bar) return;
    if (!autoplay) {
      gsap.set(bar, { scaleX: 1 });
      return;
    }
    timer.current = gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: SLIDE_MS / 1000, ease: "none", onComplete: () => go(index + 1) });
    return () => {
      timer.current?.kill();
    };
  }, [autoplay, index, go]);

  if (count === 0) return null;

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    const forward = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
    const backward = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
    if (e.key === forward) {
      e.preventDefault();
      go(index + 1);
    } else if (e.key === backward) {
      e.preventDefault();
      go(index - 1);
    }
  };

  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") swipeStart.current = e.clientX;
  };
  const onPointerUp = (e: PointerEvent) => {
    if (swipeStart.current === null) return;
    const dx = e.clientX - swipeStart.current;
    swipeStart.current = null;
    if (Math.abs(dx) < SWIPE_PX) return;
    // In RTL the next story sits to the left: swiping right brings it in.
    const forward = dir === "rtl" ? dx > 0 : dx < 0;
    go(index + (forward ? 1 : -1));
  };

  const PrevIcon = dir === "rtl" ? ChevronRight : ChevronLeft;
  const NextIcon = dir === "rtl" ? ChevronLeft : ChevronRight;
  const article = articles[index];

  return (
    <section
      ref={root}
      aria-roledescription="carousel"
      aria-label={copy.sliderLabel}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      className="relative"
    >
      <div className="grid lg:grid-cols-12">
        <div
          className="relative aspect-[16/11] overflow-hidden bg-sage touch-pan-y sm:aspect-[16/9] lg:col-span-8 lg:col-start-1 lg:row-start-1 lg:aspect-auto lg:min-h-[34rem]"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        >
          {articles.map((a, i) => (
            <div
              key={a.slug}
              data-slide-image={i}
              aria-hidden
              className="absolute inset-0"
              style={{ visibility: i === index ? "visible" : "hidden", zIndex: i === index ? 2 : 1 }}
            >
              <div data-parallax className="absolute inset-[-4%]">
                <div data-slide-zoom className="size-full">
                  <ImageSlot
                    src={a.image}
                    caption={a.imageCaption[locale]}
                    slotLabel={dict.common.imageSlot}
                    className="size-full"
                    captionClassName="bottom-[7%] start-[4%]"
                    priority={i === 0}
                    sizes="(min-width: 1024px) 66vw, 100vw"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="relative z-10 -mt-10 mx-4 sm:mx-8 lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:m-0 lg:self-center">
          <div
            key={article.slug}
            role="group"
            aria-roledescription="slide"
            aria-label={format(copy.slideOf, { current: index + 1, total: count })}
            className="border-t-2 border-care-deep bg-paper p-6 shadow-[var(--shadow-lift)] sm:p-8 lg:p-10"
          >
            <div data-slide-text>
              <NewsMeta article={article} locale={locale} dict={dict} />
            </div>
            <h2 data-slide-text className="mt-4 font-display text-[clamp(1.45rem,1.05rem+1.3vw,2.2rem)] leading-snug text-ink">
              {article.title[locale]}
            </h2>
            <p data-slide-text className="mt-3 text-[1rem] leading-8 text-muted">
              {article.excerpt[locale]}
            </p>
            <div data-slide-text className="mt-6">
              <Link href={articleHref(locale, article)} className={buttonClasses({ size: "md" })}>
                <span>{copy.readMore}</span>
                <ForwardArrow />
                <span className="visually-hidden">: {article.title[locale]}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {count > 1 && (
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4 lg:mt-8">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => go(index - 1)}
              className="flex size-11 items-center justify-center border border-line-strong text-ink transition-colors hover:border-ink/40 hover:bg-white"
            >
              <PrevIcon aria-hidden strokeWidth={1.5} className="size-5" />
              <span className="visually-hidden">{copy.previous}</span>
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              className="flex size-11 items-center justify-center border border-line-strong text-ink transition-colors hover:border-ink/40 hover:bg-white"
            >
              <NextIcon aria-hidden strokeWidth={1.5} className="size-5" />
              <span className="visually-hidden">{copy.next}</span>
            </button>
          </div>

          <ol className="flex flex-1 items-center gap-2" aria-label={copy.sliderLabel}>
            {articles.map((a, i) => (
              <li key={a.slug} className="flex-1">
                <button
                  type="button"
                  onClick={() => go(i)}
                  aria-current={i === index ? "true" : undefined}
                  aria-label={format(copy.goTo, { index: i + 1 })}
                  className="block w-full py-3"
                >
                  <span className="block h-[2px] bg-line">
                    <span
                      data-progress={i}
                      className={cn("block h-full origin-left bg-care-deep rtl:origin-right", i < index ? "scale-x-100" : "scale-x-0")}
                    />
                  </span>
                </button>
              </li>
            ))}
          </ol>

          <p className="font-mono text-[0.8125rem] text-muted tabular" aria-hidden>
            <bdi dir="ltr">
              {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </bdi>
          </p>

          {!reducedMotion && (
            <button
              type="button"
              onClick={() => setUserPlaying((p) => !p)}
              className="inline-flex min-h-11 items-center gap-2 px-2 text-[0.875rem] text-ink-2 hover:text-ink"
            >
              {userPlaying ? <Pause aria-hidden strokeWidth={1.5} className="size-4" /> : <Play aria-hidden strokeWidth={1.5} className="size-4" />}
              {userPlaying ? copy.pause : copy.play}
            </button>
          )}
        </div>
      )}
      {/* Announce changes the visitor makes; stay silent while auto-advancing. */}
      <p className="visually-hidden" aria-live={autoplay ? "off" : "polite"}>
        {format(copy.slideOf, { current: index + 1, total: count })}: {article.title[locale]}
      </p>
    </section>
  );
}
