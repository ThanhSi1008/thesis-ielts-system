"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, UserPlus, Copy, Check, ChevronRight, GraduationCap, X, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/Toaster";
import { API_BASE_URL } from "@/constants";

export default function StudentTeacherContent({ embedded }: { embedded?: boolean }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"student" | "teacher">("student");

  // State for student view
  const [teacherIdInput, setTeacherIdInput] = useState("");
  const [teachers, setTeachers] = useState<any[]>([]);
  const [linking, setLinking] = useState(false);

  // State for teacher view
  const [students, setStudents] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };
      
      if (activeTab === "student") {
        const res = await fetch(`${API_BASE_URL}/users/my-teachers`, { headers });
        if (!res.ok) throw new Error("Failed to fetch teachers");
        const data = await res.json();
        setTeachers(data);
      } else {
        const res = await fetch(`${API_BASE_URL}/users/my-students`, { headers });
        if (!res.ok) throw new Error("Failed to fetch students");
        const data = await res.json();
        setStudents(data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load connections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, [activeTab]);

  const handleLinkTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherIdInput.trim()) return;

    try {
      setLinking(true);
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_BASE_URL}/users/link-teacher`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ teacherId: teacherIdInput.trim() }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to link teacher");
      }

      toast.success("Successfully linked to teacher!");
      setTeacherIdInput("");
      fetchConnections();
    } catch (error: any) {
      toast.error(error.message || "Invalid Teacher ID");
    } finally {
      setLinking(false);
    }
  };

  const handleUnlink = async (teacherId: string) => {
    if (!confirm("Are you sure you want to unlink from this teacher?")) return;

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_BASE_URL}/users/unlink-teacher/${teacherId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to unlink");
      toast.success("Unlinked successfully");
      fetchConnections();
    } catch (error) {
      toast.error("Failed to unlink teacher");
    }
  };

  const copyId = () => {
    if (!user?.id) return;
    navigator.clipboard.writeText(user.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("ID copied to clipboard!");
  };

  const mainContent = (
    <main className={`flex-1 min-w-0 bg-white overflow-y-auto flex flex-col ${embedded ? 'h-full' : ''}`}>
      <div className="px-3 md:px-6 flex-1">
        {/* Header section with modern gradient background */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 md:p-8 text-white mt-8 mb-8 pb-12 w-full">
          <div className="relative z-10 flex w-full h-full pb-0 pt-2 lg:pt-0 gap-x-8 items-center lg:items-end justify-between min-h-[120px]">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">Student & Teacher Connect</h1>
              <p className="text-blue-100 max-w-xl text-sm md:text-base opacity-90 leading-relaxed">
                Link accounts to share progress. Students can get feedback, and teachers can gain detailed analytics into their classroom's performance.
              </p>
            </div>
            <div className="hidden sm:block">
              <GraduationCap className="w-16 h-16 md:w-24 md:h-24 text-white/20" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-8 px-4">
          <button
            onClick={() => setActiveTab("student")}
            className={`relative py-4 text-sm md:text-base font-bold flex items-center gap-2 transition-colors ${activeTab === "student" ? "text-primary" : "text-gray-400 hover:text-gray-700"}`}
          >
            <Users className="w-5 h-5" />
            I'm a Student
            {activeTab === "student" && <span className="absolute left-0 -bottom-[2px] h-[3px] rounded-full bg-primary w-full" />}
          </button>
          <button
            onClick={() => setActiveTab("teacher")}
            className={`relative py-4 text-sm md:text-base font-bold flex items-center gap-2 transition-colors ${activeTab === "teacher" ? "text-primary" : "text-gray-400 hover:text-gray-700"}`}
          >
            <GraduationCap className="w-5 h-5" />
            I'm a Teacher
            {activeTab === "teacher" && <span className="absolute left-0 -bottom-[2px] h-[3px] rounded-full bg-primary w-full" />}
          </button>
        </div>

        <div className="py-8 px-0 md:px-4 h-full">
          {activeTab === "student" ? (
            <div className="flex flex-col lg:flex-row gap-12">
              {/* Link Teacher Form */}
              <div className="w-full lg:w-1/3 space-y-6">
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Link with your Teacher</h3>
                  <p className="text-sm text-gray-500 mb-6">Ask your teacher for their unique ID and enter it below to share your progress.</p>
                  
                  <form onSubmit={handleLinkTeacher} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Teacher ID</label>
                      <input
                        type="text"
                        value={teacherIdInput}
                        onChange={(e) => setTeacherIdInput(e.target.value)}
                        placeholder="e.g. 550e8400-e29b-41d4..."
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-0 text-sm font-medium transition-colors"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={linking}
                      className="w-full flex justify-center items-center gap-2 bg-primary text-white py-3 px-4 rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-70"
                    >
                      {linking ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      ) : (
                          <>
                            <UserPlus className="w-5 h-5" />
                            Link Teacher
                          </>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Teachers List */}
              <div className="w-full lg:w-2/3">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-400" /> My Linked Teachers
                </h3>
                
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2].map(i => <div key={i} className="h-20 bg-gray-50 rounded-xl animate-pulse" />)}
                  </div>
                ) : teachers.length === 0 ? (
                  <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <Users className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-900 font-bold text-lg mb-1">No teachers linked yet</p>
                    <p className="text-gray-500 text-sm max-w-sm">When you link with a teacher, they will appear here and can monitor your IELTS practice progress.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teachers.map((link) => (
                      <div key={link.id} className="relative group bg-white rounded-2xl p-5 hover:bg-gray-50 transition-all">
                         <button 
                            onClick={() => handleUnlink(link.teacher.id)}
                            className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                            title="Unlink teacher"
                          >
                            <X className="w-5 h-5" />
                          </button>
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                              <span className="text-lg font-bold text-blue-600">
                                {link.teacher.firstName?.[0] || ""}{link.teacher.lastName?.[0] || ""}
                                {(!link.teacher.firstName && !link.teacher.lastName) && <Users className="w-5 h-5" />}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">
                                {link.teacher.firstName} {link.teacher.lastName}
                                {(!link.teacher.firstName && !link.teacher.lastName) && "Unknown Teacher"}
                              </h4>
                              <p className="text-xs text-gray-500">{link.teacher.email}</p>
                              <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full inline-flex">
                                <CheckCircle2 className="w-3 h-3" /> Linked
                              </div>
                            </div>
                          </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-12">
              {/* Teacher ID View */}
              <div className="w-full lg:w-1/3 space-y-6">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white overflow-hidden relative">
                  <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                  
                  <h3 className="text-lg font-bold text-white mb-2">Your Teacher ID</h3>
                  <p className="text-sm text-gray-400 mb-6 relative z-10">Share this unique ID with your students so they can link their accounts to you.</p>
                  
                  <div className="bg-black/40 rounded-xl p-4 flex items-center justify-between border border-white/10 group relative z-10">
                    <div className="font-mono text-sm text-blue-300 w-full truncate pr-4">
                      {user?.id || "Loading..."}
                    </div>
                    <button
                      onClick={copyId}
                      className="shrink-0 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
                      title="Copy ID"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Students List */}
              <div className="w-full lg:w-2/3">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-400" /> My Students
                </h3>
                
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />)}
                  </div>
                ) : students.length === 0 ? (
                   <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <GraduationCap className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-900 font-bold text-lg mb-1">No students linked yet</p>
                    <p className="text-gray-500 text-sm max-w-sm">Share your Teacher ID with your students to grant you access to their IELTS performance dashboards.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 font-bold text-xs text-gray-500 tracking-wider uppercase">Student</th>
                          <th className="px-6 py-4 font-bold text-xs text-gray-500 tracking-wider uppercase">Linked On</th>
                          <th className="px-6 py-4 font-bold text-xs text-gray-500 tracking-wider uppercase text-right">View Stats</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {students.map((link) => (
                          <tr key={link.id} className="hover:bg-gray-50 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm font-bold text-sm">
                                  {link.student.firstName?.[0] || ""}{link.student.lastName?.[0] || ""}
                                  {(!link.student.firstName && !link.student.lastName) && <Users className="w-4 h-4" />}
                                </div>
                                <div>
                                  <div className="font-bold text-gray-900 group-hover:text-primary transition-colors">
                                    {link.student.firstName} {link.student.lastName}
                                    {(!link.student.firstName && !link.student.lastName) && "Unknown Student"}
                                  </div>
                                  <div className="text-xs text-gray-500">{link.student.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                              {new Date(link.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end pr-2">
                                <Link
                                  href={`/ielts/student-teacher/student/${link.student.id}`}
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm"
                                  title="View Performance"
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );

  if (embedded) return mainContent;

  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="container mx-auto max-w-screen-xl px-2 py-4">
        
        <div className="flex gap-6 mt-2">
          {/* Sidebar - Using the same visual style from intensive page for consistency */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="h-full bg-white overflow-hidden">
              <div className="p-4 space-y-1">
                <Link href="/ielts/intensive?view=dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 opacity-70" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                  Dashboard
                </Link>
                
                <Link href="/ielts/intensive" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 opacity-70" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                  Mock Test
                </Link>

                <Link href="/ielts/history" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 opacity-70" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="9"/></svg>
                  Test History
                </Link>

                <div className="pt-2">
                  <Link href="/ielts/student-teacher" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold bg-primary/10 text-primary transition-colors">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    Student/Teacher
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          {mainContent}
        </div>
      </div>
    </div>
  );
}
