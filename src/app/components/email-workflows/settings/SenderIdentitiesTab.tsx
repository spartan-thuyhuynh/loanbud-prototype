import { useState } from "react";
import { Star, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { SenderIdentity, SenderIdentityType } from "../../../types";
import { useAppData } from "../../../contexts/AppDataContext";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { TemplateFormDialog } from "./TemplateFormDialog";

const emptyForm = { displayName: "", emailAddress: "", type: "brand" as SenderIdentityType, isDefault: false };

export function SenderIdentitiesTab() {
  const { senderIdentities, handleCreateSenderIdentity, handleUpdateSenderIdentity, handleDeleteSenderIdentity, handleSetDefaultSenderIdentity } = useAppData();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SenderIdentity | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (identity: SenderIdentity) => {
    setEditing(identity);
    setForm({ displayName: identity.displayName, emailAddress: identity.emailAddress, type: identity.type, isDefault: identity.isDefault });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.displayName.trim() || !form.emailAddress.trim()) {
      toast.error("Display name and email are required.");
      return;
    }
    if (editing) {
      handleUpdateSenderIdentity(editing.id, form);
      toast.success("Sender identity updated.");
    } else {
      handleCreateSenderIdentity(form);
      toast.success("Sender identity created.");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    handleDeleteSenderIdentity(id);
    setConfirmDeleteId(null);
    toast.success("Sender identity deleted.");
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h2 className="text-sm font-semibold text-foreground">Sender Identities</h2>
          <p className="text-xs text-muted-foreground">Manage email addresses used to send emails from workflows.</p>
        </div>
        <Button size="sm" onClick={openCreate}>Add Identity</Button>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-muted-foreground text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-2.5 text-left font-medium">Name</th>
              <th className="px-4 py-2.5 text-left font-medium">Email</th>
              <th className="px-4 py-2.5 text-left font-medium">Type</th>
              <th className="px-4 py-2.5 text-left font-medium">Default</th>
              <th className="px-4 py-2.5 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {senderIdentities.map((identity) => (
              <tr key={identity.id} className="bg-background hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{identity.displayName}</td>
                <td className="px-4 py-3 text-muted-foreground">{identity.emailAddress}</td>
                <td className="px-4 py-3">
                  <Badge
                    variant="secondary"
                    className={identity.type === "brand" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}
                  >
                    {identity.type === "brand" ? "Brand" : "Loan Officer"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleSetDefaultSenderIdentity(identity.id)}
                    className={`p-1 rounded transition-colors ${identity.isDefault ? "text-amber-500" : "text-muted-foreground/40 hover:text-amber-400"}`}
                    title={identity.isDefault ? "Default identity" : "Set as default"}
                  >
                    <Star className={`w-4 h-4 ${identity.isDefault ? "fill-amber-500" : ""}`} />
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {confirmDeleteId === identity.id ? (
                      <>
                        <span className="text-xs text-destructive mr-1">Delete?</span>
                        <Button variant="destructive" size="sm" className="h-7 text-xs px-2" onClick={() => handleDelete(identity.id)}>Yes</Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs px-2" onClick={() => setConfirmDeleteId(null)}>No</Button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => openEdit(identity)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setConfirmDeleteId(identity.id)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {senderIdentities.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm">No sender identities yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <TemplateFormDialog
        title={editing ? "Edit Sender Identity" : "Add Sender Identity"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
      >
        <div className="space-y-1.5">
          <Label>Display Name</Label>
          <Input
            value={form.displayName}
            placeholder="e.g. LoanBud Team"
            onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Email Address</Label>
          <Input
            type="email"
            value={form.emailAddress}
            placeholder="e.g. team@loanbud.com"
            onChange={(e) => setForm((f) => ({ ...f, emailAddress: e.target.value }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Type</Label>
          <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as SenderIdentityType }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="brand">Brand</SelectItem>
              <SelectItem value="loan-officer">Loan Officer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </TemplateFormDialog>
    </div>
  );
}
