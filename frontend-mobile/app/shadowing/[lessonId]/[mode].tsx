import React from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';

export default function RedirectShadowingLesson() {
  const { lessonId, mode } = useLocalSearchParams<{ lessonId: string; mode: string }>();
  return (
    <Redirect
      href={{
        pathname: '/practice-tools/shadowing/[lessonId]/[mode]',
        params: { lessonId, mode },
      }}
    />
  );
}
