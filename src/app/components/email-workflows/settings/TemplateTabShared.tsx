import type React from "react";
import { Pencil, Plus, Tag, Trash2 } from "lucide-react";
import { Button } from "../../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog";

// ── Primitives ────────────────────────────────────────────────────────────────

export function SectionHeading({ label }: { label: string }) {
  return <h3 className="text-sm font-semibold text-foreground">{label}</h3>;
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">{children}</p>;
}

// ── Rounded content section ───────────────────────────────────────────────────

interface DetailSectionProps {
  label: string;
  headerRight?: React.ReactNode;
  contentClassName?: string;
  children: React.ReactNode;
}

export function DetailSection({ label, headerRight, contentClassName = "px-4 py-4", children }: DetailSectionProps) {
  return (
    <div className="rounded-xl border border-border bg-background overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <SectionHeading label={label} />
        {headerRight}
      </div>
      <div className={contentClassName}>{children}</div>
    </div>
  );
}

// ── Left sidebar shell ────────────────────────────────────────────────────────

interface TemplateSidebarShellProps {
  header?: React.ReactNode;
  newLabel: string;
  onNew: () => void;
  onCategories: () => void;
  isEmpty: boolean;
  emptyIcon: React.ReactNode;
  emptyText: string;
  children: React.ReactNode;
}

export function TemplateSidebarShell({
  header,
  newLabel,
  onNew,
  onCategories,
  isEmpty,
  emptyIcon,
  emptyText,
  children,
}: TemplateSidebarShellProps) {
  return (
    <div className="w-64 border-r border-border flex flex-col shrink-0 bg-muted/20">
      {header}
      <div className="px-3 py-3 border-b border-border space-y-2">
        <Button className="w-full" onClick={onNew}>
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          {newLabel}
        </Button>
        <Button className="w-full" variant="outline" onClick={onCategories}>
          <Tag className="w-3.5 h-3.5 mr-1.5" />
          Template Categories
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {isEmpty && (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            {emptyIcon}
            <p className="text-xs text-muted-foreground">{emptyText}</p>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

// ── Right panel empty state ───────────────────────────────────────────────────

interface TemplateEmptyStateProps {
  icon: React.ReactNode;
  label?: string;
  hint?: string;
}

export function TemplateEmptyState({
  icon,
  label = "No item selected",
  hint = "Pick an item from the list or create a new one.",
}: TemplateEmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-8">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">{icon}</div>
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
      </div>
    </div>
  );
}

// ── Right panel detail header ─────────────────────────────────────────────────

interface TemplateDetailHeaderProps {
  name: string;
  subtitle: string;
  itemId: string;
  confirmDeleteId: string | null;
  onEdit: () => void;
  onDelete: () => void;
  onRequestDelete: (id: string) => void;
  onCancelDelete: () => void;
}

export function TemplateDetailHeader({
  name,
  subtitle,
  itemId,
  confirmDeleteId,
  onEdit,
  onDelete,
  onRequestDelete,
  onCancelDelete,
}: TemplateDetailHeaderProps) {
  return (
    <div className="px-6 py-4 border-b border-border bg-background flex items-center justify-between shrink-0">
      <div>
        <h2 className="text-base font-semibold text-foreground">{name}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={onEdit}>
          <Pencil className="w-3.5 h-3.5 mr-1.5" />
          Edit
        </Button>
        {confirmDeleteId === itemId ? (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-destructive font-medium">Delete?</span>
            <Button variant="destructive" size="sm" className="h-7 text-xs px-2.5" onClick={onDelete}>Yes</Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs px-2" onClick={onCancelDelete}>No</Button>
          </div>
        ) : (
          <button
            onClick={() => onRequestDelete(itemId)}
            className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Modal shell with optional confirm-save footer ─────────────────────────────

interface TemplateModalShellProps {
  open: boolean;
  title: string;
  saveLabel: string;
  confirmSave?: boolean;
  itemLabel?: string;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  onConfirmSave?: () => void;
  onCancelConfirm?: () => void;
  children: React.ReactNode;
}

export function TemplateModalShell({
  open,
  title,
  saveLabel,
  confirmSave,
  itemLabel = "item",
  onOpenChange,
  onSave,
  onConfirmSave,
  onCancelConfirm,
  children,
}: TemplateModalShellProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col overflow-hidden p-0">
        <DialogHeader className="px-6 py-4 border-b border-border shrink-0">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        <div className="shrink-0 border-t border-border bg-background">
          {confirmSave ? (
            <div className="px-6 py-4 flex items-center justify-between gap-3 bg-amber-50">
              <div>
                <p className="text-sm font-medium text-amber-900">Save changes?</p>
                <p className="text-xs text-amber-700 mt-0.5">This will overwrite the existing {itemLabel}.</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button size="sm" onClick={onConfirmSave}>Confirm Save</Button>
                <Button size="sm" variant="ghost" onClick={onCancelConfirm}>Go back</Button>
              </div>
            </div>
          ) : (
            <div className="px-6 py-4 flex items-center gap-2">
              <Button onClick={onSave}>{saveLabel}</Button>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
