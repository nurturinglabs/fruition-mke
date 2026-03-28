import { CallLog } from "@/types/call";

interface StatsRowProps {
  calls: CallLog[];
}

export function StatsRow({ calls }: StatsRowProps) {
  const totalCalls = calls.length;
  const newCalls = calls.filter((c) => c.status === "new").length;
  const eventBookings = calls.filter(
    (c) => c.intent === "event_space_booking"
  ).length;
  const urgentCalls = calls.filter((c) => c.urgency === "urgent").length;

  const stats = [
    { label: "Total Calls", value: totalCalls, color: "text-white" },
    { label: "New", value: newCalls, color: "text-amber-400" },
    { label: "Event Bookings", value: eventBookings, color: "text-terracotta" },
    { label: "Urgent", value: urgentCalls, color: "text-red-400" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-[#1A1D27] rounded-xl p-6 border border-white/10 text-center"
        >
          <p className={`text-5xl md:text-6xl font-heading font-bold ${stat.color}`}>
            {stat.value}
          </p>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-2">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}
