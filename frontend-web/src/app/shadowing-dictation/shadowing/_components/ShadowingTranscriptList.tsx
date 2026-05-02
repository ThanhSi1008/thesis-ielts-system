import ShadowingSentenceRow from './ShadowingSentenceRow';
import { ShadowingSentence } from '@/services/shadowing.api';

export interface ShadowingTranscriptListProps {
  sentences: ShadowingSentence[];
  completedSentences: number[];
  currentIndex: number;
  onPlaySentence: (sentence: ShadowingSentence) => void;
  scrollAnchorRef: React.RefObject<HTMLDivElement>;
}

export default function ShadowingTranscriptList({
  sentences,
  completedSentences,
  currentIndex,
  onPlaySentence,
  scrollAnchorRef,
}: ShadowingTranscriptListProps) {
  return (
    <div className="p-4 space-y-3 bg-gray-50 dark:bg-slate-950">
      {sentences.map((sentence, idx) => {
        if (!completedSentences.includes(idx)) return null;

        return (
          <ShadowingSentenceRow
            key={sentence.id}
            index={idx}
            sentence={sentence}
            isCompleted={true}
            isCurrent={idx === currentIndex}
            onPlay={() => onPlaySentence(sentence)}
          />
        );
      })}
      <div ref={scrollAnchorRef} />
    </div>
  );
}
