import type { AdminEmailTemplate, TemplateFolder } from "../../../types";
import type { TeamRole } from "../../../config/team";

/** Walk ancestors; hidden if this folder or any ancestor is LO-hidden. null = uncategorized = visible. */
export function isFolderVisibleToLO(folderId: string | null, folders: TemplateFolder[]): boolean {
  if (folderId === null) return true;
  const byId = new Map(folders.map((f) => [f.id, f]));
  let current = byId.get(folderId);
  const seen = new Set<string>(); // cycle guard
  while (current && !seen.has(current.id)) {
    if (!current.visibleToLoanOfficers) return false;
    seen.add(current.id);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  return true; // unknown folder id or clean walk
}

/** Override wins; else inherit from folder; else (uncategorized) visible. */
export function resolveTemplateVisibleToLO(template: AdminEmailTemplate, folders: TemplateFolder[]): boolean {
  if (template.visibleToLoanOfficers !== null) return template.visibleToLoanOfficers;
  return isFolderVisibleToLO(template.folderId, folders);
}

export function canRoleSeeTemplate(template: AdminEmailTemplate, folders: TemplateFolder[], role: TeamRole): boolean {
  if (role !== "loan_officer") return true;
  return resolveTemplateVisibleToLO(template, folders);
}

export function canRoleSeeFolder(folder: TemplateFolder, folders: TemplateFolder[], role: TeamRole): boolean {
  if (role !== "loan_officer") return true;
  return isFolderVisibleToLO(folder.id, folders);
}

/** All descendant folder ids (excludes the folder itself). */
export function getDescendantFolderIds(folderId: string, folders: TemplateFolder[]): string[] {
  const out: string[] = [];
  const children = folders.filter((f) => f.parentId === folderId);
  for (const child of children) {
    out.push(child.id, ...getDescendantFolderIds(child.id, folders));
  }
  return out;
}
