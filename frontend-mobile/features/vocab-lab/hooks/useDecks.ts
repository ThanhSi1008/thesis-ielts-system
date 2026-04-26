import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../core/api/client';
import { Deck } from '../types';

export function useDecks() {
  return useQuery({
    queryKey: ['vocab-lab', 'decks'],
    queryFn: async () => {
      const { data } = await apiClient.get<Deck[]>('/vocab-lab/decks');
      return data;
    },
  });
}
