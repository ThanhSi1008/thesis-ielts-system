import React from 'react';
import Card, { CardProps } from './Card';

export interface PressableCardProps extends Omit<CardProps, 'onPress'> {
  onPress: () => void;
}

export default function PressableCard({ onPress, ...props }: PressableCardProps) {
  return <Card onPress={onPress} {...props} />;
}
