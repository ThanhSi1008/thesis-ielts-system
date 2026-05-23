import React from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';

export default function RedirectVocabularyBook() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  return (
    <Redirect
      href={{
        pathname: '/ielts/foundation/vocabulary/[bookId]',
        params: { bookId },
      }}
    />
  );
}
