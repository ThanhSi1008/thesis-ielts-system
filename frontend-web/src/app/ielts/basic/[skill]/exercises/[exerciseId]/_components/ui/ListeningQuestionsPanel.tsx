import { Exercise } from "../utils/SharedExerciseTypes";
import { FormPoint, FormCompletionGroup } from "../../../../../components/listening-renders/FormCompletionGroup";
import { TableGroup, TableCompletionGroup } from "../../../../../components/listening-renders/TableCompletionGroup";
import { FlowChartGroup, FlowChartCompletionGroup } from "../../../../../components/listening-renders/FlowChartCompletionGroup";
import { MCQuestion, MCQuestionItem } from "../../../../../components/listening-renders/MCQuestionItem";
import { MCMultipleQuestion, MCMultipleQuestionItem } from "../../../../../components/listening-renders/MCMultipleQuestionItem";
import { SummaryGroup, SummaryCompletionGroup } from "../../../../../components/listening-renders/SummaryCompletionGroup";
import { MatchingGroup, MatchingCompletionGroup } from "../../../../../components/listening-renders/MatchingGroup";
import { MapLabellingGroupType, MapLabellingGroup } from "../../../../../components/listening-renders/MapLabellingGroup";
import { DiagramLabellingGroupType, DiagramLabellingGroup } from "../../../../../components/listening-renders/DiagramLabellingGroup";
import { ShortAnswerGroupType, ShortAnswerGroup } from "../../../../../components/listening-renders/ShortAnswerGroup";

export function ListeningQuestionsPanel({
  exercise,
  answers,
  submitted,
  onAnswer,
  audioRef,
  onLocate,
}: {
  exercise: Exercise;
  answers: Record<string | number, string>;
  submitted: boolean;
  onAnswer: (key: string | number, val: string) => void;
  audioRef: React.RefObject<HTMLAudioElement>;
  onLocate: (qNum: number) => void;
}) {
  return (
    <>
      {exercise.content.map((group, gi) => {
        // --- form completion ---
        if (!group.type && Array.isArray((group as any).points)) {
          const pts = (group as any).points as FormPoint[];
          const heading = (group as any).heading as string ?? "";
          return (
            <div key={gi}>
              <FormCompletionGroup
                heading={heading}
                points={pts}
                answers={answers}
                onAnswer={(qNum: number, val: string) => !submitted && onAnswer(qNum, val)}
                submitted={submitted}
                audioRef={audioRef}
                onLocate={onLocate}
              />
            </div>
          );
        }
        // --- flow chart ---
        if (group.type === "flow_chart") {
          return (
            <div key={gi}>
              <FlowChartCompletionGroup
                group={group as unknown as FlowChartGroup}
                answers={answers}
                onAnswer={(qNum, letter) => !submitted && onAnswer(qNum, letter)}
                submitted={submitted}
                audioRef={audioRef}
                onLocate={onLocate}
              />
            </div>
          );
        }
        // --- table ---
        if (group.type === "table") {
          return (
            <div key={gi}>
              <TableCompletionGroup
                group={group as unknown as TableGroup}
                answers={answers as Record<number, string>}
                onAnswer={(qNum, val) => !submitted && onAnswer(qNum, val as unknown as string)}
                submitted={submitted}
                audioRef={audioRef}
                onLocate={onLocate}
              />
            </div>
          );
        }
        // --- summary ---
        if (group.type === "summary_completion") {
          return (
            <div key={gi}>
              <SummaryCompletionGroup
                group={group as unknown as SummaryGroup}
                answers={answers}
                onAnswer={(qNum, val) => !submitted && onAnswer(qNum, val)}
                submitted={submitted}
                audioRef={audioRef}
                onLocate={onLocate}
              />
            </div>
          );
        }
        // --- matching ---
        if (group.type === "matching") {
          return (
            <div key={gi}>
              <MatchingCompletionGroup
                group={group as unknown as MatchingGroup}
                answers={answers}
                onAnswer={(qNum, val) => !submitted && onAnswer(qNum, val)}
                submitted={submitted}
                audioRef={audioRef}
                onLocate={onLocate}
              />
            </div>
          );
        }
        // --- map/plan labelling ---
        if (group.type === "map_labelling" || group.type === "plan_labelling") {
          return (
            <div key={gi}>
              <MapLabellingGroup
                group={group as unknown as MapLabellingGroupType}
                answers={answers}
                onAnswer={(qNum, val) => !submitted && onAnswer(qNum, val)}
                submitted={submitted}
                audioRef={audioRef}
                onLocate={onLocate}
              />
            </div>
          );
        }
        // --- diagram labelling ---
        if (group.type === "diagram_labelling") {
          return (
            <div key={gi}>
              <DiagramLabellingGroup
                group={group as unknown as DiagramLabellingGroupType}
                answers={answers}
                onAnswer={(qNum, val) => !submitted && onAnswer(qNum, val)}
                submitted={submitted}
                audioRef={audioRef}
                onLocate={onLocate}
              />
            </div>
          );
        }
        // --- short answer ---
        if (group.type === "short_answer") {
          return (
            <div key={gi}>
              <ShortAnswerGroup
                group={group as unknown as ShortAnswerGroupType}
                answers={answers}
                onAnswer={(qNum, val) => !submitted && onAnswer(qNum, val)}
                submitted={submitted}
                audioRef={audioRef}
                onLocate={onLocate}
              />
            </div>
          );
        }
        // --- multiple_choice_multiple ---
        if (group.type === "multiple_choice_multiple") {
          const key = `mcm-${gi}`;
          const rawSelected: string = (answers[key] as unknown as string) ?? "";
          const selectedLetters: string[] = rawSelected ? rawSelected.split(",") : [];
          const handleToggle = (letter: string) => {
            const upper = letter.toUpperCase();
            const next = selectedLetters.includes(upper)
              ? selectedLetters.filter((l) => l !== upper)
              : [...selectedLetters, upper];
            onAnswer(key, next.join(",") as unknown as string);
          };
          return (
            <div key={gi}>
              <MCMultipleQuestionItem
                group={group as unknown as MCMultipleQuestion}
                selectedLetters={selectedLetters}
                onToggle={handleToggle}
                submitted={submitted}
                audioRef={audioRef}
                onLocate={onLocate}
              />
            </div>
          );
        }
        // --- standard multiple_choice ---
        const questions = (Array.isArray(group.questions) ? group.questions : []) as MCQuestion[];
        const qNums = questions.map((q) => q.question_number);
        const rangeLabel =
          qNums.length > 0
            ? `Questions ${Math.min(...qNums)}–${Math.max(...qNums)}`
            : `Part ${gi + 1}`;

        return (
          <div key={gi}>
            <p className="text-[13px] font-bold text-gray-900 mb-0.5">{rangeLabel}</p>
            <p className="text-[13px] text-gray-500 mb-5">
              {exercise.instructions || (group as any).instruction || "Choose the correct letter."}
            </p>
            {group.type === "multiple_choice" ? (
              questions.map((q) => (
                <div id={`question-${q.question_number}`} key={q.question_number}>
                  <MCQuestionItem
                    q={q}
                    selected={answers[q.question_number] ?? null}
                    onSelect={(letter) =>
                      !submitted && onAnswer(q.question_number, letter)
                    }
                    submitted={submitted}
                    audioRef={audioRef}
                onLocate={onLocate}
                  />
                </div>
              ))
            ) : (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-sm text-gray-500">
                [{group.type}] renderer coming soon.
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
