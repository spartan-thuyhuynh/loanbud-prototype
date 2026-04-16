import { useState } from "react";
import type { CampaignDetailContact, CampaignMetrics, BulkActionType } from "./campaign/types";
import { CampaignMetricsHeader } from "./campaign/campaign-detail/CampaignMetricsHeader";
import { InsightFilterCards } from "./campaign/campaign-detail/InsightFilterCards";
import { ContactFilterBar } from "./campaign/campaign-detail/ContactFilterBar";
import { BulkActionsBar } from "./campaign/campaign-detail/BulkActionsBar";
import { CampaignContactTable } from "./campaign/campaign-detail/CampaignContactTable";
import { BulkActionModal } from "./campaign/campaign-detail/BulkActionModal";

interface CampaignDetailProps {
  onBack: () => void;
}

export function CampaignDetail({ onBack }: CampaignDetailProps) {
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

  const [contacts] = useState<CampaignDetailContact[]>([
    {
      id: "1",
      name: "James Lee",
      email: "james.lee@example.com",
      status: "Submitted",
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
      engagement: "opened",
      stillInSegment: true,
      lastUpdated: new Date(2026, 3, 11),
    },
    {
      id: "3",
      name: "Emily Thompson",
      email: "emily.t@example.com",
      status: "Draft",
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
      engagement: "no-response",
      stillInSegment: true,
      lastUpdated: new Date(2026, 3, 10),
    },
    {
      id: "5",
      name: "Jessica Williams",
      email: "j.williams@example.com",
      status: "New",
      engagement: "opened",
      stillInSegment: true,
      lastUpdated: new Date(2026, 3, 14),
    },
  ]);

  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [filterEngagement, setFilterEngagement] = useState("all");
  const [filterSegmentMatch, setFilterSegmentMatch] = useState("all");
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<BulkActionType>("create-tasks");

  const filteredContacts = contacts.filter((contact) => {
    const matchesEngagement =
      filterEngagement === "all" || contact.engagement === filterEngagement;
    const matchesSegment =
      filterSegmentMatch === "all" ||
      (filterSegmentMatch === "still-match" && contact.stillInSegment) ||
      (filterSegmentMatch === "no-longer-match" && !contact.stillInSegment);
    return matchesEngagement && matchesSegment;
  });

  const driftedContacts = contacts.filter((c) => !c.stillInSegment);
  const noResponseContacts = contacts.filter((c) => c.engagement === "no-response");
  const engagedButNoAction = contacts.filter(
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
        totalCount={contacts.length}
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
      />

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
    </div>
  );
}
