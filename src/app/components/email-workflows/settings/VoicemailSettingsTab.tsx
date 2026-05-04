import { useState } from "react";
import { toast } from "sonner";
import { useAppData } from "../../../contexts/AppDataContext";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Switch } from "../../ui/switch";
import { Button } from "../../ui/button";

export function VoicemailSettingsTab() {
  const { voicemailSettings, handleUpdateVoicemailSettings } = useAppData();

  const [form, setForm] = useState({ ...voicemailSettings });

  const handleSave = () => {
    handleUpdateVoicemailSettings(form);
    toast.success("Voicemail settings saved.");
  };

  return (
    <div className="p-6 max-w-xl space-y-6">
      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-foreground">Voicemail Settings</h2>
        <p className="text-xs text-muted-foreground">Configure your voicemail drop provider and defaults.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="providerName">Provider Name</Label>
          <Input
            id="providerName"
            value={form.providerName}
            placeholder="e.g. Slybroadcast"
            onChange={(e) => setForm((f) => ({ ...f, providerName: e.target.value }))}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="fromPhone">From Phone Number</Label>
          <Input
            id="fromPhone"
            value={form.fromPhoneNumber}
            placeholder="+15105551234"
            onChange={(e) => setForm((f) => ({ ...f, fromPhoneNumber: e.target.value }))}
          />
          <p className="text-xs text-muted-foreground">Use E.164 format (e.g. +15105551234)</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="defaultGreeting">Default Greeting</Label>
          <Input
            id="defaultGreeting"
            value={form.defaultGreeting}
            placeholder="Hi, you have a message from LoanBud."
            onChange={(e) => setForm((f) => ({ ...f, defaultGreeting: e.target.value }))}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border p-3.5">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">Ringless Voicemail</p>
            <p className="text-xs text-muted-foreground">Drop voicemails without the phone ringing.</p>
          </div>
          <Switch
            checked={form.ringlessEnabled}
            onCheckedChange={(checked) => setForm((f) => ({ ...f, ringlessEnabled: checked }))}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border p-3.5">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">Call Recording</p>
            <p className="text-xs text-muted-foreground">Record calls made through this system.</p>
          </div>
          <Switch
            checked={form.recordingEnabled}
            onCheckedChange={(checked) => setForm((f) => ({ ...f, recordingEnabled: checked }))}
          />
        </div>
      </div>

      <Button onClick={handleSave} size="sm">Save Settings</Button>
    </div>
  );
}
