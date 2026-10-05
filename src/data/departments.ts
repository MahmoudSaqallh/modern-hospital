import type { Department } from "@/features/departments/types";

/**
 * Medical departments. Descriptions are general service descriptions, not
 * claims about specific equipment, capacity or accreditation.
 */
export const departments: Department[] = [
  {
    id: "maternity",
    icon: "maternity",
    name: { ar: "النساء والولادة", en: "Obstetrics & Gynecology" },
    summary: { ar: "متابعة الحمل وصحة المرأة", en: "Pregnancy follow-up and women's health" },
    description: {
      ar: "عيادات متابعة الحمل والاستشارات النسائية، مع رعاية تراعي خصوصية المرأة في كل زيارة.",
      en: "Pregnancy follow-up and gynecology consultations, with care that respects every woman's privacy.",
    },
    bookable: true,
  },
  {
    id: "pediatrics",
    icon: "pediatrics",
    name: { ar: "الأطفال", en: "Pediatrics" },
    summary: { ar: "رعاية الرضّع والأطفال", en: "Care for infants and children" },
    description: {
      ar: "فحوصات النمو والمتابعة الدورية وعلاج الحالات الشائعة لدى الرضّع والأطفال.",
      en: "Growth checks, routine follow-up and treatment of common conditions for infants and children.",
    },
    bookable: true,
  },
  {
    id: "internal",
    icon: "internal",
    name: { ar: "الباطنة", en: "Internal Medicine" },
    summary: { ar: "التشخيص والأمراض المزمنة", en: "Diagnosis and chronic conditions" },
    description: {
      ar: "تشخيص ومتابعة الأمراض الباطنية والمزمنة مثل السكري وضغط الدم.",
      en: "Diagnosis and ongoing care for internal and chronic conditions such as diabetes and hypertension.",
    },
    bookable: true,
  },
  {
    id: "surgery",
    icon: "surgery",
    name: { ar: "الجراحة", en: "General Surgery" },
    summary: { ar: "الاستشارات الجراحية والمتابعة", en: "Surgical consultations and follow-up" },
    description: {
      ar: "استشارات ما قبل العمليات الجراحية ومتابعة ما بعدها في عيادات منظمة.",
      en: "Pre-operative consultations and post-operative follow-up in organized clinics.",
    },
    bookable: true,
  },
  {
    id: "cardiology",
    icon: "cardiology",
    name: { ar: "القلب", en: "Cardiology" },
    summary: { ar: "صحة القلب والأوعية الدموية", en: "Heart and vascular health" },
    description: {
      ar: "تقييم صحة القلب ومتابعة المرضى المصابين بأمراض القلب والأوعية الدموية.",
      en: "Heart health assessment and follow-up for patients with cardiovascular conditions.",
    },
    bookable: true,
  },
  {
    id: "orthopedics",
    icon: "orthopedics",
    name: { ar: "العظام", en: "Orthopedics" },
    summary: { ar: "العظام والمفاصل والإصابات", en: "Bones, joints and injuries" },
    description: {
      ar: "تشخيص وعلاج مشكلات العظام والمفاصل والإصابات الرياضية.",
      en: "Diagnosis and treatment of bone, joint and sports-related injuries.",
    },
    bookable: true,
  },
  {
    id: "radiology",
    icon: "radiology",
    name: { ar: "الأشعة", en: "Radiology" },
    summary: { ar: "التصوير الطبي التشخيصي", en: "Diagnostic imaging" },
    description: {
      ar: "خدمات التصوير الطبي التشخيصي بناءً على طلب الطبيب المعالج.",
      en: "Diagnostic imaging services based on your physician's request.",
    },
    bookable: true,
  },
  {
    id: "laboratory",
    icon: "laboratory",
    name: { ar: "المختبر", en: "Laboratory" },
    summary: { ar: "التحاليل الطبية", en: "Medical tests" },
    description: {
      ar: "إجراء التحاليل الطبية وتسليم النتائج للطبيب المعالج.",
      en: "Medical laboratory testing with results shared with your physician.",
    },
    bookable: true,
  },
  {
    id: "dental",
    icon: "dental",
    name: { ar: "الأسنان", en: "Dentistry" },
    summary: { ar: "صحة الفم والأسنان", en: "Oral and dental health" },
    description: {
      ar: "الفحص الدوري وعلاج الأسنان ورعاية صحة الفم للكبار والصغار.",
      en: "Routine check-ups, dental treatment and oral care for adults and children.",
    },
    bookable: true,
  },
  {
    id: "emergency",
    icon: "emergency",
    name: { ar: "الطوارئ", en: "Emergency" },
    summary: { ar: "الحالات العاجلة لا تحتاج حجزاً", en: "Urgent cases need no booking" },
    description: {
      ar: "الحالات العاجلة لا تُحجز عبر الموقع. يرجى التواصل مع الجمعية مباشرة لمعرفة آلية استقبال الحالات الطارئة.",
      en: "Urgent cases are not booked online. Please contact the society directly for urgent-care arrangements.",
    },
    bookable: false,
    urgent: true,
  },
];

export function getDepartment(id: string | null | undefined): Department | undefined {
  return id ? departments.find((d) => d.id === id) : undefined;
}

export const bookableDepartments = departments.filter((d) => d.bookable);
