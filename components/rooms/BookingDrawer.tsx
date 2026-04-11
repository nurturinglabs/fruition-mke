"use client";

import { BookingWithRoom } from "@/types/booking";

interface Props {
  booking: BookingWithRoom | null;
  onClose: () => void;
}

export function BookingDrawer({ booking, onClose }: Props) {
  if (!booking) return null;

  const fmtTime = (t: string) => t.slice(0, 5);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-[#1A1D27] border-l border-white/10 z-50 overflow-y-auto">
        <div className="p-6 space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-gray-500">
                {booking.room?.name || booking.room_id}
              </div>
              <h2 className="font-heading text-2xl text-white mt-1">
                {booking.event_type || "Booking"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="space-y-3 text-sm">
            <Row label="Booker" value={booking.booker_name} />
            <Row label="Phone" value={booking.booker_phone} />
            <Row label="Date" value={booking.date} />
            <Row
              label="Time"
              value={`${fmtTime(booking.start_time)} – ${fmtTime(booking.end_time)}`}
            />
            <Row label="Headcount" value={String(booking.headcount)} />
            <Row label="Special Requirements" value={booking.special_requirements} />
            <Row label="Source" value={booking.source} />
            <Row label="Status" value={booking.status} />
            {booking.notes && <Row label="Notes" value={booking.notes} />}
          </div>
        </div>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-gray-500">{label}</div>
      <div className="text-white mt-0.5">{value || "—"}</div>
    </div>
  );
}
