import { useState } from "react";
import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
import { useNavigate } from "react-router";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  ChevronDown,
  ChevronRight,
  Folder as FolderIcon,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { AdminEmailTemplate, TemplateFolder } from "../../../types";
import { useAppData } from "../../../contexts/AppDataContext";
import { Badge } from "../../ui/badge";
import {
  canRoleSeeFolder,
  canRoleSeeTemplate,
  getDescendantFolderIds,
} from "./templateVisibility";

// ── Drag types ───────────────────────────────────────────────────────────────

const TEMPLATE_DRAG = "email-template";
const FOLDER_DRAG = "email-folder";

type TemplateDragItem = { kind: "template"; id: string };
type FolderDragItem = { kind: "folder"; id: string };
type DragItem = TemplateDragItem | FolderDragItem;

const COLUMN_COUNT = 5;

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatShortDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function senderLabel(senderType: AdminEmailTemplate["senderType"]): string {
  return senderType === "loan-officer" ? "Loan Officer" : "Brand";
}

// ── Inline text input (create / rename) ─────────────────────────────────────

function InlineNameInput({
  initialValue = "",
  placeholder,
  depth,
  onCommit,
  onCancel,
}: {
  initialValue?: string;
  placeholder?: string;
  depth: number;
  onCommit: (value: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initialValue);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (value.trim()) onCommit(value.trim());
      else onCancel();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5" style={{ paddingLeft: 12 + depth * 14 }}>
      <input
        autoFocus
        value={value}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={onCancel}
        onClick={(e) => e.stopPropagation()}
        className="flex-1 text-sm bg-background border border-primary/40 rounded px-2 py-1 outline-none focus:border-primary"
      />
    </div>
  );
}

// ── TemplateRow ──────────────────────────────────────────────────────────────

