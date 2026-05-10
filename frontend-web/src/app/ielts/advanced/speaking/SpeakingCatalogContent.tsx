"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2, Mic, MessageSquareText } from "lucide-react";
import { useSpeakingParts } from "@/hooks/useIeltsAdvancedSpeaking";

const PART_OPTIONS = [
  { label: "All", value: undefined as number | undefined },
  { label: "Part 1", value: 1 },
  { label: "Part 2", value: 2 },
  { label: "Part 3", value: 3 },
];

export default function SpeakingCatalogContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [page, setPage] = useState(1);
  const [partNumber, setPartNumber] = useState<number | undefined>(
    searchParams.get("speakingPart") ? parseInt(searchParams.get("speakingPart") || "", 10) : undefined,
  );
  const [category, setCategory] = useState<string>(searchParams.get("speakingCategory") || "");
  const [topic, setTopic] = useState<string>(searchParams.get("speakingTopic") || "");
  const limit = 12;

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (partNumber) params.set("speakingPart", String(partNumber));
    else params.delete("speakingPart");
    if (category) params.set("speakingCategory", category);
    else params.delete("speakingCategory");
    if (topic) params.set("speakingTopic", topic);
    else params.delete("speakingTopic");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [partNumber, category, topic, pathname, router, searchParams]);

  const { data, isLoading, isError } = useSpeakingParts({
    partNumber,
    category: category || undefined,
    topic: topic || undefined,
    page,
    limit,
  });

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl w-fit shrink-0">
          {PART_OPTIONS.map((opt) => {
            const active = partNumber === opt.value || (!partNumber && !opt.value);
            return (
              <button
                key={opt.label}
                onClick={() => {
                  setPartNumber(opt.value);
                  setPage(1);
                }}
                className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${active ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-gray-500 dark:text-slate-400 hover:text-gray-700"}`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-bold"
          >
            <option value="">All categories</option>
            <option value="cambridge-academic">Cambridge Academic</option>
            <option value="forecast-academic">Forecast Academic</option>
            <option value="official-guide-to-ielts-academic">Official Guide Academic</option>
            <option value="practice-test-plus-academic">Practice Test Plus Academic</option>
            <option value="recent-actual-tests-academic">Recent Actual Tests Academic</option>
          </select>
          <input
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value);
              setPage(1);
            }}
            placeholder="Search topic..."
            className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-bold min-w-[200px]"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center min-h-[320px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="p-8 text-center bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30 font-bold text-red-500">
          Failed to load speaking parts.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {data?.data.map((part) => {
              const badgeColor =
                part.partNumber === 1
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                  : part.partNumber === 2
                    ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                    : "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400";

              return (
                <button
                  key={part.id}
                  onClick={() => router.push(`/ielts/advanced/speaking/${part.id}`)}
                  className="text-left group bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 hover:shadow-xl hover:border-primary/50 transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${badgeColor}`}>
                      Part {part.partNumber} · {part.partType.replace("_", " ")}
                    </span>
                    {part.bestScore ? (
                      <span className="text-green-600 dark:text-green-400 text-sm font-black">
                        {part.bestScore.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs font-bold">Not attempted</span>
                    )}
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2 mb-2">
                    {part.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mb-4 line-clamp-2">{part.topic}</p>
                  <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-slate-400 border-t border-gray-100 dark:border-slate-800 pt-4">
                    <span className="inline-flex items-center gap-1.5">
                      <MessageSquareText className="w-3.5 h-3.5" />
                      {part.questions?.length || 0} questions
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Mic className="w-3.5 h-3.5" />
                      {part.source.replace("_", " ")}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {data && data.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-bold disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm font-bold text-gray-600 dark:text-slate-400 px-4">
                Page {page} of {data.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-bold disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
