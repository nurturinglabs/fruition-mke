import { CallStatus } from "@/types/call";

const statusConfig: Record<CallStatus, { label: string; className: string }> = {
  new: {
    label: "New",
    className: "bg-amber-400/15 text-amber-400 border-amber-400/20",
  },
  reviewed: {
    label: "Reviewed",
    className: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  },
  followed_up: {
    label: "Followed Up",
    className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  },
  closed: {
    label: "Closed",
    className: "bg-white/5 text-gray-400 border-white/10",
  },
};

export function StatusBadge({ status }: { status: CallStatus }) {
  const config = statusConfig[status] || statusConfig.new;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  );
}
