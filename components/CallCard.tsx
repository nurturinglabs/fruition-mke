"use client";

import { CallLog } from "@/types/call";
import { IntentBadge } from "./IntentBadge";
import { StatusBadge } from "./StatusBadge";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface CallCardProps {
  call: CallLog;
  onMarkReviewed?: (id: string) => void;
}

export function CallCard({ call, onMarkReviewed }: CallCardProps) {
  const timeAgo = formatDistanceToNow(new Date(call.created_at), {
    addSuffix: true,
  });

  return (
    <Link href={`/dashboard/${call.id}`}>
      <div className="bg-[#1A1D27] rounded-xl p-5 border border-white/10 hover:border-white/20 transition-colors cursor-pointer">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div
              className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                call.urgency === "urgent" ? "bg-amber-400" : "bg-gray-600"
              }`}
            />
            <div>
              <p className="font-semibold text-white">
                {call.caller_name || "Unknown Caller"}
              </p>
              <p className="text-sm text-gray-400">
                {call.caller_phone || "No phone"}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <StatusBadge status={call.status} />
            <span className="text-xs text-gray-500">{timeAgo}</span>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <IntentBadge intent={call.intent} />
          {call.callback_preference && (
            <span className="text-xs text-gray-500">
              Callback: {call.callback_preference}
            </span>
          )}
        </div>

        {call.status === "new" && onMarkReviewed && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onMarkReviewed(call.id);
            }}
            className="mt-3 text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors"
          >
            Mark as Reviewed
          </button>
        )}
      </div>
    </Link>
  );
}
