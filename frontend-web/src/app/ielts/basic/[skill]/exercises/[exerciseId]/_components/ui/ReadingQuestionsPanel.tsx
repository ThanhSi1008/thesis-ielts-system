import { Exercise } from "../utils/SharedExerciseTypes";
import { MCQuestion, MCQuestionItem } from "../../../../../components/reading-renders/MCQuestionItem";
import { TFNGGroup, TrueFalseNotGivenGroup } from "../../../../../components/reading-renders/TrueFalseNotGivenGroup";
import { NoteCompletionGroup, NoteCompletionGroup as NoteCompletionGroupType } from "../../../../../components/reading-renders/NoteCompletionGroup";
import { FlowchartCompletionGroup, FlowchartCompletionGroup as FlowchartGroupType } from "../../../../../components/reading-renders/FlowchartCompletionGroup";
import { DiagramCompletionGroup, DiagramCompletionGroup as DiagramGroupType } from "../../../../../components/reading-renders/DiagramCompletionGroup";
import { MatchingSentenceEndingsGroup, MatchingSentenceEndingsGroup as MatchingSentenceEndingsGroupType } from "../../../../../components/reading-renders/MatchingSentenceEndingsGroup";
import { MatchingFeaturesGroup, MatchingFeaturesGroup as MatchingFeaturesGroupType } from "../../../../../components/reading-renders/MatchingFeaturesGroup";
import { MatchingInformationGroup, MatchingInformationGroup as MatchingInformationGroupType } from "../../../../../components/reading-renders/MatchingInformationGroup";
import { MatchingHeadingsGroup, MatchingHeadingsGroup as MatchingHeadingsGroupType } from "../../../../../components/reading-renders/MatchingHeadingsGroup";
import { SummaryCompletionGroup, SummaryCompletionGroup as SummaryGroupType } from "../../../../../components/reading-renders/SummaryCompletionGroup";
import { ShortAnswerGroup, ShortAnswerGroup as ShortAnswerGroupType } from "../../../../../components/reading-renders/ShortAnswerGroup";

export function ReadingQuestionsPanel({
  exercise,
  answers,
  submitted,
  showAnswers,
  onAnswer,
  onLocate,
}: {
  exercise: Exercise;
  answers: Record<string | number, string>;
  submitted: boolean;
  showAnswers: boolean;
  onAnswer: (key: string | number, val: string) => void;
  onLocate: (qNum: number) => void;
}) {
  return (
    <>
      {exercise.content.map((group, gi) => {
        // --- short answer ---
        if (group.type === "short_answer") {
          return (
            <div key={gi}>
              <ShortAnswerGroup
                group={group as unknown as ShortAnswerGroupType}
                answers={answers}
                onAnswer={(qNum, val) => !submitted && onAnswer(qNum, val)}
                submitted={submitted}
                showAnswers={showAnswers}
                onLocate={onLocate}
              />
            </div>
          );
        }
        // --- summary completion ---
        if (group.type === "summary_completion") {
          return (
            <div key={gi}>
              <SummaryCompletionGroup
                group={group as unknown as SummaryGroupType}
                answers={answers}
                onAnswer={(qNum, val) => !submitted && onAnswer(qNum, val)}
                submitted={submitted}
                showAnswers={showAnswers}
                onLocate={onLocate}
              />
            </div>
          );
        }
        // --- matching headings ---
        if (group.type === "matching_headings") {
          return (
            <div key={gi}>
              <MatchingHeadingsGroup
                group={group as unknown as MatchingHeadingsGroupType}
                answers={answers}
                onAnswer={(qNum, val) => !submitted && onAnswer(qNum, val)}
                submitted={submitted}
                showAnswers={showAnswers}
                onLocate={onLocate}
              />
            </div>
          );
        }
        // --- matching information ---
        if (group.type === "matching_information") {
          return (
            <div key={gi}>
              <MatchingInformationGroup
                group={group as unknown as MatchingInformationGroupType}
                answers={answers}
                onAnswer={(qNum, val) => !submitted && onAnswer(qNum, val)}
                submitted={submitted}
                showAnswers={showAnswers}
                onLocate={onLocate}
              />
            </div>
          );
        }
        // --- matching features ---
        if (group.type === "matching_features") {
          return (
            <div key={gi}>
              <MatchingFeaturesGroup
                group={group as unknown as MatchingFeaturesGroupType}
                answers={answers}
                onAnswer={(qNum, val) => !submitted && onAnswer(qNum, val)}
                submitted={submitted}
                showAnswers={showAnswers}
                onLocate={onLocate}
              />
            </div>
          );
        }
        // --- matching sentence endings ---
        if (group.type === "matching_sentence_endings") {
          return (
            <div key={gi}>
              <MatchingSentenceEndingsGroup
                group={group as unknown as MatchingSentenceEndingsGroupType}
                answers={answers}
                onAnswer={(qNum, val) => !submitted && onAnswer(qNum, val)}
                submitted={submitted}
                showAnswers={showAnswers}
                onLocate={onLocate}
              />
            </div>
          );
        }
        // --- diagram completion ---
        if (group.type === "diagram_completion") {
          return (
            <div key={gi}>
              <DiagramCompletionGroup
                group={group as unknown as DiagramGroupType}
                answers={answers}
                onAnswer={(qNum, val) => !submitted && onAnswer(qNum, val)}
                submitted={submitted}
                showAnswers={showAnswers}
                onLocate={onLocate}
              />
            </div>
          );
        }
        // --- flowchart completion ---
        if (group.type === "flowchart_completion") {
          return (
            <div key={gi}>
              <FlowchartCompletionGroup
                group={group as unknown as FlowchartGroupType}
                answers={answers}
                onAnswer={(qNum, val) => !submitted && onAnswer(qNum, val)}
                submitted={submitted}
                showAnswers={showAnswers}
                onLocate={onLocate}
              />
            </div>
          );
        }
        // --- note completion ---
        if (group.type === "note_completion") {
          return (
            <div key={gi}>
              <NoteCompletionGroup
                group={group as unknown as NoteCompletionGroupType}
                answers={answers}
                onAnswer={(qNum, val) => !submitted && onAnswer(qNum, val)}
                submitted={submitted}
                showAnswers={showAnswers}
                onLocate={onLocate}
              />
            </div>
          );
        }
        // --- true/false/not given & yes/no/not given ---
        if (group.type === "true_false_not_given" || group.type === "yes_no_not_given") {
          return (
            <div key={gi}>
              <TrueFalseNotGivenGroup
                group={group as unknown as TFNGGroup}
                answers={answers}
                onAnswer={(qNum, val) => !submitted && onAnswer(qNum, val)}
                submitted={submitted}
                showAnswers={showAnswers}
                onLocate={onLocate}
              />
            </div>
          );
        }

        // --- standard multiple_choice (fallback) ---
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
                    onSelect={(letter) => !submitted && onAnswer(q.question_number, letter)}
                    submitted={submitted}
                    showAnswers={showAnswers}
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
