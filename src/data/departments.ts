import type { Department, DepartmentCategory } from "@/features/departments/types";

/**
 * PLACEHOLDER STRUCTURE — a realistic starting point for the society's
 * departments, written in general terms (no claims about equipment, capacity
 * or accreditation). Confirm names, grouping and services with the society
 * before launch; the pages render whatever is listed here.
 */
export const departments: Department[] = [
  // ── Therapeutic ───────────────────────────────────────────────
  {
    id: "internal-medicine",
    category: "therapeutic",
    icon: "internal",
    name: { ar: "قسم الباطنية", en: "Internal Medicine" },
    role: {
      ar: "تشخيص الأمراض الباطنية والمزمنة وعلاجها ومتابعة المرضى على المدى الطويل.",
      en: "Diagnosis, treatment and long-term follow-up of internal and chronic conditions.",
    },
    services: [
      { ar: "متابعة الأمراض المزمنة", en: "Chronic disease follow-up" },
      { ar: "التشخيص الباطني", en: "Internal medicine diagnosis" },
      { ar: "الاستشارات التخصصية", en: "Specialist consultations" },
    ],
    clinicIds: ["internal", "cardiology", "dermatology"],
  },
  {
    id: "surgery",
    category: "therapeutic",
    icon: "surgery",
    name: { ar: "قسم الجراحة", en: "Surgery" },
    role: {
      ar: "الاستشارات الجراحية والإجراءات العلاجية ومتابعة المرضى قبل العمليات وبعدها.",
      en: "Surgical consultations, procedures, and patient care before and after operations.",
    },
    services: [
      { ar: "الجراحة العامة", en: "General surgery" },
      { ar: "جراحة العظام", en: "Orthopedic surgery" },
      { ar: "المتابعة بعد العمليات", en: "Post-operative follow-up" },
    ],
    clinicIds: ["surgery", "orthopedics", "ent"],
  },
  {
    id: "obstetrics",
    category: "therapeutic",
    icon: "maternity",
    name: { ar: "قسم النسائية والتوليد", en: "Obstetrics & Gynecology" },
    role: {
      ar: "رعاية صحة المرأة ومتابعة الحمل والولادة بخصوصية واهتمام.",
      en: "Women's health, pregnancy and childbirth care, delivered with privacy and attention.",
    },
    services: [
      { ar: "متابعة الحمل", en: "Pregnancy follow-up" },
      { ar: "رعاية ما بعد الولادة", en: "Postnatal care" },
      { ar: "الاستشارات النسائية", en: "Gynecology consultations" },
    ],
    clinicIds: ["maternity"],
  },
  {
    id: "pediatrics",
    category: "therapeutic",
    icon: "pediatrics",
    name: { ar: "قسم الأطفال", en: "Pediatrics" },
    role: {
      ar: "رعاية الرضّع والأطفال ومتابعة نموهم وعلاج أمراض الطفولة.",
      en: "Care for infants and children, growth follow-up and treatment of childhood illnesses.",
    },
    services: [
      { ar: "متابعة النمو", en: "Growth follow-up" },
      { ar: "رعاية حديثي الولادة", en: "Newborn care" },
    ],
    clinicIds: ["pediatrics"],
  },
  {
    id: "dentistry",
    category: "therapeutic",
    icon: "dental",
    name: { ar: "قسم طب الأسنان", en: "Dentistry" },
    role: {
      ar: "الوقاية والعلاج لصحة الفم والأسنان للكبار والصغار.",
      en: "Preventive and restorative oral care for adults and children.",
    },
    services: [
      { ar: "الفحص الدوري", en: "Routine check-ups" },
      { ar: "علاج الأسنان", en: "Dental treatment" },
    ],
    clinicIds: ["dental"],
  },
  {
    id: "emergency",
    category: "therapeutic",
    icon: "emergency",
    name: { ar: "قسم الطوارئ", en: "Emergency" },
    role: {
      ar: "استقبال الحالات العاجلة. لا تُحجز مواعيده عبر الموقع؛ يرجى التواصل مع الجمعية مباشرة.",
      en: "Receives urgent cases. Not booked online — please contact the society directly.",
    },
    services: [{ ar: "استقبال الحالات العاجلة", en: "Urgent case reception" }],
    clinicIds: [],
  },

  // ── Supporting ────────────────────────────────────────────────
  {
    id: "laboratory",
    category: "supporting",
    icon: "laboratory",
    name: { ar: "المختبر", en: "Laboratory" },
    role: {
      ar: "إجراء التحاليل الطبية التي يعتمد عليها الأطباء في التشخيص والمتابعة.",
      en: "Medical tests that doctors rely on for diagnosis and follow-up.",
    },
    services: [
      { ar: "التحاليل الدورية", en: "Routine tests" },
      { ar: "التحاليل التشخيصية", en: "Diagnostic tests" },
    ],
    clinicIds: [],
  },
  {
    id: "radiology",
    category: "supporting",
    icon: "radiology",
    name: { ar: "الأشعة", en: "Radiology" },
    role: {
      ar: "التصوير الطبي التشخيصي بطلب من الطبيب المعالج.",
      en: "Diagnostic imaging on the treating physician's request.",
    },
    services: [{ ar: "التصوير التشخيصي", en: "Diagnostic imaging" }],
    clinicIds: [],
  },
  {
    id: "pharmacy",
    category: "supporting",
    icon: "pharmacy",
    name: { ar: "الصيدلية", en: "Pharmacy" },
    role: {
      ar: "صرف الأدوية وتقديم الإرشادات الدوائية للمرضى.",
      en: "Dispensing medication and guiding patients on its use.",
    },
    services: [{ ar: "صرف الأدوية", en: "Medication dispensing" }],
    clinicIds: [],
  },
  {
    id: "sterilization",
    category: "supporting",
    icon: "sterilization",
    name: { ar: "التعقيم", en: "Sterilization" },
    role: {
      ar: "تجهيز الأدوات الطبية وتعقيمها بما يحفظ سلامة المرضى والكادر.",
      en: "Preparing and sterilizing medical instruments to keep patients and staff safe.",
    },
    services: [{ ar: "تعقيم الأدوات الطبية", en: "Instrument sterilization" }],
    clinicIds: [],
  },
  {
    id: "physiotherapy",
    category: "supporting",
    icon: "physiotherapy",
    name: { ar: "العلاج الطبيعي", en: "Physiotherapy" },
    role: {
      ar: "برامج تأهيل تساعد المرضى على استعادة الحركة بعد الإصابات والعمليات.",
      en: "Rehabilitation programs that help patients regain movement after injury or surgery.",
    },
    services: [{ ar: "برامج التأهيل", en: "Rehabilitation programs" }],
    clinicIds: ["orthopedics"],
  },
  {
    id: "nutrition",
    category: "supporting",
    icon: "nutrition",
    name: { ar: "التغذية", en: "Nutrition" },
    role: {
      ar: "إرشادات غذائية تدعم خطة العلاج، خاصة لأصحاب الأمراض المزمنة.",
      en: "Dietary guidance that supports treatment plans, especially for chronic conditions.",
    },
    services: [{ ar: "الاستشارات الغذائية", en: "Dietary consultations" }],
    clinicIds: ["internal"],
  },
];

export function departmentsByCategory(category: DepartmentCategory): Department[] {
  return departments.filter((d) => d.category === category);
}

export function getDepartment(id: string | null | undefined): Department | undefined {
  return id ? departments.find((d) => d.id === id) : undefined;
}
