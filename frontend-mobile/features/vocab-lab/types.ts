export type CardState = 'NEW' | 'LEARNING' | 'REVIEW' | 'RELEARNING';

export interface Deck {
  id: string;
  name: string;
  newCount: number;
  learningCount: number;
  dueCount: number;
  totalCards: number;
  createdAt: string;
}

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  tags: string[];
  due: string;
  cardState: CardState;
  nextReviewDate: string;
}
