import type { AttributionNode } from "../types";

/**
 * V2 (RFC-009): Attribution Source Hierarchy — the "lead source pyramid".
 *
 * Channel (L1) > Platform (L2) > Campaign (L3) > Ad Set (L4) > Creative (L5).
 * L1/L2 (and the two BizBuySell L3 leaves) mirror the Phase-1 seed taxonomy;
 * the Meta Ads subtree below them is a Phase-2 preview: nodes auto-created
 * from live UTM data (`isAutoCreated`), showing how campaigns/ad sets/creatives
 * appear in the tree by themselves the first time a lead arrives from them.
 *
 * Static reference data (no localStorage) — in the real system this is the
 * `attribution_nodes` table, editable as data without code changes.
 */
export const ATTRIBUTION_NODES: AttributionNode[] = [
  // ---- L1 channels (curated) ----
  { id: "paid-search", parentId: null, level: 1, kind: "channel", name: "Paid Search" },
  { id: "paid-social", parentId: null, level: 1, kind: "channel", name: "Paid Social" },
  { id: "organic-search", parentId: null, level: 1, kind: "channel", name: "Organic Search" },
  { id: "organic-social", parentId: null, level: 1, kind: "channel", name: "Organic Social" },
  { id: "email", parentId: null, level: 1, kind: "channel", name: "Email" },
  { id: "partnership", parentId: null, level: 1, kind: "channel", name: "Partnership" },
  { id: "website", parentId: null, level: 1, kind: "channel", name: "Website" },
  { id: "direct-manual", parentId: null, level: 1, kind: "channel", name: "Direct / Manual" },
  { id: "events", parentId: null, level: 1, kind: "channel", name: "Events" },

  // ---- L2 platforms (curated) ----
  { id: "google-ads", parentId: "paid-search", level: 2, kind: "platform", name: "Google Ads" },
  { id: "bing-ads", parentId: "paid-search", level: 2, kind: "platform", name: "Bing Ads" },
  { id: "meta-ads", parentId: "paid-social", level: 2, kind: "platform", name: "Meta Ads" },
  { id: "tiktok-ads", parentId: "paid-social", level: 2, kind: "platform", name: "TikTok Ads" },
  { id: "linkedin-ads", parentId: "paid-social", level: 2, kind: "platform", name: "LinkedIn Ads" },
  { id: "sendgrid-campaigns", parentId: "email", level: 2, kind: "platform", name: "SendGrid campaigns" },
  { id: "bizbuysell", parentId: "partnership", level: 2, kind: "platform", name: "BizBuySell" },
  { id: "transworld", parentId: "partnership", level: 2, kind: "platform", name: "Transworld Business Advisors" },
  { id: "loanbud-io", parentId: "website", level: 2, kind: "platform", name: "loanbud.io" },
  { id: "apply-lumba", parentId: "website", level: 2, kind: "platform", name: "apply.lumba.com" },
  { id: "wordpress-site", parentId: "website", level: 2, kind: "platform", name: "WordPress site" },
  { id: "crm-manual-entry", parentId: "direct-manual", level: 2, kind: "platform", name: "CRM manual entry" },
  { id: "cold-call", parentId: "direct-manual", level: 2, kind: "platform", name: "Cold call" },

  // ---- L3 BizBuySell sub-designations (curated — the meeting's checkbox-vs-API split) ----
  { id: "bbs-api-leads", parentId: "bizbuysell", level: 3, kind: "campaign", name: "API leads" },
  { id: "bbs-checkbox-leads", parentId: "bizbuysell", level: 3, kind: "campaign", name: "Checkbox leads" },

  // ---- Phase-2 preview: Meta Ads subtree auto-created from UTM data ----
  { id: "meta-black-friday", parentId: "meta-ads", level: 3, kind: "campaign", name: "black_friday_2026", isAutoCreated: true },
  { id: "meta-abandoned-app", parentId: "meta-ads", level: 3, kind: "campaign", name: "abandoned_application_nurture", isAutoCreated: true },
  { id: "meta-bf-bizowners", parentId: "meta-black-friday", level: 4, kind: "ad_set", name: "biz_owners_25_54_us", isAutoCreated: true },
  { id: "meta-bf-retargeting", parentId: "meta-black-friday", level: 4, kind: "ad_set", name: "retargeting_site_visitors", isAutoCreated: true },
  { id: "meta-bf-bo-video", parentId: "meta-bf-bizowners", level: 5, kind: "creative", name: "video_testimonial_v2", isAutoCreated: true },
  { id: "meta-bf-bo-carousel", parentId: "meta-bf-bizowners", level: 5, kind: "creative", name: "carousel_rates_july", isAutoCreated: true },
  { id: "meta-aa-dropoffs", parentId: "meta-abandoned-app", level: 4, kind: "ad_set", name: "appform_dropoffs_7d", isAutoCreated: true },
  { id: "meta-aa-comeback", parentId: "meta-aa-dropoffs", level: 5, kind: "creative", name: "sms_comeback_offer", isAutoCreated: true },
];

const NODE_BY_ID = new Map(ATTRIBUTION_NODES.map((n) => [n.id, n]));

const CHILDREN_BY_PARENT = new Map<string | null, AttributionNode[]>();
for (const node of ATTRIBUTION_NODES) {
  const siblings = CHILDREN_BY_PARENT.get(node.parentId) ?? [];
  siblings.push(node);
  CHILDREN_BY_PARENT.set(node.parentId, siblings);
}

export function attributionNodeById(id: string): AttributionNode | undefined {
  return NODE_BY_ID.get(id);
}

export function attributionChildren(parentId: string | null): AttributionNode[] {
  return CHILDREN_BY_PARENT.get(parentId) ?? [];
}

/**
 * Self-inclusive descendant expansion — the core of hierarchical filtering.
 * Selecting "Partnership" returns Partnership + BizBuySell + both its leaves + Transworld,
 * so a parent selection matches every contact classified anywhere under that branch.
 * (Real system: one indexed path-prefix query on attribution_nodes.)
 */
export function attributionDescendantIds(selectedIds: string[]): Set<string> {
  const result = new Set<string>();
  const queue = [...selectedIds];
  while (queue.length > 0) {
    const id = queue.pop()!;
    if (result.has(id)) continue;
    result.add(id);
    for (const child of attributionChildren(id)) queue.push(child.id);
  }
  return result;
}

/** Ancestor chain (root first, self last) for a node id. */
export function attributionPathNodes(id: string): AttributionNode[] {
  const path: AttributionNode[] = [];
  let current = NODE_BY_ID.get(id);
  while (current) {
    path.unshift(current);
    current = current.parentId ? NODE_BY_ID.get(current.parentId) : undefined;
  }
  return path;
}

/** Human-readable classification path, e.g. "Partnership > BizBuySell > API leads". */
export function attributionPathLabel(id: string, separator = " > "): string {
  const path = attributionPathNodes(id);
  return path.length > 0 ? path.map((n) => n.name).join(separator) : "N/A";
}
