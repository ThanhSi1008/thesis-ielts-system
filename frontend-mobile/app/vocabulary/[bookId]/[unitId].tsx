import React from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';

export default function RedirectVocabularyUnit() {
  const { bookId, unitId } = useLocalSearchParams<{ bookId: string; unitId: string }>();
  return (
    <Redirect
      href={{
        pathname: '/ielts/foundation/vocabulary/[bookId]/[unitId]',
        params: { bookId, unitId },
      }}
    />
  );
}
