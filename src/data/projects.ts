import type { Project, ProjectCategory } from "@/features/projects/types";

/**
 * SAMPLE CONTENT — illustrative projects that demonstrate the structure of
 * each category. They make no claims about results, budgets, beneficiaries
 * or donors: `results`, dates and `partner` stay empty until the society
 * provides approved information.
 */
export const projects: Project[] = [
  // ── Development ───────────────────────────────────────────────
  {
    slug: "digital-patient-services",
    category: "development",
    status: "in-progress",
    highlight: true,
    title: { ar: "التحول الرقمي لخدمات المرضى", en: "Digital transformation of patient services" },
    summary: {
      ar: "تطوير خدمات إلكترونية تسهّل الحجز والتواصل وتنظيم مواعيد العيادات.",
      en: "Developing online services that make booking, contact and clinic scheduling easier.",
    },
    overview: {
      ar: "يهدف المشروع إلى نقل الخدمات اليومية التي يحتاجها المريض إلى منصة إلكترونية واضحة وسهلة الاستخدام، بدءاً من حجز المواعيد.",
      en: "The project brings the everyday services patients need onto a clear, easy-to-use digital platform, starting with appointment booking.",
    },
    objectives: [
      { ar: "تقليل وقت الانتظار والاتصالات المتكررة", en: "Reduce waiting and repeated phone calls" },
      { ar: "تنظيم مواعيد العيادات بشكل أدق", en: "Organize clinic schedules more accurately" },
      { ar: "تسهيل وصول المرضى إلى المعلومات", en: "Make information easier for patients to reach" },
    ],
    implementation: [
      { ar: "إطلاق خدمة الحجز الإلكتروني", en: "Launch of online appointment booking" },
      { ar: "تطوير قنوات التواصل والشكاوى", en: "Developing contact and complaints channels" },
    ],
    results: [],
    cover: { caption: { ar: "خدمات المرضى الرقمية", en: "Digital patient services" } },
    gallery: [
      { caption: { ar: "واجهة الحجز", en: "Booking interface" } },
      { caption: { ar: "تنظيم المواعيد", en: "Scheduling" } },
    ],
  },
  {
    slug: "outpatient-clinics-upgrade",
    category: "development",
    status: "planned",
    title: { ar: "تطوير تجهيزات العيادات الخارجية", en: "Upgrading outpatient clinic facilities" },
    summary: {
      ar: "تحسين بيئة العيادات الخارجية وتجهيزاتها بما يخدم راحة المريض.",
      en: "Improving outpatient clinic spaces and equipment for patient comfort.",
    },
    overview: {
      ar: "مشروع لتحسين بيئة الاستقبال والانتظار وتجهيزات غرف الفحص في العيادات الخارجية.",
      en: "A project to improve reception, waiting areas and examination-room equipment in the outpatient clinics.",
    },
    objectives: [
      { ar: "بيئة انتظار أكثر راحة", en: "More comfortable waiting areas" },
      { ar: "تجهيزات فحص محدّثة", en: "Updated examination equipment" },
    ],
    implementation: [{ ar: "تُعلن مراحل التنفيذ عند اعتمادها", en: "Implementation phases will be announced once approved" }],
    results: [],
    cover: { caption: { ar: "العيادات الخارجية", en: "Outpatient clinics" } },
    gallery: [{ caption: { ar: "منطقة الانتظار", en: "Waiting area" } }],
  },

  // ── Patient support ───────────────────────────────────────────
  {
    slug: "chronic-medication-support",
    category: "patient-support",
    status: "ongoing",
    highlight: true,
    title: { ar: "برنامج دعم أدوية الأمراض المزمنة", en: "Chronic-condition medication support" },
    summary: {
      ar: "مبادرة لمساندة المرضى المحتاجين في الحصول على أدوية الأمراض المزمنة.",
      en: "An initiative helping patients in need obtain medication for chronic conditions.",
    },
    overview: {
      ar: "يركّز البرنامج على المرضى المصابين بأمراض مزمنة ممن يحتاجون إلى دعم مستمر في توفير أدويتهم، وفق معايير تحددها الجمعية.",
      en: "The program focuses on patients with chronic conditions who need ongoing help with their medication, according to criteria set by the society.",
    },
    objectives: [
      { ar: "ضمان استمرارية العلاج", en: "Help ensure continuity of treatment" },
      { ar: "تخفيف العبء المادي عن الأسر", en: "Ease the financial burden on families" },
    ],
    implementation: [{ ar: "تُعلن آلية التقديم ومعاييره عند اعتمادها", en: "Application criteria will be announced once approved" }],
    results: [],
    cover: { caption: { ar: "دعم الأدوية", en: "Medication support" } },
    gallery: [{ caption: { ar: "صيدلية الجمعية", en: "The society's pharmacy" } }],
  },
  {
    slug: "treatment-support-fund",
    category: "patient-support",
    status: "ongoing",
    title: { ar: "دعم علاج المرضى", en: "Patient treatment support" },
    summary: {
      ar: "مساهمة في تكاليف العلاج للمرضى غير القادرين، وفق الإمكانات المتاحة.",
      en: "Contributing to treatment costs for patients who cannot afford them, within available means.",
    },
    overview: {
      ar: "مبادرة تسعى إلى ألّا يكون العائق المادي سبباً في تأخر العلاج، بالتنسيق مع الأقسام المعنية.",
      en: "An initiative working so that cost is not a reason for delayed treatment, in coordination with the relevant departments.",
    },
    objectives: [
      { ar: "تسهيل وصول المرضى المحتاجين إلى العلاج", en: "Help patients in need access treatment" },
    ],
    implementation: [{ ar: "تُعلن تفاصيل المبادرة عند اعتمادها", en: "Details will be announced once approved" }],
    results: [],
    cover: { caption: { ar: "دعم العلاج", en: "Treatment support" } },
    gallery: [],
  },

  // ── Completed ─────────────────────────────────────────────────
  {
    slug: "waiting-areas-renovation",
    category: "completed",
    status: "completed",
    highlight: true,
    title: { ar: "تأهيل مناطق الانتظار", en: "Renovating waiting areas" },
    summary: {
      ar: "مشروع منجز لتحسين مناطق انتظار المرضى ومرافقيهم.",
      en: "A completed project improving waiting areas for patients and their companions.",
    },
    overview: {
      ar: "اكتمل تنفيذ المشروع لتوفير بيئة انتظار أكثر تنظيماً وراحة للمرضى ومرافقيهم.",
      en: "The project was completed to provide a more organized and comfortable waiting environment for patients and companions.",
    },
    objectives: [{ ar: "تحسين تجربة المريض قبل الزيارة", en: "Improve the patient experience before the visit" }],
    implementation: [{ ar: "تأهيل المساحات وتحسين التنظيم", en: "Renovating spaces and improving organization" }],
    results: [],
    cover: { caption: { ar: "منطقة الانتظار", en: "Waiting area" } },
    gallery: [
      { caption: { ar: "قبل التأهيل", en: "Before" } },
      { caption: { ar: "بعد التأهيل", en: "After" } },
    ],
  },
  {
    slug: "early-screening-campaign",
    category: "completed",
    status: "completed",
    title: { ar: "حملة الفحص المبكر المجتمعية", en: "Community early-screening campaign" },
    summary: {
      ar: "حملة توعوية وفحوصات مبكرة نُفّذت بالتعاون مع المجتمع المحلي.",
      en: "An awareness and early-screening campaign carried out with the local community.",
    },
    overview: {
      ar: "حملة هدفت إلى رفع الوعي بأهمية الفحص المبكر وتعريف الأسر بالخدمات المتاحة.",
      en: "A campaign to raise awareness of early screening and introduce families to available services.",
    },
    objectives: [{ ar: "تعزيز ثقافة الفحص المبكر", en: "Promote a culture of early screening" }],
    implementation: [{ ar: "أنشطة توعوية وفحوصات أولية", en: "Awareness activities and initial screenings" }],
    results: [],
    cover: { caption: { ar: "حملة الفحص المبكر", en: "Early-screening campaign" } },
    gallery: [{ caption: { ar: "من أنشطة الحملة", en: "From the campaign" } }],
  },
];

export function getProject(slug: string | null | undefined): Project | undefined {
  return slug ? projects.find((p) => p.slug === slug) : undefined;
}

export function projectsInCategory(category: ProjectCategory | null): Project[] {
  return category ? projects.filter((p) => p.category === category) : projects;
}

/** One highlighted project per category for the home page (falls back to the first). */
export function highlightedProjects(): Project[] {
  return (["development", "patient-support", "completed"] as const)
    .map((category) => {
      const inCategory = projects.filter((p) => p.category === category);
      return inCategory.find((p) => p.highlight) ?? inCategory[0];
    })
    .filter((p): p is Project => Boolean(p));
}

export function relatedProjects(project: Project, count = 3): Project[] {
  const others = projects.filter((p) => p.slug !== project.slug);
  return [...others.filter((p) => p.category === project.category), ...others.filter((p) => p.category !== project.category)].slice(0, count);
}