function TemplateRow({
  template,
  depth,
  isAdmin,
  onSelect,
  onDelete,
}: {
  template: AdminEmailTemplate;
  depth: number;
  isAdmin: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [{ isDragging }, dragRef] = useDrag<TemplateDragItem, unknown, { isDragging: boolean }>({
    type: TEMPLATE_DRAG,
    item: { kind: "template", id: template.id },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const stop = (e: MouseEvent) => e.stopPropagation();

  return (
    <tr
      ref={isAdmin ? dragRef : undefined}
      onClick={onSelect}
      className={`group border-b border-border/40 last:border-b-0 cursor-pointer hover:bg-muted/40 transition-colors ${isDragging ? "opacity-50" : ""}`}
    >
      <td className="px-3 py-2.5" style={{ paddingLeft: 12 + depth * 14 }}>
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium text-foreground truncate max-w-[260px]">{template.name}</p>
          {template.isSystem && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal text-muted-foreground shrink-0">
              System
            </Badge>
          )}
        </div>
      </td>
      <td className="px-3 py-2.5 text-sm text-muted-foreground truncate max-w-[220px]">{template.subject}</td>
      <td className="px-3 py-2.5 text-sm text-muted-foreground whitespace-nowrap">{senderLabel(template.senderType)}</td>
      <td className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{formatShortDate(template.updatedAt)}</td>
      <td className="px-3 py-2.5 text-right whitespace-nowrap relative">
        {isAdmin && (
          <div
            className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-0.5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity bg-background/95 rounded"
            onClick={stop}
          >
            {confirmDelete ? (
              <>
                <span className="text-xs text-destructive font-medium mr-1">Delete?</span>
                <button
                  type="button"
                  onClick={(e) => { stop(e); onDelete(); }}
                  className="text-xs font-medium text-destructive hover:underline"
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={(e) => { stop(e); setConfirmDelete(false); }}
                  className="text-xs font-medium text-muted-foreground hover:underline ml-1"
                >
                  No
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  title="Edit"
                  onClick={(e) => { stop(e); onSelect(); }}
                  className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  title="Delete"
                  onClick={(e) => { stop(e); setConfirmDelete(true); }}
                  className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </>
            )}
          </div>
        )}
      </td>
    </tr>
  );
}

// ── FolderGroupRow ───────────────────────────────────────────────────────────

type FolderRowMode = "idle" | "rename" | "addChild" | "confirmDelete";

function FolderGroupRow({
  folder,
  depth,
  open,
  isAdmin,
  allFolders,
  onToggle,
  onMoveTemplate,
  onMoveFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
}: {
  folder: TemplateFolder;
  depth: number;
  open: boolean;
  isAdmin: boolean;
  allFolders: TemplateFolder[];
  onToggle: () => void;
  onMoveTemplate: (templateId: string, folderId: string | null) => void;
  onMoveFolder: (id: string, newParentId: string | null) => void;
  onCreateFolder: (name: string, parentId: string | null) => void;
  onRenameFolder: (id: string, name: string) => void;
  onDeleteFolder: (id: string) => void;
}) {
  const [mode, setMode] = useState<FolderRowMode>("idle");

  const [{ isDragging }, dragRef] = useDrag<FolderDragItem, unknown, { isDragging: boolean }>({
    type: FOLDER_DRAG,
    item: { kind: "folder", id: folder.id },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const [{ isOver, canDrop }, dropRef] = useDrop<DragItem, unknown, { isOver: boolean; canDrop: boolean }>({
    accept: [TEMPLATE_DRAG, FOLDER_DRAG],
    canDrop: (item) => {
      if (item.kind === "template") return true;
      if (item.id === folder.id) return false;
      return !getDescendantFolderIds(item.id, allFolders).includes(folder.id);
    },
    drop: (item, monitor) => {
      if (monitor.didDrop()) return;
      if (item.kind === "template") {
        onMoveTemplate(item.id, folder.id);
        toast.success("Template moved.");
      } else {
        onMoveFolder(item.id, folder.id);
        toast.success("Folder moved.");
      }
    },
    collect: (monitor) => ({ isOver: monitor.isOver(), canDrop: monitor.canDrop() }),
  });

  const isActiveDrop = isOver && canDrop;
  const stop = (e: MouseEvent) => e.stopPropagation();

  const composedRef = (el: HTMLTableRowElement | null) => {
    if (isAdmin) dragRef(dropRef(el));
  };

  if (mode === "rename") {
    return (
      <tr>
        <td colSpan={COLUMN_COUNT}>
          <InlineNameInput
            initialValue={folder.name}
            depth={depth}
            onCommit={(name) => {
              if (name !== folder.name) onRenameFolder(folder.id, name);
              setMode("idle");
            }}
            onCancel={() => setMode("idle")}
          />
        </td>
      </tr>
    );
  }

  return (
    <>
      <tr
        ref={composedRef}
        onClick={onToggle}
        className={`group cursor-pointer bg-muted/30 hover:bg-muted/50 border-b border-border/60 ${isActiveDrop ? "ring-1 ring-inset ring-primary/50 bg-primary/5" : ""} ${isDragging ? "opacity-50" : ""}`}
      >
        <td colSpan={COLUMN_COUNT} className="px-3 py-2">
          <div className="flex items-center gap-1.5" style={{ paddingLeft: depth * 14 }}>
            {open ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
            <FolderIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span
              className="text-sm font-medium text-foreground truncate"
              onDoubleClick={(e) => {
                if (!isAdmin) return;
                e.stopPropagation();
                setMode("rename");
              }}
            >
              {folder.name}
            </span>

            <div className="flex-1" />

            {isAdmin && mode !== "confirmDelete" && (
              <div
                className="flex items-center gap-0.5 shrink-0 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity"
                onClick={stop}
              >
                <button
                  type="button"
                  title="Add subfolder"
                  onClick={(e) => { stop(e); setMode("addChild"); }}
                  className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  title="Rename"
                  onClick={(e) => { stop(e); setMode("rename"); }}
                  className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  title="Delete"
                  onClick={(e) => { stop(e); setMode("confirmDelete"); }}
                  className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}

            {isAdmin && mode === "confirmDelete" && (
              <div className="flex items-center gap-1.5 shrink-0" onClick={stop}>
                <span className="text-xs text-destructive font-medium">Delete?</span>
                <button
                  type="button"
                  onClick={(e) => { stop(e); onDeleteFolder(folder.id); toast.success("Folder deleted."); setMode("idle"); }}
                  className="text-xs font-medium text-destructive hover:underline"
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={(e) => { stop(e); setMode("idle"); }}
                  className="text-xs font-medium text-muted-foreground hover:underline"
                >
                  No
                </button>
              </div>
            )}
          </div>
        </td>
      </tr>

      {mode === "addChild" && (
        <tr>
          <td colSpan={COLUMN_COUNT}>
            <InlineNameInput
              placeholder="Folder name"
              depth={depth + 1}
              onCommit={(name) => {
                onCreateFolder(name, folder.id);
                setMode("idle");
                if (!open) onToggle();
              }}
              onCancel={() => setMode("idle")}
            />
          </td>
        </tr>
      )}
    </>
  );
}

// ── Root / Uncategorized drop zone (table wrapper) ──────────────────────────

function RootDropZone({
  onMoveTemplate,
  onMoveFolder,
  children,
}: {
  onMoveTemplate: (templateId: string, folderId: string | null) => void;
  onMoveFolder: (id: string, newParentId: string | null) => void;
  children: ReactNode;
}) {
  const [{ isOver, canDrop }, dropRef] = useDrop<DragItem, unknown, { isOver: boolean; canDrop: boolean }>({
    accept: [TEMPLATE_DRAG, FOLDER_DRAG],
    drop: (item, monitor) => {
      if (monitor.didDrop()) return;
      if (item.kind === "template") {
        onMoveTemplate(item.id, null);
        toast.success("Template moved.");
      } else {
        onMoveFolder(item.id, null);
        toast.success("Folder moved.");
      }
    },
    collect: (monitor) => ({ isOver: monitor.isOver(), canDrop: monitor.canDrop() }),
  });

  return (
    <div ref={dropRef} className={isOver && canDrop ? "ring-1 ring-primary/30 bg-primary/5 rounded-xl" : undefined}>
      {children}
    </div>
  );
}

// ── EmailTemplateTable ───────────────────────────────────────────────────────

export function EmailTemplateTable() {
  const navigate = useNavigate();
  const {
    adminEmailTemplates,
    templateFolders,
    currentUserRole,
    handleCreateFolder,
    handleRenameFolder,
    handleMoveFolder,
    handleDeleteFolder,
    handleMoveTemplateToFolder,
    handleDeleteAdminEmailTemplate,
  } = useAppData();

  const isAdmin = currentUserRole !== "loan_officer";
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(templateFolders.map((f) => f.id)));
  const [creatingRoot, setCreatingRoot] = useState(false);

  const toggleExpanded = (folderId: string) => {
    setExpanded((s) => {
      const n = new Set(s);
      if (n.has(folderId)) n.delete(folderId); else n.add(folderId);
      return n;
    });
  };

  const visibleFolders = templateFolders.filter((f) => canRoleSeeFolder(f, templateFolders, currentUserRole));
  const visibleTemplates = adminEmailTemplates.filter((t) => canRoleSeeTemplate(t, templateFolders, currentUserRole));

  const rootFolders = visibleFolders.filter((f) => f.parentId === null);
  const childrenOf = (id: string) => visibleFolders.filter((f) => f.parentId === id);
  const templatesInFolder = (id: string) => visibleTemplates.filter((t) => t.folderId === id);
  const uncategorized = visibleTemplates.filter((t) => t.folderId === null);

  const goToTemplate = (t: AdminEmailTemplate) => navigate(`/email-workflows/templates/${t.id}`);

  function renderTemplate(t: AdminEmailTemplate, depth: number): ReactNode {
    return (
      <TemplateRow
        key={t.id}
        template={t}
        depth={depth}
        isAdmin={isAdmin}
        onSelect={() => goToTemplate(t)}
        onDelete={() => { handleDeleteAdminEmailTemplate(t.id); toast.success("Email template deleted."); }}
      />
    );
  }

  function renderFolder(folderId: string, depth: number): ReactNode {
    const folder = visibleFolders.find((f) => f.id === folderId);
    if (!folder) return null;
    const open = expanded.has(folderId);
    return (
      <FolderGroupRow
        key={folderId}
        folder={folder}
        depth={depth}
        open={open}
        isAdmin={isAdmin}
        allFolders={templateFolders}
        onToggle={() => toggleExpanded(folderId)}
        onMoveTemplate={handleMoveTemplateToFolder}
        onMoveFolder={handleMoveFolder}
        onCreateFolder={handleCreateFolder}
        onRenameFolder={handleRenameFolder}
        onDeleteFolder={handleDeleteFolder}
      />
    );
  }

  function renderFolderTree(folderId: string, depth: number): ReactNode[] {
    const folder = visibleFolders.find((f) => f.id === folderId);
    if (!folder) return [];
    const open = expanded.has(folderId);
    const rows: ReactNode[] = [renderFolder(folderId, depth)];
    if (open) {
      childrenOf(folderId).forEach((c) => rows.push(...renderFolderTree(c.id, depth + 1)));
      templatesInFolder(folderId).forEach((t) => rows.push(renderTemplate(t, depth + 1)));
    }
    return rows;
  }

  const isEmpty = visibleTemplates.length === 0 && visibleFolders.length === 0;

  const tableBody = (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
          <th className="px-3 py-2 font-medium">Name</th>
          <th className="px-3 py-2 font-medium">Subject</th>
          <th className="px-3 py-2 font-medium">Sender</th>
          <th className="px-3 py-2 font-medium">Updated</th>
          <th className="px-3 py-2 font-medium" />
        </tr>
      </thead>
      <tbody>
        {rootFolders.flatMap((f) => renderFolderTree(f.id, 0))}
        {(isAdmin || uncategorized.length > 0) && (
          <tr className="bg-muted/20 border-b border-border/60">
            <td colSpan={COLUMN_COUNT} className="px-3 py-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
              Uncategorized
            </td>
          </tr>
        )}
        {uncategorized.map((t) => renderTemplate(t, 1))}
      </tbody>
    </table>
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col gap-3">
        {isAdmin && (
          <div>
            {creatingRoot ? (
              <InlineNameInput
                placeholder="Folder name"
                depth={0}
                onCommit={(name) => { handleCreateFolder(name, null); setCreatingRoot(false); }}
                onCancel={() => setCreatingRoot(false)}
              />
            ) : (
              <button
                type="button"
                onClick={() => setCreatingRoot(true)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground px-1 py-1"
              >
                <Plus className="w-3.5 h-3.5" />
                New Folder
              </button>
            )}
          </div>
        )}

        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-border rounded-xl">
            <p className="text-xs text-muted-foreground">No templates yet.</p>
          </div>
        ) : isAdmin ? (
          <RootDropZone onMoveTemplate={handleMoveTemplateToFolder} onMoveFolder={handleMoveFolder}>
            <div className="rounded-xl border border-border overflow-hidden overflow-x-auto">{tableBody}</div>
          </RootDropZone>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden overflow-x-auto">{tableBody}</div>
        )}
      </div>
    </DndProvider>
  );
}
