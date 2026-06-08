import { describe, expect, it } from "vitest";
import { footerNav, mainNav, faqs } from "@/lib/constants";

describe("accountless purchase flow", () => {
  it("does not expose account or portal navigation", () => {
    const links = [
      ...mainNav,
      ...footerNav.product,
      ...footerNav.support,
      ...footerNav.legal,
    ];

    const hrefs = links.map((link) => String(link.href));

    expect(hrefs).not.toContain("/dashboard");
    expect(hrefs).not.toContain("/login");
    expect(links.some((link) => /portal|account/i.test(link.title))).toBe(
      false,
    );
  });

  it("describes license delivery by email instead of an account portal", () => {
    const licenseFaq = faqs.find(
      (faq) => faq.q === "What does the license cover?",
    );

    expect(licenseFaq?.a).toMatch(/delivered.*email/i);
    expect(licenseFaq?.a).not.toMatch(/portal|account/i);
  });
});
