import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

interface McqOption {
  id: string;
  text: string;
  feedback?: string;
}

interface SpeakingMcqViewProps {
  content: {
    question: string;
    options: McqOption[];
    correctAnswer: string;
  };
  onCorrectComplete: () => Promise<void>;
}

export function SpeakingMcqView({ content, onCorrectComplete }: SpeakingMcqViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hasCompleted, setHasCompleted] = useState(false);

  const handleSelect = async (id: string) => {
    if (hasCompleted) return;
    setSelectedId(id);

    if (id === content.correctAnswer) {
      setHasCompleted(true);
      await onCorrectComplete();
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">{content.question}</h3>
      
      <div className="space-y-3">
        {content.options.map((opt) => {
          const isSelected = selectedId === opt.id;
          const isCorrect = opt.id === content.correctAnswer;
          const showFeedback = isSelected || (hasCompleted && isCorrect);

          let containerClass = "border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ";
          
          if (hasCompleted && isCorrect) {
            containerClass += "bg-green-50 border-green-500 shadow-md";
          } else if (isSelected && !isCorrect) {
            containerClass += "bg-red-50 border-red-500";
          } else if (hasCompleted && !isCorrect) {
            containerClass += "bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed";
          } else {
            containerClass += "bg-white border-gray-200 hover:border-primary hover:shadow-md";
          }

          return (
            <div 
              key={opt.id} 
              className={containerClass}
              onClick={() => handleSelect(opt.id)}
            >
              <div className="flex gap-4">
                <div className={`mt-0.5 shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  hasCompleted && isCorrect ? "border-green-500 bg-green-500 text-white" :
                  isSelected && !isCorrect ? "border-red-500 bg-red-500 text-white" :
                  "border-gray-300"
                }`}>
                  {hasCompleted && isCorrect && <CheckCircle2 className="w-4 h-4" />}
                  {isSelected && !isCorrect && <XCircle className="w-4 h-4" />}
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className={`font-medium text-lg leading-relaxed ${
                    hasCompleted && isCorrect ? "text-green-900" :
                    isSelected && !isCorrect ? "text-red-900" :
                    "text-gray-700"
                  }`}>
                    {opt.text}
                  </div>
                  
                  {showFeedback && opt.feedback && (
                    <div className={`text-sm p-3 rounded-lg ${
                      isCorrect ? "bg-green-100/50 text-green-800" : "bg-red-100/50 text-red-800"
                    }`}>
                      <span className="font-bold mr-1">Feedback:</span>
                      {opt.feedback}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
