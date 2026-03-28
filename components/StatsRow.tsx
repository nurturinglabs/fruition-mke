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
    { label: "Total Calls", value: totalCalls },
    { label: "New / Unreviewed", value: newCalls },
    { label: "Event Bookings", value: eventBookings },
    { label: "Urgent", value: urgentCalls },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-[#1A1D27] rounded-xl p-5 border border-white/10"
        >
          <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
          <p className="text-3xl font-heading font-bold text-white mt-1">
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
