import type { Clinic } from "@/features/clinics/types";

/**
 * Outpatient clinics available for booking. Descriptions are general service
 * descriptions — not claims about specific equipment, capacity or accreditation.
 * Confirm the final list with the society before launch.
 */
export const clinics: Clinic[] = [
  {
    id: "maternity",
    icon: "maternity",
    name: { ar: "عيادة النساء والولادة", en: "Obstetrics & Gynecology Clinic" },
    summary: { ar: "متابعة الحمل وصحة المرأة", en: "Pregnancy follow-up and women's health" },
    description: {
      ar: "متابعة الحمل والاستشارات النسائية، مع رعاية تراعي خصوصية المرأة في كل زيارة.",
      en: "Pregnancy follow-up and gynecology consultations, with care that respects every woman's privacy.",
    },
    bookable: true,
  },
  {
    id: "pediatrics",
    icon: "pediatrics",
    name: { ar: "عيادة الأطفال", en: "Pediatrics Clinic" },
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
    name: { ar: "عيادة الباطنة", en: "Internal Medicine Clinic" },
    summary: { ar: "التشخيص والأمراض المزمنة", en: "Diagnosis and chronic conditions" },
    description: {
      ar: "تشخيص ومتابعة الأمراض الباطنية والمزمنة مثل السكري وضغط الدم.",
      en: "Diagnosis and ongoing care for internal and chronic conditions such as diabetes and hypertension.",
    },
    bookable: true,
  },
  {
    id: "cardiology",
    icon: "cardiology",
    name: { ar: "عيادة القلب", en: "Cardiology Clinic" },
    summary: { ar: "صحة القلب والأوعية الدموية", en: "Heart and vascular health" },
    description: {
      ar: "تقييم صحة القلب ومتابعة المرضى المصابين بأمراض القلب والأوعية الدموية.",
      en: "Heart-health assessment and follow-up for patients with cardiovascular conditions.",
    },
    bookable: true,
  },
  {
    id: "orthopedics",
    icon: "orthopedics",
    name: { ar: "عيادة العظام", en: "Orthopedics Clinic" },
    summary: { ar: "العظام والمفاصل والإصابات", en: "Bones, joints and injuries" },
    description: {
      ar: "تشخيص وعلاج مشكلات العظام والمفاصل والإصابات الرياضية.",
      en: "Diagnosis and treatment of bone, joint and sports-related injuries.",
    },
    bookable: true,
  },
  {
    id: "dental",
    icon: "dental",
    name: { ar: "عيادة الأسنان", en: "Dental Clinic" },
    summary: { ar: "صحة الفم والأسنان", en: "Oral and dental health" },
    description: {
      ar: "الفحص الدوري وعلاج الأسنان ورعاية صحة الفم للكبار والصغار.",
      en: "Routine check-ups, dental treatment and oral care for adults and children.",
    },
    bookable: true,
  },
  {
    id: "surgery",
    icon: "surgery",
    name: { ar: "عيادة الجراحة", en: "General Surgery Clinic" },
    summary: { ar: "الاستشارات الجراحية والمتابعة", en: "Surgical consultations and follow-up" },
    description: {
      ar: "استشارات ما قبل العمليات الجراحية ومتابعة ما بعدها في مواعيد منظمة.",
      en: "Pre-operative consultations and post-operative follow-up on an organized schedule.",
    },
    bookable: true,
  },
  {
    id: "dermatology",
    icon: "dermatology",
    name: { ar: "عيادة الجلدية", en: "Dermatology Clinic" },
    summary: { ar: "صحة الجلد والشعر", en: "Skin and hair health" },
    description: {
      ar: "تشخيص وعلاج الأمراض الجلدية الشائعة ومتابعتها.",
      en: "Diagnosis, treatment and follow-up of common skin conditions.",
    },
    bookable: true,
  },
  {
    id: "ent",
    icon: "ent",
    name: { ar: "عيادة الأنف والأذن والحنجرة", en: "Ear, Nose & Throat Clinic" },
    summary: { ar: "الأنف والأذن والحنجرة", en: "Ear, nose and throat care" },
    description: {
      ar: "تشخيص وعلاج مشكلات الأنف والأذن والحنجرة للكبار والصغار.",
      en: "Diagnosis and treatment of ear, nose and throat conditions for adults and children.",
    },
    bookable: true,
  },
];

export function getClinic(id: string | null | undefined): Clinic | undefined {
  return id ? clinics.find((c) => c.id === id) : undefined;
}

export const bookableClinics = clinics.filter((c) => c.bookable);
