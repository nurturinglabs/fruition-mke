"use client";

import { useEffect, useState, useCallback } from "react";
import { CallLog } from "@/types/call";
import { NavBar } from "@/components/landing/NavBar";
import { StatsRow } from "@/components/StatsRow";
import { FilterBar } from "@/components/FilterBar";
import { CallCard } from "@/components/CallCard";

export default function DashboardPage() {
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [filteredCalls, setFilteredCalls] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [intentFilter, setIntentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchCalls = useCallback(async () => {
    try {
      const res = await fetch("/api/calls");
      const data = await res.json();
      setCalls(Array.isArray(data) ? data : []);
    } catch {
      console.error("Failed to fetch calls");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCalls();
  }, [fetchCalls]);

  useEffect(() => {
    let result = calls;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.caller_name?.toLowerCase().includes(q) ||
          c.caller_phone?.toLowerCase().includes(q)
      );
    }
    if (intentFilter) {
      result = result.filter((c) => c.intent === intentFilter);
    }
    if (statusFilter) {
      result = result.filter((c) => c.status === statusFilter);
    }
    setFilteredCalls(result);
  }, [calls, search, intentFilter, statusFilter]);

  const handleMarkReviewed = async (id: string) => {
    await fetch(`/api/calls/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "reviewed" }),
    });
    setCalls((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "reviewed" } : c))
    );
  };

  const newCallCount = calls.filter((c) => c.status === "new").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1117] flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1117]">
      <NavBar />
      <header className="px-4 md:px-8 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-white">
              Call Inbox
            </h1>
          </div>
          {newCallCount > 0 && (
            <span className="px-3 py-1 bg-amber-400 text-nearblack text-sm font-semibold rounded-full">
              {newCallCount} new call{newCallCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-6">
        <StatsRow calls={calls} />

        <FilterBar
          search={search}
          onSearchChange={setSearch}
          intentFilter={intentFilter}
          onIntentChange={setIntentFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />

        {filteredCalls.length === 0 ? (
          <div className="bg-[#1A1D27] rounded-xl p-12 text-center border border-white/10">
            <p className="text-gray-400">
              {calls.length === 0
                ? "No calls yet. When Zara takes her first call, it will appear here."
                : "No calls match your filters."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredCalls.map((call) => (
              <CallCard
                key={call.id}
                call={call}
                onMarkReviewed={handleMarkReviewed}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
