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

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-3 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <h1 className="font-heading text-xl font-bold text-white">Room Availability</h1>
            <RoomFilterTabs value={filter} onChange={setFilter} />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => shiftWeek(-1)}
              className="px-2.5 py-1 text-xs text-gray-400 hover:text-white bg-[#1A1D27] border border-white/10 rounded-md"
            >
              ← Prev
            </button>
            <div className="text-white text-xs font-medium min-w-[160px] text-center">
              {formatRange(weekStart)}
            </div>
            <button
              type="button"
              onClick={() => shiftWeek(1)}
              className="px-2.5 py-1 text-xs text-gray-400 hover:text-white bg-[#1A1D27] border border-white/10 rounded-md"
            >
              Next →
            </button>
            <button
              type="button"
              onClick={() => setWeekStart(startOfWeek(new Date()))}
              className="px-2.5 py-1 text-xs text-amber-400 hover:text-amber-300 border border-amber-400/30 rounded-md"
            >
              Today
            </button>
          </div>
        </div>

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

        {/* Today's bookings — compact strip */}
        {todaysBookings.length > 0 && (
          <div className="bg-[#1A1D27] rounded-lg border border-white/10 px-4 py-2.5">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">Today</span>
              {todaysBookings.map(b => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelected(b)}
                  className="text-xs text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-full whitespace-nowrap"
                >
                  <span className="text-gray-400">{b.start_time.slice(0, 5)}</span>{" "}
                  <span className="font-medium">{b.booker_name}</span>
                  <span className="text-gray-500"> · {b.room?.name || b.room_id}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      <BookingDrawer booking={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
