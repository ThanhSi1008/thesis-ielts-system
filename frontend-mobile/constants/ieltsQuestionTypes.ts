export const QUESTION_TYPE_LABELS: Record<string, string> = {
  multiple_choice: 'Multiple Choice',
  multiple_choice_multiple: 'Multiple Answer',
  note_completion: 'Note Completion',
  table_completion: 'Table Completion',
  summary_completion: 'Summary Completion',
  sentence_completion: 'Sentence Completion',
  form_completion: 'Form / Note Completion',
  short_answers: 'Short Answers',
  diagram_labelling: 'Diagram Labelling',
  matching: 'Matching',
  matching_headings: 'Matching Headings',
  matching_features: 'Matching Features',
  matching_information: 'Matching Information',
  matching_sentence_endings: 'Matching Sentence Endings',
  flowchart_completion: 'Flowchart Completion',
  true_false_not_given: 'True / False / Not Given',
  yes_no_not_given: 'Yes / No / Not Given',
};

export function getQuestionTypeLabel(type: string): string {
  return QUESTION_TYPE_LABELS[type] ?? type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
