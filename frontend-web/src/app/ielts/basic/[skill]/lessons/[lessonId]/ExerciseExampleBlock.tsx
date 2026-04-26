"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { BookOpen, ChevronRight } from "lucide-react";
import Link from "next/link";

// ─── Listening renderers ─────────────────────────────────────────────────────
// [skill]/lessons/[lessonId]/ → ../../.. → [skill]/ → components/
import { MCQuestionItem, MCQuestion } from "../../../components/listening-renders/MCQuestionItem";
import { MCMultipleQuestionItem, MCMultipleQuestion } from "../../../components/listening-renders/MCMultipleQuestionItem";
import { FormCompletionGroup, FormPoint } from "../../../components/listening-renders/FormCompletionGroup";
import { TableCompletionGroup, TableGroup } from "../../../components/listening-renders/TableCompletionGroup";
import { FlowChartCompletionGroup, FlowChartGroup } from "../../../components/listening-renders/FlowChartCompletionGroup";
import { SummaryCompletionGroup, SummaryGroup } from "../../../components/listening-renders/SummaryCompletionGroup";
import { MatchingCompletionGroup, MatchingGroup } from "../../../components/listening-renders/MatchingGroup";
import { MapLabellingGroup, MapLabellingGroupType } from "../../../components/listening-renders/MapLabellingGroup";
import { DiagramLabellingGroup, DiagramLabellingGroupType } from "../../../components/listening-renders/DiagramLabellingGroup";
import { ShortAnswerGroup, ShortAnswerGroupType } from "../../../components/listening-renders/ShortAnswerGroup";

// ─── Reading renderers ────────────────────────────────────────────────────────
import { MCQuestion as RMCQuestion, MCQuestionItem as RMCQuestionItem } from "../../../components/reading-renders/MCQuestionItem";
import { TFNGGroup, TrueFalseNotGivenGroup } from "../../../components/reading-renders/TrueFalseNotGivenGroup";
import { NoteCompletionGroup, NoteCompletionGroup as NoteCompletionGroupType } from "../../../components/reading-renders/NoteCompletionGroup";
import { FlowchartCompletionGroup, FlowchartCompletionGroup as RFlowchartGroupType } from "../../../components/reading-renders/FlowchartCompletionGroup";
import { DiagramCompletionGroup, DiagramCompletionGroup as RDiagramGroupType } from "../../../components/reading-renders/DiagramCompletionGroup";
import { MatchingSentenceEndingsGroup, MatchingSentenceEndingsGroup as MatchingSentenceEndingsGroupType } from "../../../components/reading-renders/MatchingSentenceEndingsGroup";
import { MatchingFeaturesGroup, MatchingFeaturesGroup as MatchingFeaturesGroupType } from "../../../components/reading-renders/MatchingFeaturesGroup";
import { MatchingInformationGroup, MatchingInformationGroup as MatchingInformationGroupType } from "../../../components/reading-renders/MatchingInformationGroup";
import { MatchingHeadingsGroup, MatchingHeadingsGroup as MatchingHeadingsGroupType } from "../../../components/reading-renders/MatchingHeadingsGroup";
import { SummaryCompletionGroup as RSummaryGroup, SummaryCompletionGroup as RSummaryGroupType } from "../../../components/reading-renders/SummaryCompletionGroup";
import { ShortAnswerGroup as RShortAnswerGroup, ShortAnswerGroup as RShortAnswerGroupType } from "../../../components/reading-renders/ShortAnswerGroup";

interface ExerciseExampleBlockProps {
  id?: string;             // DOM id for TOC / scroll
  title?: string;          // e.g. "Example: Single Answer"
  exerciseType: "listening" | "reading";
  exerciseId: string;
  groupIndex?: number;
}

interface Snippet {
  exerciseId: string;
  topic: string;
  instructions: string | null;
  group: any;
  groupIndex: number;
  exerciseType: string;
}

// A stub audioRef that does nothing — used so renderers don't break
const noopAudioRef = { current: null } as unknown as React.RefObject<HTMLAudioElement>;

