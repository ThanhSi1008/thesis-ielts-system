import { AlertCircle, Lightbulb, Info } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { LessonBlock } from "../utils/SharedExerciseTypes";

export function TheoryPopup({ block, onClose, customTheme }: { block: LessonBlock; onClose: () => void; customTheme?: { bg: string; border: string; icon: React.ReactNode; text?: string } }) {
  const config = {
    traps: {
      bg: "bg-[#FFF0F0]",
      border: "border-[#FFE1E1]",
      icon: <AlertCircle className="w-5 h-5 text-red-500" />,
      default: "The Common Traps",
    },
    strategy: {
      bg: "bg-[#FFF9E6]",
      border: "border-[#FFF0C2]",
      icon: <Lightbulb className="w-5 h-5 text-[#E0A800]" />,
      default: "The Step-by-Step Strategy",
    },
    tips: {
      bg: "bg-[#F0F7FF]",
      border: "border-[#DCEBFF]",
      icon: <Info className="w-5 h-5 text-[#3B82F6]" />,
      default: "Pro-Tips for Test Day",
    },
  } as Record<string, { bg: string; border: string; icon: React.ReactNode; default: string }>;

  const c = customTheme ?? config[block.type] ?? config.tips;
  const textColor = customTheme?.text ?? "text-gray-900";

  return (
    <div
      className={`absolute top-[48px] right-0 z-50 w-[550px] max-w-[90vw] max-h-[70vh] overflow-y-auto rounded-2xl border ${c.bg} ${c.border} p-6 shadow-2xl origin-top-right`}
    >
      <div className="flex items-center gap-2 mb-4">
        {c.icon}
        <h3 className={`font-bold text-[15px] ${textColor}`}>{block.title || (config[block.type] ? config[block.type].default : "Pro-Tips")}</h3>
      </div>
      <div className="prose prose-sm prose-gray max-w-none text-gray-800 leading-relaxed">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{block.content}</ReactMarkdown>
      </div>
    </div>
  );
}
