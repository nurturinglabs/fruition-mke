"use client";

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  intentFilter: string;
  onIntentChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
}

export function FilterBar({
  search,
  onSearchChange,
  intentFilter,
  onIntentChange,
  statusFilter,
  onStatusChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <input
        placeholder="Search by name or phone..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="sm:max-w-xs px-3 py-2 rounded-lg border border-white/10 bg-[#1A1D27] text-sm text-white placeholder:text-gray-500 focus:border-terracotta focus:outline-none"
      />
      <select
        value={intentFilter}
        onChange={(e) => onIntentChange(e.target.value)}
        className="px-3 py-2 rounded-lg border border-white/10 bg-[#1A1D27] text-sm text-gray-300"
      >
        <option value="">All Intents</option>
        <option value="coworking_inquiry">Coworking</option>
        <option value="event_space_booking">Event Booking</option>
        <option value="makerspace_inquiry">Makerspace</option>
        <option value="cafe_inquiry">Cafe</option>
        <option value="general_inquiry">General</option>
      </select>
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        className="px-3 py-2 rounded-lg border border-white/10 bg-[#1A1D27] text-sm text-gray-300"
      >
        <option value="">All Statuses</option>
        <option value="new">New</option>
        <option value="reviewed">Reviewed</option>
        <option value="followed_up">Followed Up</option>
        <option value="closed">Closed</option>
      </select>
    </div>
  );
}
