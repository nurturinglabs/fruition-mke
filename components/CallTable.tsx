"use client";

import { CallLog } from "@/types/call";
import { IntentBadge } from "./IntentBadge";
import { StatusBadge } from "./StatusBadge";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

interface CallTableProps {
  calls: CallLog[];
  onMarkReviewed?: (id: string) => void;
}

export function CallTable({ calls, onMarkReviewed }: CallTableProps) {
  const router = useRouter();

  return (
    <div className="bg-[#1A1D27] rounded-xl border border-white/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-4 py-3 text-[10px] text-gray-500 uppercase tracking-widest font-medium"></th>
              <th className="text-left px-4 py-3 text-[10px] text-gray-500 uppercase tracking-widest font-medium">Caller</th>
              <th className="text-left px-4 py-3 text-[10px] text-gray-500 uppercase tracking-widest font-medium">Phone</th>
              <th className="text-left px-4 py-3 text-[10px] text-gray-500 uppercase tracking-widest font-medium">Intent</th>
              <th className="text-left px-4 py-3 text-[10px] text-gray-500 uppercase tracking-widest font-medium">Callback</th>
              <th className="text-left px-4 py-3 text-[10px] text-gray-500 uppercase tracking-widest font-medium">Status</th>
              <th className="text-left px-4 py-3 text-[10px] text-gray-500 uppercase tracking-widest font-medium">Time</th>
              <th className="text-left px-4 py-3 text-[10px] text-gray-500 uppercase tracking-widest font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {calls.map((call) => {
              const timeAgo = formatDistanceToNow(new Date(call.created_at), {
                addSuffix: true,
              });
              return (
                <tr
                  key={call.id}
                  onClick={() => router.push(`/dashboard/${call.id}`)}
                  className="border-b border-white/5 hover:bg-white/[0.03] cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        call.urgency === "urgent" ? "bg-amber-400" : "bg-gray-600"
                      }`}
                    />
                  </td>
                  <td className="px-4 py-3 text-white font-medium">
                    {call.caller_name || "Unknown"}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {call.caller_phone || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <IntentBadge intent={call.intent} />
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {call.callback_preference || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={call.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {timeAgo}
                  </td>
                  <td className="px-4 py-3">
                    {call.status === "new" && onMarkReviewed && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkReviewed(call.id);
                        }}
                        className="text-xs text-amber-400 hover:text-amber-300 font-medium whitespace-nowrap"
                      >
                        Mark Reviewed
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
