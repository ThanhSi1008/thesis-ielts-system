import SpeakingPracticeContent from "./SpeakingPracticeContent";

export default function SpeakingPracticePage({ params }: { params: { partId: string } }) {
  return <SpeakingPracticeContent partId={params.partId} />;
}
