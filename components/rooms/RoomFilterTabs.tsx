"use client";

export type RoomFilter = "all" | "main-hall" | "meeting-room" | "focus-room";

interface Props {
  value: RoomFilter;
  onChange: (val: RoomFilter) => void;
}

const TABS: { id: RoomFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "main-hall", label: "Main Hall" },
  { id: "meeting-room", label: "Meeting Rooms" },
  { id: "focus-room", label: "Focus Rooms" },
];

export function RoomFilterTabs({ value, onChange }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      {TABS.map(tab => {
        const active = value === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`px-4 py-1.5 rounded-full text-sm transition-colors border ${
              active
                ? "bg-terracotta text-white border-terracotta"
                : "bg-[#1A1D27] text-gray-400 border-white/10 hover:text-white hover:border-white/30"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
