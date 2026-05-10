export interface Deck {
  id: string;
  name: string;
  newCount: number;
  learningCount: number;
  dueCount: number;
  totalCards: number;
  lastStudyDate?: string;
}

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  cardState: 'NEW' | 'LEARNING' | 'REVIEW' | 'RELEARNING';
  nextReviewDate: string;
  tags?: string[];
}
