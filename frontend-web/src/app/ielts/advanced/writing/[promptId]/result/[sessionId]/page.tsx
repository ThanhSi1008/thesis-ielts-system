import WritingResultContent from "./WritingResultContent";

export default function WritingResultPage({ params }: { params: { promptId: string, sessionId: string } }) {
  return <WritingResultContent promptId={params.promptId} sessionId={params.sessionId} />;
}
