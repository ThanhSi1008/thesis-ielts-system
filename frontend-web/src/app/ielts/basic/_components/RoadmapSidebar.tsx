import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { CheckCircle2, Lock, ChevronDown, ChevronUp, BookOpen, Headphones, PenTool, Mic, Check, ChevronLeft } from "lucide-react";

export interface RoadmapItem {
  id: string;
  title: string;
  type: 'lesson' | 'exercise';
  skill: string;
  url: string;
  isCompleted: boolean;
  isLocked: boolean;
  lessonId?: string;
}

export interface RoadmapStep {
  step: number;
  items: RoadmapItem[];
  isLocked: boolean;
  isCompleted: boolean;
}

export function RoadmapSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [steps, setSteps] = useState<RoadmapStep[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [expandedSteps, setExpandedSteps] = useState<number[]>([]);

  const fetchRoadmap = async () => {
    try {
      const res = await api.get<{ steps: RoadmapStep[]; currentStep: number }>("/ielts/roadmap");
      setSteps(res.data.steps);
      setCurrentStep(res.data.currentStep);
      
      // Default toggle is open: Expand all steps initially
      if (expandedSteps.length === 0) {
        setExpandedSteps(res.data.steps.map(s => s.step));
      }
    } catch (err) {
      console.error("Failed to fetch roadmap", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
    
    // Setup a custom event listener so when a user finishes a lesson, we can refetch the roadmap
    const handleProgressUpdate = () => fetchRoadmap();
    window.addEventListener("roadmap-progress-update", handleProgressUpdate);
    return () => window.removeEventListener("roadmap-progress-update", handleProgressUpdate);
  }, []);

  const getSkillIcon = (skill: string) => {
    switch (skill) {
      case "Listening": return <Headphones className="w-3.5 h-3.5" />;
      case "Reading": return <BookOpen className="w-3.5 h-3.5" />;
      case "Writing": return <PenTool className="w-3.5 h-3.5" />;
      case "Speaking": return <Mic className="w-3.5 h-3.5" />;
      default: return <BookOpen className="w-3.5 h-3.5" />;
    }
  };

  const handleItemClick = (item: RoadmapItem) => {
    if (item.isLocked) return;
    
    // Determine the precise URL for the roadmap viewer
    const idParam = item.type === 'lesson' ? `lessonId=${item.id}` : `exerciseId=${item.id}${item.lessonId ? `&lessonId=${item.lessonId}` : ''}`;
    // E.g. `/ielts/basic/roadmap?type=lesson&skill=listening&lessonId=abc`
    const url = `/ielts/basic/roadmap?type=${item.type}&skill=${item.skill.toLowerCase()}&${idParam}`;
    router.push(url);
  };

  const isItemActive = (item: RoadmapItem) => {
    const currentType = searchParams.get("type");
    const currentLessonId = searchParams.get("lessonId");
    const currentExerciseId = searchParams.get("exerciseId");
    if (!currentType) return false;

    if (item.type === 'lesson') {
      return currentType === 'lesson' && currentLessonId === item.id;
    } else {
      return currentType === 'exercise' && currentExerciseId === item.id;
    }
  };

  const toggleStep = (stepNumber: number) => {
    setExpandedSteps(prev => 
      prev.includes(stepNumber) ? prev.filter(s => s !== stepNumber) : [...prev, stepNumber]
    );
  };

  if (loading) {
    return <div className="animate-pulse text-sm text-gray-500 py-4">Loading syllabus...</div>;
  }

  return (
    <div className="flex flex-col h-full bg-white relative">
      <button 
        onClick={() => router.push('/ielts/basic')}
        className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-gray-400 hover:text-gray-600 font-extrabold mb-5 transition-colors w-fit group"
      >
        <ChevronLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
        Library / Roadmap
      </button>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4 pb-12 custom-scrollbar">
        {steps.map((step) => {
          const isExpanded = expandedSteps.includes(step.step);
          const isActiveStep = currentStep === step.step;

          return (
            <div key={step.step} className="flex flex-col">
              {/* Step Header */}
              <div 
                className={`flex items-center justify-between cursor-pointer py-2 px-1 hover:text-[#E0A800] transition-colors ${step.isLocked ? "opacity-50" : ""}`}
                onClick={() => toggleStep(step.step)}
              >
                <div className="flex items-center gap-2">
                  <h3 className={`text-[14px] font-extrabold ${isActiveStep ? "text-[#FFC107]" : "text-gray-900"}`}>
                    Day {step.step}
                  </h3>
                  {step.isCompleted && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                  {step.isLocked && <Lock className="w-3.5 h-3.5 text-gray-400" />}
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </div>

              {/* Step Items */}
              <div className={`flex flex-col gap-1 overflow-hidden transition-all duration-300 ${isExpanded ? "max-h-[1000px] mt-2 opacity-100" : "max-h-0 opacity-0 pointer-events-none"}`}>
                <div className="ml-3 border-l-2 border-[#EEEEEE] pl-3 py-1 flex flex-col gap-3 relative">
                  {step.items.map((item) => {
                    const active = isItemActive(item);
                    return (
                      <div 
                        key={item.id} 
                        onClick={() => handleItemClick(item)}
                        className={`relative flex flex-col gap-1 cursor-pointer group ${item.isLocked ? "cursor-not-allowed opacity-50" : ""}`}
                      >
                        {/* Dot indicator connecting to the line */}
                        {item.isCompleted ? (
                          <div className="absolute -left-[19.5px] top-1.5 w-[15px] h-[15px] rounded-full bg-green-500 border border-white flex items-center justify-center shadow-sm">
                            <Check className="w-2.5 h-2.5 text-white stroke-[3.5]" />
                          </div>
                        ) : (
                          <div className={`absolute -left-[16px] top-2 w-2 h-2 rounded-full border-2 border-white 
                            ${active ? "bg-[#FFC107] w-2.5 h-2.5 -left-[17px]" : (item.isLocked ? "bg-gray-200" : "bg-[#D6D6D6]")}
                          `} />
                        )}
                        
                        <div className={`flex items-start gap-2 p-2 rounded-lg transition-colors ${active ? "bg-[#FFF9E6]" : "hover:bg-gray-50"}`}>
                          <div className={`mt-0.5 shrink-0 flex items-center justify-center ${active ? "text-[#FFC107]" : "text-gray-400"}`}>
                            {item.isLocked ? <Lock className="w-3.5 h-3.5 text-gray-300" /> : getSkillIcon(item.skill)}
                          </div>
                          <div>
                            <p className={`text-[13px] font-medium leading-tight ${active ? "text-gray-900 font-bold" : "text-gray-600 group-hover:text-gray-900"}`}>
                              {item.title}
                            </p>
                            <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-wider font-semibold">
                              {item.skill} · {item.type === 'lesson' ? "Theory" : "Practice"}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
