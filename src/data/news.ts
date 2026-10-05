import type { NewsArticle, NewsCategory } from "@/features/news/types";

/**
 * SAMPLE CONTENT — illustrative articles that demonstrate the newsroom
 * layout. They deliberately avoid specific facts (dates of events, figures,
 * names of partners). Replace with the society's approved news, or load from
 * a CMS — every page reads from these helpers.
 */
export const news: NewsArticle[] = [
  {
    slug: "online-booking-launch",
    category: "services",
    date: "2026-10-01",
    featured: true,
    title: {
      ar: "إطلاق خدمة حجز المواعيد عبر الموقع الإلكتروني",
      en: "Online appointment booking is now available",
    },
    excerpt: {
      ar: "أصبح بإمكان المرضى اختيار العيادة والطبيب والموعد المناسب وحجزه خلال دقائق، دون الحاجة إلى الاتصال.",
      en: "Patients can now choose a clinic, a doctor and a convenient time and book in minutes — no phone call needed.",
    },
    imageCaption: { ar: "خدمة الحجز الإلكتروني", en: "Online booking service" },
    body: [
      {
        type: "paragraph",
        text: {
          ar: "تعلن جمعية الخدمة العامة عن إتاحة خدمة حجز المواعيد عبر موقعها الإلكتروني، في خطوة تهدف إلى تسهيل وصول المرضى إلى العيادات وتنظيم المواعيد بشكل أفضل.",
          en: "The Public Aid Society announces that appointments can now be booked through its website — a step to make clinics easier to reach and schedules better organized.",
        },
      },
      { type: "heading", text: { ar: "كيف تعمل الخدمة؟", en: "How does it work?" } },
      {
        type: "paragraph",
        text: {
          ar: "يختار المريض العيادة المناسبة، ثم الطبيب أو أقرب طبيب متاح، ثم اليوم والوقت، ويُدخل بياناته الأساسية ليحصل على رقم حجز فوراً. ويتواصل فريق الجمعية معه لتأكيد الموعد.",
          en: "Patients choose a clinic, then a doctor or the next available one, then a day and time, and enter their basic details to receive a reference number instantly. The society's team then calls to confirm.",
        },
      },
      {
        type: "paragraph",
        text: {
          ar: "تحرص الخدمة على طلب أقل قدر ممكن من البيانات، وتُستخدم المعلومات فقط لتنظيم الموعد والتواصل مع المريض بشأنه.",
          en: "The service asks for as little information as possible, used only to organize the appointment and contact the patient about it.",
        },
      },
    ],
  },
  {
    slug: "heart-health-awareness",
    category: "awareness",
    date: "2026-09-26",
    featured: true,
    title: {
      ar: "صحة القلب تبدأ بعادات يومية بسيطة",
      en: "Heart health starts with simple daily habits",
    },
    excerpt: {
      ar: "إرشادات عامة للحفاظ على صحة القلب، ومتى يُنصح بمراجعة الطبيب.",
      en: "General guidance for keeping your heart healthy, and when to see a doctor.",
    },
    imageCaption: { ar: "التوعية بصحة القلب", en: "Heart-health awareness" },
    body: [
      {
        type: "paragraph",
        text: {
          ar: "تبقى العادات اليومية من أهم ما يحافظ على صحة القلب: الحركة المنتظمة، والغذاء المتوازن، والنوم الكافي، والابتعاد عن التدخين.",
          en: "Daily habits remain among the most important ways to protect your heart: regular movement, a balanced diet, enough sleep, and avoiding smoking.",
        },
      },
      { type: "heading", text: { ar: "متى تراجع الطبيب؟", en: "When should you see a doctor?" } },
      {
        type: "paragraph",
        text: {
          ar: "يُنصح بمراجعة الطبيب عند الشعور بأعراض غير معتادة، أو لمن لديهم أمراض مزمنة أو تاريخ عائلي لأمراض القلب، لإجراء التقييم المناسب. هذه المعلومات عامة ولا تغني عن استشارة الطبيب.",
          en: "See a doctor if you notice unusual symptoms, or if you have a chronic condition or a family history of heart disease. This information is general and does not replace medical advice.",
        },
      },
    ],
  },
  {
    slug: "pediatrics-evening-clinic",
    category: "announcements",
    date: "2026-09-20",
    featured: true,
    title: {
      ar: "تحديث مواعيد العيادة المسائية في عيادة الأطفال",
      en: "Updated evening hours at the Pediatrics Clinic",
    },
    excerpt: {
      ar: "تظهر الأوقات المحدّثة مباشرة عند الحجز عبر الموقع.",
      en: "The updated times appear directly when you book online.",
    },
    imageCaption: { ar: "عيادة الأطفال", en: "Pediatrics Clinic" },
    body: [
      {
        type: "paragraph",
        text: {
          ar: "جرى تحديث مواعيد العيادة المسائية في عيادة الأطفال. يمكن الاطلاع على الأوقات المتاحة واختيار الأنسب مباشرة من خلال صفحة الحجز.",
          en: "Evening hours at the Pediatrics Clinic have been updated. Available times can be viewed and booked directly from the booking page.",
        },
      },
    ],
  },
  {
    slug: "community-health-day",
    category: "activities",
    date: "2026-09-12",
    featured: false,
    title: {
      ar: "يوم صحي مجتمعي بمشاركة متطوعي الجمعية",
      en: "A community health day with the society's volunteers",
    },
    excerpt: {
      ar: "نشاط توعوي يقرّب الخدمة الصحية من الأسر في المجتمع المحلي.",
      en: "An awareness activity bringing healthcare closer to local families.",
    },
    imageCaption: { ar: "نشاط مجتمعي", en: "Community activity" },
    body: [
      {
        type: "paragraph",
        text: {
          ar: "تواصل الجمعية أنشطتها التوعوية في المجتمع المحلي، بهدف تعزيز الوعي الصحي وتعريف الأسر بالخدمات المتاحة وطرق الوصول إليها.",
          en: "The society continues its awareness activities in the local community, raising health awareness and helping families learn about available services and how to reach them.",
        },
      },
    ],
  },
  {
    slug: "children-dental-appointments",
    category: "services",
    date: "2026-09-05",
    featured: false,
    title: {
      ar: "مواعيد إضافية في عيادة الأسنان للأطفال",
      en: "Additional children's appointments at the Dental Clinic",
    },
    excerpt: {
      ar: "أُضيفت مواعيد مسائية جديدة يمكن حجزها عبر الموقع.",
      en: "New evening appointments can now be booked online.",
    },
    imageCaption: { ar: "عيادة الأسنان", en: "Dental Clinic" },
    body: [
      {
        type: "paragraph",
        text: {
          ar: "أضافت عيادة الأسنان مواعيد مسائية جديدة مخصصة للأطفال، ويمكن حجزها مباشرة عبر صفحة الحجز.",
          en: "The Dental Clinic has added new evening appointments for children, bookable directly from the booking page.",
        },
      },
    ],
  },
  {
    slug: "diabetes-prevention",
    category: "awareness",
    date: "2026-08-28",
    featured: false,
    title: {
      ar: "الوقاية من السكري: خطوات عملية للأسرة",
      en: "Preventing diabetes: practical steps for the family",
    },
    excerpt: {
      ar: "نصائح عامة تساعد الأسرة على تبنّي نمط حياة صحي.",
      en: "General tips to help families adopt a healthier lifestyle.",
    },
    imageCaption: { ar: "التوعية بالسكري", en: "Diabetes awareness" },
    body: [
      {
        type: "paragraph",
        text: {
          ar: "يساعد الغذاء المتوازن والنشاط البدني المنتظم والفحص الدوري على الوقاية من السكري واكتشافه مبكراً. هذه المعلومات عامة ولا تغني عن استشارة الطبيب.",
          en: "A balanced diet, regular physical activity and routine check-ups help prevent diabetes and detect it early. This information is general and does not replace medical advice.",
        },
      },
    ],
  },
];

/** Newest first. */
export const newsByDate = [...news].sort((a, b) => b.date.localeCompare(a.date));

export function getArticle(slug: string | null | undefined): NewsArticle | undefined {
  return slug ? news.find((a) => a.slug === slug) : undefined;
}

export function featuredNews(): NewsArticle[] {
  return newsByDate.filter((a) => a.featured);
}

export function newsInCategory(category: NewsCategory | null): NewsArticle[] {
  return category ? newsByDate.filter((a) => a.category === category) : newsByDate;
}

/** Same category first, then most recent — never the article itself. */
export function relatedNews(article: NewsArticle, count = 3): NewsArticle[] {
  const others = newsByDate.filter((a) => a.slug !== article.slug);
  const same = others.filter((a) => a.category === article.category);
  const rest = others.filter((a) => a.category !== article.category);
  return [...same, ...rest].slice(0, count);
}

/** Rough reading time in minutes (≈ 180 words per minute). */
export function readingMinutes(article: NewsArticle, locale: "ar" | "en"): number {
  const words = article.body.reduce((sum, block) => sum + block.text[locale].split(/\s+/).length, 0);
  return Math.max(1, Math.round(words / 180));
}
