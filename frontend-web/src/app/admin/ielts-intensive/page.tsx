"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { adminIeltsIntensiveApi, ieltsImportApi } from "@/services/admin.api";
import { toast } from "@/components/Toaster";
import ReviewEditorModal from "../_components/ReviewEditorModal";
import api from "@/lib/api";

const POLL_INTERVAL_MS = 5000;

// ─── Status Badge ───
function JobStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    SCRAPING: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 animate-pulse",
    EXTRACTING: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 animate-pulse",
    AWAITING_REVIEW: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-450",
    FAILED: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400",
    COMMITTED: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400",
    DISCARDED: "bg-gray-150 text-gray-500 dark:bg-gray-800 dark:text-gray-550"
  };

  const current = styles[status] || "bg-gray-100 text-gray-700";

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${current}`}>
      {(status === "SCRAPING" || status === "EXTRACTING") && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
      )}
      {status}
    </span>
  );
}

// ─── Delete Confirm Dialog ───
function DeleteDialog({
  exam,
  onConfirm,
  onCancel,
}: {
  exam: any;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl p-6 max-w-sm w-full animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">Delete Live Mock Exam?</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          This will permanently delete <span className="font-semibold text-gray-800 dark:text-gray-200">&ldquo;{exam.title}&rdquo;</span>, erasing all student progress, sessions, and histories. This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-650 rounded-xl transition-colors"
          >
            Delete Exam
          </button>
        </div>
      </div>
    </div>
  );
}

export default function IELTSIntensiveAdminPage() {
  const [activeTab, setActiveTab] = useState<"live" | "staging">("live");
  
  // Live Data
  const [exams, setExams] = useState<any[]>([]);
  const [deleteExamTarget, setDeleteExamTarget] = useState<any | null>(null);
  const [isLiveLoading, setIsLiveLoading] = useState(true);

  // Staging Queue
  const [jobs, setJobs] = useState<any[]>([]);
  const [isStagingLoading, setIsStagingLoading] = useState(true);
  const [editingJob, setEditingJob] = useState<any | null>(null);

  // Poll controller
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Modals & Drawer
  const [showImportDrawer, setShowImportDrawer] = useState(false);
  
  // New Import State
  const [skill, setSkill] = useState<string>("READING");
  const [targetSystem, setTargetSystem] = useState<string>("BOTH");
  const [sourceType, setSourceType] = useState<string>("PDF_UPLOAD");
  const [sourceRef, setSourceRef] = useState<string>("");
  const [provSource, setProvSource] = useState<string>("cambridge");
  const [provBook, setProvBook] = useState<number>(18);
  const [provTest, setProvTest] = useState<number>(1);
  const [provPart, setProvPart] = useState<number>(1);
  const [provTitle, setProvTitle] = useState<string>("");
  
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingAudioscript, setIsUploadingAudioscript] = useState(false);
  const [audioscriptRef, setAudioscriptRef] = useState<string>("");
  const [isSubmittingJob, setIsSubmittingJob] = useState(false);
  const [audioUrls, setAudioUrls] = useState<(string | null)[]>([null, null, null, null]);
  const [uploadingAudioPart, setUploadingAudioPart] = useState<number | null>(null);

  // Grouped Jobs Map (groupId -> array of jobs)
  const [groups, setGroups] = useState<Record<string, any[]>>({});

  // ─── Data Fetching ───
  const fetchLiveExams = useCallback(async () => {
    setIsLiveLoading(true);
    try {
      const data = await adminIeltsIntensiveApi.getAll();
      setExams(data);
    } catch {
      toast.error("Failed to load live intensive exams.");
    } finally {
      setIsLiveLoading(false);
    }
  }, []);

  const fetchStagingQueue = useCallback(async (silent = false) => {
    if (!silent) setIsStagingLoading(true);
    try {
      const data = await ieltsImportApi.getAllJobs();
      // Filter for Intensive target system
      const intensiveJobs = data.filter(j => j.targetSystem === "INTENSIVE" || j.targetSystem === "BOTH");
      setJobs(intensiveJobs);

      // Group jobs
      const grouped: Record<string, any[]> = {};
      intensiveJobs.forEach(job => {
        if (job.groupId) {
          if (!grouped[job.groupId]) grouped[job.groupId] = [];
          grouped[job.groupId].push(job);
        }
      });
      setGroups(grouped);

      const hasActive = intensiveJobs.some(j => j.status === "PENDING" || j.status === "SCRAPING" || j.status === "EXTRACTING");
      if (hasActive) {
        startPolling();
      } else {
        stopPolling();
      }
    } catch {
      // ignore silent fetch failures
      if (!silent) toast.error("Failed to load staging queue.");
    } finally {
      if (!silent) setIsStagingLoading(false);
    }
  }, []);

  const stopPolling = useCallback(() => {
    if (pollRef.current !== null) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    if (pollRef.current !== null) return;
    pollRef.current = setInterval(() => {
      fetchStagingQueue(true);
    }, POLL_INTERVAL_MS);
  }, [fetchStagingQueue]);

  useEffect(() => {
    fetchLiveExams();
    fetchStagingQueue();
    return () => stopPolling();
  }, [fetchLiveExams, fetchStagingQueue, stopPolling]);

  // ─── Actions ───
  const handleTogglePublish = async (exam: any) => {
    try {
      await adminIeltsIntensiveApi.publish(exam.id);
      setExams(prev =>
        prev.map(e => (e.id === exam.id ? { ...e, isPublished: !e.isPublished } : e))
      );
      toast.success(exam.isPublished ? "Exam un-published (drafted)." : "Exam published successfully!");
    } catch {
      toast.error("Failed to toggle publish status.");
    }
  };

  const handleDeleteExam = async () => {
    if (!deleteExamTarget) return;
    const id = deleteExamTarget.id;
    try {
      await adminIeltsIntensiveApi.delete(id);
      setExams(prev => prev.filter(e => e.id !== id));
      toast.success("Exam deleted successfully.");
    } catch {
      toast.error("Failed to delete exam.");
    } finally {
      setDeleteExamTarget(null);
    }
  };

  const handleRetryJob = async (id: string) => {
    try {
      await ieltsImportApi.retryJob(id);
      toast.success("Job re-queued successfully.");
      fetchStagingQueue(true);
    } catch (e: any) {
      const errMsg = e.response?.data?.message;
      const formattedMsg = Array.isArray(errMsg) ? errMsg.join(", ") : (errMsg || "Failed to retry job.");
      toast.error(formattedMsg, 6000);
    }
  };

  const handleDiscardJob = async (id: string) => {
    if (!confirm("Discard this job from the staging queue?")) return;
    try {
      await ieltsImportApi.discardJob(id);
      toast.success("Job discarded.");
      fetchStagingQueue(true);
    } catch {
      toast.error("Failed to discard job.");
    }
  };

  const handleAbandonGroup = async (groupId: string) => {
    if (!confirm("Discard and abandon all jobs in this Mock Test Group?")) return;
    try {
      await ieltsImportApi.abandonGroup(groupId);
      toast.success("Group abandoned.");
      fetchStagingQueue(true);
    } catch {
      toast.error("Failed to abandon group.");
    }
  };

  const handleCommitGroup = async (groupId: string) => {
    try {
      const res = await ieltsImportApi.commitGroup(groupId, { isPublished: false });
      toast.success(`Mock Test Group committed successfully! Created ${res.examIds?.length || 0} exams.`);
      fetchLiveExams();
      fetchStagingQueue();
    } catch (e: any) {
      const errMsg = e.response?.data?.message;
      const formattedMsg = Array.isArray(errMsg) ? errMsg.join(", ") : (errMsg || "Failed to commit group.");
      toast.error(formattedMsg, 6000);
    }
  };

  // ─── File Upload Handler ───
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/admin/ielts/import/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setSourceRef((res.data as any).url);
      toast.success("PDF uploaded successfully.");
    } catch {
      toast.error("Failed to upload PDF file.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAudioscriptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAudioscript(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/admin/ielts/import/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setAudioscriptRef((res.data as any).url);
      toast.success("Audioscripts PDF uploaded successfully.");
    } catch {
      toast.error("Failed to upload Audioscripts PDF.");
    } finally {
      setIsUploadingAudioscript(false);
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>, partNum: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAudioPart(partNum);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/admin/ielts/import/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      const storedUrl = (res.data as any).url;
      setAudioUrls(prev => {
        const next = [...prev];
        next[partNum - 1] = storedUrl;
        return next;
      });
      toast.success(`Audio for Part ${partNum} uploaded successfully.`);
    } catch {
      toast.error(`Failed to upload Audio for Part ${partNum}.`);
    } finally {
      setUploadingAudioPart(null);
    }
  };

  // ─── Submit Import Job ───
  const handleCreateImportJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceRef.trim()) {
      toast.error("Please upload a PDF file.");
      return;
    }

    setIsSubmittingJob(true);
    try {
      const provenance: Record<string, any> = {
        source: provSource,
        title: provTitle.trim() || undefined
      };

      if (provSource === "cambridge") {
        provenance.bookNumber = provBook;
        provenance.testNumber = provTest;
      }

      await ieltsImportApi.createJob({
        targetSystem,
        skill,
        sourceType,
        sourceRef: sourceRef.trim(),
        audioscriptRef: skill === "LISTENING" && audioscriptRef.trim() ? audioscriptRef.trim() : undefined,
        provenance,
        audioUrls: skill === "LISTENING"
          ? (audioUrls.filter(Boolean) as string[])
          : undefined
      });

      toast.success(
        targetSystem === "BOTH"
          ? "Universal import job successfully created! Adding to both Intensive Mock & Advanced parts libraries."
          : `Import job successfully created for ${targetSystem.toLowerCase()} target!`
      );
      setShowImportDrawer(false);

      // Reset form
      setSourceRef("");
      setAudioscriptRef("");
      setProvTitle("");
      setAudioUrls([null, null, null, null]);

      fetchStagingQueue();
    } catch (e: any) {
      const errMsg = e.response?.data?.message;
      const formattedMsg = Array.isArray(errMsg) ? errMsg.join(", ") : (errMsg || "Failed to create import job.");
      toast.error(formattedMsg, 6000);
    } finally {
      setIsSubmittingJob(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">IELTS Intensive Exams</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage comprehensive, full-mark IELTS mock exams and automated AI imports.
          </p>
        </div>
        <button
          onClick={() => setShowImportDrawer(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Import Exam / Part
        </button>
      </div>

      {/* Tabs Menu */}
      <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 mb-6 pb-0.5">
        <button
          onClick={() => setActiveTab("live")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-0.5 ${
            activeTab === "live"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-250"
          }`}
        >
          Committed Live Exams ({exams.length})
        </button>
        <button
          onClick={() => setActiveTab("staging")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-0.5 ${
            activeTab === "staging"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-250"
          }`}
        >
          Staging Queue ({jobs.length})
        </button>
      </div>

      {/* ─── LIVE EXAMS TAB ─── */}
      {activeTab === "live" && (
        isLiveLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : exams.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl bg-white dark:bg-gray-900">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">No live IELTS Intensive exams available.</p>
            <button
              onClick={() => setShowImportDrawer(true)}
              className="mt-3 text-xs text-primary hover:underline font-bold"
            >
              Import your first mock exam →
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 dark:border-gray-800">
                <tr className="bg-gray-50/50 dark:bg-gray-950/20">
                  <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Exam Details</th>
                  <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Skill / Type</th>
                  <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Provenance</th>
                  <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Duration</th>
                  <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Status</th>
                  <th className="text-right px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {exams.map(exam => (
                  <tr key={exam.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-850/20 transition-colors">
                    <td className="px-5 py-4.5">
                      <div className="font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[280px]">{exam.title}</div>
                      <div className="text-[10px] text-gray-400 select-all truncate mt-0.5 max-w-[280px]">{exam.id}</div>
                    </td>
                    <td className="px-5 py-4.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
                        {exam.type || exam.skill || "FULL_TEST"}
                      </span>
                    </td>
                    <td className="px-5 py-4.5 text-gray-600 dark:text-gray-400 capitalize">
                      {exam.source} {exam.bookNumber && `(Book ${exam.bookNumber} - Test ${exam.testNumber})`}
                    </td>
                    <td className="px-5 py-4.5 text-gray-600 dark:text-gray-400">{exam.duration}m</td>
                    <td className="px-5 py-4.5">
                      <button
                        onClick={() => handleTogglePublish(exam)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold transition-all ${
                          exam.isPublished
                            ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${exam.isPublished ? "bg-green-500" : "bg-gray-400"}`} />
                        {exam.isPublished ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td className="px-5 py-4.5 text-right">
                      <button
                        onClick={() => setDeleteExamTarget(exam)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors"
                        aria-label="Delete"
                      >
                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* ─── STAGING QUEUE TAB ─── */}
      {activeTab === "staging" && (
        isStagingLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl bg-white dark:bg-gray-900">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Staging queue is empty.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Group views */}
            {Object.keys(groups).map(groupId => {
              const groupJobs = groups[groupId];
              const completedCount = groupJobs.filter(j => j.status === "COMMITTED" || j.status === "DISCARDED").length;
              const allDone = completedCount === groupJobs.length;

              return (
                <div
                  key={groupId}
                  className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 uppercase tracking-wider">
                          Full Mock Test Group
                        </span>
                        <span className="text-xs text-gray-400 truncate max-w-[200px]">ID: {groupId}</span>
                      </div>
                      <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-1">
                        Cambridge Mock Test Group — {completedCount}/{groupJobs.length} Skills Ready
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAbandonGroup(groupId)}
                        className="px-3 py-1.5 text-xs font-semibold text-red-500 border border-red-200 dark:border-red-900/60 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                      >
                        Abandon Group
                      </button>
                      <button
                        onClick={() => handleCommitGroup(groupId)}
                        disabled={!allDone}
                        className="px-4 py-1.5 text-xs font-semibold text-white bg-green-500 hover:bg-green-600 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Commit Full Group
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {groupJobs.map(job => (
                      <div
                        key={job.id}
                        className="p-4 bg-gray-50/50 dark:bg-gray-950/30 border border-gray-100 dark:border-gray-800/80 rounded-xl flex flex-col gap-3"
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-bold text-primary">{job.skill}</span>
                          <JobStatusBadge status={job.status} />
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-1">{job.structuredJson?.title || "No Title"}</p>
                        
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-[10px] text-gray-400">Tokens: {job.tokensUsed || 0}</span>
                          {job.status === "AWAITING_REVIEW" || job.status === "COMMITTED" ? (
                            <button
                              onClick={() => setEditingJob(job)}
                              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg hover:opacity-90 ${
                                job.status === "COMMITTED" 
                                  ? "bg-green-600 hover:bg-green-700 text-white" 
                                  : "bg-primary text-white"
                              }`}
                            >
                              {job.status === "COMMITTED" ? "Review & Re-commit" : "Review & Commit"}
                            </button>
                          ) : job.status === "FAILED" ? (
                            <div className="flex gap-1.5">
                              <button onClick={() => handleRetryJob(job.id)} className="p-1 text-gray-500 hover:text-gray-800"><svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg></button>
                              <button onClick={() => handleDiscardJob(job.id)} className="p-1 text-gray-500 hover:text-red-500"><svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-gray-400 capitalize">{job.status.toLowerCase()}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Ungrouped Jobs Table */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">Single Import Jobs</h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-gray-950/20 border-b border-gray-100 dark:border-gray-800">
                    <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Skill</th>
                    <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Reference / Title</th>
                    <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Created At</th>
                    <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Status</th>
                    <th className="text-right px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {jobs.filter(j => !j.groupId).map(job => (
                    <tr key={job.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-850/20 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-bold text-primary">{job.skill}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[240px]">
                          {job.structuredJson?.title || "Evaluating text..."}
                        </div>
                        <div className="text-[10px] text-gray-400 truncate max-w-[240px]">{job.sourceRef}</div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs">
                        {new Date(job.createdAt).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5"><JobStatusBadge status={job.status} /></td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex justify-end gap-2">
                          {(job.status === "AWAITING_REVIEW" || job.status === "COMMITTED") && (
                            <button
                              onClick={() => setEditingJob(job)}
                              className={`px-3 py-1 text-xs font-semibold rounded-lg hover:opacity-90 ${
                                job.status === "COMMITTED"
                                  ? "bg-green-600 hover:bg-green-700 text-white"
                                  : "bg-primary text-white"
                              }`}
                            >
                              {job.status === "COMMITTED" ? "Review & Re-commit" : "Review"}
                            </button>
                          )}
                          {(job.status === "FAILED" || job.status === "AWAITING_REVIEW") && (
                            <>
                              <button
                                onClick={() => handleRetryJob(job.id)}
                                className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
                                aria-label="Retry"
                              >
                                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
                              </button>
                              <button
                                onClick={() => handleDiscardJob(job.id)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"
                                aria-label="Discard"
                              >
                                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* ─── JOB EDITOR MODAL OVERLAY ─── */}
      {editingJob && (
        <ReviewEditorModal
          job={editingJob}
          onClose={() => setEditingJob(null)}
          onSuccess={() => {
            setEditingJob(null);
            fetchLiveExams();
            fetchStagingQueue();
          }}
        />
      )}

      {/* ─── IMPORT MODAL ─── */}
      {showImportDrawer && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-300 animate-fade-in">
          {/* Backdrop click closer */}
          <div className="absolute inset-0" onClick={() => setShowImportDrawer(false)} />
          
          <div className="relative w-full max-w-4xl bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 shadow-2xl rounded-3xl flex flex-col max-h-[90vh] overflow-hidden animate-scale-up">
            {/* Top Premium Gradient Ribbon */}
            <div className="h-1.5 w-full bg-gradient-to-r from-primary via-amber-400 to-indigo-500 shrink-0" />

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 px-6 py-4 shrink-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-primary/10 rounded-xl text-primary shrink-0">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg>
                </span>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 leading-none">
                    Import IELTS Content
                    <span className="text-[9px] bg-primary/10 text-primary font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider">AI Pipeline</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">Scrape web text/PDFs and generate structured mock exams</p>
                </div>
              </div>
              <button
                onClick={() => setShowImportDrawer(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-250 hover:bg-gray-50 dark:hover:bg-gray-850 rounded-xl transition-all"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleCreateImportJob} className="flex flex-col flex-1 overflow-hidden">
              {/* Modal Body - Scrollable content */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  
                  {/* Left Column: Form Settings & Targets */}
                  <div className="flex flex-col gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-650 dark:text-gray-400 mb-1.5">Target Skill *</label>
                      <select
                        value={skill}
                        onChange={e => setSkill(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
                      >
                        <option value="READING">Reading</option>
                        <option value="LISTENING">Listening</option>
                        <option value="WRITING">Writing</option>
                        <option value="SPEAKING">Speaking</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-655 dark:text-gray-400 mb-2">Target Destinations *</label>
                      <div className="grid grid-cols-1 gap-2.5">
                        <button
                          type="button"
                          onClick={() => setTargetSystem("BOTH")}
                          className={`group flex items-start text-left p-3.5 rounded-2xl border transition-all duration-300 relative ${
                            targetSystem === "BOTH"
                              ? "border-primary bg-primary/[0.03] dark:bg-primary/[0.01] ring-1 ring-primary shadow-sm"
                              : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-955 hover:border-gray-300 dark:hover:border-gray-700"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0 transition-all duration-200 ${
                            targetSystem === "BOTH" ? "border-primary bg-primary text-white scale-110" : "border-gray-300 dark:border-gray-600 group-hover:border-gray-450"
                          }`}>
                            {targetSystem === "BOTH" && <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-[3.5]"><polyline points="20 6 9 17 4 12" /></svg>}
                          </div>
                          <div className="ml-3">
                            <p className="text-[12px] font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                              Universal Commit (Both)
                              <span className="text-[9px] bg-emerald-500/10 text-emerald-500 font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider">Recommended</span>
                            </p>
                            <p className="text-[10.5px] text-gray-400 mt-1 leading-relaxed">
                              Add to both <strong className="font-semibold text-gray-700 dark:text-gray-300">Intensive Mock Exams</strong> and <strong className="font-semibold text-gray-700 dark:text-gray-300">Advanced modular parts</strong> simultaneously. PDF/Audio split is 100% automated.
                            </p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setTargetSystem("INTENSIVE")}
                          className={`group flex items-start text-left p-3.5 rounded-2xl border transition-all duration-300 relative ${
                            targetSystem === "INTENSIVE"
                              ? "border-primary bg-primary/[0.03] dark:bg-primary/[0.01] ring-1 ring-primary shadow-sm"
                              : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-955 hover:border-gray-300 dark:hover:border-gray-700"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0 transition-all duration-200 ${
                            targetSystem === "INTENSIVE" ? "border-primary bg-primary text-white scale-110" : "border-gray-300 dark:border-gray-600 group-hover:border-gray-455"
                          }`}>
                            {targetSystem === "INTENSIVE" && <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-[3.5]"><polyline points="20 6 9 17 4 12" /></svg>}
                          </div>
                          <div className="ml-3">
                            <p className="text-[12px] font-bold text-gray-900 dark:text-gray-100">
                              Intensive Only (Full Mock)
                            </p>
                            <p className="text-[10.5px] text-gray-400 mt-1 leading-relaxed">
                              Deploy exclusively into full mock exams.
                            </p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setTargetSystem("ADVANCED")}
                          className={`group flex items-start text-left p-3.5 rounded-2xl border transition-all duration-300 relative ${
                            targetSystem === "ADVANCED"
                              ? "border-primary bg-primary/[0.03] dark:bg-primary/[0.01] ring-1 ring-primary shadow-sm"
                              : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-955 hover:border-gray-300 dark:hover:border-gray-700"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0 transition-all duration-200 ${
                            targetSystem === "ADVANCED" ? "border-primary bg-primary text-white scale-110" : "border-gray-300 dark:border-gray-600 group-hover:border-gray-455"
                          }`}>
                            {targetSystem === "ADVANCED" && <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-[3.5]"><polyline points="20 6 9 17 4 12" /></svg>}
                          </div>
                          <div className="ml-3">
                            <p className="text-[12px] font-bold text-gray-900 dark:text-gray-100">
                              Advanced Only (Micro-Practice)
                            </p>
                            <p className="text-[10.5px] text-gray-400 mt-1 leading-relaxed">
                              Target a single specific part (e.g. only Part 1 or writing task 1 prompt).
                            </p>
                          </div>
                        </button>
                      </div>
                    </div>

                    <div className="bg-gray-50/50 dark:bg-gray-850/10 border border-gray-150/60 dark:border-gray-800 p-4 rounded-2xl flex flex-col gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 dark:border-gray-400 mb-1.5">Source Publisher</label>
                        <select
                          value={provSource}
                          onChange={e => setProvSource(e.target.value)}
                          className="w-full text-xs px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        >
                          <option value="cambridge">Cambridge IELTS</option>
                          <option value="forecast">Forecast / Actual Test</option>
                          <option value="other">Other / Custom</option>
                        </select>
                      </div>

                      {provSource === "cambridge" ? (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-450 mb-1">Book Number</label>
                            <input
                              type="number"
                              value={provBook}
                              onChange={e => setProvBook(Number(e.target.value))}
                              className="w-full text-xs px-3 py-2 border border-gray-200 dark:border-gray-750 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-455 mb-1">Test Number</label>
                            <input
                              type="number"
                              value={provTest}
                              onChange={e => setProvTest(Number(e.target.value))}
                              className="w-full text-xs px-3 py-2 border border-gray-200 dark:border-gray-750 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-455 mb-1">Source Title / Reference</label>
                          <input
                            type="text"
                            value={provTitle}
                            onChange={e => setProvTitle(e.target.value)}
                            placeholder="e.g. Cambridge 18 Reading Test 1"
                            className="w-full text-xs px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: PDF Upload & Media Inputs */}
                  <div className="flex flex-col gap-5">
                    {/* PDF Upload Input */}
                    <div className="flex flex-col gap-1.5">
                      <label className="block text-xs font-bold text-gray-600 dark:text-gray-400">PDF Booklet Document *</label>
                      <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-primary/50 rounded-2xl p-5 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-gray-800/10 transition-all duration-200 group relative">
                        <div className="absolute top-0 right-0 w-12 h-12 bg-primary/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
                        <svg viewBox="0 0 24 24" className="w-8 h-8 text-gray-400 group-hover:text-primary/70 mb-2 transition-colors duration-200" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg>
                        <span className="text-xs text-gray-655 text-gray-600 dark:text-gray-400 font-bold mb-1">Drag or drop PDF file here</span>
                        <span className="text-[10px] text-gray-400 mb-3">PDF Format (max 10MB)</span>
                        
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={handlePdfUpload}
                          className="hidden"
                          id="pdf-file-picker"
                        />
                        <label
                          htmlFor="pdf-file-picker"
                          className="px-4 py-1.5 bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 cursor-pointer shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-95 flex items-center gap-1.5"
                        >
                          {isUploading && <span className="w-3 h-3 border border-gray-455 border-t-transparent rounded-full animate-spin" />}
                          Select PDF
                        </label>

                        {sourceRef && (
                          <div className="mt-4 w-full bg-green-500/10 dark:bg-green-950/20 border border-green-500/20 px-3 py-2 rounded-xl flex items-center gap-2">
                            <span className="text-emerald-500 bg-emerald-100 dark:bg-emerald-950/50 p-0.5 rounded-full shrink-0">
                              <svg viewBox="0 0 20 20" className="w-3 h-3 fill-current"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                            </span>
                            <div className="overflow-hidden">
                              <span className="text-[10px] text-green-700 dark:text-green-400 font-bold block leading-none">PDF uploaded successfully</span>
                              <span className="text-[9px] text-gray-455 block truncate max-w-[280px] select-all mt-1">{sourceRef}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Audioscripts PDF Upload — LISTENING only */}
                    {skill === "LISTENING" && (
                      <div className="border border-blue-100 dark:border-blue-900 bg-blue-50/20 dark:bg-blue-955/5 rounded-2xl p-4 flex flex-col gap-3 animate-fade-in">
                        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                          <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg>
                          <span className="text-xs font-bold">Audioscripts PDF</span>
                        </div>
                        <p className="text-[10.5px] text-blue-600/80 dark:text-blue-500 leading-relaxed -mt-1.5">
                          Contains tape transcripts &amp; answer keys for all 4 parts.
                        </p>

                        <div className="flex items-center gap-3">
                          <input
                            type="file"
                            accept="application/pdf"
                            onChange={handleAudioscriptUpload}
                            className="hidden"
                            id="audioscript-file-picker"
                          />
                          <label
                            htmlFor="audioscript-file-picker"
                            className="px-4 py-1.5 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-bold text-blue-700 dark:text-blue-300 cursor-pointer shadow-sm hover:bg-blue-50 dark:hover:bg-gray-755 transition-all active:scale-95 flex items-center gap-1.5 shrink-0"
                          >
                            {isUploadingAudioscript && <span className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin" />}
                            Upload Audioscripts
                          </label>

                          {audioscriptRef && (
                            <div className="flex-1 min-w-0 bg-white dark:bg-gray-900 border border-blue-100 dark:border-blue-900/60 px-3 py-1.5 rounded-xl shadow-sm flex items-center justify-between gap-2">
                              <span className="text-[9.5px] text-gray-500 dark:text-gray-400 truncate select-all">{audioscriptRef.split("/").pop()}</span>
                              <button
                                type="button"
                                onClick={() => setAudioscriptRef("")}
                                className="text-[9px] text-red-500 hover:text-red-655 font-bold shrink-0"
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Audio Tracks for Listening Skill */}
                    {skill === "LISTENING" && (
                      <div className="border border-gray-150 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30 rounded-2xl p-4 flex flex-col gap-3 animate-fade-in">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-gray-655 dark:text-gray-400">
                            Audio Tracks (Part 1-4) *
                          </label>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            audioUrls.filter(Boolean).length === 4
                              ? "bg-green-500/10 text-green-500"
                              : "bg-amber-500/10 text-amber-500 animate-pulse"
                          }`}>
                            {audioUrls.filter(Boolean).length}/4 Uploaded
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {[1, 2, 3, 4].map(partNum => {
                            const uploadedUrl = audioUrls[partNum - 1];
                            const isUploadingPart = uploadingAudioPart === partNum;
                            return (
                              <div key={partNum} className="bg-white dark:bg-gray-900 border border-gray-150/70 dark:border-gray-800 p-2.5 rounded-xl flex flex-col justify-between shadow-sm relative overflow-hidden">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-extrabold text-primary uppercase">Part {partNum}</span>
                                  {uploadedUrl ? (
                                    <span className="text-[9px] font-bold text-green-600 flex items-center gap-0.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                      Active
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-medium text-gray-400">Pending</span>
                                  )}
                                </div>
                                {uploadedUrl ? (
                                  <div className="mt-2 flex items-center justify-between gap-1">
                                    <span className="text-[9px] text-gray-400 truncate max-w-[90px] select-all" title={uploadedUrl}>
                                      {uploadedUrl.split("/").pop()}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => setAudioUrls(prev => { const next = [...prev]; next[partNum - 1] = null; return next; })}
                                      className="text-[8px] font-bold text-red-500 hover:text-red-650"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                ) : (
                                  <div className="mt-2.5">
                                    <input
                                      type="file"
                                      accept="audio/*"
                                      id={`audio-part-${partNum}`}
                                      className="hidden"
                                      disabled={isUploadingPart}
                                      onChange={e => handleAudioUpload(e, partNum)}
                                    />
                                    <label
                                      htmlFor={`audio-part-${partNum}`}
                                      className="block w-full text-center py-1 bg-gray-50 dark:bg-gray-850 hover:bg-gray-100 dark:hover:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-lg text-[9px] font-bold text-gray-655 dark:text-gray-300 cursor-pointer transition-colors"
                                    >
                                      {isUploadingPart ? "Uploading..." : "Upload Audio"}
                                    </label>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* Modal Footer - Fixed */}
              <div className="flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setShowImportDrawer(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-850 transition-all active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingJob || isUploading || isUploadingAudioscript || uploadingAudioPart !== null || (skill === "LISTENING" && audioUrls.filter(Boolean).length < 4)}
                  className="px-5 py-2 text-xs font-semibold text-white bg-primary rounded-xl hover:opacity-90 disabled:opacity-60 transition-all active:scale-[0.98] flex items-center gap-1.5 shadow-sm"
                >
                  {isSubmittingJob && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  Submit Import
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteExamTarget && (
        <DeleteDialog
          exam={deleteExamTarget}
          onConfirm={handleDeleteExam}
          onCancel={() => setDeleteExamTarget(null)}
        />
      )}
    </div>
  );
}
