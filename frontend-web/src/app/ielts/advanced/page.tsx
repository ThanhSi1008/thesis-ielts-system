"use client";

import { useEffect, useState } from "react";
import { Headphones, BookOpen, PenTool, Mic, Info } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

interface PracticePart {
  id: string;
  title: string;
  partNumber: number;
  questionTypes: string[];
}

export default function IeltsAdvancedPracticePage() {
  const [skill, setSkill] = useState("Listening");
  const [parts, setParts] = useState<PracticePart[]>([]);
  const [selectedPart, setSelectedPart] = useState(1);
  const [loading, setLoading] = useState(true);

  const skills = [
    { name: "Listening", icon: Headphones },
    { name: "Reading", icon: BookOpen },
    { name: "Writing", icon: PenTool },
    { name: "Speaking", icon: Mic },
  ];

  useEffect(() => {
    if (skill === "Listening") {
      api.get<PracticePart[]>("/ielts/advanced/listening", {
        withCredentials: true
      })
      .then(res => {
        setParts(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [skill]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-up">
      {/* Page Header */}
      <div className="mb-10 text-left">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          IELTS Advanced <span className="text-primary italic">Practice</span>
        </h1>
        <p className="text-slate-500 text-lg max-w-2xl">
          Master every section with targeted practice drills designed to push you towards a Band 8.0+.
        </p>
      </div>

      {/* Skills Nav - Segmented Pill Style */}
      <div className="flex bg-slate-100 p-1 rounded-2xl w-fit mb-10 shadow-inner">
        {skills.map((s) => (
          <button
            key={s.name}
            onClick={() => setSkill(s.name)}
            className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-bold text-[15px] transition-all duration-300 ${
              skill === s.name
                ? "bg-white text-slate-900 shadow-md scale-105"
                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
            }`}
          >
            <s.icon className={`w-4 h-4 transition-colors ${skill === s.name ? "text-primary" : "text-slate-400"}`} />
            {s.name}
          </button>
        ))}
      </div>

      {skill === "Listening" && (
        <div className="space-y-12">
          {/* Part Selection - Glassmorphism Cards */}
          <div>
             <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-1 bg-primary rounded-full"></div>
                <h2 className="text-xl font-extrabold text-slate-800">Select Listening Part</h2>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { id: 1, title: "Part 1", desc: "Basic Conversation", icon: "01" },
                  { id: 2, title: "Part 2", desc: "Short Monologue", icon: "02" },
                  { id: 3, title: "Part 3", desc: "Academic Discussion", icon: "03" },
                  { id: 4, title: "Part 4", desc: "Academic Lecture", icon: "04" },
                ].map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => setSelectedPart(item.id)}
                    className={`group relative overflow-hidden rounded-2xl border p-6 transition-all duration-500 cursor-pointer ${
                      selectedPart === item.id 
                        ? "border-primary bg-gradient-to-br from-amber-50 to-white shadow-lg shadow-amber-100/50 scale-[1.02]" 
                        : "border-slate-100 bg-white hover:border-primary/30 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1"
                    }`}
                  >
                    <div className="flex flex-col gap-2 relative z-10">
                      <div className={`text-3xl font-black mb-1 transition-colors ${selectedPart === item.id ? "text-primary/20" : "text-slate-100 group-hover:text-primary/10"}`}>
                        {item.icon}
                      </div>
                      <div className={`flex items-center gap-2 font-bold text-lg transition-colors ${selectedPart === item.id ? "text-slate-900" : "text-slate-600 group-hover:text-slate-900"}`}>
                        <Info className={`w-5 h-5 ${selectedPart === item.id ? "text-primary" : "text-slate-400 group-hover:text-primary"}`} />
                        {item.title}
                      </div>
                      <div className={`text-sm font-semibold transition-colors ${selectedPart === item.id ? "text-amber-600" : "text-slate-400 group-hover:text-amber-500"}`}>
                        {item.desc}
                      </div>
                    </div>
                    {/* Decorative pattern */}
                    <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
                  </div>
                ))}
             </div>
          </div>

          {/* Submissions Section */}
          <div className="animate-fade-up [animation-delay:200ms]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1 bg-primary rounded-full"></div>
                <h2 className="text-xl font-extrabold text-slate-800">Available Practice Submissions</h2>
              </div>
              <div className="text-sm font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                {loading ? "--" : parts.filter(p => p.partNumber === selectedPart).length} items found
              </div>
            </div>
            
            {loading ? (
              <div className="grid gap-4">
                 {[1, 2, 3].map(i => (
                   <div key={i} className="animate-pulse bg-slate-50 border border-slate-100 h-24 rounded-2xl"></div>
                 ))}
              </div>
            ) : (
              <div className="grid gap-5">
                {parts.filter(p => p.partNumber === selectedPart).map((part, idx) => (
                  <div 
                    key={part.id} 
                    className="group bg-white border border-slate-100 shadow-sm p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-primary/20 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 animate-fade-up"
                    style={{ animationDelay: `${300 + idx * 100}ms` }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 text-white text-xs font-bold shadow-lg shadow-slate-900/10">
                          {idx + 1}
                        </span>
                        <h4 className="font-bold text-slate-800 text-lg truncate group-hover:text-primary transition-colors">
                          {part.title}
                        </h4>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                         {part.questionTypes?.map((qt: string) => (
                           <span 
                             key={qt} 
                             className="bg-slate-50 text-slate-500 border border-slate-100 px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider group-hover:bg-amber-50 group-hover:text-amber-600 group-hover:border-amber-100 transition-colors"
                           >
                             {qt.replace('_', ' ')}
                           </span>
                         ))}
                         {part.questionTypes?.length === 0 && (
                            <span className="text-slate-400 text-xs italic">Standard Format</span>
                         )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="hidden lg:flex flex-col items-end text-right">
                         <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Difficulty</span>
                         <span className="text-sm font-bold text-slate-700">Advanced 8.0+</span>
                      </div>
                      <Link 
                        href={`/ielts/advanced/listening/${part.id}`} 
                        className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-primary hover:text-slate-900 shadow-lg shadow-slate-900/10 hover:shadow-primary/20 transition-all duration-300 text-center active:scale-95"
                      >
                        Practice Now
                      </Link>
                    </div>
                  </div>
                ))}
                {parts.filter(p => p.partNumber === selectedPart).length === 0 && (
                   <div className="py-12 bg-slate-50 border border-dashed border-slate-200 rounded-3xl text-center">
                      <p className="text-slate-400 font-medium italic">No practice tests available for Part {selectedPart} yet.</p>
                   </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      {skill !== "Listening" && (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
           <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6">
              <Headphones className="w-10 h-10 text-slate-200" />
           </div>
           <h3 className="text-xl font-bold text-slate-800 mb-2">{skill} section coming soon</h3>
           <p className="text-slate-400 max-w-xs">We&apos;re currently preparing high-quality {skill.toLowerCase()} materials for you.</p>
        </div>
      )}
    </div>
  );

}
