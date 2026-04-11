"use client";

import { useEffect, useState, useCallback } from "react";
import { NavBar } from "@/components/landing/NavBar";
import { WeekCalendar } from "@/components/rooms/WeekCalendar";
import { RoomFilterTabs, RoomFilter } from "@/components/rooms/RoomFilterTabs";
import { BookingDrawer } from "@/components/rooms/BookingDrawer";
import { BookingWithRoom } from "@/types/booking";

function startOfWeek(d: Date): Date {
  const copy = new Date(d);
  const day = copy.getDay(); // 0 Sun .. 6 Sat
  const diff = day === 0 ? -6 : 1 - day; // make Monday the first day
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function toIsoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatRange(start: Date): string {
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const sameMonth = start.getMonth() === end.getMonth();
  const startStr = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endStr = end.toLocaleDateString("en-US", {
    month: sameMonth ? undefined : "short",
    day: "numeric",
    year: "numeric",
  });
  return `${startStr} – ${endStr}`;
}

export default function RoomsPage() {
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()));
  const [bookings, setBookings] = useState<BookingWithRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<RoomFilter>("all");
  const [selected, setSelected] = useState<BookingWithRoom | null>(null);

  const fetchBookings = useCallback(async (ws: Date) => {
    setLoading(true);
    const from = toIsoDate(ws);
    const toDate = new Date(ws);
    toDate.setDate(toDate.getDate() + 6);
    const to = toIsoDate(toDate);
    try {
      const res = await fetch(`/api/bookings?from=${from}&to=${to}`);
      const data = await res.json();
      setBookings(Array.isArray(data.bookings) ? data.bookings : []);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings(weekStart);
  }, [weekStart, fetchBookings]);

  const shiftWeek = (delta: number) => {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + delta * 7);
    setWeekStart(next);
  };

  const todayIso = toIsoDate(new Date());
  const todaysBookings = bookings
    .filter(b => b.date === todayIso)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  return (
    <div className="min-h-screen bg-[#0F1117]">
      <NavBar />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="font-heading text-2xl font-bold text-white">Room Availability</h1>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => shiftWeek(-1)}
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-white bg-[#1A1D27] border border-white/10 rounded-md"
            >
              ← Prev
            </button>
            <div className="text-white text-sm font-medium min-w-[180px] text-center">
              {formatRange(weekStart)}
            </div>
            <button
              type="button"
              onClick={() => shiftWeek(1)}
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-white bg-[#1A1D27] border border-white/10 rounded-md"
            >
              Next →
            </button>
            <button
              type="button"
              onClick={() => setWeekStart(startOfWeek(new Date()))}
              className="px-3 py-1.5 text-sm text-amber-400 hover:text-amber-300 border border-amber-400/30 rounded-md"
            >
              Today
            </button>
          </div>
        </div>

        <RoomFilterTabs value={filter} onChange={setFilter} />

        {loading ? (
          <div className="bg-[#1A1D27] rounded-xl p-12 text-center border border-white/10 text-gray-400">
            Loading bookings…
          </div>
        ) : (
          <WeekCalendar
            weekStart={weekStart}
            bookings={bookings}
            roomFilter={filter}
            onBookingClick={setSelected}
          />
        )}

        {/* Today's bookings list */}
        <div className="bg-[#1A1D27] rounded-xl border border-white/10 p-5">
          <h2 className="font-heading text-lg text-white mb-3">Today&apos;s bookings</h2>
          {todaysBookings.length === 0 ? (
            <p className="text-gray-500 text-sm">No bookings today.</p>
          ) : (
            <ul className="divide-y divide-white/5">
              {todaysBookings.map(b => (
                <li
                  key={b.id}
                  className="py-3 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/5 px-2 rounded"
                  onClick={() => setSelected(b)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">
                      {b.booker_name}{b.event_type ? ` — ${b.event_type}` : ""}
                    </div>
                    <div className="text-xs text-gray-500">
                      {b.room?.name || b.room_id} · {b.headcount} people
                    </div>
                  </div>
                  <div className="text-sm text-gray-300 whitespace-nowrap">
                    {b.start_time.slice(0, 5)}–{b.end_time.slice(0, 5)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      <BookingDrawer booking={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