function renderGroup(group: any, exerciseType: string) {
  if (!group) return null;

  // Read-only preview: submitted=false so answers are NOT shown, pointer-events-none
  // makes it non-interactive. No answers are pre-filled.
  const noop = () => {};

  const type: string = group.type ?? "form";

  // ── Listening ──────────────────────────────────────────────────────────
  if (exerciseType === "listening") {
    if (type === "multiple_choice") {
      const questions = (group.questions ?? []) as MCQuestion[];
      return questions.map((q) => (
        <MCQuestionItem
          key={q.question_number}
          q={q}
          selected={null}
          onSelect={noop}
          submitted={false}
          showAnswers={false}
          audioRef={noopAudioRef}
          onLocate={noop}
        />
      ));
    }

    if (type === "multiple_choice_multiple") {
      return (
        <MCMultipleQuestionItem
          group={group as MCMultipleQuestion}
          selectedLetters={[]}
          onToggle={noop}
          submitted={false}
          showAnswers={false}
          audioRef={noopAudioRef}
          onLocate={noop}
        />
      );
    }

    if (type === "form" || !group.type) {
      const pts = (group.points ?? []) as FormPoint[];
      return (
        <FormCompletionGroup
          heading={group.heading ?? ""}
          points={pts}
          answers={{}}
          onAnswer={noop}
          submitted={false}
          showAnswers={false}
          audioRef={noopAudioRef}
          onLocate={noop}
        />
      );
    }

    if (type === "table") {
      return (
        <TableCompletionGroup
          group={group as TableGroup}
          answers={{}}
          onAnswer={noop}
          submitted={false}
          showAnswers={false}
          audioRef={noopAudioRef}
          onLocate={noop}
        />
      );
    }

    if (type === "flow_chart") {
      return (
        <FlowChartCompletionGroup
          group={group as FlowChartGroup}
          answers={{}}
          onAnswer={noop}
          submitted={false}
          showAnswers={false}
          audioRef={noopAudioRef}
          onLocate={noop}
        />
      );
    }

    if (type === "summary_completion") {
      return (
        <SummaryCompletionGroup
          group={group as SummaryGroup}
          answers={{}}
          onAnswer={noop}
          submitted={false}
          showAnswers={false}
          audioRef={noopAudioRef}
          onLocate={noop}
        />
      );
    }

    if (type === "matching") {
      return (
        <MatchingCompletionGroup
          group={group as MatchingGroup}
          answers={{}}
          onAnswer={noop}
          submitted={false}
          showAnswers={false}
          audioRef={noopAudioRef}
          onLocate={noop}
        />
      );
    }

    if (type === "map_labelling" || type === "plan_labelling") {
      return (
        <MapLabellingGroup
          group={group as MapLabellingGroupType}
          answers={{}}
          onAnswer={noop}
          submitted={false}
          showAnswers={false}
          audioRef={noopAudioRef}
          onLocate={noop}
        />
      );
    }

    if (type === "diagram_labelling") {
      return (
        <DiagramLabellingGroup
          group={group as DiagramLabellingGroupType}
          answers={{}}
          onAnswer={noop}
          submitted={false}
          showAnswers={false}
          audioRef={noopAudioRef}
          onLocate={noop}
        />
      );
    }

    if (type === "short_answer") {
      return (
        <ShortAnswerGroup
          group={group as ShortAnswerGroupType}
          answers={{}}
          onAnswer={noop}
          submitted={false}
          showAnswers={false}
          audioRef={noopAudioRef}
          onLocate={noop}
        />
      );
    }
  }

  // ── Reading ─────────────────────────────────────────────────────────────
  if (exerciseType === "reading") {
    if (type === "true_false_not_given" || type === "yes_no_not_given") {
      return (
        <TrueFalseNotGivenGroup
          group={group as TFNGGroup}
          answers={{}}
          onAnswer={noop}
          submitted={false}
          showAnswers={false}
          onLocate={noop}
        />
      );
    }

    if (type === "note_completion") {
      return (
        <NoteCompletionGroup
          group={group as NoteCompletionGroupType}
          answers={{}}
          onAnswer={noop}
          submitted={false}
          showAnswers={false}
          onLocate={noop}
        />
      );
    }

    if (type === "flowchart_completion") {
      return (
        <FlowchartCompletionGroup
          group={group as RFlowchartGroupType}
          answers={{}}
          onAnswer={noop}
          submitted={false}
          showAnswers={false}
          onLocate={noop}
        />
      );
    }

    if (type === "diagram_completion") {
      return (
        <DiagramCompletionGroup
          group={group as RDiagramGroupType}
          answers={{}}
          onAnswer={noop}
          submitted={false}
          showAnswers={false}
          onLocate={noop}
        />
      );
    }

    if (type === "sentence_completion" || type === "matching_sentence_endings") {
      return (
        <MatchingSentenceEndingsGroup
          group={group as MatchingSentenceEndingsGroupType}
          answers={{}}
          onAnswer={noop}
          submitted={false}
          showAnswers={false}
          onLocate={noop}
        />
      );
    }

    if (type === "matching_features") {
      return (
        <MatchingFeaturesGroup
          group={group as MatchingFeaturesGroupType}
          answers={{}}
          onAnswer={noop}
          submitted={false}
          showAnswers={false}
          onLocate={noop}
        />
      );
    }

    if (type === "matching_information") {
      return (
        <MatchingInformationGroup
          group={group as MatchingInformationGroupType}
          answers={{}}
          onAnswer={noop}
          submitted={false}
          showAnswers={false}
          onLocate={noop}
        />
      );
    }

    if (type === "matching_headings") {
      return (
        <MatchingHeadingsGroup
          group={group as MatchingHeadingsGroupType}
          answers={{}}
          onAnswer={noop}
          submitted={false}
          showAnswers={false}
          onLocate={noop}
        />
      );
    }

    if (type === "summary_completion") {
      return (
        <RSummaryGroup
          group={group as RSummaryGroupType}
          answers={{}}
          onAnswer={noop}
          submitted={false}
          showAnswers={false}
          onLocate={noop}
        />
      );
    }

    if (type === "short_answer") {
      return (
        <RShortAnswerGroup
          group={group as RShortAnswerGroupType}
          answers={{}}
          onAnswer={noop}
          submitted={false}
          showAnswers={false}
          onLocate={noop}
        />
      );
    }

    // reading multiple_choice fallback
    const questions = (group.questions ?? []) as RMCQuestion[];
    return (
      <div>
        <p className="text-[13px] text-gray-500 mb-5">
          {(group as any).instruction || "Choose the correct letter."}
        </p>
        {questions.map((q) => (
          <div id={`question-${q.question_number}`} key={q.question_number}>
            <RMCQuestionItem
              q={q}
              selected={null}
              onSelect={noop}
              submitted={false}
              showAnswers={false}
              onLocate={noop}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="text-sm text-gray-400 italic">
      [{type}] example
    </div>
  );
}

export function ExerciseExampleBlock({
  id,
  title,
  exerciseType,
  exerciseId,
  groupIndex = 0,
}: ExerciseExampleBlockProps) {
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    axios
      .get(`http://localhost:3000/api/v1/ielts/exercise-snippet`, {
        params: { type: exerciseType, id: exerciseId, groupIndex },
        signal: controller.signal,
      })
      .then((res) => setSnippet(res.data))
      .catch((err) => {
        if (axios.isCancel(err)) return; // AbortController cleanup — not a real error
        setError(true);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [exerciseId, exerciseType, groupIndex]);

  return (
    <div
      id={id}
      className="rounded-2xl bg-[#F8F9FA] border border-gray-200/80 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200/60">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-gray-200 flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5 text-gray-500" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Example</span>
            {title && (
              <p className="text-[13px] font-bold text-gray-800 leading-tight">{title}</p>
            )}
          </div>
        </div>
        {snippet && (
          <Link
            href={`/ielts/basic/${exerciseType}/exercises/${exerciseId}`}
            className="flex items-center gap-1 text-[11px] font-bold text-gray-400 hover:text-gray-700 transition-colors uppercase tracking-wider"
          >
            Full exercise
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Body */}
      <div className="px-6 py-6">
        {loading && (
          <div className="animate-pulse text-sm text-gray-400 font-medium">Loading example...</div>
        )}
        {error && (
          <div className="text-sm text-red-400 font-medium">Could not load example.</div>
        )}
        {snippet && !loading && (
          <>
            {snippet.instructions && (
              <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-5 border-l-2 border-gray-300 pl-3">
                {snippet.instructions}
              </p>
            )}
            <div className="pointer-events-none select-none opacity-90">
              {renderGroup(snippet.group, exerciseType)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
