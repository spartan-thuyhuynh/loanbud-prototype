import { useState } from "react";
import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Folder as FolderIcon,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { AdminEmailTemplate, TemplateFolder } from "../../../types";
import type { TeamRole } from "../../../config/team";
import {
  canRoleSeeFolder,
  canRoleSeeTemplate,
  getDescendantFolderIds,
  resolveTemplateVisibleToLO,
} from "./templateVisibility";

// ── Drag types ───────────────────────────────────────────────────────────────

const TEMPLATE_DRAG = "email-template";
const FOLDER_DRAG = "email-folder";

type TemplateDragItem = { kind: "template"; id: string };
type FolderDragItem = { kind: "folder"; id: string };
type DragItem = TemplateDragItem | FolderDragItem;

// ── Props ────────────────────────────────────────────────────────────────────

interface FolderTreeProps {
  folders: TemplateFolder[];
  templates: AdminEmailTemplate[];
  currentUserRole: TeamRole;
  selectedId: string | null;
  onSelectTemplate: (t: AdminEmailTemplate) => void;
  onMoveTemplate: (templateId: string, folderId: string | null) => void;
  onMoveFolder: (id: string, newParentId: string | null) => void;
  onCreateFolder: (name: string, parentId: string | null) => void;
  onRenameFolder: (id: string, name: string) => void;
  onDeleteFolder: (id: string) => void;
  onSetFolderVisibility: (id: string, visible: boolean) => void;
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

// ── TemplateNode ─────────────────────────────────────────────────────────────

function TemplateNode({
  template,
  depth,
  isActive,
  loHidden,
  isAdmin,
  onSelect,
}: {
  template: AdminEmailTemplate;
  depth: number;
  isActive: boolean;
  loHidden: boolean;
  isAdmin: boolean;
  onSelect: () => void;
}) {
  const [{ isDragging }, dragRef] = useDrag<TemplateDragItem, unknown, { isDragging: boolean }>({
    type: TEMPLATE_DRAG,
    item: { kind: "template", id: template.id },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  return (
    <button
      ref={isAdmin ? dragRef : undefined}
      onClick={onSelect}
      className={`w-full text-left px-3 py-2.5 border-b border-border/40 last:border-b-0 transition-colors ${isActive ? "bg-background shadow-sm" : "hover:bg-background/60"}${isDragging ? " opacity-50" : ""}`}
      style={{ paddingLeft: 12 + depth * 14 }}
    >
      <div className="flex items-center gap-1.5">
        <p className={`text-sm font-medium truncate flex-1 ${isActive ? "text-primary" : "text-foreground"}`}>{template.name}</p>
        {loHidden && <EyeOff className="w-3 h-3 text-muted-foreground/70 shrink-0" aria-label="Hidden from loan officers" />}
      </div>
      {template.subject && (
        <p className="text-[11px] text-muted-foreground truncate mt-0.5">{template.subject}</p>
      )}
    </button>
  );
}

// ── FolderNode ───────────────────────────────────────────────────────────────

type FolderNodeMode = "idle" | "rename" | "addChild" | "confirmDelete";

function FolderNode({
  folder,
  depth,
  open,
  loHidden,
  isAdmin,
  allFolders,
  onToggle,
  onMoveTemplate,
  onMoveFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onSetFolderVisibility,
  children,
}: {
  folder: TemplateFolder;
  depth: number;
  open: boolean;
  loHidden: boolean;
  isAdmin: boolean;
  allFolders: TemplateFolder[];
  onToggle: () => void;
  onMoveTemplate: (templateId: string, folderId: string | null) => void;
  onMoveFolder: (id: string, newParentId: string | null) => void;
  onCreateFolder: (name: string, parentId: string | null) => void;
  onRenameFolder: (id: string, name: string) => void;
  onDeleteFolder: (id: string) => void;
  onSetFolderVisibility: (id: string, visible: boolean) => void;
  children?: ReactNode;
}) {
  const [mode, setMode] = useState<FolderNodeMode>("idle");

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

  const composedRef = (el: HTMLDivElement | null) => {
    if (isAdmin) dragRef(dropRef(el));
  };

  const stop = (e: MouseEvent) => e.stopPropagation();

  if (mode === "rename") {
    return (
      <InlineNameInput
        initialValue={folder.name}
        depth={depth}
        onCommit={(name) => {
          if (name !== folder.name) onRenameFolder(folder.id, name);
          setMode("idle");
        }}
        onCancel={() => setMode("idle")}
      />
    );
  }

  return (
    <div>
      <div
        ref={composedRef}
        onClick={onToggle}
        className={`group w-full flex items-center gap-1.5 px-3 py-2 cursor-pointer hover:bg-background/60 ${isActiveDrop ? "ring-1 ring-primary/50 bg-primary/5" : ""}${isDragging ? " opacity-50" : ""}`}
        style={{ paddingLeft: 12 + depth * 14 }}
      >
        {open ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
        <FolderIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <span
          className="text-sm font-medium text-foreground truncate flex-1"
          onDoubleClick={(e) => {
            if (!isAdmin) return;
            e.stopPropagation();
            setMode("rename");
          }}
        >
          {folder.name}
        </span>
        {loHidden && <EyeOff className="w-3 h-3 text-muted-foreground/70 shrink-0" aria-label="Hidden from loan officers" />}

        {isAdmin && mode !== "confirmDelete" && (
          <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
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
              title={folder.visibleToLoanOfficers ? "Visible to loan officers" : "Hidden from loan officers"}
              onClick={(e) => { stop(e); onSetFolderVisibility(folder.id, !folder.visibleToLoanOfficers); }}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              {folder.visibleToLoanOfficers ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
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

      {mode === "addChild" && (
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
      )}

      {open && children}
    </div>
  );
}

// ── Tree ─────────────────────────────────────────────────────────────────────

export function EmailTemplateFolderTree({
  folders,
  templates,
  currentUserRole,
  selectedId,
  onSelectTemplate,
  onMoveTemplate,
  onMoveFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onSetFolderVisibility,
}: FolderTreeProps) {
  const isAdmin = currentUserRole !== "loan_officer";
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(folders.map((f) => f.id)));
  const [creatingRoot, setCreatingRoot] = useState(false);

  const toggleExpanded = (folderId: string) => {
    setExpanded((s) => {
      const n = new Set(s);
      if (n.has(folderId)) n.delete(folderId); else n.add(folderId);
      return n;
    });
  };

  const visibleFolders = folders.filter((f) => canRoleSeeFolder(f, folders, currentUserRole));
  const visibleTemplates = templates.filter((t) => canRoleSeeTemplate(t, folders, currentUserRole));

  const rootFolders = visibleFolders.filter((f) => f.parentId === null);
  const childrenOf = (id: string) => visibleFolders.filter((f) => f.parentId === id);
  const templatesInFolder = (id: string) => visibleTemplates.filter((t) => t.folderId === id);
  const uncategorized = visibleTemplates.filter((t) => t.folderId === null);

  function renderFolder(folderId: string, depth: number): ReactNode {
    const folder = visibleFolders.find((f) => f.id === folderId);
    if (!folder) return null;
    const open = expanded.has(folderId);
    const loHidden = isAdmin && !canRoleSeeFolder(folder, folders, "loan_officer");
    return (
      <FolderNode
        key={folderId}
        folder={folder}
        depth={depth}
        open={open}
        loHidden={loHidden}
        isAdmin={isAdmin}
        allFolders={folders}
        onToggle={() => toggleExpanded(folderId)}
        onMoveTemplate={onMoveTemplate}
        onMoveFolder={onMoveFolder}
        onCreateFolder={onCreateFolder}
        onRenameFolder={onRenameFolder}
        onDeleteFolder={onDeleteFolder}
        onSetFolderVisibility={onSetFolderVisibility}
      >
        {childrenOf(folderId).map((c) => renderFolder(c.id, depth + 1))}
        {templatesInFolder(folderId).map((t) => renderTemplate(t, depth + 1))}
      </FolderNode>
    );
  }

  function renderTemplate(t: AdminEmailTemplate, depth: number) {
    const loHidden = isAdmin && !resolveTemplateVisibleToLO(t, folders);
    return (
      <TemplateNode
        key={t.id}
        template={t}
        depth={depth}
        isActive={selectedId === t.id}
        loHidden={loHidden}
        isAdmin={isAdmin}
        onSelect={() => onSelectTemplate(t)}
      />
    );
  }

  // A single DndProvider must wrap BOTH branches below: FolderNode/TemplateNode call
  // useDrag/useDrop unconditionally (isAdmin only gates whether refs are attached),
  // so react-dnd's useDragDropManager() needs a provider ancestor on the LO path too,
  // or it throws "Expected drag drop context" the instant a folder/template renders.
  return (
    <DndProvider backend={HTML5Backend}>
      {!isAdmin ? (
        <>
          {rootFolders.map((f) => renderFolder(f.id, 0))}
          {uncategorized.length > 0 && (
            <div>
              <div className="px-3 py-2 text-[11px] uppercase tracking-wide text-muted-foreground">Uncategorized</div>
              {uncategorized.map((t) => renderTemplate(t, 1))}
            </div>
          )}
        </>
      ) : (
        <RootDropZone onMoveTemplate={onMoveTemplate} onMoveFolder={onMoveFolder}>
          <div className="px-3 pt-1 pb-2">
            {creatingRoot ? (
              <InlineNameInput
                placeholder="Folder name"
                depth={0}
                onCommit={(name) => { onCreateFolder(name, null); setCreatingRoot(false); }}
                onCancel={() => setCreatingRoot(false)}
              />
            ) : (
              <button
                type="button"
                onClick={() => setCreatingRoot(true)}
                className="w-full flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground px-1 py-1"
              >
                <Plus className="w-3.5 h-3.5" />
                New Folder
              </button>
            )}
          </div>
          {rootFolders.map((f) => renderFolder(f.id, 0))}
          <div className="px-3 py-2 text-[11px] uppercase tracking-wide text-muted-foreground">Uncategorized</div>
          {uncategorized.map((t) => renderTemplate(t, 1))}
        </RootDropZone>
      )}
    </DndProvider>
  );
}

// ── Root drop zone (move to top-level / Uncategorized) ────────────────────────

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
    <div ref={dropRef} className={isOver && canDrop ? "ring-1 ring-primary/30 bg-primary/5 rounded-md" : undefined}>
      {children}
    </div>
  );
}
