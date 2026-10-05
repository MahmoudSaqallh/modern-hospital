import { describe, expect, it } from "vitest";
import { NAV_ITEMS, isActiveItem, isActivePath } from "@/components/navigation/navItems";
import { clinics, getClinic } from "./clinics";
import { departments } from "./departments";
import { doctors } from "./doctors";
import { featuredNews, getArticle, news, newsByDate, newsInCategory, readingMinutes, relatedNews } from "./news";
import { hasDonationChannel, mailtoHref, phoneHref, safeDonationUrl, supportContact, supportPrograms } from "./patientSupport";
import { highlightedProjects, projects, projectsInCategory, relatedProjects } from "./projects";

const unique = (values: string[]) => new Set(values).size === values.length;

describe("structured content", () => {
  it("links every doctor and department to real clinics", () => {
    for (const doctor of doctors) expect(getClinic(doctor.clinicId), doctor.id).toBeDefined();
    for (const department of departments) {
      for (const id of department.clinicIds) expect(getClinic(id), `${department.id} → ${id}`).toBeDefined();
    }
  });

  it("uses unique ids and slugs", () => {
    expect(unique(clinics.map((c) => c.id))).toBe(true);
    expect(unique(departments.map((d) => d.id))).toBe(true);
    expect(unique(news.map((a) => a.slug))).toBe(true);
    expect(unique(projects.map((p) => p.slug))).toBe(true);
  });

  it("has both therapeutic and supporting departments", () => {
    expect(departments.some((d) => d.category === "therapeutic")).toBe(true);
    expect(departments.some((d) => d.category === "supporting")).toBe(true);
  });
});

describe("news helpers", () => {
  it("sorts newest first and filters by category", () => {
    const dates = newsByDate.map((a) => a.date);
    expect(dates).toEqual([...dates].sort().reverse());
    expect(newsInCategory("awareness").every((a) => a.category === "awareness")).toBe(true);
    expect(newsInCategory(null)).toHaveLength(news.length);
    expect(featuredNews().every((a) => a.featured)).toBe(true);
  });

  it("never relates an article to itself", () => {
    const article = getArticle(newsByDate[0].slug)!;
    const related = relatedNews(article);
    expect(related).toHaveLength(Math.min(3, news.length - 1));
    expect(related.some((a) => a.slug === article.slug)).toBe(false);
    expect(readingMinutes(article, "ar")).toBeGreaterThanOrEqual(1);
  });
});

describe("project helpers", () => {
  it("highlights one project per category", () => {
    const highlights = highlightedProjects();
    expect(highlights.map((p) => p.category)).toEqual(["development", "patient-support", "completed"]);
  });

  it("filters by category and relates same-category projects first", () => {
    expect(projectsInCategory("completed").every((p) => p.category === "completed")).toBe(true);
    const project = projectsInCategory("development")[0];
    const related = relatedProjects(project);
    expect(related.some((p) => p.slug === project.slug)).toBe(false);
    const sameCount = projectsInCategory("development").length - 1;
    expect(related.slice(0, Math.min(sameCount, 3)).every((p) => p.category === "development")).toBe(true);
  });
});

describe("navigation", () => {
  const contact = NAV_ITEMS.find((item) => item.key === "contact")!;

  it("keeps complaints under contact", () => {
    expect(contact.children?.map((c) => c.key)).toContain("complaints");
  });

  it("marks the parent active on a child route", () => {
    expect(isActiveItem("/ar/complaints", "ar", contact)).toBe(true);
    expect(isActiveItem("/en/contact", "en", contact)).toBe(true);
    expect(isActiveItem("/ar/clinics", "ar", contact)).toBe(false);
  });

  it("matches home exactly but other sections by prefix", () => {
    expect(isActivePath("/ar", "ar", "/")).toBe(true);
    expect(isActivePath("/ar/news", "ar", "/")).toBe(false);
    expect(isActivePath("/ar/news/heart-health-awareness", "ar", "/news")).toBe(true);
    expect(isActivePath("/ar/newsletter", "ar", "/news")).toBe(false);
  });
});

describe("patient sponsorship", () => {
  it("publishes exactly the approved inquiry details", () => {
    expect(supportContact).toEqual({ phone: "0597706883", email: "project@pah.ps" });
    expect(phoneHref(supportContact.phone)).toBe("tel:0597706883");
    expect(mailtoHref(supportContact.email)).toBe("mailto:project@pah.ps");
    for (const program of supportPrograms) expect(program.contact).toEqual(supportContact);
  });

  it("has both programs and invents no project numbers or banking details", () => {
    expect(supportPrograms.map((p) => p.id)).toEqual(["operations", "patient-fund"]);
    expect(supportPrograms.map((p) => p.title.ar)).toEqual(["دعم العمليات", "صندوق المريض الفقير"]);
    for (const { donation } of supportPrograms) {
      expect(donation).toEqual({ projectNumber: null, accountNumber: null, iban: null, bankName: null, donationUrl: null, qrCode: null });
      expect(hasDonationChannel(donation)).toBe(false);
    }
  });

  it("only ever links to an https donation page", () => {
    expect(safeDonationUrl("https://example.org/donate")).toBe("https://example.org/donate");
    expect(safeDonationUrl("http://example.org/donate")).toBeNull();
    expect(safeDonationUrl("javascript:alert(1)")).toBeNull();
    expect(safeDonationUrl("not a url")).toBeNull();
    expect(safeDonationUrl(null)).toBeNull();
  });

  it("is reachable from the projects menu", () => {
    const projectsItem = NAV_ITEMS.find((item) => item.key === "projects")!;
    expect(projectsItem.children?.map((c) => c.path)).toContain("/patient-support");
    expect(isActiveItem("/ar/patient-support", "ar", projectsItem)).toBe(true);
  });
});
