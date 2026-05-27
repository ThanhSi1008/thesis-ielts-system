"use client";

import React, { useState, useEffect, useRef } from "react";
import { z } from "zod";
import { ieltsImportApi } from "@/services/admin.api";
import { toast } from "@/components/Toaster";

// ─── Whitelisted IELTS Question Types ───
const WHITELISTED_TYPES = [
  "multiple_choice",
  "multiple_choice_multiple",
  "short_answer",
  "form_completion",
  "note_completion",
  "sentence_completion",
  "summary_completion",
  "matching",
  "matching_features",
  "matching_information",
  "matching_headings",
  "table_completion",
  "true_false_not_given",
  "yes_no_not_given",
  "fill_blank"
];

// ─── Question-type taxonomy helpers ───
const CHOICE_TYPES = new Set([
  "multiple_choice", "multiple_choice_multiple",
  "matching", "matching_features", "matching_information", "matching_headings",
]);

const TOGGLE_TYPES: Record<string, string[]> = {
  "true_false_not_given": ["TRUE", "FALSE", "NOT GIVEN"],
  "yes_no_not_given":     ["YES",  "NO",  "NOT GIVEN"],
};

// ─── Explanation parsing helper ───
function parseExplanation(exp: string = "") {
  const cleanExp = exp || "";
  const hasTags = /Locating:|Justification:|Distractor/i.test(cleanExp);
  if (!hasTags && cleanExp) {
    return { locating: "", justification: cleanExp, distractor: "" };
  }
  const locatingMatch = cleanExp.match(/Locating:\s*([\s\S]*?)(?=Justification:|Distractor\s*Analysis:|$)/i);
  const justificationMatch = cleanExp.match(/Justification:\s*([\s\S]*?)(?=Distractor\s*Analysis:|Locating:|$)/i);
  const distractorMatch = cleanExp.match(/Distractor\s*Analysis:\s*([\s\S]*?)(?=Locating:|Justification:|$)/i);

  return {
    locating: locatingMatch ? locatingMatch[1].trim() : "",
    justification: justificationMatch ? justificationMatch[1].trim() : "",
    distractor: distractorMatch ? distractorMatch[1].trim() : ""
  };
}

// ─── Zod Schema for Client-Side Validation ───
const questionSchema = z.object({
  question_number: z.number().nullish(),
  question_numbers: z.array(z.number()).nullish(),
  type: z.string().refine(t => WHITELISTED_TYPES.includes(t.toLowerCase().trim()), {
    message: "Question type must be a whitelisted IELTS type."
  }),
  question_text: z.string().min(1, "Question text is required."),
  answer: z.string().nullish(),
  correct_answer: z.string().nullish(),
  correct_answers: z.array(z.string()).nullish(),
  options: z.array(z.string()).nullish(),
  question_timestamp: z.string().nullish()
});

const partSchema = z.object({
  audio_part_index: z.number().int().min(1).max(4).nullish(),
  partNumber: z.number().nullish(),
  title: z.string().nullish(),
  passage: z.string().nullish(),
  transcript: z.array(z.any()).nullish(),
  content: z.array(questionSchema).nullish(),
  questionTypes: z.array(z.string()).nullish()
});

const structuredJsonSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().nullish(),
  duration: z.number().min(1, "Duration must be at least 1 minute.").nullish(),
  passage: z.string().nullish(),
  transcript: z.array(z.any()).nullish(),
  prompt: z.string().nullish(),
  imageUrl: z.string().nullish(),
  questions: z.array(z.any()).nullish(),
  content: z.array(questionSchema).nullish(),
  parts: z.array(partSchema).nullish()
});

