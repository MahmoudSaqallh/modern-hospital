import type { Doctor } from "@/features/doctors/types";

/**
 * SAMPLE DATA — placeholder doctor profiles for layout and booking-flow
 * development. Replace with the organization's verified roster (or load
 * from the backend) before launch. Names, titles and bios are illustrative.
 */
export const doctors: Doctor[] = [
  {
    id: "ahmad-mohammad",
    clinicId: "pediatrics",
    name: { ar: "د. أحمد محمد", en: "Dr. Ahmad Mohammad" },
    title: { ar: "استشاري طب الأطفال", en: "Consultant Pediatrician" },
    qualification: { ar: "بكالوريوس الطب والجراحة، البورد في طب الأطفال", en: "MBBS, Board certification in Pediatrics" },
    bio: {
      ar: "يهتم بمتابعة نمو الأطفال منذ الولادة، ويحرص على شرح خطة العلاج للأهل بلغة واضحة وهادئة.",
      en: "Focuses on following children's growth from birth and explains every care plan to parents clearly and calmly.",
    },
    services: [
      { ar: "متابعة النمو والتطور", en: "Growth and development checks" },
      { ar: "علاج أمراض الطفولة الشائعة", en: "Common childhood illnesses" },
      { ar: "استشارات التغذية للأطفال", en: "Child nutrition advice" },
    ],
    workingDays: [6, 0, 1, 2, 3],
    sessions: ["morning", "evening"],
  },
  {
    id: "lina-haddad",
    clinicId: "pediatrics",
    name: { ar: "د. لينا الحداد", en: "Dr. Lina Haddad" },
    title: { ar: "أخصائية طب الأطفال وحديثي الولادة", en: "Pediatrics & Neonatology Specialist" },
    qualification: { ar: "بكالوريوس الطب والجراحة، ماجستير طب الأطفال", en: "MBBS, Master's in Pediatrics" },
    bio: {
      ar: "تتابع حديثي الولادة والرضّع، وتقدّم إرشادات الرضاعة والرعاية في الأشهر الأولى.",
      en: "Cares for newborns and infants, with guidance on feeding and care through the first months.",
    },
    services: [
      { ar: "فحص حديثي الولادة", en: "Newborn examinations" },
      { ar: "إرشادات الرضاعة", en: "Feeding guidance" },
    ],
    workingDays: [0, 2, 4],
    sessions: ["morning"],
  },
  {
    id: "rana-khalil",
    clinicId: "maternity",
    name: { ar: "د. رنا خليل", en: "Dr. Rana Khalil" },
    title: { ar: "استشارية النساء والولادة", en: "Consultant Obstetrician & Gynecologist" },
    qualification: { ar: "بكالوريوس الطب والجراحة، البورد في النساء والولادة", en: "MBBS, Board certification in Obstetrics & Gynecology" },
    bio: {
      ar: "ترافق المرأة خلال مراحل الحمل المختلفة وتقدّم الاستشارات النسائية بخصوصية واهتمام.",
      en: "Supports women through each stage of pregnancy and offers gynecology consultations with privacy and care.",
    },
    services: [
      { ar: "متابعة الحمل", en: "Pregnancy follow-up" },
      { ar: "الاستشارات النسائية", en: "Gynecology consultations" },
      { ar: "رعاية ما بعد الولادة", en: "Postnatal care" },
    ],
    workingDays: [6, 1, 3],
    sessions: ["morning", "evening"],
  },
  {
    id: "maha-saleh",
    clinicId: "maternity",
    name: { ar: "د. مها صالح", en: "Dr. Maha Saleh" },
    title: { ar: "أخصائية النساء والولادة", en: "Obstetrics & Gynecology Specialist" },
    qualification: { ar: "بكالوريوس الطب والجراحة، ماجستير النساء والولادة", en: "MBBS, Master's in Obstetrics & Gynecology" },
    bio: {
      ar: "تهتم بصحة المرأة في مختلف المراحل العمرية وبالتوعية الصحية الوقائية.",
      en: "Focuses on women's health across life stages and on preventive health awareness.",
    },
    services: [
      { ar: "الفحص الدوري للمرأة", en: "Routine women's check-ups" },
      { ar: "متابعة الحمل", en: "Pregnancy follow-up" },
    ],
    workingDays: [0, 2, 4],
    sessions: ["evening"],
  },
  {
    id: "khaled-yousef",
    clinicId: "internal",
    name: { ar: "د. خالد يوسف", en: "Dr. Khaled Yousef" },
    title: { ar: "استشاري الأمراض الباطنية", en: "Consultant in Internal Medicine" },
    qualification: { ar: "بكالوريوس الطب والجراحة، البورد في الأمراض الباطنية", en: "MBBS, Board certification in Internal Medicine" },
    bio: {
      ar: "يتابع مرضى السكري وضغط الدم والأمراض المزمنة بخطط علاج واضحة ومراجعات منتظمة.",
      en: "Follows patients with diabetes, hypertension and chronic conditions through clear plans and regular reviews.",
    },
    services: [
      { ar: "متابعة السكري وضغط الدم", en: "Diabetes and blood-pressure follow-up" },
      { ar: "الفحص الطبي الشامل", en: "Comprehensive medical check-ups" },
      { ar: "تشخيص الأمراض الباطنية", en: "Internal medicine diagnosis" },
    ],
    workingDays: [6, 0, 1, 2, 3, 4],
    sessions: ["morning"],
  },
  {
    id: "sami-abdullah",
    clinicId: "internal",
    name: { ar: "د. سامي عبدالله", en: "Dr. Sami Abdullah" },
    title: { ar: "أخصائي الأمراض الباطنية", en: "Internal Medicine Specialist" },
    qualification: { ar: "بكالوريوس الطب والجراحة، ماجستير الأمراض الباطنية", en: "MBBS, Master's in Internal Medicine" },
    bio: {
      ar: "يعمل في العيادات المسائية ويهتم بالتشخيص الدقيق والمتابعة المنظمة للمرضى.",
      en: "Runs the evening clinics with a focus on careful diagnosis and organized patient follow-up.",
    },
    services: [
      { ar: "الاستشارات الباطنية", en: "Internal medicine consultations" },
      { ar: "متابعة الأمراض المزمنة", en: "Chronic condition follow-up" },
    ],
    workingDays: [6, 1, 3],
    sessions: ["evening"],
  },
  {
    id: "omar-najjar",
    clinicId: "surgery",
    name: { ar: "د. عمر النجار", en: "Dr. Omar Najjar" },
    title: { ar: "استشاري الجراحة العامة", en: "Consultant General Surgeon" },
    qualification: { ar: "بكالوريوس الطب والجراحة، البورد في الجراحة العامة", en: "MBBS, Board certification in General Surgery" },
    bio: {
      ar: "يقدّم الاستشارات الجراحية ويشرح للمريض خيارات العلاج ومراحل التحضير والتعافي.",
      en: "Provides surgical consultations and walks patients through treatment options, preparation and recovery.",
    },
    services: [
      { ar: "الاستشارات الجراحية", en: "Surgical consultations" },
      { ar: "المتابعة بعد العمليات", en: "Post-operative follow-up" },
    ],
    workingDays: [0, 2, 4],
    sessions: ["morning", "evening"],
  },
  {
    id: "hani-mansour",
    clinicId: "cardiology",
    name: { ar: "د. هاني منصور", en: "Dr. Hani Mansour" },
    title: { ar: "استشاري أمراض القلب", en: "Consultant Cardiologist" },
    qualification: { ar: "بكالوريوس الطب والجراحة، البورد في أمراض القلب", en: "MBBS, Board certification in Cardiology" },
    bio: {
      ar: "يهتم بتقييم صحة القلب والوقاية من أمراضه ومتابعة المرضى على المدى الطويل.",
      en: "Focuses on heart-health assessment, prevention and long-term patient follow-up.",
    },
    services: [
      { ar: "تقييم صحة القلب", en: "Heart-health assessment" },
      { ar: "متابعة مرضى القلب", en: "Cardiac patient follow-up" },
      { ar: "استشارات الوقاية", en: "Prevention consultations" },
    ],
    workingDays: [6, 1, 3],
    sessions: ["morning"],
  },
  {
    id: "yazan-qasem",
    clinicId: "orthopedics",
    name: { ar: "د. يزن قاسم", en: "Dr. Yazan Qasem" },
    title: { ar: "أخصائي جراحة العظام", en: "Orthopedic Surgery Specialist" },
    qualification: { ar: "بكالوريوس الطب والجراحة، ماجستير جراحة العظام", en: "MBBS, Master's in Orthopedic Surgery" },
    bio: {
      ar: "يعالج آلام المفاصل والإصابات ويضع خطط تأهيل تساعد المريض على العودة لنشاطه.",
      en: "Treats joint pain and injuries with rehabilitation plans that help patients return to activity.",
    },
    services: [
      { ar: "علاج آلام المفاصل", en: "Joint pain treatment" },
      { ar: "الإصابات الرياضية", en: "Sports injuries" },
    ],
    workingDays: [6, 0, 2, 4],
    sessions: ["evening"],
  },
  {
    id: "nour-ibrahim",
    clinicId: "dermatology",
    name: { ar: "د. نور إبراهيم", en: "Dr. Nour Ibrahim" },
    title: { ar: "أخصائية الأمراض الجلدية", en: "Dermatology Specialist" },
    qualification: { ar: "بكالوريوس الطب والجراحة، ماجستير الأمراض الجلدية", en: "MBBS, Master's in Dermatology" },
    bio: {
      ar: "تهتم بتشخيص الأمراض الجلدية الشائعة ومتابعتها، وتشرح للمريض خطة العلاج بوضوح.",
      en: "Diagnoses and follows up common skin conditions, explaining each treatment plan clearly.",
    },
    services: [
      { ar: "تشخيص الأمراض الجلدية", en: "Skin condition diagnosis" },
      { ar: "متابعة الحالات المزمنة", en: "Chronic condition follow-up" },
    ],
    workingDays: [6, 1, 3],
    sessions: ["evening"],
  },
  {
    id: "dana-awad",
    clinicId: "ent",
    name: { ar: "د. دانة عوض", en: "Dr. Dana Awad" },
    title: { ar: "أخصائية الأنف والأذن والحنجرة", en: "Ear, Nose & Throat Specialist" },
    qualification: { ar: "بكالوريوس الطب والجراحة، ماجستير الأنف والأذن والحنجرة", en: "MBBS, Master's in Otolaryngology" },
    bio: {
      ar: "تعالج مشكلات الأنف والأذن والحنجرة للكبار والصغار، وتتابع الحالات المتكررة.",
      en: "Treats ear, nose and throat conditions for adults and children, with follow-up for recurring cases.",
    },
    services: [
      { ar: "فحص السمع والأذن", en: "Ear and hearing examination" },
      { ar: "علاج التهابات الجيوب الأنفية", en: "Sinus infection treatment" },
    ],
    workingDays: [0, 2, 4],
    sessions: ["morning"],
  },
  {
    id: "faris-zaid",
    clinicId: "dental",
    name: { ar: "د. فارس زيد", en: "Dr. Faris Zaid" },
    title: { ar: "طبيب أسنان عام", en: "General Dentist" },
    qualification: { ar: "بكالوريوس طب وجراحة الفم والأسنان", en: "Bachelor of Dental Surgery" },
    bio: {
      ar: "يقدّم الفحص الدوري وعلاجات الأسنان الأساسية مع التركيز على راحة المريض.",
      en: "Provides routine check-ups and essential dental treatment with a focus on patient comfort.",
    },
    services: [
      { ar: "الفحص الدوري", en: "Routine check-ups" },
      { ar: "حشوات الأسنان", en: "Fillings" },
      { ar: "تنظيف الأسنان", en: "Dental cleaning" },
    ],
    workingDays: [6, 0, 1, 2, 3],
    sessions: ["morning", "evening"],
  },
  {
    id: "salma-hasan",
    clinicId: "dental",
    name: { ar: "د. سلمى حسن", en: "Dr. Salma Hasan" },
    title: { ar: "أخصائية طب أسنان الأطفال", en: "Pediatric Dentistry Specialist" },
    qualification: { ar: "بكالوريوس طب الأسنان، ماجستير طب أسنان الأطفال", en: "BDS, Master's in Pediatric Dentistry" },
    bio: {
      ar: "تهتم بصحة أسنان الأطفال وتجعل الزيارة تجربة هادئة ومطمئنة للطفل.",
      en: "Cares for children's teeth and keeps every visit calm and reassuring for the child.",
    },
    services: [
      { ar: "فحص أسنان الأطفال", en: "Children's dental check-ups" },
      { ar: "التوعية بصحة الفم", en: "Oral-health guidance" },
    ],
    workingDays: [1, 3],
    sessions: ["evening"],
  },
];

export function getDoctor(id: string | null | undefined): Doctor | undefined {
  return id ? doctors.find((d) => d.id === id) : undefined;
}

export function getDoctorsByClinic(clinicId: string): Doctor[] {
  return doctors.filter((d) => d.clinicId === clinicId);
}
