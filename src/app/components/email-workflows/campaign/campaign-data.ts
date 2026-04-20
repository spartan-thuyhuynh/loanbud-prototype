import type { EmailTemplate } from "./types";

export const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-fuchsia-500",
  "bg-orange-500",
];

export function getAvatarColor(firstName: string, lastName: string): string {
  const code = (firstName.charCodeAt(0) || 0) + (lastName.charCodeAt(0) || 0);
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export const CAMPAIGN_STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-500",
  scheduled: "bg-blue-500",
  sent: "bg-green-500",
  auto: "bg-purple-500",
};

export const CAMPAIGN_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  sent: "Sent",
  auto: "Auto",
};

export const templateCategories = [
  "Initial Outreach",
  "Follow-up",
  "Nurture",
  "Re-engagement",
  "Custom",
];

export const sampleTemplates: Omit<EmailTemplate, "id" | "createdAt">[] = [
  {
    name: "New Listing Claim",
    subject: "Claim Your Listing - Fast Approval Available",
    body: `Hi {{first_name}},

I noticed your listing for {{listing_name}} and wanted to reach out personally.

We specialize in fast approvals and competitive rates. I'd love to discuss how we can help you move forward quickly.

Can we schedule a quick call this week?

Best regards,
The LoanBud Team`,
    senderType: "brand",
    category: "Initial Outreach",
  },
  {
    name: "Day 3 Follow-up",
    subject: "Quick follow-up on {{listing_name}}",
    body: `Hi {{first_name}},

I wanted to follow up on my previous message about {{listing_name}}.

Have you had a chance to consider our offer? I'm here to answer any questions you might have.

Looking forward to hearing from you.

Best,
LoanBud Team`,
    senderType: "brand",
    category: "Follow-up",
  },
  {
    name: "Agent Personal Touch",
    subject: "Personal assistance with your loan application",
    body: `Hi {{first_name}},

This is [Agent Name] from LoanBud. I've been assigned to personally assist with {{listing_name}}.

I've helped hundreds of clients secure funding, and I'd love to do the same for you. My direct line is [Phone Number].

When's a good time to connect?

Best regards,
[Agent Name]`,
    senderType: "agent",
    category: "Initial Outreach",
  },
];
