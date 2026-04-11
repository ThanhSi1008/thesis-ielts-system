"use client";

import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useState } from "react";
import { Trash2 } from "lucide-react";

export default function IeltsBasicPreparationPage() {
  const router = useRouter();
  const [resetting, setResetting] = useState(false);

  const handleResetProgress = async () => {
    if (!window.confirm("DEV: Are you sure you want to completely wipe all your IELTS Basic progress?")) return;
    setResetting(true);
    try {
      await api.post("/ielts/progress/reset");
      alert("Progress successfully reset!");
      // Optionally trigger the sidebar update if it were loaded, but since it's only loaded on the roadmap route, it will just cleanly fetch it fresh when you start!
    } catch (err) {
      console.error(err);
      alert("Failed to reset progress");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-6 w-full h-full p-4">
      <button
        onClick={() => router.push("/ielts/basic/roadmap")}
        className="bg-[#FFC107] text-gray-900 text-sm font-bold py-2.5 px-8 rounded-lg hover:bg-[#FFB300] transition-colors shadow-sm"
      >
        Start Roadmap
      </button>

      {/* DEV Tool */}
      <div className="mt-12 p-6 border-2 border-red-100 bg-red-50/50 rounded-xl max-w-sm">
        <h3 className="text-red-800 font-bold mb-1 text-sm uppercase tracking-wider">Developer Tools</h3>
        <p className="text-gray-500 text-[13px] mb-4">
          Wipe all progress tracking records to test the initial locked state of the roadmap step sequences from scratch.
        </p>
        <button
          onClick={handleResetProgress}
          disabled={resetting}
          className="flex items-center gap-2 text-sm font-bold text-red-600 bg-white border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
          {resetting ? "Resetting..." : "Reset All Progress"}
        </button>
      </div>
    </div>
  );
}
