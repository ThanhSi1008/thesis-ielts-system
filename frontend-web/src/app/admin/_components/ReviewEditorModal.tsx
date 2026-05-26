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

  // Initialize
  useEffect(() => {
    if (job) {
      const parsedJson = job.structuredJson || { title: "", content: [] };
      setStructuredJson(parsedJson);
      setJsonText(JSON.stringify(parsedJson, null, 2));
      setProvenance(job.provenance || { source: "cambridge" });
    }
  }, [job]);

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
      
      // Find maximum question number across all parts to auto-increment correctly
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

    // 1. Basic JSON Contract schema checking via Zod
    const schemaResult = structuredJsonSchema.safeParse(structuredJson);
    if (!schemaResult.success) {
      schemaResult.error.errors.forEach(err => {
        errors.push(`${err.path.join(".")}: ${err.message}`);
      });
    }

    // 2. Deep validation on answer formatting
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

      // Check parentheses balance
      let parenCount = 0;
      for (let i = 0; i < ansStr.length; i++) {
        if (ansStr[i] === '(') parenCount++;
        else if (ansStr[i] === ')') {
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

      // Check slash formatting
      if (ansStr.includes("//") || ansStr.startsWith("/") || ansStr.endsWith("/")) {
        errors.push(`[Question ${qNum}] Invalid slash formatting in answer "${ansStr}". Alternate answers must use single slash without hanging slashes (e.g. answer1/answer2).`);
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
    try {
      await ieltsImportApi.saveDraft(job.id, {
        structuredJson,
        provenance,
        version: job.version || 0
      });
      toast.success("Draft saved successfully.");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to save draft.");
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
    try {
      await ieltsImportApi.commitJob(job.id, {
        overwrite,
        isPublished: false // Always default to false for reviews
      });
      toast.success("Committed to live bank successfully!");
      onSuccess();
    } catch (e: any) {
      if (e.response?.status === 409) {
        setShowOverwriteConfirm(true);
      } else {
        toast.error(e.response?.data?.message || "Failed to commit job.");
      }
    } finally {
      setIsCommitting(false);
    }
  };

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
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Review Importing Job</h2>
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
                ? "bg-white dark:bg-gray-955 text-gray-950 dark:text-white shadow-sm"
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
            Commit & Publish Draft
          </button>
        </div>
      </header>

      {/* Error list banner */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-950/20 border-b border-red-200 dark:border-red-900/60 p-4 max-h-[160px] overflow-y-auto shrink-0">
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
      <main className="flex-1 overflow-hidden flex max-w-7xl mx-auto w-full p-6 gap-6">
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
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {/* Part Selector Tabs for Multi-Part Exams */}
              {isMultiPart && (
                <div className="bg-gray-50 dark:bg-gray-955 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-2">Select Part:</span>
                  {(structuredJson.parts || []).map((p: any, idx: number) => {
                    const isActive = idx === activeReviewPartIdx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setActiveReviewPartIdx(idx)}
                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                          isActive
                            ? "bg-primary text-white shadow-md scale-105"
                            : "bg-white hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-800"
                        }`}
                      >
                        {job.skill === "READING" ? `Passage ${idx + 1}` : `Part ${idx + 1}`}
                      </button>
                    );
                  })}
                </div>
              )}

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

              {/* ─── Listening / Audio Player ─── */}
              {job.skill === "LISTENING" && (
                <div className="bg-gray-50 dark:bg-gray-955 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-1.5">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-primary" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                    Listening Audio Player
                  </h4>
                  {job.mediaAssets && job.mediaAssets[0] ? (
                    <div className="flex flex-col gap-2">
                      <audio src={job.mediaAssets[0].storedUrl} controls className="w-full" />
                      <span className="text-[10px] text-gray-400 select-all truncate">
                        Audio Source: {job.mediaAssets[0].storedUrl}
                      </span>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 italic">No audio asset attached to this job.</div>
                  )}
                </div>
              )}

              {/* ─── Reading / Passage text ─── */}
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

              {/* ─── Writing / Prompt and Preview ─── */}
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

              {/* ─── Questions and Answers Grid ─── */}
              {(job.skill === "LISTENING" || job.skill === "READING") && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Questions & Answers</h3>
                    <button
                      onClick={handleAddQuestion}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-semibold transition-colors"
                    >
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                      Add Question
                    </button>
                  </div>

                  <div className="flex flex-col gap-4">
                    {(activePart.content || []).map((q: any, idx: number) => {
                      const ans = q.correct_answer !== undefined ? q.correct_answer : q.answer !== undefined ? q.answer : q.correct_answers;
                      
                      return (
                        <div
                          key={idx}
                          className="p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm relative group"
                        >
                          {/* Remove button */}
                          <button
                            onClick={() => handleRemoveQuestion(idx)}
                            className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
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
                            
                            <div className="col-span-5">
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

                            {/* Timestamp for Listening */}
                            {job.skill === "LISTENING" && (
                              <div className="col-span-5">
                                <div className="flex items-center justify-between mb-1">
                                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Timestamp (mm:ss)</label>
                                  {!q.question_timestamp && (
                                    <span className="text-[9px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/10 px-1 py-0.2 rounded flex items-center gap-0.5 shrink-0 animate-pulse">
                                      ⚠️ Missing
                                    </span>
                                  )}
                                </div>
                                <input
                                  type="text"
                                  value={q.question_timestamp || ""}
                                  onChange={e => handleContentFieldChange(idx, "question_timestamp", e.target.value)}
                                  placeholder="e.g. 02:45"
                                  className="w-full text-xs px-2.5 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none"
                                />
                              </div>
                            )}
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

                          <div className="mt-3">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                              Correct Answer (slashes for alternate, parentheses for optional spelling)
                            </label>
                            <input
                              type="text"
                              value={ans || ""}
                              onChange={e => handleContentFieldChange(idx, "answer", e.target.value)}
                              placeholder="e.g. colo(u)r or car/taxi"
                              className="w-full text-xs px-2.5 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none font-semibold text-primary"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
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
