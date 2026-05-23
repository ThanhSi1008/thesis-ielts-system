import React from 'react';
import { View } from 'react-native';
import { spacing } from '@/constants';

export type SpacerSize = keyof typeof spacing;

export interface SpacerProps {
  size?: SpacerSize;
  horizontal?: boolean;
}

export default function Spacer({ size = 4, horizontal = false }: SpacerProps) {
  const gutter = spacing[size];

  return (
    <View
      style={{
        width: horizontal ? gutter : undefined,
        height: horizontal ? undefined : gutter,
      }}
    />
  );
}
