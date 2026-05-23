import React from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';

export default function RedirectGrammarBook() {
  const { bookSlug } = useLocalSearchParams<{ bookSlug: string }>();
  return (
    <Redirect
      href={{
        pathname: '/ielts/foundation/grammar/[bookSlug]',
        params: { bookSlug },
      }}
    />
  );
}
