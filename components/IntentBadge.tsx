import { CallIntent } from "@/types/call";

const intentConfig: Record<CallIntent, { label: string; className: string }> = {
  coworking_inquiry: {
    label: "Coworking",
    className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  },
  event_space_booking: {
    label: "Event Booking",
    className: "bg-terracotta/15 text-terracotta border-terracotta/20",
  },
  makerspace_inquiry: {
    label: "Makerspace",
    className: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  },
  cafe_inquiry: {
    label: "Cafe",
    className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  },
  general_inquiry: {
    label: "General",
    className: "bg-white/5 text-gray-400 border-white/10",
  },
};

export function IntentBadge({ intent }: { intent: CallIntent }) {
  const config = intentConfig[intent] || intentConfig.general_inquiry;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  );
}
