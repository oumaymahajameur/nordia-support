import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_FILTERS } from "./tickets";
import { readFilters, readSelectedId, writeUrl } from "./urlState";

const ALLOWED = {
  status: ["all", "open", "resolved"],
  sort: ["date_desc", "priority_desc"],
};

describe("urlState", () => {
  beforeEach(() => window.history.replaceState(null, "", "/"));

  it("restores filters and the open ticket from the URL", () => {
    window.history.replaceState(null, "", "/?search=vpn&status=open&sort=priority_desc&ticket=7");
    expect(readFilters(DEFAULT_FILTERS, ALLOWED)).toEqual({
      ...DEFAULT_FILTERS, search: "vpn", status: "open", sort: "priority_desc",
    });
    expect(readSelectedId()).toBe(7);
  });

  it("ignores invalid values", () => {
    window.history.replaceState(null, "", "/?status=banana&sort=nope&ticket=abc");
    const f = readFilters(DEFAULT_FILTERS, ALLOWED);
    expect(f.status).toBe("all");
    expect(f.sort).toBe("date_desc");
    expect(readSelectedId()).toBeNull();
  });

  it("writes only non-default values", () => {
    writeUrl(DEFAULT_FILTERS, DEFAULT_FILTERS, null);
    expect(window.location.search).toBe("");
    writeUrl({ ...DEFAULT_FILTERS, status: "open" }, DEFAULT_FILTERS, 5);
    expect(window.location.search).toBe("?status=open&ticket=5");
  });
});