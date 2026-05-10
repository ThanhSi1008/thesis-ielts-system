import WritingPracticeContent from "./WritingPracticeContent";

export default function WritingPracticePage({ params }: { params: { promptId: string } }) {
  return <WritingPracticeContent promptId={params.promptId} />;
}
