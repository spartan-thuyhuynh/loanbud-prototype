import { useState } from "react";
import { UserMinus, Users, ListChecks } from "lucide-react";
import { toast } from "sonner";
import type { CampaignDetailContact, CampaignMetrics, BulkActionType } from "./campaign/types";
import { CampaignMetricsHeader } from "./campaign/campaign-detail/CampaignMetricsHeader";
import { InsightFilterCards } from "./campaign/campaign-detail/InsightFilterCards";
import { ContactFilterBar } from "./campaign/campaign-detail/ContactFilterBar";
import { BulkActionsBar } from "./campaign/campaign-detail/BulkActionsBar";
import { CampaignContactTable } from "./campaign/campaign-detail/CampaignContactTable";
import { BulkActionModal } from "./campaign/campaign-detail/BulkActionModal";
import { TaskQueue } from "./TaskQueue";
import { useAppData } from "@/app/contexts/AppDataContext";

type DetailTab = "contacts" | "tasks";

interface CampaignDetailProps {
  onBack: () => void;
}

export function CampaignDetail({ onBack }: CampaignDetailProps) {
  const { taskItems, handleRemoveContactFromCampaign } = useAppData();
  const [activeTab, setActiveTab] = useState<DetailTab>("contacts");
  const [campaign] = useState<CampaignMetrics>({
    id: "1",
    name: "New Broker Outreach - April",
    segmentName: "New Broker Listings",
    sentAt: new Date(2026, 3, 10),
    recipientCount: 45,
    deliveryRate: 97.8,
    openRate: 68.5,
    clickRate: 24.4,
    noResponseCount: 14,
  });

  const campaignTasks = taskItems.filter(
    (ti) => ti.sourceType === "campaign" && ti.source === campaign.name,
  );

  const [campaignContacts, setCampaignContacts] = useState<CampaignDetailContact[]>([
    {
      id: "1",
      name: "James Lee",
      email: "james.lee@example.com",
      status: "Submitted",
      listingName: "123 Oak Street",
      engagement: "clicked",
      stillInSegment: false,
      driftReason: 'Status changed to "Submitted"',
      lastUpdated: new Date(2026, 3, 12),
    },
    {
      id: "2",
      name: "Michael Rodriguez",
      email: "michael.r@example.com",
      status: "New",
      listingName: "456 Maple Ave",
      engagement: "opened",
      stillInSegment: true,
      lastUpdated: new Date(2026, 3, 11),
    },
    {
      id: "3",
      name: "Emily Thompson",
      email: "emily.t@example.com",
      status: "Draft",
      listingName: "789 Pine Rd",
      engagement: "no-response",
      stillInSegment: false,
      driftReason: 'Status changed to "Draft"',
      lastUpdated: new Date(2026, 3, 13),
    },
    {
      id: "4",
      name: "David Patel",
      email: "david.patel@example.com",
      status: "New",
      listingName: "321 Elm Blvd",
      engagement: "no-response",
      stillInSegment: true,
      lastUpdated: new Date(2026, 3, 10),
    },
    {
      id: "5",
      name: "Jessica Williams",
      email: "j.williams@example.com",
      status: "New",
      listingName: "654 Cedar Ln",
      engagement: "opened",
      stillInSegment: true,
      lastUpdated: new Date(2026, 3, 14),
    },
  ]);

  const [removeConfirmId, setRemoveConfirmId] = useState<string | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [filterEngagement, setFilterEngagement] = useState("all");
  const [filterSegmentMatch, setFilterSegmentMatch] = useState("all");
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<BulkActionType>("create-tasks");

  const filteredContacts = campaignContacts.filter((contact) => {
    const matchesEngagement =
      filterEngagement === "all" || contact.engagement === filterEngagement;
    const matchesSegment =
      filterSegmentMatch === "all" ||
      (filterSegmentMatch === "still-match" && contact.stillInSegment) ||
      (filterSegmentMatch === "no-longer-match" && !contact.stillInSegment);
    return matchesEngagement && matchesSegment;
  });

  const driftedContacts = campaignContacts.filter((c) => !c.stillInSegment);
  const noResponseContacts = campaignContacts.filter((c) => c.engagement === "no-response");
  const engagedButNoAction = campaignContacts.filter(
    (c) =>
      (c.engagement === "opened" || c.engagement === "clicked") &&
      c.stillInSegment,
  );

  const handleSelectContact = (id: string) => {
    setSelectedContacts((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredContacts.map((c) => c.id));
    }
  };

  const confirmRemoveContact = (id: string) => setRemoveConfirmId(id);

  const executeRemoveContact = () => {
    if (!removeConfirmId) return;
    const contact = campaignContacts.find((c) => c.id === removeConfirmId);
    setCampaignContacts((prev) => prev.filter((c) => c.id !== removeConfirmId));
    setSelectedContacts((prev) => prev.filter((id) => id !== removeConfirmId));
    handleRemoveContactFromCampaign(removeConfirmId, campaign.name);
    setRemoveConfirmId(null);
    toast.success(`${contact?.name ?? "Contact"} removed from campaign. Scheduled tasks cancelled.`);
  };

  const openBulkAction = (type: BulkActionType) => {
    setBulkActionType(type);
    setShowBulkModal(true);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <CampaignMetricsHeader
        campaign={campaign}
        driftedCount={driftedContacts.length}
        onBack={onBack}
      />

      {/* Tab bar */}
      <div className="flex gap-0 border-b border-border px-8 bg-card">
        <button
          onClick={() => setActiveTab("contacts")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "contacts"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="w-4 h-4" />
          Contacts
          <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-muted rounded-full">
            {campaignContacts.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("tasks")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "tasks"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <ListChecks className="w-4 h-4" />
          Tasks
          <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-muted rounded-full">
            {campaignTasks.filter((t) => t.status === "pending").length}
          </span>
        </button>
      </div>

      {activeTab === "contacts" && (
        <>
          <InsightFilterCards
            driftedCount={driftedContacts.length}
            noResponseCount={noResponseContacts.length}
            engagedNoActionCount={engagedButNoAction.length}
            onFilterDrifted={() => {
              setFilterSegmentMatch("no-longer-match");
              setFilterEngagement("all");
            }}
            onFilterNoResponse={() => {
              setFilterEngagement("no-response");
              setFilterSegmentMatch("all");
            }}
            onFilterEngaged={() => {
              setFilterEngagement("opened");
              setFilterSegmentMatch("still-match");
            }}
          />

          <ContactFilterBar
            filterEngagement={filterEngagement}
            filterSegmentMatch={filterSegmentMatch}
            filteredCount={filteredContacts.length}
            totalCount={campaignContacts.length}
            onChangeEngagement={setFilterEngagement}
            onChangeSegmentMatch={setFilterSegmentMatch}
            onClear={() => {
              setFilterEngagement("all");
              setFilterSegmentMatch("all");
            }}
          />

          {selectedContacts.length > 0 && (
            <BulkActionsBar
              selectedCount={selectedContacts.length}
              onCreateTasks={() => openBulkAction("create-tasks")}
              onMoveSegment={() => openBulkAction("move-segment")}
              onRemoveSegment={() => openBulkAction("remove-segment")}
              onExclude={() => openBulkAction("exclude")}
            />
          )}

          <CampaignContactTable
            contacts={filteredContacts}
            selectedContacts={selectedContacts}
            onSelectAll={handleSelectAll}
            onSelectContact={handleSelectContact}
            onRemoveContact={confirmRemoveContact}
          />
        </>
      )}

      {activeTab === "tasks" && (
        <div className="flex-1 overflow-hidden">
          <TaskQueue tasks={campaignTasks} />
        </div>
      )}

      <BulkActionModal
        isOpen={showBulkModal}
        actionType={bulkActionType}
        selectedCount={selectedContacts.length}
        segmentName={campaign.segmentName}
        onConfirm={() => {
          setShowBulkModal(false);
          setSelectedContacts([]);
        }}
        onClose={() => setShowBulkModal(false)}
      />

      {removeConfirmId && (() => {
        const contact = campaignContacts.find((c) => c.id === removeConfirmId);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-card rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-red-100 rounded-full">
                  <UserMinus className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-base font-semibold">Remove from Campaign</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-1">
                Remove <span className="font-medium text-foreground">{contact?.name}</span> from this campaign?
              </p>
              <p className="text-xs text-muted-foreground mb-5">
                All pending scheduled tasks for this contact in this campaign will be cancelled.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setRemoveConfirmId(null)}
                  className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={executeRemoveContact}
                  className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  Remove & Cancel Tasks
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
