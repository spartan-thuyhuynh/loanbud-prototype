import { describe, it, expect } from "vitest";
import type { AdminEmailTemplate, TemplateFolder } from "../../../types";
import {
  isFolderVisibleToLO,
  resolveTemplateVisibleToLO,
  canRoleSeeTemplate,
  canRoleSeeFolder,
  getDescendantFolderIds,
} from "./templateVisibility";

const folders: TemplateFolder[] = [
  { id: "a", name: "A", parentId: null, visibleToLoanOfficers: true, createdAt: new Date() },
  { id: "a1", name: "A1", parentId: "a", visibleToLoanOfficers: true, createdAt: new Date() },
  { id: "h", name: "Hidden", parentId: null, visibleToLoanOfficers: false, createdAt: new Date() },
  { id: "h1", name: "Hidden child", parentId: "h", visibleToLoanOfficers: true, createdAt: new Date() },
];

function tpl(over: Partial<AdminEmailTemplate>): AdminEmailTemplate {
  return {
    id: "t", name: "T", subject: "s", body: "b",
    folderId: null, visibleToLoanOfficers: null,
    senderType: "brand", variables: [], createdAt: new Date(), updatedAt: new Date(),
    ...over,
  };
}

describe("isFolderVisibleToLO", () => {
  it("null folderId (uncategorized) is visible", () => {
    expect(isFolderVisibleToLO(null, folders)).toBe(true);
  });
  it("a visible folder under a visible parent is visible", () => {
    expect(isFolderVisibleToLO("a1", folders)).toBe(true);
  });
  it("a visible folder under a hidden parent is hidden (inheritance)", () => {
    expect(isFolderVisibleToLO("h1", folders)).toBe(false);
  });
  it("unknown folderId is treated as visible", () => {
    expect(isFolderVisibleToLO("ghost", folders)).toBe(true);
  });
});

describe("resolveTemplateVisibleToLO", () => {
  it("override Hide wins over a visible folder", () => {
    expect(resolveTemplateVisibleToLO(tpl({ folderId: "a", visibleToLoanOfficers: false }), folders)).toBe(false);
  });
  it("override Show wins over a hidden folder", () => {
    expect(resolveTemplateVisibleToLO(tpl({ folderId: "h", visibleToLoanOfficers: true }), folders)).toBe(true);
  });
  it("no override inherits the folder", () => {
    expect(resolveTemplateVisibleToLO(tpl({ folderId: "h1", visibleToLoanOfficers: null }), folders)).toBe(false);
  });
  it("no override + no folder defaults to visible", () => {
    expect(resolveTemplateVisibleToLO(tpl({ folderId: null, visibleToLoanOfficers: null }), folders)).toBe(true);
  });
});

describe("role gating", () => {
  it("admin sees a hidden template", () => {
    expect(canRoleSeeTemplate(tpl({ folderId: "h" }), folders, "admin")).toBe(true);
  });
  it("super_admin sees a hidden folder", () => {
    expect(canRoleSeeFolder(folders[2], folders, "super_admin")).toBe(true);
  });
  it("loan_officer does not see a hidden template", () => {
    expect(canRoleSeeTemplate(tpl({ folderId: "h1" }), folders, "loan_officer")).toBe(false);
  });
  it("loan_officer sees a visible template", () => {
    expect(canRoleSeeTemplate(tpl({ folderId: "a1" }), folders, "loan_officer")).toBe(true);
  });
});

describe("getDescendantFolderIds", () => {
  it("returns nested descendants, excluding self", () => {
    expect(getDescendantFolderIds("a", folders)).toEqual(["a1"]);
  });
  it("returns [] for a leaf", () => {
    expect(getDescendantFolderIds("a1", folders)).toEqual([]);
  });
});
