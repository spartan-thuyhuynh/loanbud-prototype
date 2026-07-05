import type { ChannelOptOut } from "@/app/types";

/** Human-readable label for how a channel opt-out was triggered. */
export function optOutSourceLabel(source: ChannelOptOut["source"]): string {
  if (source === "sms-stop") return "Replied STOP";
  if (source === "email-unsubscribe") return "Unsubscribed from email group";
  return "Set manually by loan officer";
}
