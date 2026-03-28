"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { CallLog, CallStatus } from "@/types/call";
import { NavBar } from "@/components/landing/NavBar";
import { IntentBadge } from "@/components/IntentBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDistanceToNow, format } from "date-fns";
import Link from "next/link";

export default function CallDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [call, setCall] = useState<CallLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchCall() {
      const res = await fetch(`/api/calls/${id}`);
      if (!res.ok) {
        router.push("/dashboard");
        return;
      }
      const data = await res.json();
      setCall(data);
      setNotes(data.notes || "");
      setLoading(false);
    }
    fetchCall();
  }, [id, router]);

  const updateStatus = async (status: CallStatus) => {
    setSaving(true);
    const res = await fetch(`/api/calls/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setCall(updated);
    }
    setSaving(false);
  };

  const saveNotes = async () => {
    setSaving(true);
    const res = await fetch(`/api/calls/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    if (res.ok) {
      const updated = await res.json();
      setCall(updated);
    }
    setSaving(false);
  };

  const copyContact = () => {
    if (!call) return;
    const text = `${call.caller_name || "Unknown"} - ${call.caller_phone || "No phone"}`;
    navigator.clipboard.writeText(text);
  };

  if (loading || !call) {
    return (
      <div className="min-h-screen bg-[#0F1117] flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  const duration = call.call_duration_seconds
    ? `${Math.floor(call.call_duration_seconds / 60)}m ${call.call_duration_seconds % 60}s`
    : null;

  return (
    <div className="min-h-screen bg-[#0F1117]">
      <NavBar />
      <div className="px-4 md:px-8 py-5">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-gray-400 hover:text-terracotta transition-colors"
          >
            &larr; Back to Inbox
          </Link>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-6 space-y-6">
        {/* Caller info card */}
        <div className="bg-[#1A1D27] rounded-xl p-6 border border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    call.urgency === "urgent" ? "bg-amber-400" : "bg-gray-600"
                  }`}
                />
                <h2 className="text-2xl font-heading font-bold text-white">
                  {call.caller_name || "Unknown Caller"}
                </h2>
              </div>
              <p className="text-gray-400 text-lg">
                {call.caller_phone || "No phone number"}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {format(new Date(call.created_at), "PPpp")} (
                {formatDistanceToNow(new Date(call.created_at), {
                  addSuffix: true,
                })}
                )
              </p>
            </div>
            <div className="flex items-center gap-3">
              <IntentBadge intent={call.intent} />
              <StatusBadge status={call.status} />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={copyContact}
              className="px-4 py-2 text-sm border border-white/10 rounded-lg text-gray-300 hover:bg-white/5 transition-colors"
            >
              Copy Contact Info
            </button>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#1A1D27] rounded-xl p-6 border border-white/10 space-y-4">
            <h3 className="font-heading font-bold text-lg text-white">
              Call Info
            </h3>
            <DetailRow label="Callback Preference" value={call.callback_preference} />
            <DetailRow label="Urgency" value={call.urgency} />
            {duration && <DetailRow label="Duration" value={duration} />}
            {call.retell_call_id && (
              <DetailRow label="Retell Call ID" value={call.retell_call_id} />
            )}
          </div>

          {call.intent === "event_space_booking" && (
            <div className="bg-[#1A1D27] rounded-xl p-6 border border-white/10 space-y-4">
              <h3 className="font-heading font-bold text-lg text-white">
                Event Details
              </h3>
              <DetailRow label="Event Type" value={call.event_type} />
              <DetailRow label="Preferred Date" value={call.event_date} />
              <DetailRow label="Headcount" value={call.event_headcount} />
              <DetailRow label="Special Requirements" value={call.special_requirements} />
            </div>
          )}

          {call.intent === "coworking_inquiry" && (
            <div className="bg-[#1A1D27] rounded-xl p-6 border border-white/10 space-y-4">
              <h3 className="font-heading font-bold text-lg text-white">
                Coworking Details
              </h3>
              <DetailRow label="Type" value={call.coworking_type} />
            </div>
          )}
        </div>

        {/* Recording */}
        {call.recording_url && (
          <div className="bg-[#1A1D27] rounded-xl p-6 border border-white/10">
            <h3 className="font-heading font-bold text-lg text-white mb-3">
              Recording
            </h3>
            <audio controls className="w-full">
              <source src={call.recording_url} />
            </audio>
          </div>
        )}

        {/* Notes */}
        <div className="bg-[#1A1D27] rounded-xl p-6 border border-white/10">
          <h3 className="font-heading font-bold text-lg text-white mb-3">
            Notes
          </h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add your notes here..."
            className="w-full p-3 border border-white/10 rounded-lg text-sm resize-y min-h-[100px] bg-[#0F1117] text-gray-300 placeholder:text-gray-600 focus:border-terracotta focus:outline-none"
          />
          <button
            onClick={saveNotes}
            disabled={saving}
            className="mt-3 px-4 py-2 bg-terracotta text-white rounded-lg text-sm font-medium hover:bg-terracotta/90 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Notes"}
          </button>
        </div>

        {/* Status update */}
        <div className="bg-[#1A1D27] rounded-xl p-6 border border-white/10">
          <h3 className="font-heading font-bold text-lg text-white mb-3">
            Update Status
          </h3>
          <div className="flex flex-wrap gap-2">
            {(["new", "reviewed", "followed_up", "closed"] as CallStatus[]).map(
              (status) => (
                <button
                  key={status}
                  onClick={() => updateStatus(status)}
                  disabled={saving || call.status === status}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    call.status === status
                      ? "bg-terracotta text-white"
                      : "border border-white/10 text-gray-300 hover:bg-white/5"
                  } disabled:opacity-50`}
                >
                  {status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </button>
              )
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-gray-200">{value || "—"}</p>
    </div>
  );
}
