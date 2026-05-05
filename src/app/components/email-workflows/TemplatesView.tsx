import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { EmailTemplatesTab } from "./settings/EmailTemplatesTab";
import { SmsTemplatesTab } from "./settings/SmsTemplatesTab";
import { VoicemailScriptsTab } from "./settings/VoicemailScriptsTab";
import { VoicemailSettingsTab } from "./settings/VoicemailSettingsTab";
import { SenderIdentitiesTab } from "./settings/SenderIdentitiesTab";

export function TemplatesView() {
  return (
    <div className="flex flex-col h-full bg-background">
      <div className="border-b border-border bg-card px-8 py-5 shrink-0">
        <h1 className="text-3xl font-semibold text-foreground">Configuration</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage templates and system configuration for email workflows.</p>
      </div>

      <Tabs defaultValue="email-templates" className="flex flex-col flex-1 min-h-0">
        <TabsList className="shrink-0 justify-start rounded-none border-b border-border bg-transparent px-8 h-10 gap-0">
          <TabsTrigger
            value="email-templates"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 h-full text-sm"
          >
            Email Templates
          </TabsTrigger>
          <TabsTrigger
            value="sms-templates"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 h-full text-sm"
          >
            SMS Templates
          </TabsTrigger>
          <TabsTrigger
            value="voicemail-scripts"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 h-full text-sm"
          >
            Voicemail Records
          </TabsTrigger>
          <TabsTrigger
            value="voicemail-settings"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 h-full text-sm"
          >
            Voicemail Settings
          </TabsTrigger>
          <TabsTrigger
            value="sender-identities"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 h-full text-sm"
          >
            Sender Identities
          </TabsTrigger>
        </TabsList>

        <TabsContent value="email-templates" className="flex-1 min-h-0 mt-0 overflow-hidden">
          <EmailTemplatesTab />
        </TabsContent>
        <TabsContent value="sms-templates" className="flex-1 min-h-0 mt-0 overflow-hidden">
          <SmsTemplatesTab />
        </TabsContent>
        <TabsContent value="voicemail-scripts" className="flex-1 min-h-0 mt-0 overflow-hidden">
          <VoicemailScriptsTab />
        </TabsContent>
        <TabsContent value="voicemail-settings" className="flex-1 min-h-0 mt-0 overflow-y-auto">
          <VoicemailSettingsTab />
        </TabsContent>
        <TabsContent value="sender-identities" className="flex-1 min-h-0 mt-0 overflow-y-auto">
          <SenderIdentitiesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
