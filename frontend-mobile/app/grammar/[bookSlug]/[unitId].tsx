import React from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';

export default function RedirectGrammarUnit() {
  const { bookSlug, unitId } = useLocalSearchParams<{ bookSlug: string; unitId: string }>();
  return (
    <Redirect
      href={{
        pathname: '/ielts/foundation/grammar/[bookSlug]/[unitId]',
        params: { bookSlug, unitId },
      }}
    />
  );
}
