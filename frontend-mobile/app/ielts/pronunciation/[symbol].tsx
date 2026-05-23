import React from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';

export default function RedirectPronunciationSymbol() {
  const { symbol } = useLocalSearchParams<{ symbol: string }>();
  return (
    <Redirect
      href={{
        pathname: '/ielts/foundation/pronunciation/[symbol]',
        params: { symbol },
      }}
    />
  );
}