interface ReviewEditorModalProps {
  job: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewEditorModal({ job, onClose, onSuccess }: ReviewEditorModalProps) {
  const [activeTab, setActiveTab] = useState<"visual" | "json">("visual");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [showOverwriteConfirm, setShowOverwriteConfirm] = useState(false);
  const [apiError, setApiError] = useState<{ status: number; message: string } | null>(null);

  // Staged data
  const [structuredJson, setStructuredJson] = useState<any>({
    title: "",
    description: "",
    duration: 60,
    content: []
  });
  const [provenance, setProvenance] = useState<any>({
    source: "cambridge",
    bookNumber: 17,
    testNumber: 1
  });
  const [jsonText, setJsonText] = useState("");
  const [activeReviewPartIdx, setActiveReviewPartIdx] = useState(0);
  const isMultiPart = Array.isArray(structuredJson?.parts);
  const activePart = isMultiPart ? (structuredJson?.parts[activeReviewPartIdx] || {}) : structuredJson;

  const [transcriptText, setTranscriptText] = useState("");

  // Initialize
  useEffect(() => {
    if (job) {
      const parsedJson = job.structuredJson || { title: "", content: [] };
      setStructuredJson(parsedJson);
      setJsonText(JSON.stringify(parsedJson, null, 2));
      setProvenance(job.provenance || { source: "cambridge" });
    }
  }, [job]);

  // Sync transcript text area changes on part change
  useEffect(() => {
    if (isMultiPart && structuredJson.parts) {
      const activePartLocal = structuredJson.parts[activeReviewPartIdx] || {};
      const trans = activePartLocal.transcript || [];
      const formatted = Array.isArray(trans)
        ? trans.map((t: any) => `${t.speaker || "Speaker"}: ${t.text || ""}`).join("\n")
        : "";
      setTranscriptText(formatted);
    }
  }, [activeReviewPartIdx, structuredJson, isMultiPart]);

  // Sync JSON text area changes back to visual state
  const handleJsonChange = (val: string) => {
    setJsonText(val);
    try {
      const parsed = JSON.parse(val);
      setStructuredJson(parsed);
      setJsonError(null);
    } catch (e: any) {
      setJsonError("Invalid JSON syntax: " + e.message);
    }
  };

  // Sync visual updates to JSON string
  const updateStructuredJson = (updated: any) => {
    setStructuredJson(updated);
    setJsonText(JSON.stringify(updated, null, 2));
  };

  // Transcript handler
  const handleTranscriptChange = (val: string) => {
    setTranscriptText(val);
    const lines = val.split("\n");
    const parsedTrans = lines.map(line => {
      const colonIdx = line.indexOf(":");
      if (colonIdx > 0) {
        return {
          speaker: line.substring(0, colonIdx).trim(),
          text: line.substring(colonIdx + 1).trim()
        };
      } else {
        return {
          speaker: "Speaker",
          text: line.trim()
        };
      }
    }).filter(t => t.text !== "");

    const newParts = [...(structuredJson.parts || [])];
    newParts[activeReviewPartIdx] = {
      ...newParts[activeReviewPartIdx],
      transcript: parsedTrans
    };
    updateStructuredJson({
      ...structuredJson,
      parts: newParts
    });
  };

  // ─── Form Handlers ───
  const handleContentFieldChange = (index: number, field: string, value: any) => {
    if (isMultiPart) {
      const newParts = [...(structuredJson.parts || [])];
      const activePartLocal = { ...newParts[activeReviewPartIdx] };
      const newContent = [...(activePartLocal.content || [])];
      newContent[index] = {
        ...newContent[index],
        [field]: value
      };
      activePartLocal.content = newContent;
      newParts[activeReviewPartIdx] = activePartLocal;
      updateStructuredJson({
        ...structuredJson,
        parts: newParts
      });
    } else {
      const newContent = [...(structuredJson.content || [])];
      newContent[index] = {
        ...newContent[index],
        [field]: value
      };
      updateStructuredJson({
        ...structuredJson,
        content: newContent
      });
    }
  };

  const handleAddQuestion = () => {
    if (isMultiPart) {
      const newParts = [...(structuredJson.parts || [])];
      const activePartLocal = { ...newParts[activeReviewPartIdx] };
      const newContent = [...(activePartLocal.content || [])];
      
      let maxQNum = 0;
      structuredJson.parts.forEach((p: any) => {
        (p.content || []).forEach((q: any) => {
          if (q.question_number > maxQNum) maxQNum = q.question_number;
        });
      });

      newContent.push({
        question_number: maxQNum + 1,
        type: "sentence_completion",
        question_text: "New question text...",
        answer: ""
      });
      activePartLocal.content = newContent;
      newParts[activeReviewPartIdx] = activePartLocal;
      updateStructuredJson({
        ...structuredJson,
        parts: newParts
      });
    } else {
      const newContent = [...(structuredJson.content || [])];
      newContent.push({
        question_number: newContent.length + 1,
        type: "sentence_completion",
        question_text: "New question text...",
        answer: ""
      });
      updateStructuredJson({
        ...structuredJson,
        content: newContent
      });
    }
  };

  const handleRemoveQuestion = (index: number) => {
    if (isMultiPart) {
      const newParts = [...(structuredJson.parts || [])];
      const activePartLocal = { ...newParts[activeReviewPartIdx] };
      const newContent = (activePartLocal.content || []).filter((_: any, idx: number) => idx !== index);
      activePartLocal.content = newContent;
      newParts[activeReviewPartIdx] = activePartLocal;
      updateStructuredJson({
        ...structuredJson,
        parts: newParts
      });
    } else {
      const newContent = (structuredJson.content || []).filter((_: any, idx: number) => idx !== index);
      updateStructuredJson({
        ...structuredJson,
        content: newContent
      });
    }
  };

  // ─── Local Validations ───
  const validateClientSide = (): boolean => {
    const errors: string[] = [];
    setValidationErrors([]);

    const schemaResult = structuredJsonSchema.safeParse(structuredJson);
    if (!schemaResult.success) {
      schemaResult.error.errors.forEach(err => {
        errors.push(`${err.path.join(".")}: ${err.message}`);
      });
    }

    let allQuestions: any[] = [];
    if (isMultiPart) {
      (structuredJson.parts || []).forEach((p: any) => {
        allQuestions.push(...(p.content || []));
      });
    } else {
      allQuestions = structuredJson.content || [];
    }

    if ((job.skill === "LISTENING" || job.skill === "READING") && allQuestions.length === 0) {
      errors.push("Reading and Listening exams must have at least one question.");
    }

    allQuestions.forEach((q: any, index: number) => {
      const qNum = q.question_number || (q.question_numbers ? q.question_numbers.join(",") : `Row ${index + 1}`);
      const answer = q.correct_answer !== undefined ? q.correct_answer : q.answer !== undefined ? q.answer : q.correct_answers;

      if (answer === undefined || answer === null || String(answer).trim() === "") {
        errors.push(`[Question ${qNum}] Correct answer cannot be empty.`);
        return;
      }

      const ansStr = String(answer);

      if (q.type === "true_false_not_given" && !["TRUE", "FALSE", "NOT GIVEN"].includes(ansStr)) {
        errors.push(`[Question ${qNum}] T/F/NG answer must be exactly "TRUE", "FALSE", or "NOT GIVEN" (found: "${ansStr}").`);
        return;
      }
      if (q.type === "yes_no_not_given" && !["YES", "NO", "NOT GIVEN"].includes(ansStr)) {
        errors.push(`[Question ${qNum}] Y/N/NG answer must be exactly "YES", "NO", or "NOT GIVEN" (found: "${ansStr}").`);
        return;
      }

      if (CHOICE_TYPES.has(q.type) && (!q.options || q.options.length === 0)) {
        errors.push(`[Question ${qNum}] "${q.type}" requires an "options" array to be populated.`);
      }

      if (!CHOICE_TYPES.has(q.type) && !TOGGLE_TYPES[q.type]) {
        let parenCount = 0;
        for (let i = 0; i < ansStr.length; i++) {
          if (ansStr[i] === "(") parenCount++;
          else if (ansStr[i] === ")") {
            parenCount--;
            if (parenCount < 0) {
              errors.push(`[Question ${qNum}] Unbalanced parentheses in answer "${ansStr}".`);
              break;
            }
          }
        }
        if (parenCount !== 0) {
          errors.push(`[Question ${qNum}] Unbalanced parentheses in answer "${ansStr}".`);
        }

        if (ansStr.includes("//") || ansStr.startsWith("/") || ansStr.endsWith("/")) {
          errors.push(`[Question ${qNum}] Invalid slash formatting in answer "${ansStr}". Alternate answers must use single slash without hanging slashes (e.g. answer1/answer2).`);
        }
      }
    });

    if (errors.length > 0) {
      setValidationErrors(errors);
      toast.error("Validation failed. Please correct errors before committing.", 5000);
      return false;
    }
    return true;
  };

  // ─── Actions ───
  const handleSaveDraft = async () => {
    if (jsonError) {
      toast.error("Please resolve JSON syntax errors first.");
      return;
    }
    setIsSaving(true);
    setApiError(null);
    try {
      await ieltsImportApi.saveDraft(job.id, {
        structuredJson,
        provenance,
        version: job.version || 0
      });
      toast.success("Draft saved successfully.");
    } catch (e: any) {
      if (e.response?.status === 429 || e.response?.status === 503) {
        setApiError({ status: e.response.status, message: e.message });
      } else {
        const errMsg = e.response?.data?.message;
        const formattedMsg = Array.isArray(errMsg) ? errMsg.join(", ") : (errMsg || "Failed to save draft.");
        toast.error(formattedMsg, 6000);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCommit = async (overwrite = false) => {
    if (jsonError) {
      toast.error("Please resolve JSON syntax errors first.");
      return;
    }

    if (!validateClientSide()) return;

    setIsCommitting(true);
    setApiError(null);
    try {
      await ieltsImportApi.commitJob(job.id, {
        overwrite,
        isPublished: false
      });
      toast.success("Committed to live bank successfully!");
      onSuccess();
    } catch (e: any) {
      if (e.response?.status === 409) {
        setShowOverwriteConfirm(true);
      } else if (e.response?.status === 429 || e.response?.status === 503) {
        setApiError({ status: e.response.status, message: e.message });
      } else {
        const errMsg = e.response?.data?.message;
        const formattedMsg = Array.isArray(errMsg) ? errMsg.join(", ") : (errMsg || "Failed to commit job.");
        toast.error(formattedMsg, 6000);
      }
    } finally {
      setIsCommitting(false);
    }
  };

  const audioAssets: any[] = Array.isArray(job.mediaAssets) ? job.mediaAssets : [];
  const isListening = job.skill === "LISTENING";
  const activePartNumber = activeReviewPartIdx + 1;
  const isMultiAudio = audioAssets.length > 1;
  const activeAudioAsset = isMultiAudio
    ? (audioAssets.find((a: any) => a.partIndex === activePartNumber) ?? audioAssets[activeReviewPartIdx] ?? audioAssets[0])
    : audioAssets[0];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-gray-50 dark:bg-gray-950/95 backdrop-blur-md">
      {/* Navbar Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Back"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#001f3f] dark:text-gray-100">Review Importing Job</h2>
              <span className="text-[10px] font-bold tracking-wider uppercase bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {job.skill}
              </span>
              <span className="text-[10px] font-bold tracking-wider uppercase bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full">
                {job.targetSystem}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[400px]">Job ID: {job.id}</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("visual")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === "visual"
                ? "bg-white dark:bg-gray-955 text-gray-955 dark:text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            Visual Form
          </button>
          <button
            onClick={() => setActiveTab("json")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === "json"
                ? "bg-white dark:bg-gray-955 text-gray-955 dark:text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            Raw JSON Code
          </button>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-60"
          >
            {isSaving && <span className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />}
            Save Draft
          </button>
          <button
            onClick={() => handleCommit(false)}
            disabled={isCommitting}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-primary rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {isCommitting && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {job.status === "COMMITTED" ? "Re-commit to Live" : "Commit & Publish Draft"}
          </button>
        </div>
      </header>

      {/* Quota & Error Messaging Banner */}
      {apiError && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border-b border-amber-250 dark:border-amber-900/60 p-4 shrink-0 animate-in fade-in duration-200">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-lg shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </span>
              <div>
                <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400">
                  {apiError.status === 429 ? "Giới hạn lượt yêu cầu đã hết (Quota Drained)" : "Hệ thống AI quá tải tạm thời (Transient Overload)"}
                </h4>
                <p className="text-[11px] text-amber-700 dark:text-amber-450 mt-0.5">
                  {apiError.status === 429 
                    ? "Bạn đã sử dụng hết hạn ngạch (quota) API hoặc đang gửi quá nhiều yêu cầu cùng lúc. Vui lòng đợi một lát hoặc nâng cấp tài khoản của bạn để tiếp tục."
                    : "Máy chủ đang gặp tình trạng quá tải hoặc đang bảo trì tạm thời. Vui lòng đợi trong giây lát và thực hiện lưu nháp hoặc commit lại."
                  }
                </p>
              </div>
            </div>
            <button 
              onClick={() => setApiError(null)} 
              className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:opacity-80 px-2 py-1 border border-amber-250 dark:border-amber-800 rounded-md"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Error list validation banner */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-955/20 border-b border-red-200 dark:border-red-900/60 p-4 max-h-[160px] overflow-y-auto shrink-0">
          <div className="max-w-6xl mx-auto">
            <h4 className="text-xs font-bold text-red-700 dark:text-red-400 flex items-center gap-1.5 mb-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              Grading Engine Compatibility Violations ({validationErrors.length})
            </h4>
            <ul className="list-disc pl-5 text-xs text-red-600 dark:text-red-300 space-y-0.5">
              {validationErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Main Body */}
      <main className="flex-1 overflow-hidden flex w-full max-w-[1600px] mx-auto p-6 gap-6">
        {/* Left Column: Provenance Card */}
        <section className="w-[300px] flex flex-col gap-4 shrink-0 overflow-y-auto pr-1">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Provenance Metadata</h3>
            
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">Source Name</label>
                <input
                  type="text"
                  value={provenance.source || ""}
                  onChange={e => setProvenance({ ...provenance, source: e.target.value })}
                  placeholder="e.g. cambridge, forecast"
                  className="w-full text-xs px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {provenance.source === "cambridge" ? (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">Book Number</label>
                    <input
                      type="number"
                      value={provenance.bookNumber || ""}
                      onChange={e => setProvenance({ ...provenance, bookNumber: Number(e.target.value) })}
                      className="w-full text-xs px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">Test Number</label>
                    <input
                      type="number"
                      value={provenance.testNumber || ""}
                      onChange={e => setProvenance({ ...provenance, testNumber: Number(e.target.value) })}
                      className="w-full text-xs px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">Forecast Quarter</label>
                    <input
                      type="text"
                      value={provenance.quarter || ""}
                      onChange={e => setProvenance({ ...provenance, quarter: e.target.value })}
                      placeholder="e.g. Q1, Q2"
                      className="w-full text-xs px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">Year</label>
                    <input
                      type="number"
                      value={provenance.year || ""}
                      onChange={e => setProvenance({ ...provenance, year: Number(e.target.value) })}
                      className="w-full text-xs px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none"
                    />
                  </div>
                </>
              )}

              {job.targetSystem === "ADVANCED" && (
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">Part / Section</label>
                  <input
                    type="number"
                    value={provenance.partNumber || ""}
                    onChange={e => setProvenance({ ...provenance, partNumber: Number(e.target.value) })}
                    placeholder="1 to 4"
                    className="w-full text-xs px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm text-xs text-gray-500 dark:text-gray-400">
            <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2">Job Metrics</h4>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between"><span>Model:</span><span className="font-semibold text-gray-700 dark:text-gray-300">{job.geminiModel || "Unknown"}</span></div>
              <div className="flex justify-between"><span>Tokens Used:</span><span className="font-semibold text-gray-700 dark:text-gray-300">{job.tokensUsed || 0}</span></div>
              <div className="flex justify-between"><span>Status:</span><span className="font-semibold text-gray-700 dark:text-gray-300 uppercase">{job.status}</span></div>
              <div className="flex justify-between"><span>Callback:</span><span className="font-semibold text-gray-700 dark:text-gray-300">{job.sourceType}</span></div>
            </div>
          </div>
        </section>

        {/* Right Column: Visual or JSON Editors */}
        <section className="flex-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden flex flex-col shadow-sm">
          {activeTab === "json" ? (
            /* RAW JSON EDITOR TAB */
            <div className="flex-1 flex flex-col p-5 overflow-hidden">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold text-gray-500">Edit raw JSON directly. Structured Schema and Whitelists are validated on commit.</span>
                {jsonError ? (
                  <span className="text-xs text-red-500 font-bold">{jsonError}</span>
                ) : (
                  <span className="text-xs text-green-500 font-bold">✓ Valid JSON syntax</span>
                )}
              </div>
              <textarea
                value={jsonText}
                onChange={e => handleJsonChange(e.target.value)}
                className="flex-1 font-mono text-[11px] p-4 bg-gray-50 dark:bg-gray-955 border border-gray-200 dark:border-gray-800 rounded-2xl text-gray-800 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary overflow-y-auto leading-relaxed resize-none"
              />
            </div>
          ) : (
            /* VISUAL FORMS EDITOR TAB */
            <div className="flex-1 flex flex-col overflow-hidden">
              
              {/* IF LISTENING: Show Modern Media Management Hub */}
              {isListening && (
                <div className="p-6 pb-2 shrink-0 border-b border-gray-100 dark:border-gray-800">
                  {/* Media Assets Hub Section */}
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm shrink-0 mb-4 bg-gradient-to-r from-gray-50/50 to-white dark:from-gray-900 dark:to-gray-950">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1.5 h-3.5 bg-primary rounded-full" />
                      <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-[#001f3f] dark:text-gray-100">Media Assets Hub</h3>
                    </div>

                    <div className="grid grid-cols-12 gap-4">
                      {/* PDF Question Booklet Slot */}
                      <div className="col-span-4 bg-white dark:bg-gray-900 p-3.5 border border-gray-100 dark:border-gray-800 rounded-xl flex flex-col justify-between shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-red-50 dark:bg-red-950/20 text-red-650 rounded-xl shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                          </div>
                          <div className="overflow-hidden">
                            <h4 className="text-[11px] font-bold text-gray-800 dark:text-gray-200 truncate">PDF Question Booklet</h4>
                            <p className="text-[9px] text-gray-400 truncate mt-0.5">Cambridge IELTS Booklet.pdf</p>
                          </div>
                        </div>
                        <div className="mt-2.5 flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-green-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            Uploaded
                          </span>
                          <button className="text-[9px] font-bold text-primary hover:opacity-85">Replace</button>
                        </div>
                      </div>

                      {/* 4 Audio Tracks Slot */}
                      <div className="col-span-5 bg-white dark:bg-gray-900 p-3.5 border border-gray-100 dark:border-gray-800 rounded-xl flex flex-col justify-between shadow-sm">
                        <div>
                          <h4 className="text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-2">Audio Tracks (Part 1-4)</h4>
                          <div className="grid grid-cols-4 gap-1.5">
                            {[1, 2, 3, 4].map(partNum => {
                              const hasAudio = audioAssets.some((a: any) => (a.partIndex ?? 0) === partNum || (!a.partIndex && partNum === 1));
                              const isActive = activeReviewPartIdx + 1 === partNum;
                              return (
                                <button
                                  key={partNum}
                                  type="button"
                                  onClick={() => setActiveReviewPartIdx(partNum - 1)}
                                  className={[
                                    "py-1.5 rounded-lg text-[9px] font-bold border transition-all text-center flex flex-col items-center gap-0.5",
                                    isActive
                                      ? "bg-primary border-primary text-white shadow-sm"
                                      : hasAudio
                                        ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-250 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400"
                                        : "bg-gray-50 dark:bg-gray-850 border-gray-200 dark:border-gray-800 text-gray-400"
                                  ].join(" ")}
                                >
                                  <span>P{partNum}</span>
                                  <span className="text-[7px] font-normal uppercase select-none">
                                    {hasAudio ? "Live" : "Pend"}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Master Audio Dashboard */}
                        <div className="mt-2.5 pt-2 border-t border-gray-150 dark:border-gray-800 flex flex-col">
                          {activeAudioAsset ? (
                            <div className="flex items-center gap-2">
                              <audio
                                key={`${activeReviewPartIdx}-${activeAudioAsset.storedUrl}`}
                                src={activeAudioAsset.storedUrl}
                                controls
                                className="flex-1 h-7 text-xs focus:outline-none"
                              />
                              <span className="text-[9px] font-bold text-gray-400 shrink-0 select-all truncate max-w-[90px]">
                                Part {activeReviewPartIdx + 1}
                              </span>
                            </div>
                          ) : (
                            <div className="text-[10px] text-amber-500 italic">No audio file for Part {activeReviewPartIdx + 1}.</div>
                          )}
                        </div>
                      </div>

                      {/* Official Answer Key Image Slot */}
                      <div className="col-span-3 bg-white dark:bg-gray-900 p-3.5 border border-gray-100 dark:border-gray-800 rounded-xl flex flex-col justify-between shadow-sm">
                        <div className="flex items-start gap-2.5">
                          {structuredJson.imageUrl ? (
                            <div className="w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden shrink-0">
                              <img src={structuredJson.imageUrl} alt="Answer Key" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="p-2 bg-amber-50 dark:bg-amber-950/20 text-amber-600 rounded-xl shrink-0">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                          )}
                          <div className="overflow-hidden">
                            <h4 className="text-[11px] font-bold text-gray-800 dark:text-gray-200 truncate">Official Answer Key</h4>
                            <p className="text-[9px] text-gray-400 truncate mt-0.5">
                              {structuredJson.imageUrl ? "AnswerKeyImage.png" : "No file linked"}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2.5 flex items-center justify-between">
                          <span className={[
                            "inline-flex items-center gap-1 text-[9px] font-bold",
                            structuredJson.imageUrl ? "text-green-600" : "text-amber-500"
                          ].join(" ")}>
                            <span className={[
                              "w-1.5 h-1.5 rounded-full",
                              structuredJson.imageUrl ? "bg-green-500" : "bg-amber-500 animate-pulse"
                            ].join(" ")} />
                            {structuredJson.imageUrl ? "Uploaded" : "Pending"}
                          </span>
                          <button
                            onClick={() => {
                              const url = prompt("Enter Official Answer Key Image URL:", structuredJson.imageUrl || "");
                              if (url !== null) {
                                updateStructuredJson({ ...structuredJson, imageUrl: url });
                              }
                            }}
                            className="text-[9px] font-bold text-primary hover:opacity-85"
                          >
                            {structuredJson.imageUrl ? "Edit Link" : "Upload"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* McKinsey-style tabbed navigation for Parts 1, 2, 3, 4 */}
                  <div className="bg-gray-50 dark:bg-gray-955 p-2.5 rounded-2xl border border-gray-150 dark:border-gray-800 flex items-center gap-2">
                    <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider mr-2">IELTS Parts:</span>
                    {(structuredJson.parts || []).map((p: any, idx: number) => {
                      const isActive = idx === activeReviewPartIdx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveReviewPartIdx(idx)}
                          className={[
                            "px-4 py-1.5 text-xs font-bold rounded-xl transition-all",
                            isActive
                              ? "bg-primary text-white shadow-sm scale-102"
                              : "bg-white hover:bg-gray-150 dark:bg-gray-900 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-800"
                          ].join(" ")}
                        >
                          Part {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* IF NOT LISTENING: Keep simple layout or Passage/Tab selectors */}
              {!isListening && isMultiPart && (
                <div className="p-6 pb-2 shrink-0 border-b border-gray-100 dark:border-gray-800">
                  <div className="bg-gray-50 dark:bg-gray-955 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-2">Select Passage:</span>
                    {(structuredJson.parts || []).map((p: any, idx: number) => {
                      const isActive = idx === activeReviewPartIdx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveReviewPartIdx(idx)}
                          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                            isActive
                              ? "bg-primary text-white shadow-md scale-105"
                              : "bg-white hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-800"
                          }`}
                        >
                          Passage {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Dynamic Part-Based Workspace Container with key-forced remount */}
              <div 
                key={`part-workspace-${activeReviewPartIdx}-${isListening}`} 
                className="flex-1 overflow-hidden flex flex-col"
              >
                {isListening ? (
                  /* TWO COLUMN LISTENING WORKSPACE */
                  <div className="flex-1 flex gap-6 overflow-hidden p-6">
                    {/* LEFT COLUMN: Verbatim Transcript Area */}
                    <div className="w-5/12 flex flex-col bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-5 shadow-sm overflow-hidden">
                      <div className="flex items-center justify-between mb-3.5 shrink-0">
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                          <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">Verbatim Audio Transcript</h3>
                        </div>
                        <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/5 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Live-Sync
                        </span>
                      </div>
                      <textarea
                        value={transcriptText}
                        onChange={e => handleTranscriptChange(e.target.value)}
                        className="flex-1 text-xs font-mono p-4 bg-gray-50 dark:bg-gray-955 border border-gray-200 dark:border-gray-850 rounded-xl text-gray-800 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary overflow-y-auto leading-relaxed resize-none shadow-inner"
                        placeholder="Man: Hello. This is Cambridge IELTS 18 Part 1...&#10;Woman: Oh hi! I would like to..."
                      />
                    </div>

                    {/* RIGHT COLUMN: Question & Answer Grid */}
                    <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                      <div className="flex justify-between items-center mb-3 shrink-0">
                        <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">Question & Answer Grid</h3>
                        <button
                          type="button"
                          onClick={handleAddQuestion}
                          className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-gray-150 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-200 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-colors"
                        >
                          <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                          Add Question
                        </button>
                      </div>

                      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-5">
                        {((activePart.content || []) as any[]).flatMap((q: any, idx: number) => {
                          const ans = q.correct_answer !== undefined ? q.correct_answer : q.answer !== undefined ? q.answer : q.correct_answers;
                          const allContent: any[] = activePart.content || [];
                          const prevQ = idx > 0 ? allContent[idx - 1] : null;
                          const isGroupStart = !prevQ ||
                            prevQ.type !== q.type ||
                            JSON.stringify(prevQ.options ?? []) !== JSON.stringify(q.options ?? []);
                          let groupRangeLabel = "";
                          if (isGroupStart) {
                            let groupEndIdx = idx;
                            while (
                              groupEndIdx + 1 < allContent.length &&
                              allContent[groupEndIdx + 1].type === q.type &&
                              JSON.stringify(allContent[groupEndIdx + 1].options ?? []) === JSON.stringify(q.options ?? [])
                            ) groupEndIdx++;
                            const startNum: number = q.question_number ?? idx + 1;
                            const endNum: number = allContent[groupEndIdx].question_number ?? groupEndIdx + 1;
                            groupRangeLabel = startNum === endNum ? `Question ${startNum}` : `Questions ${startNum}–${endNum}`;
                          }
                          const isChoiceGroup = CHOICE_TYPES.has(q.type);
                          const typeLabel = (q.type as string)
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (c: string) => c.toUpperCase());

                          const nodes: React.ReactNode[] = [];
                          
                          if (isGroupStart) {
                            nodes.push(
                              <div
                                key={`gh-${idx}`}
                                className={[
                                  "flex items-center gap-3 px-4 py-2 rounded-xl border shrink-0",
                                  isChoiceGroup
                                    ? "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/60"
                                    : "bg-gray-50 dark:bg-gray-800/60 border-gray-150 dark:border-gray-800",
                                  idx > 0 ? "mt-2" : "",
                                ].join(" ")}
                              >
                                <div className={`w-2 h-2 rounded-full shrink-0 ${isChoiceGroup ? "bg-blue-500" : "bg-gray-400"}`} />
                                <span className={`text-[10px] font-extrabold uppercase tracking-wider ${
                                  isChoiceGroup ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
                                }`}>{typeLabel}</span>
                                <span className="text-[9px] font-bold text-gray-400 bg-gray-150 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                                  {groupRangeLabel}
                                </span>
                              </div>
                            );
                          }

                          const parsedExplanation = parseExplanation(q.explanation || "");

                          nodes.push(
                            <div
                              key={idx}
                              className="p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-150 dark:border-gray-800 shadow-sm relative group/card"
                            >
                              {/* Remove button */}
                              <button
                                type="button"
                                onClick={() => handleRemoveQuestion(idx)}
                                className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors opacity-0 group-hover/card:opacity-100"
                                aria-label="Remove Question"
                              >
                                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>

                              {/* Expert Meta-Bar */}
                              <div className="flex flex-wrap items-center gap-2 pb-2.5 border-b border-gray-100 dark:border-gray-850 mb-3 text-xs shrink-0 select-none">
                                {/* Type Badge */}
                                <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[9px] font-bold uppercase tracking-wider rounded">
                                  {q.type.replace(/_/g, " ")}
                                </span>

                                {/* Timestamp Box with clock icon */}
                                <div className="flex items-center gap-1.5 ml-1.5 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-0.5 bg-gray-50 dark:bg-gray-850">
                                  <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                  <input
                                    type="text"
                                    value={q.question_timestamp || ""}
                                    onChange={e => handleContentFieldChange(idx, "question_timestamp", e.target.value)}
                                    placeholder="mm:ss"
                                    className={[
                                      "w-12 text-[10px] bg-transparent text-gray-850 dark:text-gray-250 focus:outline-none font-mono text-center",
                                      !q.question_timestamp ? "text-amber-500 font-bold" : ""
                                    ].join(" ")}
                                  />
                                  {!q.question_timestamp && (
                                    <span className="text-[9px] font-bold text-amber-500 animate-pulse">⚠️</span>
                                  )}
                                </div>

                                <span className="ml-auto text-[10px] font-black text-[#001f3f] dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                                  Q{q.question_number}
                                </span>
                              </div>

                              {/* Question number and raw template input */}
                              <div className="grid grid-cols-12 gap-3 mb-3">
                                <div className="col-span-3">
                                  <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-450 mb-1">Q#</label>
                                  <input
                                    type="number"
                                    value={q.question_number || ""}
                                    onChange={e => handleContentFieldChange(idx, "question_number", Number(e.target.value))}
                                    className="w-full text-xs px-2.5 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-850 text-gray-900 dark:text-gray-100 focus:outline-none"
                                  />
                                </div>
                                <div className="col-span-9">
                                  <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-450 mb-1">Question Type</label>
                                  <select
                                    value={q.type || "sentence_completion"}
                                    onChange={e => handleContentFieldChange(idx, "type", e.target.value)}
                                    className="w-full text-xs px-2.5 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-850 text-gray-900 dark:text-gray-100 focus:outline-none"
                                  >
                                    {WHITELISTED_TYPES.map(t => (
                                      <option key={t} value={t}>{t}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              {/* Inline Gap Filler or Options Selector */}
                              {!isChoiceGroup && !TOGGLE_TYPES[q.type] ? (
                                /* Gap-filling inline builder */
                                (() => {
                                  const rawText: string = q.question_text || "";
                                  const parts = rawText.split("___");
                                  const siblings = allContent
                                    .filter((other: any) => other.question_text === rawText)
                                    .sort((a: any, b: any) => (a.question_number ?? 0) - (b.question_number ?? 0));
                                  
                                  return (
                                    <div className="mt-3">
                                      <div className="flex items-center justify-between mb-1">
                                        <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400">
                                          Sentence Preview & Inline Answer *
                                        </label>
                                        <span className="text-[8px] font-bold text-gray-450 uppercase tracking-widest bg-gray-50 dark:bg-gray-800 px-1.5 py-0.2 rounded select-none">
                                          {siblings.length > 1 ? "Multi-blank" : "Single Blank"}
                                        </span>
                                      </div>
                                      <div className="px-3.5 py-2.5 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-955 text-xs flex flex-wrap items-center gap-y-2 min-h-[38px] leading-relaxed shadow-inner">
                                        {parts.map((seg: string, segIdx: number) => {
                                          const sib = siblings[segIdx];
                                          const isOwn = sib?.question_number === q.question_number;
                                          const sibAns = sib ? (sib.correct_answer !== undefined ? sib.correct_answer : sib.answer !== undefined ? sib.answer : sib.correct_answers) : "";
                                          
                                          return (
                                            <React.Fragment key={segIdx}>
                                              {seg && (
                                                <span className="text-gray-800 dark:text-gray-200 font-medium whitespace-pre-wrap">{seg}</span>
                                              )}
                                              {segIdx < parts.length - 1 && (
                                                isOwn ? (
                                                  <input
                                                    type="text"
                                                    value={ans || ""}
                                                    onChange={e => handleContentFieldChange(idx, "answer", e.target.value)}
                                                    placeholder="answer"
                                                    className="inline-block text-xs px-2 py-0.5 mx-1 border-b-2 border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 font-bold focus:outline-none rounded text-center min-w-[70px] max-w-[150px]"
                                                  />
                                                ) : (
                                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 mx-1 align-middle select-none border border-gray-300 dark:border-gray-700 shadow-sm">
                                                    {sib ? `Q${sib.question_number}` : `___`}
                                                  </span>
                                                )
                                              )}
                                            </React.Fragment>
                                          );
                                        })}
                                      </div>
                                      <div className="mt-2">
                                        <label className="block text-[8px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Edit Sentence Text (Use '___' for blanks)</label>
                                        <input
                                          type="text"
                                          value={q.question_text || ""}
                                          onChange={e => handleContentFieldChange(idx, "question_text", e.target.value)}
                                          className="w-full text-[11px] px-2.5 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-850 text-gray-900 dark:text-gray-100 focus:outline-none"
                                        />
                                      </div>
                                    </div>
                                  );
                                })()
                              ) : (
                                /* Normal selection rendering */
                                <div className="mt-2.5">
                                  <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-450 mb-1">Question Text</label>
                                  <input
                                    type="text"
                                    value={q.question_text || ""}
                                    onChange={e => handleContentFieldChange(idx, "question_text", e.target.value)}
                                    className="w-full text-xs px-2.5 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-850 text-gray-900 dark:text-gray-100 focus:outline-none"
                                  />
                                </div>
                              )}

                              {/* Options Editor (for Multiple choice & matching) */}
                              {isChoiceGroup && (
                                <div className="mt-3">
                                  <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400">
                                      Options
                                      <span className="ml-1 text-[8px] font-normal normal-case text-gray-400">(format: "A. Option Text")</span>
                                    </label>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const opts: string[] = q.options || [];
                                        const nextKey = "ABCDEFGHIJ"[opts.length] ?? String.fromCharCode(65 + opts.length);
                                        handleContentFieldChange(idx, "options", [...opts, `${nextKey}. `]);
                                      }}
                                      className="flex items-center gap-0.5 text-[9px] font-extrabold text-primary hover:opacity-85"
                                    >
                                      + Add Option
                                    </button>
                                  </div>
                                  <div className="flex flex-col gap-1.5">
                                    {((q.options || []) as string[]).map((opt: string, optIdx: number) => (
                                      <div key={optIdx} className="flex items-center gap-1.5">
                                        <input
                                          type="text"
                                          value={opt}
                                          onChange={e => {
                                            const newOpts = [...(q.options as string[])];
                                            newOpts[optIdx] = e.target.value;
                                            handleContentFieldChange(idx, "options", newOpts);
                                          }}
                                          className="flex-1 text-xs px-2.5 py-1 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none font-mono"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => handleContentFieldChange(idx, "options", (q.options as string[]).filter((_: string, i: number) => i !== optIdx))}
                                          className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                                        >
                                          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                                        </button>
                                      </div>
                                    ))}
                                    {(!q.options || q.options.length === 0) && (
                                      <p className="text-[9px] italic text-amber-500">⚠️ Options array is empty — required for matching or choice questions.</p>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Correct Answer editing */}
                              {TOGGLE_TYPES[q.type] ? (
                                <div className="mt-3">
                                  <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Correct Answer</label>
                                  <div className="flex gap-1.5">
                                    {TOGGLE_TYPES[q.type].map(btn => (
                                      <button
                                        key={btn}
                                        type="button"
                                        onClick={() => handleContentFieldChange(idx, "answer", btn)}
                                        className={[
                                          "px-3 py-1 text-[10px] font-bold rounded border transition-all",
                                          ans === btn
                                            ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                                            : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-primary"
                                        ].join(" ")}
                                      >
                                        {btn}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ) : isChoiceGroup ? (
                                <div className="mt-3">
                                  <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Correct Answer</label>
                                  {(q.options || []).length > 0 ? (
                                    <select
                                      value={ans || ""}
                                      onChange={e => handleContentFieldChange(idx, "answer", e.target.value)}
                                      className="w-full text-xs px-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-850 text-emerald-600 dark:text-emerald-400 font-extrabold focus:outline-none"
                                    >
                                      <option value="">— Select Correct Option —</option>
                                      {((q.options || []) as string[]).map((opt: string) => {
                                        const dotIdx = opt.indexOf(".");
                                        const key = dotIdx > 0 ? opt.substring(0, dotIdx).trim() : opt.charAt(0);
                                        return <option key={key} value={key}>{opt}</option>;
                                      })}
                                    </select>
                                  ) : (
                                    <input
                                      type="text"
                                      value={ans || ""}
                                      onChange={e => handleContentFieldChange(idx, "answer", e.target.value)}
                                      placeholder="e.g. A, B, i"
                                      className="w-full text-xs px-2.5 py-1.5 border border-amber-200 dark:border-amber-900 rounded-lg bg-amber-500/5 text-emerald-500 focus:outline-none font-bold"
                                    />
                                  )}
                                </div>
                              ) : null}

                              {/* 3-Part Explanation Detail Area */}
                              <div className="mt-3.5 pt-3 border-t border-gray-100 dark:border-gray-850 shrink-0">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Expert Explanation (3-Part)</span>
                                  <div className="flex gap-1.5">
                                    {["Locating", "Justification", "Distractor"].map(tab => (
                                      <span key={tab} className="text-[8px] font-bold px-1.5 py-0.2 rounded-full bg-gray-150 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase tracking-wider scale-95">
                                        {tab}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                <div className="grid grid-cols-12 gap-3">
                                  <div className="col-span-4">
                                    <label className="block text-[8px] font-extrabold text-gray-500 dark:text-gray-450 uppercase tracking-widest mb-1">Locating (Transcript)</label>
                                    <textarea
                                      value={parsedExplanation.locating}
                                      onChange={e => {
                                        const newExp = `Locating: ${e.target.value}\nJustification: ${parsedExplanation.justification}\nDistractor Analysis: ${parsedExplanation.distractor}`;
                                        handleContentFieldChange(idx, "explanation", newExp);
                                      }}
                                      rows={2}
                                      className="w-full text-[10px] px-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-850 text-gray-800 dark:text-gray-300 focus:outline-none resize-none leading-normal font-sans"
                                      placeholder="Exact speaker phrase..."
                                    />
                                  </div>
                                  <div className="col-span-4">
                                    <label className="block text-[8px] font-extrabold text-gray-500 dark:text-gray-450 uppercase tracking-widest mb-1">Justification (Logic)</label>
                                    <textarea
                                      value={parsedExplanation.justification}
                                      onChange={e => {
                                        const newExp = `Locating: ${parsedExplanation.locating}\nJustification: ${e.target.value}\nDistractor Analysis: ${parsedExplanation.distractor}`;
                                        handleContentFieldChange(idx, "explanation", newExp);
                                      }}
                                      rows={2}
                                      className="w-full text-[10px] px-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-850 text-gray-800 dark:text-gray-300 focus:outline-none resize-none leading-normal font-sans"
                                      placeholder="Synonym map or paraphrasing..."
                                    />
                                  </div>
                                  <div className="col-span-4">
                                    <label className="block text-[8px] font-extrabold text-gray-500 dark:text-gray-450 uppercase tracking-widest mb-1">Distractor Analysis</label>
                                    <textarea
                                      value={parsedExplanation.distractor}
                                      onChange={e => {
                                        const newExp = `Locating: ${parsedExplanation.locating}\nJustification: ${parsedExplanation.justification}\nDistractor Analysis: ${e.target.value}`;
                                        handleContentFieldChange(idx, "explanation", newExp);
                                      }}
                                      rows={2}
                                      className="w-full text-[10px] px-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-850 text-gray-800 dark:text-gray-300 focus:outline-none resize-none leading-normal font-sans"
                                      placeholder="Why alternatives are wrong..."
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                          return nodes;
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ORIGINAL SINGLE COLUMN WORKSPACE FOR OTHER SKILLS */
                  <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                    {/* Common metadata */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Exam Title *</label>
                        <input
                          type="text"
                          value={structuredJson.title || ""}
                          onChange={e => updateStructuredJson({ ...structuredJson, title: e.target.value })}
                          className="w-full text-xs px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none"
                          required
                        />
                      </div>
                      {job.skill !== "SPEAKING" && job.skill !== "WRITING" && (
                        <div>
                          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Duration (minutes) *</label>
                          <input
                            type="number"
                            value={structuredJson.duration || 60}
                            onChange={e => updateStructuredJson({ ...structuredJson, duration: Number(e.target.value) })}
                            className="w-full text-xs px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none"
                            required
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Description / Instructions</label>
                      <textarea
                        value={structuredJson.description || ""}
                        onChange={e => updateStructuredJson({ ...structuredJson, description: e.target.value })}
                        rows={2}
                        className="w-full text-xs px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none resize-none"
                      />
                    </div>

                    {/* Reading Passage content */}
                    {job.skill === "READING" && (
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                          Passage Content {isMultiPart ? `(Passage ${activeReviewPartIdx + 1})` : ""}
                        </label>
                        <textarea
                          value={activePart.passage || ""}
                          onChange={e => {
                            if (isMultiPart) {
                              const newParts = [...(structuredJson.parts || [])];
                              newParts[activeReviewPartIdx] = {
                                ...newParts[activeReviewPartIdx],
                                passage: e.target.value
                              };
                              updateStructuredJson({ ...structuredJson, parts: newParts });
                            } else {
                              updateStructuredJson({ ...structuredJson, passage: e.target.value });
                            }
                          }}
                          rows={8}
                          className="w-full text-xs font-mono px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none leading-relaxed"
                        />
                      </div>
                    )}

                    {/* Writing attachment */}
                    {job.skill === "WRITING" && (
                      <div className="flex flex-col gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Writing Prompt</label>
                          <textarea
                            value={structuredJson.prompt || ""}
                            onChange={e => updateStructuredJson({ ...structuredJson, prompt: e.target.value })}
                            rows={6}
                            className="w-full text-xs px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Prompt Attachment Image URL</label>
                          <input
                            type="text"
                            value={structuredJson.imageUrl || ""}
                            onChange={e => updateStructuredJson({ ...structuredJson, imageUrl: e.target.value })}
                            placeholder="https://..."
                            className="w-full text-xs px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none"
                          />
                          {structuredJson.imageUrl && (
                            <div className="mt-2 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden max-w-sm">
                              <img src={structuredJson.imageUrl} alt="Prompt Preview" className="w-full h-auto object-cover max-h-[200px]" />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Question List for Reading/Listening non-intensive or other formats */}
                    {(job.skill === "LISTENING" || job.skill === "READING") && (
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Questions & Answers</h3>
                          <button
                            type="button"
                            onClick={handleAddQuestion}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-semibold transition-colors"
                          >
                            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                            Add Question
                          </button>
                        </div>

                        <div className="flex flex-col gap-4">
                          {((activePart.content || []) as any[]).flatMap((q: any, idx: number) => {
                            const ans = q.correct_answer !== undefined ? q.correct_answer : q.answer !== undefined ? q.answer : q.correct_answers;
                            const allContent: any[] = activePart.content || [];
                            const prevQ = idx > 0 ? allContent[idx - 1] : null;
                            const isGroupStart = !prevQ ||
                              prevQ.type !== q.type ||
                              JSON.stringify(prevQ.options ?? []) !== JSON.stringify(q.options ?? []);
                            let groupRangeLabel = "";
                            if (isGroupStart) {
                              let groupEndIdx = idx;
                              while (
                                groupEndIdx + 1 < allContent.length &&
                                allContent[groupEndIdx + 1].type === q.type &&
                                JSON.stringify(allContent[groupEndIdx + 1].options ?? []) === JSON.stringify(q.options ?? [])
                              ) groupEndIdx++;
                              const startNum: number = q.question_number ?? idx + 1;
                              const endNum: number = allContent[groupEndIdx].question_number ?? groupEndIdx + 1;
                              groupRangeLabel = startNum === endNum ? `Question ${startNum}` : `Questions ${startNum}–${endNum}`;
                            }
                            const isChoiceGroup = CHOICE_TYPES.has(q.type);
                            const typeLabel = (q.type as string)
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (c: string) => c.toUpperCase());

                            const nodes: React.ReactNode[] = [];
                            
                            if (isGroupStart) {
                              nodes.push(
                                <div
                                  key={`gh-${idx}`}
                                  className={[
                                    "flex items-center gap-3 px-4 py-2.5 rounded-xl border",
                                    isChoiceGroup
                                      ? "bg-blue-50 dark:bg-blue-955/20 border-blue-200 dark:border-blue-800/60"
                                      : "bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700",
                                    idx > 0 ? "mt-2" : "",
                                  ].join(" ")}
                                >
                                  <div className={`w-2 h-2 rounded-full shrink-0 ${isChoiceGroup ? "bg-blue-500" : "bg-gray-400"}`} />
                                  <span className={`text-[11px] font-bold uppercase tracking-wider ${
                                    isChoiceGroup ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
                                  }`}>{typeLabel}</span>
                                  <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                                    {groupRangeLabel}
                                  </span>
                                  {isChoiceGroup && (q.options || []).length > 0 && (
                                    <span className="text-[10px] text-blue-500 dark:text-blue-400 ml-auto font-medium">
                                      {(q.options as string[]).length} options
                                    </span>
                                  )}
                                </div>
                              );
                            }

                            nodes.push(
                              <div
                                key={idx}
                                className="p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm relative group"
                              >
                                <button
                                  type="button"
                                  onClick={() => handleRemoveQuestion(idx)}
                                  className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-955/20 transition-colors"
                                  aria-label="Remove Question"
                                >
                                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>

                                <div className="grid grid-cols-12 gap-4">
                                  <div className="col-span-2">
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Q#</label>
                                    <input
                                      type="number"
                                      value={q.question_number || ""}
                                      onChange={e => handleContentFieldChange(idx, "question_number", Number(e.target.value))}
                                      className="w-full text-xs px-2.5 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none"
                                    />
                                  </div>
                                  
                                  <div className="col-span-10">
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Question Type</label>
                                    <select
                                      value={q.type || "sentence_completion"}
                                      onChange={e => handleContentFieldChange(idx, "type", e.target.value)}
                                      className="w-full text-xs px-2.5 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none"
                                    >
                                      {WHITELISTED_TYPES.map(t => (
                                        <option key={t} value={t}>{t}</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>

                                <div className="mt-3">
                                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Question Text</label>
                                  <input
                                    type="text"
                                    value={q.question_text || ""}
                                    onChange={e => handleContentFieldChange(idx, "question_text", e.target.value)}
                                    className="w-full text-xs px-2.5 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none font-medium"
                                  />
                                </div>

                                {isChoiceGroup && (
                                  <div className="mt-3">
                                    <div className="flex items-center justify-between mb-1.5">
                                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Options</label>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const opts: string[] = q.options || [];
                                          const nextKey = "ABCDEFGHIJ"[opts.length] ?? String.fromCharCode(65 + opts.length);
                                          handleContentFieldChange(idx, "options", [...opts, `${nextKey}. `]);
                                        }}
                                        className="flex items-center gap-1 text-[10px] font-semibold text-primary hover:opacity-80"
                                      >
                                        + Add Option
                                      </button>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                      {((q.options || []) as string[]).map((opt: string, optIdx: number) => (
                                        <div key={optIdx} className="flex items-center gap-2">
                                          <input
                                            type="text"
                                            value={opt}
                                            onChange={e => {
                                              const newOpts = [...(q.options as string[])];
                                              newOpts[optIdx] = e.target.value;
                                              handleContentFieldChange(idx, "options", newOpts);
                                            }}
                                            className="flex-1 text-xs px-2.5 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-850 dark:text-gray-200 focus:outline-none font-mono"
                                          />
                                          <button
                                            type="button"
                                            onClick={() => handleContentFieldChange(idx, "options", (q.options as string[]).filter((_: string, i: number) => i !== optIdx))}
                                            className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                                          >
                                            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div className="mt-3">
                                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Correct Answer</label>
                                  <input
                                    type="text"
                                    value={ans || ""}
                                    onChange={e => handleContentFieldChange(idx, "answer", e.target.value)}
                                    className="w-full text-xs px-2.5 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none font-semibold text-primary"
                                  />
                                </div>

                                <div className="mt-3">
                                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Explanation</label>
                                  <textarea
                                    value={q.explanation || ""}
                                    onChange={e => handleContentFieldChange(idx, "explanation", e.target.value)}
                                    rows={3}
                                    className="w-full text-xs px-2.5 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none resize-none leading-relaxed"
                                  />
                                </div>
                              </div>
                            );
                            return nodes;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* ─── Overwrite Confirm Dialog ─── */}
      {showOverwriteConfirm && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl p-6 max-w-sm w-full">
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">Provenance Conflict</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              An exam with the same source metadata already exists in the live database. Do you want to <span className="font-semibold text-red-500">overwrite</span> the existing record?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowOverwriteConfirm(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowOverwriteConfirm(false);
                  handleCommit(true);
                }}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-650 rounded-xl transition-colors"
              >
                Overwrite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
