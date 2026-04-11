"use client";

import { BookingWithRoom, getRoomCategory, ROOM_COLORS } from "@/types/booking";
import { RoomFilter } from "./RoomFilterTabs";

interface Props {
  weekStart: Date;
  bookings: BookingWithRoom[];
  roomFilter: RoomFilter;
  onBookingClick: (b: BookingWithRoom) => void;
}

const START_HOUR = 8;
const END_HOUR = 20;
const HOUR_PX = 64;
const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

function fmtDayLabel(d: Date): { weekday: string; date: string } {
  return {
    weekday: d.toLocaleDateString("en-US", { weekday: "short" }),
    date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  };
}

function toIsoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function timeToHours(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h + (m || 0) / 60;
}

function hourLabel(h: number): string {
  if (h === 12) return "12 PM";
  if (h === 0) return "12 AM";
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

export function WeekCalendar({ weekStart, bookings, roomFilter, onBookingClick }: Props) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const filtered = bookings.filter(b => {
    if (roomFilter === "all") return true;
    return getRoomCategory(b.room_id) === roomFilter;
  });

  const today = toIsoDate(new Date());
  const gridHeight = (END_HOUR - START_HOUR) * HOUR_PX;

  return (
    <div className="bg-[#1A1D27] rounded-xl border border-white/10 overflow-x-auto">
      <div className="min-w-[900px] flex">
        {/* Hour gutter */}
        <div className="w-[72px] flex-shrink-0 pt-[49px]">
          {HOURS.slice(0, -1).map(h => (
            <div
              key={h}
              className="text-[11px] text-gray-500 text-right pr-3"
              style={{ height: `${HOUR_PX}px` }}
            >
              {hourLabel(h)}
            </div>
          ))}
        </div>

        {/* Day columns */}
        <div className="flex-1 grid grid-cols-7">
          {days.map(d => {
            const isoDate = toIsoDate(d);
            const isToday = isoDate === today;
            const { weekday, date } = fmtDayLabel(d);
            const dayBookings = filtered.filter(b => b.date === isoDate);

            return (
              <div
                key={isoDate}
                className={`border-l border-white/5 flex flex-col ${isToday ? "bg-terracotta/5" : ""}`}
              >
                {/* Column header */}
                <div
                  className={`h-[49px] border-b border-white/10 text-center py-2 ${
                    isToday ? "bg-terracotta/10" : ""
                  }`}
                >
                  <div className="text-xs uppercase tracking-wider text-gray-500">{weekday}</div>
                  <div className={`text-sm ${isToday ? "text-amber-400 font-semibold" : "text-white"}`}>
                    {date}
                  </div>
                </div>

                {/* Hour grid + bookings */}
                <div className="relative" style={{ height: `${gridHeight}px` }}>
                  {HOURS.slice(0, -1).map(h => (
                    <div
                      key={h}
                      className="border-b border-white/5"
                      style={{ height: `${HOUR_PX}px` }}
                    />
                  ))}

                  {dayBookings.map(b => {
                    const startH = timeToHours(b.start_time);
                    const endH = timeToHours(b.end_time);
                    if (endH <= START_HOUR || startH >= END_HOUR) return null;

                    const clippedStart = Math.max(startH, START_HOUR);
                    const clippedEnd = Math.min(endH, END_HOUR);
                    const top = (clippedStart - START_HOUR) * HOUR_PX;
                    const height = (clippedEnd - clippedStart) * HOUR_PX - 4;
                    const colors = ROOM_COLORS[getRoomCategory(b.room_id)];

                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => onBookingClick(b)}
                        className="absolute left-1 right-1 rounded-md px-2 py-1 text-left text-[11px] leading-tight overflow-hidden hover:brightness-110 transition-all border"
                        style={{
                          top: `${top + 2}px`,
                          height: `${height}px`,
                          backgroundColor: colors.bg,
                          color: colors.text,
                          borderColor: colors.border,
                        }}
                        title={`${b.booker_name} — ${b.event_type || ""}`}
                      >
                        <div className="font-semibold truncate">{b.booker_name}</div>
                        <div className="opacity-90 truncate">{b.event_type}</div>
                        <div className="opacity-75">
                          {b.start_time.slice(0, 5)}–{b.end_time.slice(0, 5)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
