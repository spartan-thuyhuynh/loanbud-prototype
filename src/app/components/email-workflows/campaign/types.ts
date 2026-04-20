import type { Contact } from "@/app/types";

export type CampaignStatus = "draft" | "scheduled" | "sent" | "auto";

export interface ComposeSubmitParams {
  recipients: Contact[];
  subject: string;
  body: string;
  senderIdentity: string;
  segmentId: string;
  segmentName: string;
  templateId: string;
  templateName: string;
  campaignName: string;
  followUp: {
    taskType: string;
    dueDate: Date;
    objective: string;
    vmScript: string;
  };
}

export interface FollowUpTask {
  daysAfter: number;
  taskType: string;
  description: string;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  segmentId: string;
  segmentName: string;
  templateId: string;
  templateName: string;
  status: CampaignStatus;
  scheduledFor?: Date;
  sentAt?: Date;
  recipientCount: number;
  openRate?: number;
  followUpTasks: FollowUpTask[];
}

export interface CampaignDetailContact {
  id: string;
  name: string;
  email: string;
  status: string;
  listingName: string;
  engagement: "opened" | "clicked" | "delivered" | "no-response";
  stillInSegment: boolean;
  driftReason?: string;
  lastUpdated: Date;
}

export interface CampaignMetrics {
  id: string;
  name: string;
  segmentName: string;
  sentAt: Date;
  recipientCount: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  noResponseCount: number;
}

export type BulkActionType =
  | "create-tasks"
  | "move-segment"
  | "remove-segment"
  | "exclude";

export interface FilterRule {
  field: "listingStatus" | "userType";
  operator: "=" | "!=";
  value: string;
  /** connector linking this filter to the next one */
  logic: "and" | "or";
}

export interface FilterGroup {
  id: string;
  filters: FilterRule[];
  /** connector linking this group to the next group */
  connectorAfter: "and" | "or";
}

export interface SavedSegment {
  id: string;
  name: string;
  description: string;
  filters: FilterRule[];
  createdAt: Date;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  senderType: "brand" | "agent";
  category: string;
  createdAt: Date;
}
