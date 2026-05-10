import SpeakingResultContent from "./SpeakingResultContent";

export default function SpeakingResultPage({
  params,
}: {
  params: { partId: string; sessionId: string };
}) {
  return <SpeakingResultContent partId={params.partId} sessionId={params.sessionId} />;
}
