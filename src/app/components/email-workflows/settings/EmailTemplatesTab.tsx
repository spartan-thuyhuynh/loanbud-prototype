import { useNavigate } from "react-router";
import { Plus } from "lucide-react";
import type { TeamRole } from "../../../config/team";
import { useAppData } from "../../../contexts/AppDataContext";
import { Button } from "../../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { EmailTemplateTable } from "./EmailTemplateTable";

export function EmailTemplatesTab() {
  const { currentUserRole, handleSetCurrentUserRole } = useAppData();
  const navigate = useNavigate();
  const isAdmin = currentUserRole !== "loan_officer";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border shrink-0">
        {isAdmin ? (
          <Button size="sm" onClick={() => navigate("/email-workflows/templates/new")}>
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            New Template
          </Button>
        ) : (
          <div />
        )}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">View as</span>
          <Select value={currentUserRole} onValueChange={(v) => handleSetCurrentUserRole(v as TeamRole)}>
            <SelectTrigger className="h-7 w-40 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
              <SelectItem value="loan_officer">Loan Officer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        <EmailTemplateTable />
      </div>
    </div>
  );
}
