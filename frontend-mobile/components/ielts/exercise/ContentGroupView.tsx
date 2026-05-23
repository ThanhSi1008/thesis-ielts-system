import React from 'react';
import { FillGroup } from './FillGroup';
import { TFNGGroup } from './TFNGGroup';
import { MatchingGroup } from './MatchingGroup';
import { MCMultipleGroup } from './MCMultipleGroup';
import { MCQGroup } from './MCQGroup';
import { TableGroupView } from './TableGroupView';
import { MapLabellingGroupView } from './MapLabellingGroupView';
import { FormGroupView } from './FormGroupView';
import { NoteCompletionGroupView } from './NoteCompletionGroupView';
import { DiagramCompletionGroupView } from './DiagramCompletionGroupView';
import { SummaryGroupView } from './SummaryGroupView';
import { FlowChartGroupView } from './FlowChartGroupView';
import { ReadingFlowchartGroupView } from './ReadingFlowchartGroupView';
import { ReadingSummaryGroupView } from './ReadingSummaryGroupView';
import { ReadingMatchingGroupView } from './ReadingMatchingGroupView';
import { SentenceEndingsGroupView } from './SentenceEndingsGroupView';

export function ContentGroupView({
  group,
  gi,
  answers,
  submitted,
  onAnswer,
}: {
  group: any;
  gi: number;
  answers: Record<string | number, string>;
  submitted: boolean;
  onAnswer: (key: string | number, val: string) => void;
}) {
  const TFNG_TYPES = ['true_false_not_given', 'yes_no_not_given'];
  // Listening matching: uses group.items + group.answers (Record)
  const LISTENING_MATCHING_TYPES = ['matching'];
  // Reading grid matching (features/information/headings): group.questions[] + group.options[{letter,text}]
  const READING_MATCHING_TYPES = ['matching_headings', 'matching_features', 'matching_information'];
  // Sentence endings: group.questions[] + group.options[{id,text}] — different structure
  const SENTENCE_ENDINGS_TYPES = ['matching_sentence_endings'];
  const FORM_TYPES = ['form_completion', 'note_completion'];
  // Listening summary: uses group.text with regex \d+... blanks
  const LISTENING_SUMMARY_TYPES = ['summary_completion'];
  const FLOWCHART_TYPES = ['flowchart_completion', 'flow_chart'];
  const TABLE_TYPES = ['table', 'table_completion'];
  const MAP_TYPES = ['map_labelling', 'plan_labelling', 'diagram_labelling'];
  const FILL_TYPES = ['short_answer', 'sentence_completion'];

  if (TABLE_TYPES.includes(group.type)) {
    return (
      <TableGroupView
        group={group}
        answers={answers}
        submitted={submitted}
        onAnswer={(q: any, v: any) => onAnswer(q, v)}
      />
    );
  }
  if (MAP_TYPES.includes(group.type)) {
    return (
      <MapLabellingGroupView
        group={group}
        answers={answers}
        submitted={submitted}
        onAnswer={(q: any, v: any) => onAnswer(q, v)}
      />
    );
  }
  if (FORM_TYPES.includes(group.type) || (!group.type && group.points)) {
    // Reading note_completion has group.notes (array of strings/grouped objects)
    if (group.type === 'note_completion' && Array.isArray(group.notes)) {
      return (
        <NoteCompletionGroupView
          group={group}
          answers={answers}
          submitted={submitted}
          onAnswer={(q: any, v: any) => onAnswer(q, v)}
        />
      );
    }
    // Listening form/note completion uses group.points with inline {{qNum}} or regex blanks
    return (
      <FormGroupView
        group={{ ...group, type: group.type || 'form_completion' }}
        answers={answers}
        submitted={submitted}
        onAnswer={(q: any, v: any) => onAnswer(q, v)}
      />
    );
  }
  // Reading summary_completion uses {{qNum}} placeholders and questions array
  if (
    LISTENING_SUMMARY_TYPES.includes(group.type) &&
    Array.isArray(group.questions) &&
    (group.summary || group.text)
  ) {
    return (
      <ReadingSummaryGroupView
        group={group}
        answers={answers}
        submitted={submitted}
        onAnswer={(q: any, v: any) => onAnswer(q, v)}
      />
    );
  }
  // Listening summary_completion uses group.questions as Record object and group.text with regex blanks
  if (LISTENING_SUMMARY_TYPES.includes(group.type)) {
    return (
      <SummaryGroupView
        group={group}
        answers={answers}
        submitted={submitted}
        onAnswer={(q: any, v: any) => onAnswer(q, v)}
      />
    );
  }
  if (FLOWCHART_TYPES.includes(group.type)) {
    // Reading flowchart uses group.stages[] + group.questions[]
    // Listening flowchart uses group.steps[] with step.question embedded
    if (Array.isArray(group.stages)) {
      return (
        <ReadingFlowchartGroupView
          group={group}
          answers={answers}
          submitted={submitted}
          onAnswer={(q: any, v: any) => onAnswer(q, v)}
        />
      );
    }
    return (
      <FlowChartGroupView
        group={group}
        answers={answers}
        submitted={submitted}
        onAnswer={(q: any, v: any) => onAnswer(q, v)}
      />
    );
  }
  // diagram_completion: has image_url + labels[] with {{qNum}} placeholders
  if (group.type === 'diagram_completion') {
    return (
      <DiagramCompletionGroupView
        group={group}
        answers={answers}
        submitted={submitted}
        onAnswer={(q: any, v: any) => onAnswer(q, v)}
      />
    );
  }
  if (FILL_TYPES.includes(group.type)) {
    return (
      <FillGroup
        group={group}
        answers={answers}
        submitted={submitted}
        onAnswer={(q: any, v: any) => onAnswer(q, v)}
      />
    );
  }
  if (TFNG_TYPES.includes(group.type)) {
    return (
      <TFNGGroup
        group={group}
        answers={answers}
        submitted={submitted}
        onAnswer={(q: any, l: any) => onAnswer(q, l)}
      />
    );
  }
  // Reading matching types (features/information/headings) → card layout with letter option buttons
  if (READING_MATCHING_TYPES.includes(group.type)) {
    return (
      <ReadingMatchingGroupView
        group={group}
        answers={answers}
        submitted={submitted}
        onAnswer={(q: any, l: any) => onAnswer(q, l)}
      />
    );
  }
  // Sentence endings → chip selection with opt.id structure
  if (SENTENCE_ENDINGS_TYPES.includes(group.type)) {
    return (
      <SentenceEndingsGroupView
        group={group}
        answers={answers}
        submitted={submitted}
        onAnswer={(q: any, l: any) => onAnswer(q, l)}
      />
    );
  }
  // Listening matching type → radio-button grid layout
  if (LISTENING_MATCHING_TYPES.includes(group.type)) {
    return (
      <MatchingGroup
        group={group}
        answers={answers}
        submitted={submitted}
        onAnswer={(q: any, l: any) => onAnswer(q, l)}
      />
    );
  }
  if (group.type === 'multiple_choice_multiple') {
    return (
      <MCMultipleGroup
        group={group}
        gi={gi}
        answers={answers}
        submitted={submitted}
        onAnswer={(q: any, l: any) => onAnswer(q, l)}
      />
    );
  }

  // Default: MCQ
  return (
    <MCQGroup
      group={group}
      answers={answers}
      submitted={submitted}
      onAnswer={(q: any, l: any) => onAnswer(q, l)}
    />
  );
}
