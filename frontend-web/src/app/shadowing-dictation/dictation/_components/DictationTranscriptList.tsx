import DictationSentenceRow from './DictationSentenceRow';
import { DictationSentence } from '@/services/dictation.api';

export interface DictationTranscriptListProps {
  sentences: DictationSentence[];
  completedSentences: number[];
  currentIndex: number;
  onPlaySentence: (sentence: DictationSentence) => void;
}

export default function DictationTranscriptList({
  sentences,
  completedSentences,
  currentIndex,
  onPlaySentence,
}: DictationTranscriptListProps) {
  return (
    <div className="p-4 space-y-3">
      {sentences.map((sentence, idx) => {
        if (!completedSentences.includes(idx)) return null;

        return (
          <DictationSentenceRow
            key={sentence.id}
            index={idx}
            sentence={sentence}
            isCompleted={true}
            isCurrent={idx === currentIndex}
            onPlay={() => onPlaySentence(sentence)}
          />
        );
      })}
    </div>
  );
}
